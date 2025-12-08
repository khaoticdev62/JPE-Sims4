"""Tests for the validation components."""

import unittest
from pathlib import Path

from engine.validation.validator import ProjectValidator
from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, LocalizedString
)


class TestProjectValidator(unittest.TestCase):
    """Test ProjectValidator class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.validator = ProjectValidator()
    
    def test_validate_valid_project(self):
        """Test validating a completely valid project."""
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Valid Project",
                project_id="valid_project",
                version="1.0.0"
            ),
            interactions=[
                Interaction(
                    id=ResourceId(name="valid_interaction"),
                    display_name_key="Valid Interaction",
                    description_key="A valid interaction",
                    participants=[InteractionParticipant(role="Actor", description="The actor")]
                )
            ],
            buffs=[
                Buff(
                    id=ResourceId(name="valid_buff"),
                    display_name_key="Valid Buff",
                    description_key="A valid buff"
                )
            ],
            traits=[
                Trait(
                    id=ResourceId(name="valid_trait"),
                    display_name_key="Valid Trait",
                    description_key="A valid trait"
                )
            ],
            enums=[
                EnumDefinition(
                    id=ResourceId(name="valid_enum"),
                    options=[EnumOption(name="option1", value=0)]
                )
            ],
            localized_strings=[
                LocalizedString(key="valid_key", text="Valid Text", locale="en_US")
            ]
        )
        
        errors = self.validator.validate(project)
        
        # Should have no errors
        error_count = len([e for e in errors if e.severity.value in ('error', 'fatal')])
        self.assertEqual(error_count, 0)
    
    def test_validate_project_metadata(self):
        """Test validation of project metadata."""
        # Test with missing name
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="",  # Empty name
                project_id="test_project",
                version="1.0.0"
            )
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_PROJECT_NAME"])
        self.assertEqual(error_count, 1)
        
        # Test with missing project_id
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="",  # Empty ID
                version="1.0.0"
            )
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_PROJECT_ID"])
        self.assertEqual(error_count, 1)
    
    def test_validate_interaction(self):
        """Test validation of interactions."""
        # Test interaction with missing ID
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            interactions=[
                Interaction(
                    id=ResourceId(name=""),  # Empty ID
                    display_name_key="Test Interaction"
                )
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_INTERACTION_ID"])
        self.assertEqual(error_count, 1)
        
        # Test interaction with duplicate participant roles
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            interactions=[
                Interaction(
                    id=ResourceId(name="test_interaction"),
                    display_name_key="Test Interaction",
                    participants=[
                        InteractionParticipant(role="Actor", description="First actor"),
                        InteractionParticipant(role="Actor", description="Second actor")  # Duplicate role
                    ]
                )
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "DUPLICATE_PARTICIPANT_ROLES"])
        self.assertEqual(warning_count, 1)
    
    def test_validate_buff(self):
        """Test validation of buffs."""
        # Test buff with missing ID
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            buffs=[
                Buff(
                    id=ResourceId(name=""),  # Empty ID
                    display_name_key="Test Buff"
                )
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_BUFF_ID"])
        self.assertEqual(error_count, 1)
        
        # Test buff with negative duration
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            buffs=[
                Buff(
                    id=ResourceId(name="test_buff"),
                    display_name_key="Test Buff",
                    duration_sim_minutes=-10  # Negative duration
                )
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "INVALID_BUFF_DURATION"])
        self.assertEqual(warning_count, 1)
    
    def test_validate_trait(self):
        """Test validation of traits."""
        # Test trait with missing ID
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            traits=[
                Trait(
                    id=ResourceId(name=""),  # Empty ID
                    display_name_key="Test Trait"
                )
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_TRAIT_ID"])
        self.assertEqual(error_count, 1)
    
    def test_validate_enum(self):
        """Test validation of enums."""
        # Test enum with missing ID
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            enums=[
                EnumDefinition(
                    id=ResourceId(name=""),  # Empty ID
                    options=[EnumOption(name="option1", value=0)]
                )
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_ENUM_ID"])
        self.assertEqual(error_count, 1)
        
        # Test enum with duplicate option names
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            enums=[
                EnumDefinition(
                    id=ResourceId(name="test_enum"),
                    options=[
                        EnumOption(name="option1", value=0),
                        EnumOption(name="option1", value=1)  # Duplicate name
                    ]
                )
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "DUPLICATE_ENUM_OPTIONS"])
        self.assertEqual(error_count, 1)
        
        # Test enum with no options (should be a warning)
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            enums=[
                EnumDefinition(
                    id=ResourceId(name="empty_enum"),
                    options=[]  # No options
                )
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "EMPTY_ENUM_OPTIONS"])
        self.assertEqual(warning_count, 1)
    
    def test_validate_localized_string(self):
        """Test validation of localized strings."""
        # Test string with missing key
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            localized_strings=[
                LocalizedString(key="", text="Test text")  # Empty key
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "INVALID_STRING_KEY"])
        self.assertEqual(error_count, 1)
        
        # Test string with empty text (should be a warning)
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            localized_strings=[
                LocalizedString(key="test_key", text="")  # Empty text
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "EMPTY_STRING_TEXT"])
        self.assertEqual(warning_count, 1)
        
        # Test string with invalid locale format
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            localized_strings=[
                LocalizedString(key="test_key", text="Test text", locale="invalid_format")
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "INVALID_LOCALE_FORMAT"])
        self.assertEqual(warning_count, 1)
    
    def test_validate_cross_references(self):
        """Test validation of cross-references."""
        # Test duplicate resource IDs across different types
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            interactions=[
                Interaction(
                    id=ResourceId(name="duplicate_id"),  # Same ID as buff below
                    display_name_key="Test Interaction"
                )
            ],
            buffs=[
                Buff(
                    id=ResourceId(name="duplicate_id"),  # Same ID as interaction above
                    display_name_key="Test Buff"
                )
            ]
        )
        
        errors = self.validator.validate(project)
        error_count = len([e for e in errors if e.code == "DUPLICATE_RESOURCE_ID"])
        self.assertEqual(error_count, 1)
        
        # Test undefined buff reference in trait
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            traits=[
                Trait(
                    id=ResourceId(name="test_trait"),
                    display_name_key="Test Trait",
                    buffs=[ResourceId(name="undefined_buff")]  # References a buff that doesn't exist
                )
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "UNDEFINED_BUFF_REFERENCE"])
        self.assertEqual(warning_count, 1)
        
        # Test undefined trait reference in buff
        project = ProjectIR(
            metadata=ProjectMetadata(
                name="Test Project",
                project_id="test_project",
                version="1.0.0"
            ),
            buffs=[
                Buff(
                    id=ResourceId(name="test_buff"),
                    display_name_key="Test Buff",
                    traits=["undefined_trait"]  # References a trait that doesn't exist
                )
            ]
        )
        
        errors = self.validator.validate(project)
        warning_count = len([e for e in errors if e.code == "UNDEFINED_TRAIT_REFERENCE"])
        self.assertEqual(warning_count, 1)


if __name__ == '__main__':
    unittest.main()