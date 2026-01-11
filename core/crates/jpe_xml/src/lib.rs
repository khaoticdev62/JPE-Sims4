//! XML parsing and generation for Sims 4 tuning files
use jpe_diag::{Diagnostic, Severity};
use jpe_ir::{ProjectIR, Interaction, Buff, Trait, TargetType, TestExpr, LootAction, Ref, Duration, Target, AgeTest, PreservedNode};
use quick_xml::events::{Event, BytesStart};
use quick_xml::Reader;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub struct XmlParser;

impl XmlParser {
    pub fn parse_folder(&self, folder_path: &Path) -> Result<(ProjectIR, Vec<Diagnostic>), Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();
        let mut project = ProjectIR::new();

        if !folder_path.is_dir() {
            diagnostics.push(
                Diagnostic::new(
                    "JPE2003_INVALID_INPUT_PATH",
                    Severity::Error,
                    format!("Path is not a directory: {:?}", folder_path)
                )
            );
            return Err(diagnostics);
        }

        // Iterate through all XML files in the folder
        for entry in fs::read_dir(folder_path).map_err(|e| {
            vec![Diagnostic::new(
                "JPE2004_READ_DIR_ERROR",
                Severity::Error,
                format!("Failed to read directory: {}", e)
            )]
        })? {
            let entry = entry.map_err(|e| {
                vec![Diagnostic::new(
                    "JPE2005_READ_ENTRY_ERROR",
                    Severity::Error,
                    format!("Failed to read directory entry: {}", e)
                )]
            })?;

            let path = entry.path();
            if path.extension().map_or(false, |ext| ext == "xml") {
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
                "JPE2006_READ_FILE_ERROR",
                Severity::Error,
                format!("Failed to read file: {}", e)
            )]
        })?;

        let mut reader = Reader::from_str(&content);
        reader.trim_text(true);

        let mut buf = Vec::new();
        let mut current_element = String::new();
        let mut current_interaction: Option<Interaction> = None;
        let mut current_buff: Option<Buff> = None;
        let mut current_trait: Option<Trait> = None;
        let mut preserved_nodes = Vec::new();

        loop {
            match reader.read_event_into(&mut buf) {
                Ok(Event::Start(ref e)) => {
                    current_element = String::from_utf8_lossy(e.name().as_ref()).to_string();

                    match current_element.as_str() {
                        "IInteraction" => {
                            // Start parsing an interaction
                            let mut attrs = HashMap::new();
                            for attr in e.attributes() {
                                if let Ok(attr) = attr {
                                    let key = String::from_utf8_lossy(attr.key.as_ref()).to_string();
                                    let value = String::from_utf8_lossy(&attr.value).to_string();
                                    attrs.insert(key, value);
                                }
                            }

                            let id_str = attrs.get("instance_id").unwrap_or(&"0".to_string());
                            let id = id_str.parse::<u64>().unwrap_or(0);

                            current_interaction = Some(Interaction::new(id, attrs.get("display_name").unwrap_or(&"Unknown".to_string())));
                        }
                        "buff" => {
                            // Start parsing a buff
                            let mut attrs = HashMap::new();
                            for attr in e.attributes() {
                                if let Ok(attr) = attr {
                                    let key = String::from_utf8_lossy(attr.key.as_ref()).to_string();
                                    let value = String::from_utf8_lossy(&attr.value).to_string();
                                    attrs.insert(key, value);
                                }
                            }

                            let id_str = attrs.get("instance_id").unwrap_or(&"0".to_string());
                            let id = id_str.parse::<u64>().unwrap_or(0);

                            current_buff = Some(Buff::new(id, attrs.get("display_name").unwrap_or(&"Unknown".to_string())));
                        }
                        "trait" => {
                            // Start parsing a trait
                            let mut attrs = HashMap::new();
                            for attr in e.attributes() {
                                if let Ok(attr) = attr {
                                    let key = String::from_utf8_lossy(attr.key.as_ref()).to_string();
                                    let value = String::from_utf8_lossy(&attr.value).to_string();
                                    attrs.insert(key, value);
                                }
                            }

                            let id_str = attrs.get("instance_id").unwrap_or(&"0".to_string());
                            let id = id_str.parse::<u64>().unwrap_or(0);

                            current_trait = Some(Trait::new(id, attrs.get("display_name").unwrap_or(&"Unknown".to_string())));
                        }
                        _ => {
                            // For unsupported elements, preserve them
                            let element_start = format!("<{}", String::from_utf8_lossy(e.name().as_ref()));
                            let mut attrs_str = String::new();
                            for attr in e.attributes() {
                                if let Ok(attr) = attr {
                                    let key = String::from_utf8_lossy(attr.key.as_ref()).to_string();
                                    let value = String::from_utf8_lossy(&attr.value).to_string();
                                    attrs_str.push_str(&format!(" {}=\"{}\"", key, value));
                                }
                            }
                            let element_start = format!("{}{}>", element_start, attrs_str);

                            preserved_nodes.push(PreservedNode {
                                xpath: format!("//{}", current_element),
                                raw_xml: element_start,
                                note: format!("Unsupported element: {}", current_element),
                            });
                        }
                    }
                }
                Ok(Event::Empty(ref e)) => {
                    // Handle empty elements
                    current_element = String::from_utf8_lossy(e.name().as_ref()).to_string();

                    // For now, just preserve empty elements
                    let element_start = format!("<{}", String::from_utf8_lossy(e.name().as_ref()));
                    let mut attrs_str = String::new();
                    for attr in e.attributes() {
                        if let Ok(attr) = attr {
                            let key = String::from_utf8_lossy(attr.key.as_ref()).to_string();
                            let value = String::from_utf8_lossy(&attr.value).to_string();
                            attrs_str.push_str(&format!(" {}=\"{}\"", key, value));
                        }
                    }
                    let element_empty = format!("{}{}/>", element_start, attrs_str);

                    preserved_nodes.push(PreservedNode {
                        xpath: format!("//{}", current_element),
                        raw_xml: element_empty,
                        note: format!("Unsupported empty element: {}", current_element),
                    });
                }
                Ok(Event::Text(e)) => {
                    // Handle text content
                    let text = e.unescape().unwrap_or_default();
                    if !text.trim().is_empty() {
                        // For now, just log text content as preserved
                        preserved_nodes.push(PreservedNode {
                            xpath: format!("//{}", current_element),
                            raw_xml: text.to_string(),
                            note: format!("Text content in {}", current_element),
                        });
                    }
                }
                Ok(Event::End(ref e)) => {
                    let element_name = String::from_utf8_lossy(e.name().as_ref()).to_string();

                    // When we finish parsing an interaction, buff, or trait, add it to the project
                    match element_name.as_str() {
                        "IInteraction" => {
                            if let Some(mut interaction) = current_interaction.take() {
                                interaction.preserved_xml = preserved_nodes;
                                preserved_nodes = Vec::new();
                                project.add_interaction(interaction);
                            }
                        }
                        "buff" => {
                            if let Some(mut buff) = current_buff.take() {
                                buff.preserved_xml = preserved_nodes;
                                preserved_nodes = Vec::new();
                                project.add_buff(buff);
                            }
                        }
                        "trait" => {
                            if let Some(mut trait_) = current_trait.take() {
                                trait_.preserved_xml = preserved_nodes;
                                preserved_nodes = Vec::new();
                                project.add_trait(trait_);
                            }
                        }
                        _ => {
                            // For other closing tags, continue
                        }
                    }

                    current_element.clear();
                }
                Ok(Event::Eof) => break,
                Err(e) => {
                    diagnostics.push(
                        Diagnostic::new(
                            "JPE2007_XML_PARSE_ERROR",
                            Severity::Error,
                            format!("XML parsing error: {}", e)
                        )
                    );
                    break;
                }
                _ => (), // There are several other `Event`s we do not consider here
            }

            buf.clear();
        }

        Ok((project, diagnostics))
    }
}

pub struct XmlGenerator;

impl XmlGenerator {
    pub fn generate_folder(&self, project: &ProjectIR, output_folder: &Path) -> Result<Vec<Diagnostic>, Vec<Diagnostic>> {
        let mut diagnostics = Vec::new();

        // Create output folder if it doesn't exist
        fs::create_dir_all(output_folder).map_err(|e| {
            vec![Diagnostic::new(
                "JPE2008_CREATE_DIR_ERROR",
                Severity::Error,
                format!("Failed to create output directory: {}", e)
            )]
        })?;

        // Generate XML for each interaction
        for interaction in &project.interactions {
            let xml_content = self.generate_interaction_xml(interaction);
            let file_path = output_folder.join(format!("interaction_{}.xml", interaction.id));
            fs::write(&file_path, xml_content).map_err(|e| {
                vec![Diagnostic::new(
                    "JPE2009_WRITE_FILE_ERROR",
                    Severity::Error,
                    format!("Failed to write interaction file: {}", e)
                )]
            })?;
        }

        // Generate XML for each buff
        for buff in &project.buffs {
            let xml_content = self.generate_buff_xml(buff);
            let file_path = output_folder.join(format!("buff_{}.xml", buff.id));
            fs::write(&file_path, xml_content).map_err(|e| {
                vec![Diagnostic::new(
                    "JPE2010_WRITE_FILE_ERROR",
                    Severity::Error,
                    format!("Failed to write buff file: {}", e)
                )]
            })?;
        }

        // Generate XML for each trait
        for trait_ in &project.traits {
            let xml_content = self.generate_trait_xml(trait_);
            let file_path = output_folder.join(format!("trait_{}.xml", trait_.id));
            fs::write(&file_path, xml_content).map_err(|e| {
                vec![Diagnostic::new(
                    "JPE2011_WRITE_FILE_ERROR",
                    Severity::Error,
                    format!("Failed to write trait file: {}", e)
                )]
            })?;
        }

        Ok(diagnostics)
    }

    fn generate_interaction_xml(&self, interaction: &Interaction) -> String {
        let mut xml = String::new();
        xml.push_str("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.push_str("<IInteraction ");
        xml.push_str(&format!("instance_id=\"{}\" ", interaction.id));
        xml.push_str(&format!("display_name=\"{}\" ", interaction.name));

        if let Some(ref category) = interaction.pie_menu_category {
            xml.push_str(&format!("pie_menu_category=\"{}\" ", category));
        }

        xml.push_str(">\n");

        // Add preserved XML nodes if passthrough is enabled
        for preserved in &interaction.preserved_xml {
            xml.push_str(&format!("  {}\n", preserved.raw_xml));
        }

        xml.push_str("</IInteraction>\n");
        xml
    }

    fn generate_buff_xml(&self, buff: &Buff) -> String {
        let mut xml = String::new();
        xml.push_str("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.push_str("<buff ");
        xml.push_str(&format!("instance_id=\"{}\" ", buff.id));
        xml.push_str(&format!("display_name=\"{}\" ", buff.name));

        if let Some(ref duration) = buff.duration_ref {
            xml.push_str(&format!("duration=\"{}\" ", duration));
        }

        xml.push_str(">\n");

        // Add preserved XML nodes if passthrough is enabled
        for preserved in &buff.preserved_xml {
            xml.push_str(&format!("  {}\n", preserved.raw_xml));
        }

        xml.push_str("</buff>\n");
        xml
    }

    fn generate_trait_xml(&self, trait_: &Trait) -> String {
        let mut xml = String::new();
        xml.push_str("<?xml version=\"1.0\" encoding=\"utf-8\"?>\n");
        xml.push_str("<trait ");
        xml.push_str(&format!("instance_id=\"{}\" ", trait_.id));
        xml.push_str(&format!("display_name=\"{}\" ", trait_.name));
        xml.push_str(">\n");

        // Add preserved XML nodes if passthrough is enabled
        for preserved in &trait_.preserved_xml {
            xml.push_str(&format!("  {}\n", preserved.raw_xml));
        }

        xml.push_str("</trait>\n");
        xml
    }
}