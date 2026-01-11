//! JPE language parser and formatter
use jpe_diag::{Diagnostic, Severity};
use jpe_ir::{ProjectIR, Interaction, Buff, Trait, TargetType, TestExpr, LootAction, Ref, Duration, Target, AgeTest, PreservedNode};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub struct JpeParser;

impl JpeParser {
    pub fn parse_folder(&self, folder_path: &Path) -> Result<(ProjectIR, Vec<Diagnostic>), Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();
        let mut project = ProjectIR::new();

        if !folder_path.is_dir() {
            diagnostics.push(
                Diagnostic::new(
                    "JPE1003_INVALID_INPUT_PATH",
                    Severity::Error,
                    format!("Path is not a directory: {:?}", folder_path)
                )
            );
            return Err(diagnostics);
        }

        // Iterate through all JPE files in the folder
        for entry in fs::read_dir(folder_path).map_err(|e| {
            vec![Diagnostic::new(
                "JPE1004_READ_DIR_ERROR",
                Severity::Error,
                format!("Failed to read directory: {}", e)
            )]
        })? {
            let entry = entry.map_err(|e| {
                vec![Diagnostic::new(
                    "JPE1005_READ_ENTRY_ERROR",
                    Severity::Error,
                    format!("Failed to read directory entry: {}", e)
                )]
            })?;

            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "jpe") {
                match self.parse_file(&path) {
                    Ok((mut parsed_project, mut file_diagnostics)) => {
                        project.interactions.extend(parsed_project.interactions);
                        project.buffs.extend(parsed_project.buffs);
                        project.traits.extend(parsed_project.traits);
                        project.test_expressions.extend(parsed_project.test_expressions);
                        project.loot_actions.extend(parsed_project.loot_actions);
                        project.metadata.extend(parsed_project.metadata);
                        diagnostics.append(&mut file_diagnostics);
                    }
                    Err(mut file_diagnostics) => {
                        diagnostics.append(&mut file_diagnostics);
                    }
                }
            }
        }

        Ok((project, diagnostics))
    }

    fn parse_file(&self, file_path: &Path) -> Result<(ProjectIR, Vec<Diagnostic>), Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();
        let mut project = ProjectIR::new();

        let content = fs::read_to_string(file_path).map_err(|e| {
            vec![Diagnostic::new(
                "JPE1006_READ_FILE_ERROR",
                Severity::Error,
                format!("Failed to read file: {}", e)
            )]
        })?;

        // Simple line-by-line parsing for MVP
        let lines: Vec<&str> = content.lines().collect();
        let mut current_indent_level = 0;
        let mut current_interaction: Option<Interaction> = None;
        let mut current_buff: Option<Buff> = None;
        let mut current_trait: Option<Trait> = None;
        let mut preserved_nodes = Vec::new();

        for (line_num, line) in lines.iter().enumerate() {
            let trimmed_line = line.trim();

            // Skip empty lines and comments
            if trimmed_line.is_empty() || trimmed_line.starts_with('#') {
                continue;
            }

            // Count leading spaces to determine indentation level
            let indent_spaces = line.len() - line.trim_start().len();
            let current_level = indent_spaces / 2; // Assuming 2 spaces per indent level

            // Parse top-level declarations
            if current_level == 0 {
                if let Some(captures) = regex::Regex::new(r#"^(\w+)\s+"([^"]+)":\s*$"#).unwrap().captures(trimmed_line) {
                    let element_type = &captures[1];
                    let element_name = &captures[2];

                    match element_type {
                        "interaction" => {
                            let mut interaction = Interaction::new(0, element_name); // ID will be assigned later
                            current_interaction = Some(interaction);
                            current_buff = None;
                            current_trait = None;
                        }
                        "buff" => {
                            let mut buff = Buff::new(0, element_name); // ID will be assigned later
                            current_buff = Some(buff);
                            current_interaction = None;
                            current_trait = None;
                        }
                        "trait" => {
                            let mut trait_ = Trait::new(0, element_name); // ID will be assigned later
                            current_trait = Some(trait_);
                            current_interaction = None;
                            current_buff = None;
                        }
                        _ => {
                            // Unknown element type, preserve as comment
                            preserved_nodes.push(PreservedNode {
                                xpath: format!("line_{}", line_num + 1),
                                raw_xml: line.to_string(),
                                note: format!("Unknown element type: {}", element_type),
                            });
                        }
                    }
                }
            }
            // Parse properties within elements
            else if current_level > 0 {
                if let Some(captures) = regex::Regex::new(r#"^(\w+):\s*(.*)$"#).unwrap().captures(trimmed_line) {
                    let property = &captures[1];
                    let value = &captures[2].trim();

                    match (current_interaction.as_mut(), current_buff.as_mut(), current_trait.as_mut()) {
                        (Some(ref mut interaction), _, _) => {
                            match property {
                                "id" => {
                                    if let Ok(id) = value.parse::<u64>() {
                                        interaction.id = id;
                                    }
                                }
                                "target" => {
                                    interaction.target_type = match value {
                                        "Sim" | "sim" => TargetType::Sim,
                                        "Object" | "object" => TargetType::Object,
                                        _ => TargetType::Sim, // Default
                                    };
                                }
                                "pie_menu" => {
                                    interaction.pie_menu_category = Some(value.to_string());
                                }
                                _ => {
                                    // Store unknown properties in metadata
                                    interaction.metadata.insert(property.to_string(), value.to_string());
                                }
                            }
                        }
                        (_, Some(ref mut buff), _) => {
                            match property {
                                "id" => {
                                    if let Ok(id) = value.parse::<u64>() {
                                        buff.id = id;
                                    }
                                }
                                "duration_ref" => {
                                    buff.duration_ref = Some(value.to_string());
                                }
                                _ => {
                                    // Store unknown properties in metadata
                                    buff.metadata.insert(property.to_string(), value.to_string());
                                }
                            }
                        }
                        (_, _, Some(ref mut trait_)) => {
                            match property {
                                "id" => {
                                    if let Ok(id) = value.parse::<u64>() {
                                        trait_.id = id;
                                    }
                                }
                                _ => {
                                    // Store unknown properties in metadata
                                    trait_.metadata.insert(property.to_string(), value.to_string());
                                }
                            }
                        }
                        _ => {
                            // Property outside of an element, treat as preserved
                            preserved_nodes.push(PreservedNode {
                                xpath: format!("line_{}", line_num + 1),
                                raw_xml: line.to_string(),
                                note: "Property outside of element".to_string(),
                            });
                        }
                    }
                }
                // Handle list items (indented with '-')
                else if trimmed_line.starts_with("- ") {
                    let list_item = &trimmed_line[2..]; // Remove "- " prefix

                    match (current_interaction.as_mut(), current_buff.as_mut(), current_trait.as_mut()) {
                        (Some(ref mut interaction), _, _) => {
                            // Parse test expressions or loot actions
                            if list_item.contains("when") || list_item.contains("is") {
                                // This is a test expression - simplified parsing for MVP
                                let test_expr = self.parse_simple_test(list_item);
                                interaction.available_when.push(test_expr);
                            } else if list_item.contains("apply") || list_item.contains("modify") || list_item.contains("set") {
                                // This is a loot action - simplified parsing for MVP
                                let loot_action = self.parse_simple_loot_action(list_item);
                                interaction.on_success.push(loot_action);
                            }
                        }
                        _ => {
                            // List item outside of interaction, treat as preserved
                            preserved_nodes.push(PreservedNode {
                                xpath: format!("line_{}", line_num + 1),
                                raw_xml: line.to_string(),
                                note: "List item outside of interaction".to_string(),
                            });
                        }
                    }
                }
            }
        }

        // Add any completed elements to the project
        if let Some(mut interaction) = current_interaction {
            interaction.preserved_xml = preserved_nodes.clone();
            preserved_nodes.clear();
            project.add_interaction(interaction);
        }

        if let Some(mut buff) = current_buff {
            buff.preserved_xml = preserved_nodes.clone();
            preserved_nodes.clear();
            project.add_buff(buff);
        }

        if let Some(mut trait_) = current_trait {
            trait_.preserved_xml = preserved_nodes;
            project.add_trait(trait_);
        }

        Ok((project, diagnostics))
    }

    fn parse_simple_test(&self, test_str: &str) -> TestExpr {
        // Simplified test parsing for MVP
        if test_str.contains("age") && test_str.contains("teen") {
            TestExpr::Age(AgeTest::TeenOrOlder)
        } else if test_str.contains("sleeping") {
            TestExpr::IsSleeping(test_str.contains("not") == false)
        } else if test_str.contains("relationship") {
            TestExpr::Relationship(50) // Default value for MVP
        } else {
            // Default to a simple age test
            TestExpr::Age(AgeTest::TeenOrOlder)
        }
    }

    fn parse_simple_loot_action(&self, action_str: &str) -> LootAction {
        // Simplified loot action parsing for MVP
        if action_str.contains("apply") && action_str.contains("buff") {
            LootAction::ApplyBuff {
                buff: Ref::new(0).with_name("PlaceholderBuff"),
                target: if action_str.contains("target") { Target::Target } else { Target::Actor },
                duration: if action_str.contains("for") {
                    Some(Duration::new(2, 0)) // Default 2 hours
                } else {
                    None
                },
            }
        } else if action_str.contains("modify") && action_str.contains("statistic") {
            LootAction::ModifyStatistic {
                stat: "mood".to_string(), // Default for MVP
                delta: 1.0, // Default for MVP
                target: if action_str.contains("target") { Target::Target } else { Target::Actor },
            }
        } else if action_str.contains("set") && action_str.contains("commodity") {
            LootAction::SetCommodity {
                commodity: "fun".to_string(), // Default for MVP
                value: 50.0, // Default for MVP
                target: if action_str.contains("target") { Target::Target } else { Target::Actor },
            }
        } else {
            // Default to a simple buff application
            LootAction::ApplyBuff {
                buff: Ref::new(0).with_name("DefaultBuff"),
                target: Target::Actor,
                duration: None,
            }
        }
    }
}

pub struct JpeFormatter;

impl JpeFormatter {
    pub fn format_project(&self, project: &ProjectIR) -> Result<(String, Vec<Diagnostic>), Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();
        let mut output = String::new();

        // Add header comment
        output.push_str("# Generated by JPE Sims 4 Mod Translation Suite\n\n");

        // Format interactions
        for interaction in &project.interactions {
            output.push_str(&format!("interaction \"{}\":\n", interaction.name));
            output.push_str(&format!("  id: {}\n", interaction.id));

            match interaction.target_type {
                TargetType::Sim => output.push_str("  target: Sim\n"),
                TargetType::Object => output.push_str("  target: Object\n"),
            }

            if let Some(ref category) = interaction.pie_menu_category {
                output.push_str(&format!("  pie_menu: {}\n", category));
            }

            if !interaction.available_when.is_empty() {
                output.push_str("  available_when:\n");
                for test in &interaction.available_when {
                    output.push_str(&format!("    - {}\n", self.format_test(test)));
                }
            }

            if !interaction.on_success.is_empty() {
                output.push_str("  on_success:\n");
                for action in &interaction.on_success {
                    output.push_str(&format!("    - {}\n", self.format_loot_action(action)));
                }
            }

            // Add metadata
            for (key, value) in &interaction.metadata {
                output.push_str(&format!("  {}: {}\n", key, value));
            }

            output.push_str("\n");
        }

        // Format buffs
        for buff in &project.buffs {
            output.push_str(&format!("buff \"{}\":\n", buff.name));
            output.push_str(&format!("  id: {}\n", buff.id));

            if let Some(ref duration_ref) = buff.duration_ref {
                output.push_str(&format!("  duration_ref: {}\n", duration_ref));
            }

            // Add metadata
            for (key, value) in &buff.metadata {
                output.push_str(&format!("  {}: {}\n", key, value));
            }

            output.push_str("\n");
        }

        // Format traits
        for trait_ in &project.traits {
            output.push_str(&format!("trait \"{}\":\n", trait_.name));
            output.push_str(&format!("  id: {}\n", trait_.id));

            // Add metadata
            for (key, value) in &trait_.metadata {
                output.push_str(&format!("  {}: {}\n", key, value));
            }

            output.push_str("\n");
        }

        Ok((output, diagnostics))
    }

    fn format_test(&self, test: &TestExpr) -> String {
        match test {
            TestExpr::Age(age_test) => {
                match age_test {
                    AgeTest::TeenOrOlder => "actor is teen_or_older".to_string(),
                    AgeTest::Child => "actor is child".to_string(),
                    AgeTest::Toddler => "actor is toddler".to_string(),
                    AgeTest::Adult => "actor is adult".to_string(),
                    AgeTest::Elder => "actor is elder".to_string(),
                }
            }
            TestExpr::IsSleeping(is_sleeping) => {
                if *is_sleeping {
                    "target is sleeping".to_string()
                } else {
                    "target is not sleeping".to_string()
                }
            }
            TestExpr::Relationship(level) => {
                format!("relationship min_level {}", level)
            }
            TestExpr::HasTrait(_) => {
                "has trait".to_string() // Simplified for MVP
            }
            TestExpr::HasBuff(_) => {
                "has buff".to_string() // Simplified for MVP
            }
            TestExpr::And(_) => {
                "logical and".to_string() // Simplified for MVP
            }
            TestExpr::Or(_) => {
                "logical or".to_string() // Simplified for MVP
            }
            TestExpr::Not(_) => {
                "logical not".to_string() // Simplified for MVP
            }
        }
    }

    fn format_loot_action(&self, action: &LootAction) -> String {
        match action {
            LootAction::ApplyBuff { ref buff, target, ref duration } => {
                let target_str = match target {
                    Target::Actor => "actor",
                    Target::Target => "target",
                };

                let duration_str = if let Some(ref dur) = duration {
                    format!(" for {}h{}m", dur.hours, dur.minutes)
                } else {
                    "".to_string()
                };

                format!("apply buff \"{}\" to {}{}",
                    buff.name.as_ref().unwrap_or(&"unknown".to_string()),
                    target_str,
                    duration_str)
            }
            LootAction::ModifyStatistic { ref stat, delta, target } => {
                let target_str = match target {
                    Target::Actor => "actor",
                    Target::Target => "target",
                };

                format!("modify statistic \"{}\" by {} to {}", stat, delta, target_str)
            }
            LootAction::SetCommodity { ref commodity, value, target } => {
                let target_str = match target {
                    Target::Actor => "actor",
                    Target::Target => "target",
                };

                format!("set commodity \"{}\" to {} for {}", commodity, value, target_str)
            }
        }
    }
}

// Need to add regex as a dependency
// Add this to Cargo.toml: regex = "1.0"