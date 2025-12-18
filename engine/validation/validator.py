from __future__ import annotations

from typing import List

from engine.ir import (
    ProjectIR, ProjectMetadata, ResourceId, Interaction, InteractionParticipant,
    Buff, Trait, EnumDefinition, EnumOption, TestSet, TestCondition, TestOperand,
    LootAction, StatisticModifier, LocalizedString
)
import sys
from pathlib import Path
# Add the parent directory to the path to allow imports
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from diagnostics.errors import EngineError, ErrorCategory, ErrorSeverity


class ProjectValidator:
    """Perform structural and semantic validation on a ProjectIR instance."""

    def validate(self, ir: ProjectIR) -> List[EngineError]:
        """Return a list of validation errors and warnings.

        The validator does not modify the IR; it only inspects and reports.
        """
        errors: List[EngineError] = []

        # Validate project metadata
        errors.extend(self._validate_project_metadata(ir.metadata))

        # Validate all components
        for interaction in ir.interactions:
            errors.extend(self._validate_interaction(interaction))

        for buff in ir.buffs:
            errors.extend(self._validate_buff(buff))

        for trait in ir.traits:
            errors.extend(self._validate_trait(trait))

        for enum_def in ir.enums:
            errors.extend(self._validate_enum(enum_def))

        for string in ir.localized_strings:
            errors.extend(self._validate_localized_string(string))

        # Validate cross-references
        errors.extend(self._validate_cross_references(ir))

        return errors

    def _validate_project_metadata(self, metadata: ProjectMetadata) -> List[EngineError]:
        """Validate project metadata fields."""
        errors: List[EngineError] = []

        if not metadata.name or not metadata.name.strip():
            errors.append(EngineError(
                code="INVALID_PROJECT_NAME",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="Project name is required",
                message_long="The project must have a valid name",
                suggested_fix="Add a 'name' field to your project metadata."
            ))

        if not metadata.project_id or not metadata.project_id.strip():
            errors.append(EngineError(
                code="INVALID_PROJECT_ID",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="Project ID is required",
                message_long="The project must have a valid ID",
                suggested_fix="Add a 'project_id' field to your project metadata."
            ))

        return errors

    def _validate_interaction(self, interaction: Interaction) -> List[EngineError]:
        """Validate a single interaction."""
        errors: List[EngineError] = []

        # Validate ID
        if not interaction.id.name or not interaction.id.name.strip():
            errors.append(EngineError(
                code="INVALID_INTERACTION_ID",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="Interaction ID is required",
                message_long="Every interaction must have a valid ID",
                suggested_fix="Add an 'id' field to your interaction definition.",
                resource_id=interaction.id.name if interaction.id else "unknown"
            ))

        # Validate participants
        for i, participant in enumerate(interaction.participants):
            if not participant.role or not participant.role.strip():
                errors.append(EngineError(
                    code="INVALID_PARTICIPANT_ROLE",
                    category=ErrorCategory.VALIDATION_SCHEMA,
                    severity=ErrorSeverity.WARNING,
                    message_short="Participant role is missing",
                    message_long=f"Interaction '{interaction.id.name}' has a participant without a role at index {i}",
                    suggested_fix="Add a 'role' field to the participant definition.",
                    resource_id=interaction.id.name
                ))

        # Check for duplicate participant roles
        roles = [p.role for p in interaction.participants if p.role]
        if len(roles) != len(set(roles)):
            errors.append(EngineError(
                code="DUPLICATE_PARTICIPANT_ROLES",
                category=ErrorCategory.VALIDATION_SEMANTIC,
                severity=ErrorSeverity.WARNING,
                message_short="Duplicate participant roles detected",
                message_long=f"Interaction '{interaction.id.name}' has duplicate participant roles",
                suggested_fix="Ensure each participant in an interaction has a unique role.",
                resource_id=interaction.id.name
            ))

        return errors

    def _validate_buff(self, buff: Buff) -> List[EngineError]:
        """Validate a single buff."""
        errors: List[EngineError] = []

        # Validate ID
        if not buff.id.name or not buff.id.name.strip():
            errors.append(EngineError(
                code="INVALID_BUFF_ID",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="Buff ID is required",
                message_long="Every buff must have a valid ID",
                suggested_fix="Add an 'id' field to your buff definition.",
                resource_id=buff.id.name if buff.id else "unknown"
            ))

        # Validate duration if specified
        if buff.duration_sim_minutes is not None and buff.duration_sim_minutes < 0:
            errors.append(EngineError(
                code="INVALID_BUFF_DURATION",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.WARNING,
                message_short="Buff duration should be non-negative",
                message_long=f"Buff '{buff.id.name}' has a negative duration",
                suggested_fix="Set the duration to a non-negative value.",
                resource_id=buff.id.name
            ))

        return errors

    def _validate_trait(self, trait: Trait) -> List[EngineError]:
        """Validate a single trait."""
        errors: List[EngineError] = []

        # Validate ID
        if not trait.id.name or not trait.id.name.strip():
            errors.append(EngineError(
                code="INVALID_TRAIT_ID",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="Trait ID is required",
                message_long="Every trait must have a valid ID",
                suggested_fix="Add an 'id' field to your trait definition.",
                resource_id=trait.id.name if trait.id else "unknown"
            ))

        return errors

    def _validate_enum(self, enum_def: EnumDefinition) -> List[EngineError]:
        """Validate a single enum definition."""
        errors: List[EngineError] = []

        # Validate ID
        if not enum_def.id.name or not enum_def.id.name.strip():
            errors.append(EngineError(
                code="INVALID_ENUM_ID",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="Enum ID is required",
                message_long="Every enum must have a valid ID",
                suggested_fix="Add an 'id' field to your enum definition.",
                resource_id=enum_def.id.name if enum_def.id else "unknown"
            ))

        # Validate options
        if not enum_def.options:
            errors.append(EngineError(
                code="EMPTY_ENUM_OPTIONS",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.WARNING,
                message_short="Enum has no options",
                message_long=f"Enum '{enum_def.id.name}' has no defined options",
                suggested_fix="Add at least one option to your enum definition.",
                resource_id=enum_def.id.name
            ))
        else:
            # Check for duplicate option names
            option_names = [opt.name for opt in enum_def.options]
            if len(option_names) != len(set(option_names)):
                errors.append(EngineError(
                    code="DUPLICATE_ENUM_OPTIONS",
                    category=ErrorCategory.VALIDATION_SEMANTIC,
                    severity=ErrorSeverity.ERROR,
                    message_short="Enum has duplicate option names",
                    message_long=f"Enum '{enum_def.id.name}' has duplicate option names",
                    suggested_fix="Ensure all option names within an enum are unique.",
                    resource_id=enum_def.id.name
                ))

        return errors

    def _validate_localized_string(self, string: LocalizedString) -> List[EngineError]:
        """Validate a single localized string."""
        errors: List[EngineError] = []

        # Validate key
        if not string.key or not string.key.strip():
            errors.append(EngineError(
                code="INVALID_STRING_KEY",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.ERROR,
                message_short="String key is required",
                message_long="Every localized string must have a valid key",
                suggested_fix="Add a 'key' field to your string definition.",
                resource_id=string.key
            ))

        # Validate text
        if not string.text or not string.text.strip():
            errors.append(EngineError(
                code="EMPTY_STRING_TEXT",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.WARNING,
                message_short="String text is empty",
                message_long=f"Localized string with key '{string.key}' has empty text",
                suggested_fix="Add text content to your string definition.",
                resource_id=string.key
            ))

        # Validate locale format
        if string.locale and not self._is_valid_locale(string.locale):
            errors.append(EngineError(
                code="INVALID_LOCALE_FORMAT",
                category=ErrorCategory.VALIDATION_SCHEMA,
                severity=ErrorSeverity.WARNING,
                message_short="Invalid locale format",
                message_long=f"Locale '{string.locale}' for key '{string.key}' does not match expected format (e.g., en_US)",
                suggested_fix="Use a standard locale format like 'en_US' or 'en'.",
                resource_id=string.key
            ))

        return errors

    def _is_valid_locale(self, locale: str) -> bool:
        """Check if a locale string is in the expected format (e.g., en_US)."""
        # Basic check: should be in format like "en_US" or "en"
        parts = locale.split('_')
        if len(parts) == 1:
            # Just language code
            return len(parts[0]) == 2 or len(parts[0]) == 3
        elif len(parts) == 2:
            # Language and country code
            return (len(parts[0]) == 2 or len(parts[0]) == 3) and len(parts[1]) == 2
        return False

    def _validate_cross_references(self, ir: ProjectIR) -> List[EngineError]:
        """Validate cross-references between different components."""
        errors: List[EngineError] = []

        # Collect all resource IDs for reference checking
        all_resource_ids: set[str] = set()

        # Add all interaction IDs
        for interaction in ir.interactions:
            all_resource_ids.add(interaction.id.name)

        # Add all buff IDs
        for buff in ir.buffs:
            all_resource_ids.add(buff.id.name)

        # Add all trait IDs
        for trait in ir.traits:
            all_resource_ids.add(trait.id.name)

        # Add all enum IDs
        for enum_def in ir.enums:
            all_resource_ids.add(enum_def.id.name)

        # Add all string keys
        for string in ir.localized_strings:
            all_resource_ids.add(string.key)

        # Check for duplicate IDs across all resource types
        id_counts: dict[str, int] = {}
        for res_id in all_resource_ids:
            id_counts[res_id] = id_counts.get(res_id, 0) + 1

        for res_id, count in id_counts.items():
            if count > 1:
                errors.append(EngineError(
                    code="DUPLICATE_RESOURCE_ID",
                    category=ErrorCategory.VALIDATION_SEMANTIC,
                    severity=ErrorSeverity.ERROR,
                    message_short="Duplicate resource ID across different components",
                    message_long=f"Resource ID '{res_id}' is used by multiple different components",
                    suggested_fix="Ensure each resource (interaction, buff, trait, etc.) has a unique ID.",
                    resource_id=res_id
                ))

        # Check that buffs referenced in traits exist
        for trait in ir.traits:
            for buff_ref in trait.buffs:
                if buff_ref.name not in all_resource_ids:
                    errors.append(EngineError(
                        code="UNDEFINED_BUFF_REFERENCE",
                        category=ErrorCategory.VALIDATION_SEMANTIC,
                        severity=ErrorSeverity.WARNING,
                        message_short="Undefined buff referenced in trait",
                        message_long=f"Trait '{trait.id.name}' references undefined buff '{buff_ref.name}'",
                        suggested_fix=f"Define a buff with ID '{buff_ref.name}' or remove the reference from the trait.",
                        resource_id=trait.id.name
                    ))

        # Check that traits referenced in buffs exist
        for buff in ir.buffs:
            for trait_name in buff.traits:
                if trait_name not in all_resource_ids:
                    errors.append(EngineError(
                        code="UNDEFINED_TRAIT_REFERENCE",
                        category=ErrorCategory.VALIDATION_SEMANTIC,
                        severity=ErrorSeverity.WARNING,
                        message_short="Undefined trait referenced in buff",
                        message_long=f"Buff '{buff.id.name}' references undefined trait '{trait_name}'",
                        suggested_fix=f"Define a trait with ID '{trait_name}' or remove the reference from the buff.",
                        resource_id=buff.id.name
                    ))

        return errors
