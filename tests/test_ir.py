"""Tests for the Intermediate Representation components."""

import unittest
from pathlib import Path

from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, TestSet, TestCondition, TestOperand,
    LootAction, StatisticModifier, LocalizedString, ResourceCategory
)


class TestResourceId(unittest.TestCase):
    """Test ResourceId class."""
    
    def test_resource_id_creation(self):
        """Test creating a ResourceId."""
        resource_id = ResourceId(name="test_interaction", module="test_module", class_name="TestInteraction", instance_id=12345)
        self.assertEqual(resource_id.name, "test_interaction")
        self.assertEqual(resource_id.module, "test_module")
        self.assertEqual(resource_id.class_name, "TestInteraction")
        self.assertEqual(resource_id.instance_id, 12345)
    
    def test_resource_id_defaults(self):
        """Test ResourceId with default values."""
        resource_id = ResourceId(name="simple_id")
        self.assertEqual(resource_id.name, "simple_id")
        self.assertIsNone(resource_id.module)
        self.assertIsNone(resource_id.class_name)
        self.assertIsNone(resource_id.instance_id)


class TestLocalizedString(unittest.TestCase):
    """Test LocalizedString class."""
    
    def test_localized_string_creation(self):
        """Test creating a LocalizedString."""
        string = LocalizedString(key="test_key", text="Test text", locale="en_US")
        self.assertEqual(string.key, "test_key")
        self.assertEqual(string.text, "Test text")
        self.assertEqual(string.locale, "en_US")
    
    def test_localized_string_defaults(self):
        """Test LocalizedString with default locale."""
        string = LocalizedString(key="test_key", text="Test text")
        self.assertEqual(string.locale, "en_US")


class TestInteraction(unittest.TestCase):
    """Test Interaction class."""
    
    def test_interaction_creation(self):
        """Test creating an Interaction."""
        interaction = Interaction(
            id=ResourceId(name="test_interaction"),
            display_name_key="test_interaction_name",
            description_key="test_interaction_desc",
            participants=[InteractionParticipant(role="Actor", description="Test actor")]
        )
        self.assertEqual(interaction.id.name, "test_interaction")
        self.assertEqual(interaction.display_name_key, "test_interaction_name")
        self.assertEqual(interaction.description_key, "test_interaction_desc")
        self.assertEqual(len(interaction.participants), 1)
        self.assertEqual(interaction.participants[0].role, "Actor")


class TestBuff(unittest.TestCase):
    """Test Buff class."""
    
    def test_buff_creation(self):
        """Test creating a Buff."""
        buff = Buff(
            id=ResourceId(name="test_buff"),
            display_name_key="test_buff_name",
            description_key="test_buff_desc",
            duration_sim_minutes=60
        )
        self.assertEqual(buff.id.name, "test_buff")
        self.assertEqual(buff.display_name_key, "test_buff_name")
        self.assertEqual(buff.description_key, "test_buff_desc")
        self.assertEqual(buff.duration_sim_minutes, 60)


class TestTrait(unittest.TestCase):
    """Test Trait class."""
    
    def test_trait_creation(self):
        """Test creating a Trait."""
        trait = Trait(
            id=ResourceId(name="test_trait"),
            display_name_key="test_trait_name",
            description_key="test_trait_desc"
        )
        self.assertEqual(trait.id.name, "test_trait")
        self.assertEqual(trait.display_name_key, "test_trait_name")
        self.assertEqual(trait.description_key, "test_trait_desc")


class TestEnumDefinition(unittest.TestCase):
    """Test EnumDefinition class."""
    
    def test_enum_creation(self):
        """Test creating an EnumDefinition."""
        enum_def = EnumDefinition(
            id=ResourceId(name="test_enum"),
            options=[EnumOption(name="option1", value=0), EnumOption(name="option2", value=1)]
        )
        self.assertEqual(enum_def.id.name, "test_enum")
        self.assertEqual(len(enum_def.options), 2)
        self.assertEqual(enum_def.options[0].name, "option1")
        self.assertEqual(enum_def.options[0].value, 0)
        self.assertEqual(enum_def.options[1].name, "option2")
        self.assertEqual(enum_def.options[1].value, 1)


class TestProjectIR(unittest.TestCase):
    """Test ProjectIR class."""
    
    def test_project_ir_creation(self):
        """Test creating a ProjectIR."""
        metadata = ProjectMetadata(name="Test Project", project_id="test_project", version="1.0.0")
        project_ir = ProjectIR(
            metadata=metadata,
            interactions=[Interaction(id=ResourceId(name="test_interaction"))],
            buffs=[Buff(id=ResourceId(name="test_buff"))],
            traits=[Trait(id=ResourceId(name="test_trait"))],
            enums=[EnumDefinition(id=ResourceId(name="test_enum"))],
            localized_strings=[LocalizedString(key="test_key", text="test")]
        )
        self.assertEqual(project_ir.metadata.name, "Test Project")
        self.assertEqual(len(project_ir.interactions), 1)
        self.assertEqual(len(project_ir.buffs), 1)
        self.assertEqual(len(project_ir.traits), 1)
        self.assertEqual(len(project_ir.enums), 1)
        self.assertEqual(len(project_ir.localized_strings), 1)


if __name__ == '__main__':
    unittest.main()