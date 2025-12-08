"""Tests for the template builder wizard system."""

import pytest
from pathlib import Path
from tempfile import TemporaryDirectory

from ui.template_builder_wizard import (
    InteractionType,
    MoodType,
    TestCondition,
    Effect,
    TemplateConfig,
    TemplateBuilderWizard,
)


class TestInteractionType:
    """Test InteractionType enum."""

    def test_all_types_available(self):
        """Test that all interaction types are available."""
        types = [t.value for t in InteractionType]
        assert "social" in types
        assert "object" in types
        assert "autonomous" in types
        assert "looping" in types

    def test_type_equality(self):
        """Test interaction type comparison."""
        assert InteractionType.SOCIAL == InteractionType.SOCIAL
        assert InteractionType.SOCIAL != InteractionType.OBJECT


class TestMoodType:
    """Test MoodType enum."""

    def test_all_moods_available(self):
        """Test that all mood types are available."""
        moods = [m.value for m in MoodType]
        assert "positive" in moods
        assert "negative" in moods
        assert "neutral" in moods


class TestTestCondition:
    """Test TestCondition class."""

    def test_create_condition(self):
        """Test creating a test condition."""
        condition = TestCondition(condition_type="actor is adult")
        assert condition.condition_type == "actor is adult"
        assert condition.negate is False

    def test_condition_to_string(self):
        """Test converting condition to string."""
        condition = TestCondition(condition_type="actor is adult")
        assert condition.to_string() == "actor is adult"

    def test_negated_condition(self):
        """Test negated condition."""
        condition = TestCondition(condition_type="actor is tired", negate=True)
        assert "not" in condition.to_string()


class TestEffect:
    """Test Effect class."""

    def test_create_effect(self):
        """Test creating an effect."""
        effect = Effect(effect_type="increase mood by 10")
        assert effect.effect_type == "increase mood by 10"

    def test_effect_to_string(self):
        """Test converting effect to string."""
        effect = Effect(effect_type="increase friendship")
        assert effect.to_string() == "increase friendship"

    def test_effect_with_parameters(self):
        """Test effect with parameters."""
        effect = Effect(
            effect_type="increase skill",
            parameters={"skill": "cooking", "amount": 2}
        )
        effect_str = effect.to_string()
        assert "cooking" in effect_str or "skill:cooking" in effect_str


class TestTemplateConfig:
    """Test TemplateConfig class."""

    def test_create_config(self):
        """Test creating a template configuration."""
        config = TemplateConfig(
            name="Greet Friend",
            description="Give a friendly greeting",
            interaction_type=InteractionType.SOCIAL,
            duration=15,
        )
        assert config.name == "Greet Friend"
        assert config.description == "Give a friendly greeting"
        assert config.duration == 15

    def test_config_to_jpe(self):
        """Test converting config to JPE syntax."""
        config = TemplateConfig(
            name="Simple Greeting",
            description="Wave at someone",
            interaction_type=InteractionType.SOCIAL,
            duration=10,
        )
        config.tests.append(TestCondition(condition_type="actor is not alone"))
        config.effects.append(Effect(effect_type="increase mood by 5"))

        jpe_code = config.to_jpe()

        assert "Simple Greeting" in jpe_code
        assert "Wave at someone" in jpe_code
        assert "social" in jpe_code
        assert "10" in jpe_code
        assert "tests:" in jpe_code
        assert "effects:" in jpe_code

    def test_config_with_buffs(self):
        """Test config with custom buffs."""
        config = TemplateConfig(
            name="Happy Interaction",
            description="Feel happy",
            interaction_type=InteractionType.SOCIAL,
            duration=20,
        )

        config.buffs["Happy Feeling"] = {
            "description": "Feeling happy",
            "mood_type": "positive",
            "intensity": 2,
            "duration": 180,
            "mood_gain": 20,
        }

        jpe_code = config.to_jpe()

        assert "Happy Feeling" in jpe_code
        assert "positive" in jpe_code
        assert "180" in jpe_code

    def test_config_to_dict(self):
        """Test serializing config to dictionary."""
        config = TemplateConfig(
            name="Test Interaction",
            description="Test description",
            interaction_type=InteractionType.OBJECT,
            duration=30,
            category="Skill",
        )

        config_dict = config.to_dict()

        assert config_dict["name"] == "Test Interaction"
        assert config_dict["description"] == "Test description"
        assert config_dict["interaction_type"] == "object"
        assert config_dict["duration"] == 30
        assert config_dict["category"] == "Skill"

    def test_config_from_dict(self):
        """Test deserializing config from dictionary."""
        original_dict = {
            "name": "Loaded Interaction",
            "description": "Loaded from dict",
            "interaction_type": "social",
            "duration": 45,
            "tests": [
                {"type": "actor is adult", "negate": False}
            ],
            "effects": [
                {"type": "increase mood by 10", "parameters": {}}
            ],
            "buffs": {},
            "category": "Social",
            "cost": 0,
            "is_autonomous": False,
        }

        config = TemplateConfig.from_dict(original_dict)

        assert config.name == "Loaded Interaction"
        assert config.description == "Loaded from dict"
        assert config.duration == 45
        assert len(config.tests) == 1
        assert len(config.effects) == 1

    def test_config_roundtrip(self):
        """Test config serialization roundtrip."""
        original = TemplateConfig(
            name="Roundtrip Test",
            description="Testing serialization",
            interaction_type=InteractionType.SOCIAL,
            duration=60,
        )

        original.tests.append(TestCondition(condition_type="both are adults"))
        original.effects.append(Effect(effect_type="increase friendship +20"))

        # Serialize and deserialize
        dict_repr = original.to_dict()
        restored = TemplateConfig.from_dict(dict_repr)

        assert restored.name == original.name
        assert restored.description == original.description
        assert restored.duration == original.duration
        assert len(restored.tests) == len(original.tests)
        assert len(restored.effects) == len(original.effects)


class TestTemplateBuilderWizard:
    """Test the template builder wizard."""

    def test_wizard_creation(self):
        """Test wizard instance creation."""
        import tkinter as tk
        root = tk.Tk()
        try:
            wizard = TemplateBuilderWizard(root)
            assert wizard.parent == root
            assert wizard.config is not None
        finally:
            root.destroy()

    def test_wizard_common_tests(self):
        """Test that common tests are available."""
        import tkinter as tk
        root = tk.Tk()
        try:
            wizard = TemplateBuilderWizard(root)
            tests = wizard.COMMON_TESTS
            assert "Age & Lifecycle" in tests
            assert "Mood & Emotions" in tests
            assert "Relationships" in tests
        finally:
            root.destroy()

    def test_wizard_common_effects(self):
        """Test that common effects are available."""
        import tkinter as tk
        root = tk.Tk()
        try:
            wizard = TemplateBuilderWizard(root)
            effects = wizard.COMMON_EFFECTS
            assert "Mood Changes" in effects
            assert "Relationships" in effects
            assert "Skills" in effects
        finally:
            root.destroy()

    def test_wizard_callback(self):
        """Test wizard save callback."""
        import tkinter as tk
        root = tk.Tk()

        callback_called = []

        def test_callback(config):
            callback_called.append(config)

        try:
            wizard = TemplateBuilderWizard(root, on_save=test_callback)
            assert wizard.on_save is not None
        finally:
            root.destroy()


class TestTemplateGeneration:
    """Test complete template generation workflow."""

    def test_simple_template_generation(self):
        """Test generating a simple template."""
        config = TemplateConfig(
            name="Simple Wave",
            description="Give a friendly wave",
            interaction_type=InteractionType.SOCIAL,
            duration=10,
        )

        config.tests.append(TestCondition(condition_type="actor is not alone"))
        config.effects.append(Effect(effect_type="increase mood by 5"))
        config.effects.append(Effect(effect_type="increase friendship +3"))

        jpe_code = config.to_jpe()

        # Verify structure
        assert "Simple Wave" in jpe_code
        assert "description:" in jpe_code
        assert "type: social" in jpe_code
        assert "duration: 10" in jpe_code
        assert "tests:" in jpe_code
        assert "effects:" in jpe_code

        # Verify it's valid-looking JPE syntax
        lines = jpe_code.strip().split("\n")
        assert lines[0] == "Simple Wave"
        assert "description:" in lines[1]

    def test_complex_template_generation(self):
        """Test generating a complex template with multiple features."""
        config = TemplateConfig(
            name="Complex Interaction",
            description="A complex interaction with many features",
            interaction_type=InteractionType.SOCIAL,
            duration=60,
            category="Skill",
            cost=5,
        )

        # Add multiple tests
        config.tests.append(TestCondition(condition_type="both are adults"))
        config.tests.append(TestCondition(condition_type="actor is friends with target"))
        config.tests.append(TestCondition(condition_type="not in public"))

        # Add multiple effects
        config.effects.append(Effect(effect_type="increase friendship +30"))
        config.effects.append(Effect(effect_type="increase mood by 25"))

        # Add custom buff
        config.buffs["Connected Feeling"] = {
            "description": "Feeling connected to someone",
            "mood_type": "positive",
            "intensity": 3,
            "duration": 240,
            "mood_gain": 25,
        }

        jpe_code = config.to_jpe()

        # Verify all components are present
        assert "Complex Interaction" in jpe_code
        assert "both are adults" in jpe_code
        assert "not in public" in jpe_code
        assert "increase friendship +30" in jpe_code
        assert "Connected Feeling" in jpe_code
        assert "positive" in jpe_code

    def test_template_file_export(self):
        """Test exporting template to file."""
        with TemporaryDirectory() as tmpdir:
            config = TemplateConfig(
                name="Test Export",
                description="Testing file export",
                interaction_type=InteractionType.OBJECT,
                duration=45,
            )

            jpe_code = config.to_jpe()
            output_path = Path(tmpdir) / "test_template.jpe"
            output_path.write_text(jpe_code)

            assert output_path.exists()
            assert "Test Export" in output_path.read_text()

    def test_template_config_json_export(self):
        """Test exporting config as JSON."""
        import json

        config = TemplateConfig(
            name="JSON Export Test",
            description="Testing JSON export",
            interaction_type=InteractionType.SOCIAL,
            duration=30,
        )

        config_dict = config.to_dict()
        json_str = json.dumps(config_dict, indent=2)

        # Verify JSON is valid
        parsed = json.loads(json_str)
        assert parsed["name"] == "JSON Export Test"
        assert parsed["duration"] == 30


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_empty_template_name(self):
        """Test template with empty name."""
        config = TemplateConfig(
            name="",
            description="Test",
            interaction_type=InteractionType.SOCIAL,
            duration=10,
        )

        jpe_code = config.to_jpe()
        assert jpe_code is not None  # Should still generate

    def test_zero_duration(self):
        """Test template with zero duration."""
        config = TemplateConfig(
            name="Zero Duration",
            description="Test",
            interaction_type=InteractionType.SOCIAL,
            duration=0,
        )

        jpe_code = config.to_jpe()
        assert "duration: 0" in jpe_code

    def test_very_long_duration(self):
        """Test template with very long duration."""
        config = TemplateConfig(
            name="Long Interaction",
            description="Test",
            interaction_type=InteractionType.SOCIAL,
            duration=86400,  # 24 hours
        )

        jpe_code = config.to_jpe()
        assert "86400" in jpe_code

    def test_special_characters_in_description(self):
        """Test template with special characters in description."""
        config = TemplateConfig(
            name="Special Chars",
            description='Test with "quotes" and \'apostrophes\' and special: chars!',
            interaction_type=InteractionType.SOCIAL,
            duration=10,
        )

        jpe_code = config.to_jpe()
        assert "Special Chars" in jpe_code

    def test_multiple_buffs(self):
        """Test template with multiple buffs."""
        config = TemplateConfig(
            name="Multiple Buffs",
            description="Test",
            interaction_type=InteractionType.SOCIAL,
            duration=30,
        )

        for i in range(5):
            config.buffs[f"Buff {i}"] = {
                "description": f"Buff {i} description",
                "mood_type": "positive",
                "intensity": 2,
                "duration": 180,
                "mood_gain": 10,
            }

        jpe_code = config.to_jpe()

        for i in range(5):
            assert f"Buff {i}" in jpe_code
