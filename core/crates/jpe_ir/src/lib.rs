//! Intermediate representation types for JPE Sims 4 Mod Translation Suite
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Common types
pub type TuningId = u64;
pub type ResourceKey = String;
pub type LocKey = String;

// Reference to another IR element
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ref<T> {
    pub id: TuningId,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resource_key: Option<ResourceKey>,
}

impl<T> Ref<T> {
    pub fn new(id: TuningId) -> Self {
        Self {
            id,
            name: None,
            resource_key: None,
        }
    }

    pub fn with_name(mut self, name: impl Into<String>) -> Self {
        self.name = Some(name.into());
        self
    }

    pub fn with_resource_key(mut self, resource_key: impl Into<ResourceKey>) -> Self {
        self.resource_key = Some(resource_key.into());
        self
    }
}

// Preserved XML node for unsupported elements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PreservedNode {
    pub xpath: String,
    pub raw_xml: String,
    pub note: String,
}

// Interaction IR type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Interaction {
    pub id: TuningId,
    pub name: String,
    pub target_type: TargetType,
    pub pie_menu_category: Option<String>,
    #[serde(default)]
    pub available_when: Vec<TestExpr>,
    #[serde(default)]
    pub on_success: Vec<LootAction>,
    #[serde(default)]
    pub metadata: HashMap<String, String>,
    #[serde(default)]
    pub preserved_xml: Vec<PreservedNode>,
}

impl Interaction {
    pub fn new(id: TuningId, name: impl Into<String>) -> Self {
        Self {
            id,
            name: name.into(),
            target_type: TargetType::Sim,
            pie_menu_category: None,
            available_when: vec![],
            on_success: vec![],
            metadata: HashMap::new(),
            preserved_xml: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TargetType {
    Sim,
    Object,
}

// Buff IR type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Buff {
    pub id: TuningId,
    pub name: String,
    pub duration_ref: Option<String>,
    #[serde(default)]
    pub metadata: HashMap<String, String>,
    #[serde(default)]
    pub preserved_xml: Vec<PreservedNode>,
}

impl Buff {
    pub fn new(id: TuningId, name: impl Into<String>) -> Self {
        Self {
            id,
            name: name.into(),
            duration_ref: None,
            metadata: HashMap::new(),
            preserved_xml: vec![],
        }
    }
}

// Trait IR type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Trait {
    pub id: TuningId,
    pub name: String,
    #[serde(default)]
    pub metadata: HashMap<String, String>,
    #[serde(default)]
    pub preserved_xml: Vec<PreservedNode>,
}

impl Trait {
    pub fn new(id: TuningId, name: impl Into<String>) -> Self {
        Self {
            id,
            name: name.into(),
            metadata: HashMap::new(),
            preserved_xml: vec![],
        }
    }
}

// Test expressions (conditions)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TestExpr {
    And(Vec<TestExpr>),
    Or(Vec<TestExpr>),
    Not(Box<TestExpr>),
    Age(AgeTest),
    IsSleeping(bool),
    Relationship(i32),  // min relationship level
    HasTrait(Ref<Trait>),
    HasBuff(Ref<Buff>),
    // Add more as needed
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgeTest {
    TeenOrOlder,
    Child,
    Toddler,
    Adult,
    Elder,
}

// Loot actions
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LootAction {
    ApplyBuff {
        buff: Ref<Buff>,
        target: Target,
        duration: Option<Duration>,
    },
    ModifyStatistic {
        stat: String,
        delta: f32,
        target: Target,
    },
    SetCommodity {
        commodity: String,
        value: f32,
        target: Target,
    },
    // Add more as needed
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Target {
    Actor,
    Target,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Duration {
    pub hours: u32,
    pub minutes: u32,
}

impl Duration {
    pub fn new(hours: u32, minutes: u32) -> Self {
        Self { hours, minutes }
    }
}

// Project container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectIR {
    pub interactions: Vec<Interaction>,
    pub buffs: Vec<Buff>,
    pub traits: Vec<Trait>,
    #[serde(default)]
    pub test_expressions: Vec<TestExpr>,
    #[serde(default)]
    pub loot_actions: Vec<LootAction>,
    pub metadata: HashMap<String, String>,
}

impl ProjectIR {
    pub fn new() -> Self {
        Self {
            interactions: vec![],
            buffs: vec![],
            traits: vec![],
            test_expressions: vec![],
            loot_actions: vec![],
            metadata: HashMap::new(),
        }
    }

    pub fn add_interaction(&mut self, interaction: Interaction) {
        self.interactions.push(interaction);
    }

    pub fn add_buff(&mut self, buff: Buff) {
        self.buffs.push(buff);
    }

    pub fn add_trait(&mut self, trait_: Trait) {
        self.traits.push(trait_);
    }

    pub fn get_interaction_by_id(&self, id: TuningId) -> Option<&Interaction> {
        self.interactions.iter().find(|i| i.id == id)
    }

    pub fn get_buff_by_id(&self, id: TuningId) -> Option<&Buff> {
        self.buffs.iter().find(|b| b.id == id)
    }

    pub fn get_trait_by_id(&self, id: TuningId) -> Option<&Trait> {
        self.traits.iter().find(|t| t.id == id)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagnostic_creation() {
        let diag = crate::jpe_diag::Diagnostic::new(
            "TEST001",
            crate::jpe_diag::Severity::Warning,
            "This is a test diagnostic"
        );
        
        assert_eq!(diag.code, "TEST001");
        assert_eq!(diag.severity, crate::jpe_diag::Severity::Warning);
        assert_eq!(diag.message, "This is a test diagnostic");
    }

    #[test]
    fn test_project_ir_creation() {
        let mut project = ProjectIR::new();
        
        // Add a test interaction
        let interaction = Interaction::new(123, "Test Interaction");
        project.add_interaction(interaction);
        
        // Add a test buff
        let buff = Buff::new(456, "Test Buff");
        project.add_buff(buff);
        
        // Add a test trait
        let trait_ = Trait::new(789, "Test Trait");
        project.add_trait(trait_);
        
        assert_eq!(project.interactions.len(), 1);
        assert_eq!(project.buffs.len(), 1);
        assert_eq!(project.traits.len(), 1);
        
        assert_eq!(project.get_interaction_by_id(123).unwrap().name, "Test Interaction");
        assert_eq!(project.get_buff_by_id(456).unwrap().name, "Test Buff");
        assert_eq!(project.get_trait_by_id(789).unwrap().name, "Test Trait");
    }

    #[test]
    fn test_interaction_creation() {
        let mut interaction = Interaction::new(123, "Friendly Ask About Day");
        interaction.target_type = TargetType::Sim;
        interaction.pie_menu_category = Some("Friendly".to_string());
        
        assert_eq!(interaction.id, 123);
        assert_eq!(interaction.name, "Friendly Ask About Day");
        assert_eq!(interaction.target_type, TargetType::Sim);
        assert_eq!(interaction.pie_menu_category, Some("Friendly".to_string()));
    }
}