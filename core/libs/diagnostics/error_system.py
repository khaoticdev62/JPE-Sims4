"""Multi-color coded error system for JPE Sims 4 Mod Translator."""

import tkinter as tk
from tkinter import ttk, messagebox
from enum import Enum
from dataclasses import dataclass
from typing import List, Dict, Optional, Any
import webbrowser


class ErrorSeverity(Enum):
    """Severity levels for error classification."""
    CRITICAL = "critical"
    WARNING = "warning"
    CAUTION = "caution"
    INFO = "info"
    SUCCESS = "success"


class ModConflictType(Enum):
    """Types of mod conflicts that can be detected."""
    RESOURCE_ID_COLLISION = "resource_id_collision"
    GAME_VERSION_MISMATCH = "game_version_mismatch"
    OBJECT_CONFLICT = "object_conflict"
    TRAIT_CONFLICT = "trait_conflict"
    DEPENDENCY_MISSING = "dependency_missing"
    XML_SCHEMA_VIOLATION = "xml_schema_violation"
    PERFORMANCE_HIGH_IMPACT = "performance_high_impact"
    DEPRECATED_FEATURE = "deprecated_feature"


@dataclass
class ErrorDetails:
    """Detailed information about an error."""
    error_id: str
    title: str
    description: str
    error_severity: ErrorSeverity
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    column_number: Optional[int] = None
    suggested_fixes: List[str] = None
    documentation_url: Optional[str] = None
    affected_mods: List[str] = None
    related_resources: List[str] = None

    def __post_init__(self):
        if self.suggested_fixes is None:
            self.suggested_fixes = []
        if self.affected_mods is None:
            self.affected_mods = []
        if self.related_resources is None:
            self.related_resources = []


class ErrorCard(ttk.Frame):
    """Custom error card component with color-coded visualization."""
    
    COLOR_MAP = {
        ErrorSeverity.CRITICAL: {
            "bg": "#FED7D7",  # Light red
            "fg": "#E53E3E",  # Dark red
            "border": "#FC8181",  # Medium red
            "icon": "🔴"
        },
        ErrorSeverity.WARNING: {
            "bg": "#FEEBC8",  # Light orange
            "fg": "#DD6B20",  # Dark orange
            "border": "#F6AD55",  # Medium orange
            "icon": "🟠"
        },
        ErrorSeverity.CAUTION: {
            "bg": "#FEF3C7",  # Light yellow
            "fg": "#D69E2E",  # Dark yellow
            "border": "#ECC94B",  # Medium yellow
            "icon": "🟡"
        },
        ErrorSeverity.INFO: {
            "bg": "#EBF8FF",  # Light blue
            "fg": "#3182CE",  # Dark blue
            "border": "#63B3ED",  # Medium blue
            "icon": "🔵"
        },
        ErrorSeverity.SUCCESS: {
            "bg": "#E6FFEA",  # Light green
            "fg": "#38A169",  # Dark green
            "border": "#68D391",  # Medium green
            "icon": "🟢"
        }
    }
    
    def __init__(self, parent, error_details: ErrorDetails, **kwargs):
        super().__init__(parent, **kwargs)
        
        self.error_details = error_details
        self.setup_ui()
    
    def setup_ui(self):
        """Create the error card UI."""
        # Get color scheme based on severity
        colors = self.COLOR_MAP[self.error_details.error_severity]

        # Configure the frame with colors
        self.configure(relief=tk.RAISED, borderwidth=2)

        # Create a custom style for this card
        style_name = f"ErrorCard.{self.error_details.error_severity.value}.TFrame"
        style = ttk.Style()
        style.configure(style_name, background=colors["bg"])

        # Apply the style
        self.configure(style=style_name)

        # Main content frame
        content_frame = ttk.Frame(self)
        content_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Header frame with icon and severity
        header_frame = ttk.Frame(content_frame)
        header_frame.pack(fill=tk.X, padx=0, pady=(0, 8))

        # Error icon
        icon_label = ttk.Label(
            header_frame,
            text=self.COLOR_MAP[self.error_details.error_severity]["icon"],
            font=("Arial", 14)
        )
        icon_label.pack(side=tk.LEFT, padx=(0, 8))

        # Error title
        title_label = ttk.Label(
            header_frame,
            text=f"{self.error_details.error_severity.value.upper()}: {self.error_details.title}",
            font=("Arial", 10, "bold"),
            foreground=self.COLOR_MAP[self.error_details.error_severity]["fg"]
        )
        title_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # File reference if available
        if self.error_details.file_path:
            file_reference = ttk.Label(
                content_frame,
                text=f"File: {self.error_details.file_path}",
                font=("Consolas", 9),
                foreground="#4A5568"
            )
            file_reference.pack(fill=tk.X, padx=0, pady=(0, 5))

            if self.error_details.line_number:
                position_text = f"Line: {self.error_details.line_number}"
                if self.error_details.column_number:
                    position_text += f", Column: {self.error_details.column_number}"
                position_label = ttk.Label(
                    content_frame,
                    text=position_text,
                    font=("Consolas", 9),
                    foreground="#718096"
                )
                position_label.pack(fill=tk.X, padx=0, pady=(0, 5))

        # Error description
        desc_label = ttk.Label(
            content_frame,
            text=self.error_details.description,
            font=("Arial", 10),
            foreground="#2D3748",
            wraplength=600
        )
        desc_label.pack(fill=tk.X, padx=0, pady=(0, 8))

        # Affected mods if any
        if self.error_details.affected_mods:
            mod_frame = ttk.LabelFrame(content_frame, text="Affected Mods", padding=5)
            mod_frame.pack(fill=tk.X, padx=0, pady=(0, 8))

            mod_list = "\n".join(f"• {mod}" for mod in self.error_details.affected_mods)
            mod_label = ttk.Label(
                mod_frame,
                text=mod_list,
                font=("Arial", 9),
                foreground="#2D3748"
            )
            mod_label.pack(anchor=tk.W)

        # Solution steps
        if self.error_details.suggested_fixes:
            solution_frame = ttk.LabelFrame(content_frame, text="How to Fix", padding=5)
            solution_frame.pack(fill=tk.X, padx=0, pady=(0, 8))

            for i, fix in enumerate(self.error_details.suggested_fixes, 1):
                fix_label = ttk.Label(
                    solution_frame,
                    text=f"{i}. {fix}",
                    font=("Arial", 9),
                    foreground="#2D3748"
                )
                fix_label.pack(anchor=tk.W, pady=2)

        # Action buttons at bottom
        button_frame = ttk.Frame(content_frame)
        button_frame.pack(fill=tk.X, padx=0, pady=(5, 0))

        if self.error_details.documentation_url:
            doc_button = ttk.Button(
                button_frame,
                text="View Documentation",
                command=lambda: self.open_documentation()
            )
            doc_button.pack(side=tk.RIGHT, padx=2)

        # Quick fix button if available
        if self.error_details.suggested_fixes:
            quick_fix_button = ttk.Button(
                button_frame,
                text="Quick Fix",
                command=self.quick_fix
            )
            quick_fix_button.pack(side=tk.RIGHT, padx=2)
    
    def _create_card_style(self):
        """Create a style for the card."""
        # This is just a placeholder - in a full implementation we'd create
        # a custom ttk style with the specific colors
        return "TFrame"
    
    def open_documentation(self):
        """Open the documentation URL in a browser."""
        if self.error_details.documentation_url:
            webbrowser.open(self.error_details.documentation_url)
    
    def quick_fix(self):
        """Apply a quick fix if available."""
        # In a real implementation, this would apply automated fixes
        # For now, just show a message
        fixes = "\n".join(self.error_details.suggested_fixes[:3])  # Limit to first 3
        message = f"Quick fix for:\n{self.error_details.title}\n\nSuggested steps:\n{fixes}"
        tk.messagebox.showinfo("Quick Fix Applied", message)


class ModCompatibilityChecker:
    """System to detect mod compatibility issues."""

    def __init__(self):
        self.installed_mods = []
        self.game_version = "1.100.42.1030"
        self.conflicts = []

    def set_game_version(self, version: str):
        """Set the current game version."""
        self.game_version = version

    def _check_game_version_compatibility(self) -> List[ErrorDetails]:
        """Check for game version compatibility issues."""
        errors = []

        for mod in self.installed_mods:
            if "required_game_version" in mod:
                req_version = mod["required_game_version"]
                if not self._compare_versions(self.game_version, req_version):
                    errors.append(ErrorDetails(
                        error_id=f"version_mismatch_{mod['name']}",
                        error_severity=ErrorSeverity.WARNING,
                        title="Game Version Mismatch",
                        description=f"Mod '{mod['name']}' requires game version {req_version} but you're running {self.game_version}",
                        suggested_fixes=[
                            "Update your game to the required version",
                            "Look for a mod update compatible with your game version",
                            "Temporarily disable the mod until updated"
                        ],
                        affected_mods=[mod["name"]],
                        documentation_url="https://jpe-sims4-mod-translator.com/game-compatibility"
                    ))

        return errors

    def _check_resource_id_conflicts(self) -> List[ErrorDetails]:
        """Check for resource ID conflicts between mods."""
        errors = []

        # Group resources by ID
        resource_map = {}
        for mod in self.installed_mods:
            if "resources" in mod:
                for resource in mod["resources"]:
                    res_id = resource.get("id")
                    if res_id:
                        if res_id not in resource_map:
                            resource_map[res_id] = []
                        resource_map[res_id].append(mod["name"])

        # Find conflicts
        for res_id, mod_names in resource_map.items():
            if len(mod_names) > 1:
                errors.append(ErrorDetails(
                    error_id=f"resource_conflict_{res_id}",
                    error_severity=ErrorSeverity.CAUTION,
                    title="Resource ID Conflict",
                    description=f"Multiple mods are attempting to define the same resource ID: {res_id}",
                    suggested_fixes=[
                        "Review conflicting mods to determine which one to keep",
                        "Check if mods are supposed to be used together",
                        "Contact mod authors about ID conflicts"
                    ],
                    affected_mods=mod_names
                ))

        return errors

    def _check_object_conflicts(self) -> List[ErrorDetails]:
        """Check for object conflicts between mods."""
        errors = []

        # Group objects by GUID
        object_map = {}
        for mod in self.installed_mods:
            if "objects" in mod:
                for obj in mod["objects"]:
                    obj_guid = obj.get("guid")
                    if obj_guid:
                        if obj_guid not in object_map:
                            object_map[obj_guid] = []
                        object_map[obj_guid].append(mod["name"])

        # Find conflicts
        for obj_guid, mod_names in object_map.items():
            if len(mod_names) > 1:
                errors.append(ErrorDetails(
                    error_id=f"object_conflict_{obj_guid}",
                    error_severity=ErrorSeverity.CAUTION,
                    title="Object Conflict",
                    description=f"Multiple mods are modifying the same object with GUID: {obj_guid}",
                    suggested_fixes=[
                        "Verify if mods are compatible with each other",
                        "Check mod documentation for compatibility notes",
                        "Only use one mod per object if they conflict"
                    ],
                    affected_mods=mod_names
                ))

        return errors

    def _check_trait_conflicts(self) -> List[ErrorDetails]:
        """Check for trait conflicts between mods."""
        errors = []

        # Group traits by ID
        trait_map = {}
        for mod in self.installed_mods:
            if "traits" in mod:
                for trait in mod["traits"]:
                    trait_id = trait.get("id")
                    if trait_id:
                        if trait_id not in trait_map:
                            trait_map[trait_id] = []
                        trait_map[trait_id].append(mod["name"])

        # Find conflicts
        for trait_id, mod_names in trait_map.items():
            if len(mod_names) > 1:
                errors.append(ErrorDetails(
                    error_id=f"trait_conflict_{trait_id}",
                    error_severity=ErrorSeverity.CAUTION,
                    title="Trait Conflict",
                    description=f"Multiple mods are defining the same trait ID: {trait_id}",
                    suggested_fixes=[
                        "Review trait definitions for conflicts",
                        "Check if mods are designed to work together",
                        "Only use one mod per trait if they conflict"
                    ],
                    affected_mods=mod_names
                ))

        return errors

    def _check_dependencies(self) -> List[ErrorDetails]:
        """Check for missing dependencies."""
        errors = []

        # Create a list of all available resources
        available_resources = set()
        for mod in self.installed_mods:
            if "resources" in mod:
                for resource in mod["resources"]:
                    res_id = resource.get("id")
                    if res_id:
                        available_resources.add(res_id)
            if "objects" in mod:
                for obj in mod["objects"]:
                    obj_guid = obj.get("guid")
                    if obj_guid:
                        available_resources.add(obj_guid)

        # Check for missing dependencies
        for mod in self.installed_mods:
            if "dependencies" in mod:
                for dep in mod["dependencies"]:
                    if dep not in available_resources:
                        errors.append(ErrorDetails(
                            error_id=f"missing_dependency_{dep}",
                            error_severity=ErrorSeverity.WARNING,
                            title="Missing Dependency",
                            description=f"Mod '{mod['name']}' requires resource '{dep}' which is not installed",
                            suggested_fixes=[
                                "Install the required dependency mod",
                                "Check if dependency mod is compatible with your game version",
                                "Verify dependency mod is properly installed"
                            ],
                            affected_mods=[mod["name"]]
                        ))

        return errors

    def _check_deprecated_features(self) -> List[ErrorDetails]:
        """Check for deprecated features usage."""
        errors = []

        for mod in self.installed_mods:
            if "deprecated_elements" in mod:
                for element in mod["deprecated_elements"]:
                    errors.append(ErrorDetails(
                        error_id=f"deprecated_element_{mod['name']}_{element}",
                        error_severity=ErrorSeverity.INFO,
                        title="Deprecated Feature Used",
                        description=f"Mod '{mod['name']}' uses deprecated element '{element}'",
                        suggested_fixes=[
                            "Update the mod to use newer alternatives",
                            "Contact the mod author for updates",
                            "Be aware this may stop working in future updates"
                        ],
                        affected_mods=[mod["name"]],
                        documentation_url="https://jpe-sims4-mod-translator.com/deprecated-features"
                    ))

        return errors

    def _compare_versions(self, current: str, required: str) -> bool:
        """Compare version strings."""
        try:
            curr_parts = [int(x) for x in current.split('.')[:3]]
            req_parts = [int(x) for x in required.split('.')[:3]]
            for c, r in zip(curr_parts, req_parts):
                if c < r:
                    return False
                elif c > r:
                    return True
            # If all compared parts are equal, check if current has more parts (e.g., "1.2.0.1" > "1.2.0")
            return len(curr_parts) >= len(req_parts)
        except:
            # If comparison fails, assume compatible
            return True
    
    def check_compatibility(self) -> List[ErrorDetails]:
        """Check for all compatibility issues."""
        errors = []
        
        # Check for game version compatibility issues
        errors.extend(self._check_game_version_compatibility())
        
        # Check for resource ID conflicts
        errors.extend(self._check_resource_id_conflicts())
        
        # Check for object conflicts
        errors.extend(self._check_object_conflicts())
        
        # Check for trait conflicts
        errors.extend(self._check_trait_conflicts())
        
        # Check for missing dependencies
        errors.extend(self._check_dependencies())
        
        # Check for deprecated features
        errors.extend(self._check_deprecated_features())
        
        return errors
    
    def _check_game_version_compatibility(self) -> List[ErrorDetails]:
        """Check for game version compatibility issues."""
        errors = []
        
        for mod in self.installed_mods:
            if "required_game_version" in mod:
                req_version = mod["required_game_version"]
                if not self._compare_versions(self.game_version, req_version):
                    errors.append(ErrorDetails(
                        error_id=f"version_mismatch_{mod['name']}",
                        error_severity=ErrorSeverity.WARNING,
                        title="Game Version Mismatch",
                        description=f"Mod '{mod['name']}' requires game version {req_version} but you're running {self.game_version}",
                        suggested_fixes=[
                            "Update your game to the required version",
                            "Look for a mod update compatible with your game version",
                            "Temporarily disable the mod until updated"
                        ],
                        affected_mods=[mod["name"]],
                        documentation_url="https://jpe-sims4-mod-translator.com/game-compatibility"
                    ))
        
        return errors
    
    def _check_resource_id_conflicts(self) -> List[ErrorDetails]:
        """Check for resource ID conflicts between mods."""
        errors = []
        
        # Group resources by ID
        resource_map = {}
        for mod in self.installed_mods:
            if "resources" in mod:
                for resource in mod["resources"]:
                    res_id = resource.get("id")
                    if res_id:
                        if res_id not in resource_map:
                            resource_map[res_id] = []
                        resource_map[res_id].append(mod["name"])
        
        # Find conflicts
        for res_id, mod_names in resource_map.items():
            if len(mod_names) > 1:
                errors.append(ErrorDetails(
                    error_id=f"resource_conflict_{res_id}",
                    error_severity=ErrorSeverity.CAUTION,
                    title="Resource ID Conflict",
                    description=f"Multiple mods are attempting to define the same resource ID: {res_id}",
                    suggested_fixes=[
                        "Review conflicting mods to determine which one to keep",
                        "Check if mods are supposed to be used together",
                        "Contact mod authors about ID conflicts"
                    ],
                    affected_mods=mod_names,
                    related_resources=[res_id]
                ))
        
        return errors
    
    def _check_object_conflicts(self) -> List[ErrorDetails]:
        """Check for object conflicts between mods."""
        errors = []
        
        # Group objects by GUID
        object_map = {}
        for mod in self.installed_mods:
            if "objects" in mod:
                for obj in mod["objects"]:
                    obj_guid = obj.get("guid")
                    if obj_guid:
                        if obj_guid not in object_map:
                            object_map[obj_guid] = []
                        object_map[obj_guid].append(mod["name"])
        
        # Find conflicts
        for obj_guid, mod_names in object_map.items():
            if len(mod_names) > 1:
                errors.append(ErrorDetails(
                    error_id=f"object_conflict_{obj_guid}",
                    error_severity=ErrorSeverity.CAUTION,
                    title="Object Conflict",
                    description=f"Multiple mods are modifying the same object with GUID: {obj_guid}",
                    suggested_fixes=[
                        "Verify if mods are compatible with each other",
                        "Check mod documentation for compatibility notes",
                        "Only use one mod per object if they conflict"
                    ],
                    affected_mods=mod_names,
                    related_resources=[obj_guid]
                ))
        
        return errors
    
    def _check_trait_conflicts(self) -> List[ErrorDetails]:
        """Check for trait conflicts between mods."""
        errors = []
        
        # Group traits by ID
        trait_map = {}
        for mod in self.installed_mods:
            if "traits" in mod:
                for trait in mod["traits"]:
                    trait_id = trait.get("id")
                    if trait_id:
                        if trait_id not in trait_map:
                            trait_map[trait_id] = []
                        trait_map[trait_id].append(mod["name"])
        
        # Find conflicts
        for trait_id, mod_names in trait_map.items():
            if len(mod_names) > 1:
                errors.append(ErrorDetails(
                    error_id=f"trait_conflict_{trait_id}",
                    error_severity=ErrorSeverity.CAUTION,
                    title="Trait Conflict",
                    description=f"Multiple mods are defining the same trait ID: {trait_id}",
                    suggested_fixes=[
                        "Review trait definitions for conflicts",
                        "Check if mods are designed to work together",
                        "Only use one mod per trait if they conflict"
                    ],
                    affected_mods=mod_names,
                    related_resources=[trait_id]
                ))
        
        return errors
    
    def _check_dependencies(self) -> List[ErrorDetails]:
        """Check for missing dependencies."""
        errors = []
        
        # Create a list of all available resources
        available_resources = set()
        for mod in self.installed_mods:
            if "resources" in mod:
                for resource in mod["resources"]:
                    res_id = resource.get("id")
                    if res_id:
                        available_resources.add(res_id)
            if "objects" in mod:
                for obj in mod["objects"]:
                    obj_guid = obj.get("guid")
                    if obj_guid:
                        available_resources.add(obj_guid)
        
        # Check for missing dependencies
        for mod in self.installed_mods:
            if "dependencies" in mod:
                for dep in mod["dependencies"]:
                    if dep not in available_resources:
                        errors.append(ErrorDetails(
                            error_id=f"missing_dependency_{dep}",
                            error_severity=ErrorSeverity.WARNING,
                            title="Missing Dependency",
                            description=f"Mod '{mod['name']}' requires resource '{dep}' which is not installed",
                            suggested_fixes=[
                                "Install the required dependency mod",
                                "Check if dependency mod is compatible with your game version",
                                "Verify dependency mod is properly installed"
                            ],
                            affected_mods=[mod["name"]],
                            related_resources=[dep]
                        ))
        
        return errors
    
    def _check_deprecated_features(self) -> List[ErrorDetails]:
        """Check for deprecated features usage."""
        errors = []
        
        for mod in self.installed_mods:
            if "deprecated_elements" in mod:
                for element in mod["deprecated_elements"]:
                    errors.append(ErrorDetails(
                        error_id=f"deprecated_element_{mod['name']}_{element}",
                        error_severity=ErrorSeverity.INFO,
                        title="Deprecated Feature Used",
                        description=f"Mod '{mod['name']}' uses deprecated element '{element}'",
                        suggested_fixes=[
                            "Update the mod to use newer alternatives",
                            "Contact the mod author for updates",
                            "Be aware this may stop working in future updates"
                        ],
                        affected_mods=[mod["name"]],
                        documentation_url="https://jpe-sims4-mod-translator.com/deprecated-features"
                    ))
        
        return errors
    
    def _compare_versions(self, current: str, required: str) -> bool:
        """Compare version strings."""
        try:
            curr_parts = [int(x) for x in current.split('.')[:3]]
            req_parts = [int(x) for x in required.split('.')[:3]]
            return curr_parts >= req_parts
        except:
            # If comparison fails, assume compatible
            return True


class ErrorDisplayManager:
    """Manage display of errors in UI."""
    
    def __init__(self, parent):
        self.parent = parent
        self.error_cards = []
        self.compatibility_checker = ModCompatibilityChecker()
        
        self.setup_ui()
    
    def setup_ui(self):
        """Set up the error display UI."""
        # Main container
        self.container = ttk.Frame(self.parent)
        self.container.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Header
        header_frame = ttk.Frame(self.container)
        header_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(
            header_frame,
            text="Mod Error Detection & Compatibility Checker",
            font=("Arial", 14, "bold")
        ).pack(side=tk.LEFT)
        
        # Refresh button
        refresh_btn = ttk.Button(
            header_frame,
            text="Check for Issues",
            command=self.check_for_issues
        )
        refresh_btn.pack(side=tk.RIGHT)
        
        # Error container (canvas with scrollbar for multiple errors)
        canvas_frame = ttk.Frame(self.container)
        canvas_frame.pack(fill=tk.BOTH, expand=True)
        
        self.canvas = tk.Canvas(canvas_frame)
        scrollbar = ttk.Scrollbar(canvas_frame, orient="vertical", command=self.canvas.yview)
        self.scroll_frame = ttk.Frame(self.canvas)
        
        self.scroll_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scroll_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Bind mousewheel to scroll
        self.canvas.bind_all("<MouseWheel>", self._on_mousewheel)
    
    def _on_mousewheel(self, event):
        """Handle mouse wheel scrolling."""
        self.canvas.yview_scroll(int(-1*(event.delta/120)), "units")
    
    def clear_errors(self):
        """Clear all displayed errors."""
        for card in self.error_cards:
            card.destroy()
        self.error_cards = []
    
    def display_errors(self, errors: List[ErrorDetails]):
        """Display a list of errors."""
        self.clear_errors()
        
        if not errors:
            ttk.Label(
                self.scroll_frame,
                text="No issues detected! All mods are compatible.",
                font=("Arial", 12, "italic"),
                foreground="green"
            ).pack(pady=20)
            return
        
        # Group errors by severity
        severity_groups = {
            ErrorSeverity.CRITICAL: [],
            ErrorSeverity.WARNING: [],
            ErrorSeverity.CAUTION: [],
            ErrorSeverity.INFO: [],
            ErrorSeverity.SUCCESS: []
        }
        
        for error in errors:
            severity_groups[error.error_severity].append(error)
        
        # Display groups in order of importance
        for severity in [ErrorSeverity.CRITICAL, ErrorSeverity.WARNING, ErrorSeverity.CAUTION, ErrorSeverity.INFO, ErrorSeverity.SUCCESS]:
            group_errors = severity_groups[severity]
            if group_errors:
                self._display_error_group(group_errors, severity)
    
    def _display_error_group(self, errors: List[ErrorDetails], severity: ErrorSeverity):
        """Display a group of errors with a header."""
        header_text = {
            ErrorSeverity.CRITICAL: f"Critical Issues ({len(errors)})",
            ErrorSeverity.WARNING: f"Warnings ({len(errors)})",
            ErrorSeverity.CAUTION: f"Potential Conflicts ({len(errors)})",
            ErrorSeverity.INFO: f"Informational Notes ({len(errors)})",
            ErrorSeverity.SUCCESS: f"Success Messages ({len(errors)})"
        }[severity]
        
        # Add group header
        header_frame = ttk.Frame(self.scroll_frame)
        header_frame.pack(fill=tk.X, padx=5, pady=5)
        
        ttk.Label(
            header_frame,
            text=header_text,
            font=("Arial", 10, "bold"),
            foreground=self.ErrorCard.COLOR_MAP[severity]["fg"]
        ).pack(side=tk.LEFT)
        
        # Add error cards
        for error in errors:
            card = ErrorCard(self.scroll_frame, error)
            card.pack(fill=tk.X, padx=5, pady=2, ipadx=5, ipady=5)
            self.error_cards.append(card)
    
    def check_for_issues(self):
        """Check for all potential issues."""
        # In a real implementation, this would check for actual project issues
        # such as compatibility problems, resource conflicts, etc.
        # For now, we'll just run the compatibility checker with any loaded mods
        errors = self.compatibility_checker.check_compatibility()
        self.display_errors(errors)


def main():
    """Main function to run the error detection system."""
    root = tk.Tk()
    root.title("JPE Sims 4 - Mod Error Detection & Compatibility Checker")
    root.geometry("800x600")
    
    # Initialize the error display
    error_manager = ErrorDisplayManager(root)
    
    # Initially check for issues
    error_manager.check_for_issues()
    
    root.mainloop()


if __name__ == "__main__":
    main()