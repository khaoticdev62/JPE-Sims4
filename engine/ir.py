from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Union


class ResourceCategory(str, Enum):
    INTERACTION = "interaction"
    BUFF = "buff"
    TRAIT = "trait"
    STATISTIC = "statistic"
    LOOT_ACTION = "loot_action"
    TEST_SET = "test_set"
    ENUM = "enum"
    LOCALIZED_STRING = "localized_string"


@dataclass(slots=True)
class ResourceId:
    """Logical identifier for a tuning resource.

    This ties together the module, class name, and instance identifier used by the game.
    """

    name: str
    module: Optional[str] = None
    class_name: Optional[str] = None
    instance_id: Optional[int] = None


@dataclass(slots=True)
class LocalizedString:
    """Represents a single localized string entry in a string table."""

    key: str
    text: str
    locale: str = "en_US"


@dataclass(slots=True)
class EnumOption:
    """Single option inside an enum definition."""

    name: str
    value: Union[int, str]


@dataclass(slots=True)
class EnumDefinition:
    """Enum used by tuning tests or tunables."""

    id: ResourceId
    options: List[EnumOption] = field(default_factory=list)


@dataclass(slots=True)
class TestOperand:
    """Single operand in a test condition (e.g. statistic value, relationship value)."""

    left: str
    operator: str
    right: Union[int, float, str, bool]


@dataclass(slots=True)
class TestCondition:
    """Single test condition within a test set."""

    description: str
    operands: List[TestOperand] = field(default_factory=list)


@dataclass(slots=True)
class TestSet:
    """Logical grouping of tests used to gate interactions or loot."""

    id: Optional[ResourceId]
    conditions: List[TestCondition] = field(default_factory=list)
    run_type: str = "all"  # logical policy such as "all" or "any"


@dataclass(slots=True)
class LootAction:
    """Represents a single loot action, such as granting a buff or changing a statistic."""

    id: Optional[ResourceId]
    description: str
    parameters: Dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class Buff:
    """Represents a buff or moodlet."""

    id: ResourceId
    display_name_key: Optional[str] = None
    description_key: Optional[str] = None
    traits: List[str] = field(default_factory=list)
    duration_sim_minutes: Optional[int] = None


@dataclass(slots=True)
class Trait:
    """Represents a trait that can add modifiers and buffs."""

    id: ResourceId
    display_name_key: Optional[str] = None
    description_key: Optional[str] = None
    buffs: List[ResourceId] = field(default_factory=list)


@dataclass(slots=True)
class StatisticModifier:
    """Modifier applied to a statistic by a trait, buff, or loot."""

    statistic_name: str
    delta: float


@dataclass(slots=True)
class InteractionParticipant:
    """Participant role in an interaction, such as actor or target."""

    role: str
    description: Optional[str] = None


@dataclass(slots=True)
class Interaction:
    """Represents a single interaction tuning object in IR form."""

    id: ResourceId
    display_name_key: Optional[str] = None
    description_key: Optional[str] = None
    participants: List[InteractionParticipant] = field(default_factory=list)
    tests: List[TestSet] = field(default_factory=list)
    loot_actions: List[LootAction] = field(default_factory=list)
    autonomy_disabled: bool = False


@dataclass(slots=True)
class ProjectMetadata:
    """Metadata fields for a mod project."""

    name: str
    project_id: str
    version: str
    author: Optional[str] = None


@dataclass(slots=True)
class ProjectIR:
    """Top-level container for the IR representation of a project."""

    metadata: ProjectMetadata
    interactions: List[Interaction] = field(default_factory=list)
    buffs: List[Buff] = field(default_factory=list)
    traits: List[Trait] = field(default_factory=list)
    enums: List[EnumDefinition] = field(default_factory=list)
    test_sets: List[TestSet] = field(default_factory=list)
    loot_actions: List[LootAction] = field(default_factory=list)
    localized_strings: List[LocalizedString] = field(default_factory=list)
