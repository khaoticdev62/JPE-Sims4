"""Interactive template builder wizard for JPE Studio.

Provides a step-by-step GUI wizard that helps users create custom JPE templates
without needing to understand the full syntax. Guides users through interaction
creation with validation at each step.

Features:
- Step-by-step wizard interface
- Real-time syntax validation
- Template preview
- Pre-defined patterns and defaults
- Save and load template configurations
- Export to JPE format
"""

from __future__ import annotations

import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Callable, Any
from datetime import datetime
import json


class InteractionType(Enum):
    """Available interaction types."""
    SOCIAL = "social"
    OBJECT = "object"
    AUTONOMOUS = "autonomous"
    LOOPING = "looping"


class MoodType(Enum):
    """Available mood types."""
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


@dataclass
class TestCondition:
    """A single test condition."""
    condition_type: str
    parameters: Dict[str, Any] = field(default_factory=dict)
    negate: bool = False

    def to_string(self) -> str:
        """Convert to JPE syntax."""
        base = self.condition_type
        if self.negate:
            base = f"not {base}"
        return base


@dataclass
class Effect:
    """A single effect."""
    effect_type: str
    parameters: Dict[str, Any] = field(default_factory=dict)

    def to_string(self) -> str:
        """Convert to JPE syntax."""
        effect = self.effect_type
        for key, value in self.parameters.items():
            effect += f" {key}:{value}"
        return effect


@dataclass
class TemplateConfig:
    """Complete template configuration."""
    name: str
    description: str
    interaction_type: InteractionType
    duration: int
    tests: List[TestCondition] = field(default_factory=list)
    effects: List[Effect] = field(default_factory=list)
    buffs: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    category: Optional[str] = None
    cost: int = 0
    is_autonomous: bool = False

    def to_jpe(self) -> str:
        """Generate JPE syntax from configuration."""
        lines = []

        # Interaction header
        lines.append(self.name)
        lines.append(f'  description: "{self.description}"')
        lines.append(f"  type: {self.interaction_type.value}")
        lines.append(f"  duration: {self.duration}")

        # Tests
        if self.tests:
            lines.append("  tests:")
            for test in self.tests:
                lines.append(f"    - {test.to_string()}")

        # Effects
        if self.effects:
            lines.append("  effects:")
            for effect in self.effects:
                lines.append(f"    - {effect.to_string()}")

        # Buffs
        for buff_name, buff_config in self.buffs.items():
            lines.append("")
            lines.append("---")
            lines.append("")
            lines.append(buff_name)
            for key, value in buff_config.items():
                if isinstance(value, str) and not value.isdigit():
                    lines.append(f'  {key}: "{value}"')
                else:
                    lines.append(f"  {key}: {value}")

        return "\n".join(lines)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "name": self.name,
            "description": self.description,
            "interaction_type": self.interaction_type.value,
            "duration": self.duration,
            "tests": [{"type": t.condition_type, "negate": t.negate}
                     for t in self.tests],
            "effects": [{"type": e.effect_type, "parameters": e.parameters}
                       for e in self.effects],
            "buffs": self.buffs,
            "category": self.category,
            "cost": self.cost,
            "is_autonomous": self.is_autonomous,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> TemplateConfig:
        """Deserialize from dictionary."""
        config = cls(
            name=data["name"],
            description=data["description"],
            interaction_type=InteractionType(data["interaction_type"]),
            duration=data["duration"],
            category=data.get("category"),
            cost=data.get("cost", 0),
            is_autonomous=data.get("is_autonomous", False),
        )

        for test_data in data.get("tests", []):
            config.tests.append(TestCondition(
                condition_type=test_data["type"],
                negate=test_data.get("negate", False),
            ))

        for effect_data in data.get("effects", []):
            config.effects.append(Effect(
                effect_type=effect_data["type"],
                parameters=effect_data.get("parameters", {}),
            ))

        config.buffs = data.get("buffs", {})

        return config


class TemplateBuilderWizard:
    """Main wizard controller."""

    # Pre-defined test conditions
    COMMON_TESTS = {
        "Age & Lifecycle": {
            "actor is adult": "Restricts to adult Sims",
            "actor is teen": "Restricts to teen Sims",
            "both are adults": "Both participants must be adults",
        },
        "Mood & Emotions": {
            "actor is in good mood": "Actor must be happy",
            "actor is in bad mood": "Actor must be sad/angry",
            "actor is in focus mood": "Actor must be focused",
            "target is in good mood": "Target must be happy",
        },
        "Relationships": {
            "actor knows target": "Sims must know each other",
            "actor is friends with target": "Must have friendship",
            "actor is in love with target": "Must have romance",
            "actor is best friend with target": "Must be best friends",
        },
        "Skill & Status": {
            "actor has skill level 3+": "Requires skill level 3 or higher",
            "actor is not tired": "Actor must have energy",
            "actor is not busy": "Actor must be available",
        },
        "Location": {
            "not in public": "Must be in private location",
            "in home lot": "Must be on home lot",
            "location has equipment": "Location must have required equipment",
        },
    }

    # Pre-defined effects
    COMMON_EFFECTS = {
        "Mood Changes": {
            "increase mood by 10": "Slightly boost mood",
            "increase mood by 20": "Moderately boost mood",
            "increase mood by 30": "Significantly boost mood",
            "remove sad feeling": "Remove sadness",
            "remove angry feeling": "Remove anger",
        },
        "Relationships": {
            "increase friendship +5": "Small friendship boost",
            "increase friendship +15": "Moderate friendship increase",
            "increase friendship +30": "Large friendship increase",
            "increase romance +10": "Small romance boost",
            "increase romance +30": "Significant romance increase",
        },
        "Skills": {
            "increase cooking skill by 1": "Small cooking skill gain",
            "increase painting skill by 1": "Small painting skill gain",
            "increase logic skill by 2": "Moderate logic skill gain",
        },
        "Status": {
            "add happy feeling": "Add happiness buff",
            "add focused feeling": "Add focus buff",
            "add energized feeling": "Add energy buff",
            "add tired feeling": "Add fatigue buff",
        },
    }

    def __init__(self, parent: tk.Widget, on_save: Optional[Callable] = None):
        """Initialize the wizard.

        Args:
            parent: Parent widget
            on_save: Callback when template is saved
        """
        self.parent = parent
        self.on_save = on_save
        self.config = TemplateConfig(
            name="",
            description="",
            interaction_type=InteractionType.SOCIAL,
            duration=30,
        )

    def create_wizard_window(self) -> tk.Toplevel:
        """Create and return the wizard window."""
        window = tk.Toplevel(self.parent)
        window.title("JPE Template Builder Wizard")
        window.geometry("900x700")

        self.wizard_window = window
        self.create_notebook(window)

        # Buttons
        button_frame = ttk.Frame(window)
        button_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=10, pady=10)

        ttk.Button(
            button_frame,
            text="Previous",
            command=self.previous_step
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            button_frame,
            text="Next",
            command=self.next_step
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            button_frame,
            text="Preview",
            command=self.show_preview
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            button_frame,
            text="Save Template",
            command=self.save_template
        ).pack(side=tk.LEFT, padx=5)

        ttk.Button(
            button_frame,
            text="Cancel",
            command=window.destroy
        ).pack(side=tk.RIGHT, padx=5)

        return window

    def create_notebook(self, window: tk.Toplevel) -> None:
        """Create the notebook (tabbed interface)."""
        self.notebook = ttk.Notebook(window)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        # Step 1: Basic Information
        self.basic_frame = self.create_basic_info_tab()
        self.notebook.add(self.basic_frame, text="Step 1: Basic Info")

        # Step 2: Type & Duration
        self.type_frame = self.create_type_tab()
        self.notebook.add(self.type_frame, text="Step 2: Type & Duration")

        # Step 3: Tests
        self.tests_frame = self.create_tests_tab()
        self.notebook.add(self.tests_frame, text="Step 3: Conditions")

        # Step 4: Effects
        self.effects_frame = self.create_effects_tab()
        self.notebook.add(self.effects_frame, text="Step 4: Effects")

        # Step 5: Buffs
        self.buffs_frame = self.create_buffs_tab()
        self.notebook.add(self.buffs_frame, text="Step 5: Buffs")

    def create_basic_info_tab(self) -> ttk.Frame:
        """Create basic information step."""
        frame = ttk.Frame(self.notebook)

        # Title
        ttk.Label(frame, text="Step 1: Basic Information", font=("Arial", 14, "bold")).pack(pady=10)

        # Name
        ttk.Label(frame, text="Interaction Name:").pack(anchor=tk.W, padx=20)
        self.name_entry = ttk.Entry(frame, width=50)
        self.name_entry.pack(padx=20, pady=5, fill=tk.X)
        ttk.Label(frame, text="Examples: Greet Friend, Romantic Kiss, Cook Meal",
                 font=("Arial", 9, "italic")).pack(anchor=tk.W, padx=20)

        # Description
        ttk.Label(frame, text="Description:").pack(anchor=tk.W, padx=20, pady=(15, 0))
        self.desc_entry = scrolledtext.ScrolledText(frame, height=5, width=60)
        self.desc_entry.pack(padx=20, pady=5, fill=tk.BOTH, expand=True)
        ttk.Label(frame, text="What does this interaction do? This shows up in-game.",
                 font=("Arial", 9, "italic")).pack(anchor=tk.W, padx=20)

        # Category
        ttk.Label(frame, text="Category (optional):").pack(anchor=tk.W, padx=20, pady=(15, 0))
        categories = ["Social", "Skill", "Entertainment", "Romance", "Family", "Career"]
        self.category_var = tk.StringVar(value="Social")
        category_combo = ttk.Combobox(frame, textvariable=self.category_var,
                                      values=categories, state="readonly")
        category_combo.pack(padx=20, pady=5, fill=tk.X)

        return frame

    def create_type_tab(self) -> ttk.Frame:
        """Create type and duration step."""
        frame = ttk.Frame(self.notebook)

        ttk.Label(frame, text="Step 2: Type & Duration", font=("Arial", 14, "bold")).pack(pady=10)

        # Interaction Type
        ttk.Label(frame, text="Interaction Type:").pack(anchor=tk.W, padx=20, pady=(10, 0))

        type_frame = ttk.LabelFrame(frame, text="Select type:")
        type_frame.pack(padx=20, pady=10, fill=tk.X)

        self.type_var = tk.StringVar(value="social")

        types = [
            ("Social (between two Sims)", "social"),
            ("Object (Sim interacts with object)", "object"),
            ("Autonomous (Sims do it on their own)", "autonomous"),
            ("Looping (Repeating interaction)", "looping"),
        ]

        for label, value in types:
            ttk.Radiobutton(type_frame, text=label, variable=self.type_var,
                           value=value).pack(anchor=tk.W, padx=20, pady=5)

        # Duration
        ttk.Label(frame, text="Duration (seconds):").pack(anchor=tk.W, padx=20, pady=(15, 0))

        duration_frame = ttk.Frame(frame)
        duration_frame.pack(padx=20, pady=5, fill=tk.X)

        ttk.Label(duration_frame, text="Quick (5-15s):").pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(duration_frame, text="5", variable=tk.StringVar(),
                       command=lambda: self.set_duration(5)).pack(side=tk.LEFT, padx=2)
        ttk.Radiobutton(duration_frame, text="10", variable=tk.StringVar(),
                       command=lambda: self.set_duration(10)).pack(side=tk.LEFT, padx=2)
        ttk.Radiobutton(duration_frame, text="15", variable=tk.StringVar(),
                       command=lambda: self.set_duration(15)).pack(side=tk.LEFT, padx=2)

        ttk.Label(duration_frame, text=" | Medium (20-60s):").pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(duration_frame, text="30", variable=tk.StringVar(),
                       command=lambda: self.set_duration(30)).pack(side=tk.LEFT, padx=2)
        ttk.Radiobutton(duration_frame, text="45", variable=tk.StringVar(),
                       command=lambda: self.set_duration(45)).pack(side=tk.LEFT, padx=2)
        ttk.Radiobutton(duration_frame, text="60", variable=tk.StringVar(),
                       command=lambda: self.set_duration(60)).pack(side=tk.LEFT, padx=2)

        ttk.Label(duration_frame, text=" | Long (120+s):").pack(side=tk.LEFT, padx=5)
        ttk.Radiobutton(duration_frame, text="120", variable=tk.StringVar(),
                       command=lambda: self.set_duration(120)).pack(side=tk.LEFT, padx=2)

        # Custom duration
        ttk.Label(frame, text="Custom duration:").pack(anchor=tk.W, padx=20, pady=(10, 0))
        self.duration_entry = ttk.Entry(frame, width=20)
        self.duration_entry.pack(padx=20, pady=5)
        self.duration_entry.insert(0, "30")

        return frame

    def create_tests_tab(self) -> ttk.Frame:
        """Create test conditions step."""
        frame = ttk.Frame(self.notebook)

        ttk.Label(frame, text="Step 3: Conditions (Tests)",
                 font=("Arial", 14, "bold")).pack(pady=10)

        ttk.Label(frame, text="When should this interaction be available?").pack(pady=5)

        # Test selection
        test_frame = ttk.LabelFrame(frame, text="Available tests:")
        test_frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

        self.test_checkboxes: Dict[str, tk.BooleanVar] = {}
        self.test_vars: Dict[str, tk.StringVar] = {}

        for category, tests in self.COMMON_TESTS.items():
            cat_frame = ttk.LabelFrame(test_frame, text=category)
            cat_frame.pack(fill=tk.X, padx=10, pady=5)

            for test_name, description in tests.items():
                row_frame = ttk.Frame(cat_frame)
                row_frame.pack(fill=tk.X, padx=10, pady=3)

                var = tk.BooleanVar()
                self.test_checkboxes[test_name] = var

                ttk.Checkbutton(row_frame, text=test_name, variable=var).pack(side=tk.LEFT)
                ttk.Label(row_frame, text=f"({description})",
                         font=("Arial", 8, "italic")).pack(side=tk.LEFT, padx=10)

        return frame

    def create_effects_tab(self) -> ttk.Frame:
        """Create effects step."""
        frame = ttk.Frame(self.notebook)

        ttk.Label(frame, text="Step 4: Effects", font=("Arial", 14, "bold")).pack(pady=10)

        ttk.Label(frame, text="What should happen when this interaction completes?").pack(pady=5)

        # Effect selection
        effects_frame = ttk.LabelFrame(frame, text="Available effects:")
        effects_frame.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

        self.effect_checkboxes: Dict[str, tk.BooleanVar] = {}

        for category, effects in self.COMMON_EFFECTS.items():
            cat_frame = ttk.LabelFrame(effects_frame, text=category)
            cat_frame.pack(fill=tk.X, padx=10, pady=5)

            for effect_name, description in effects.items():
                row_frame = ttk.Frame(cat_frame)
                row_frame.pack(fill=tk.X, padx=10, pady=3)

                var = tk.BooleanVar()
                self.effect_checkboxes[effect_name] = var

                ttk.Checkbutton(row_frame, text=effect_name, variable=var).pack(side=tk.LEFT)
                ttk.Label(row_frame, text=f"({description})",
                         font=("Arial", 8, "italic")).pack(side=tk.LEFT, padx=10)

        return frame

    def create_buffs_tab(self) -> ttk.Frame:
        """Create buffs step."""
        frame = ttk.Frame(self.notebook)

        ttk.Label(frame, text="Step 5: Custom Buffs", font=("Arial", 14, "bold")).pack(pady=10)

        ttk.Label(frame, text="Create custom emotion/feeling buffs (optional)").pack(pady=5)

        # Buff creation area
        buff_frame = ttk.LabelFrame(frame, text="New buff:")
        buff_frame.pack(padx=10, pady=10, fill=tk.X)

        ttk.Label(buff_frame, text="Buff Name:").pack(anchor=tk.W, padx=10)
        self.buff_name_entry = ttk.Entry(buff_frame, width=40)
        self.buff_name_entry.pack(padx=10, pady=5, fill=tk.X)

        ttk.Label(buff_frame, text="Description:").pack(anchor=tk.W, padx=10)
        self.buff_desc_entry = ttk.Entry(buff_frame, width=40)
        self.buff_desc_entry.pack(padx=10, pady=5, fill=tk.X)

        ttk.Label(buff_frame, text="Mood Type:").pack(anchor=tk.W, padx=10)
        mood_frame = ttk.Frame(buff_frame)
        mood_frame.pack(padx=10, pady=5, fill=tk.X)

        self.mood_var = tk.StringVar(value="positive")
        for mood in ["positive", "negative", "neutral"]:
            ttk.Radiobutton(mood_frame, text=mood, variable=self.mood_var,
                           value=mood).pack(side=tk.LEFT, padx=5)

        ttk.Label(buff_frame, text="Intensity (1-4):").pack(anchor=tk.W, padx=10)
        self.intensity_spinbox = ttk.Spinbox(buff_frame, from_=1, to=4, width=10)
        self.intensity_spinbox.set(2)
        self.intensity_spinbox.pack(padx=10, pady=5)

        ttk.Label(buff_frame, text="Duration (seconds):").pack(anchor=tk.W, padx=10)
        self.duration_spinbox = ttk.Spinbox(buff_frame, from_=30, to=3600, width=10)
        self.duration_spinbox.set(180)
        self.duration_spinbox.pack(padx=10, pady=5)

        ttk.Button(buff_frame, text="Add Buff", command=self.add_buff).pack(padx=10, pady=5)

        # Buffs list
        self.buffs_text = scrolledtext.ScrolledText(frame, height=10, width=70)
        self.buffs_text.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

        return frame

    def set_duration(self, duration: int) -> None:
        """Set the duration."""
        self.config.duration = duration
        if hasattr(self, 'duration_entry'):
            self.duration_entry.delete(0, tk.END)
            self.duration_entry.insert(0, str(duration))

    def add_buff(self) -> None:
        """Add a buff to the configuration."""
        name = self.buff_name_entry.get()
        if not name:
            messagebox.showwarning("Warning", "Please enter a buff name")
            return

        self.config.buffs[name] = {
            "description": self.buff_desc_entry.get(),
            "mood_type": self.mood_var.get(),
            "intensity": int(self.intensity_spinbox.get()),
            "duration": int(self.duration_spinbox.get()),
            "mood_gain": 10 if self.mood_var.get() == "positive" else -10,
        }

        self.update_buffs_display()
        self.buff_name_entry.delete(0, tk.END)
        self.buff_desc_entry.delete(0, tk.END)

    def update_buffs_display(self) -> None:
        """Update the buffs display."""
        self.buffs_text.delete(1.0, tk.END)
        for name, buff_config in self.config.buffs.items():
            self.buffs_text.insert(tk.END, f"{name} ({buff_config['mood_type']})\n")

    def show_preview(self) -> None:
        """Show a preview of the generated JPE code."""
        self.update_config()
        preview_window = tk.Toplevel(self.wizard_window)
        preview_window.title("Template Preview")
        preview_window.geometry("700x600")

        preview_text = scrolledtext.ScrolledText(preview_window, wrap=tk.WORD)
        preview_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        jpe_code = self.config.to_jpe()
        preview_text.insert(1.0, jpe_code)
        preview_text.config(state=tk.DISABLED)

        ttk.Button(preview_window, text="Close",
                  command=preview_window.destroy).pack(pady=10)

    def update_config(self) -> None:
        """Update config from form values."""
        self.config.name = self.name_entry.get()
        self.config.description = self.desc_entry.get(1.0, tk.END).strip()
        self.config.interaction_type = InteractionType(self.type_var.get())
        self.config.category = self.category_var.get()

        try:
            self.config.duration = int(self.duration_entry.get())
        except ValueError:
            self.config.duration = 30

        # Update tests
        self.config.tests = []
        for test_name, var in self.test_checkboxes.items():
            if var.get():
                self.config.tests.append(TestCondition(condition_type=test_name))

        # Update effects
        self.config.effects = []
        for effect_name, var in self.effect_checkboxes.items():
            if var.get():
                self.config.effects.append(Effect(effect_type=effect_name))

    def save_template(self) -> None:
        """Save the template to a file."""
        self.update_config()

        if not self.config.name:
            messagebox.showerror("Error", "Please enter a template name")
            return

        # Ask where to save
        file_path = filedialog.asksaveasfilename(
            defaultextension=".jpe",
            filetypes=[("JPE Files", "*.jpe"), ("All Files", "*.*")],
            initialfile=self.config.name.lower().replace(" ", "_") + ".jpe"
        )

        if not file_path:
            return

        try:
            # Save JPE file
            jpe_code = self.config.to_jpe()
            Path(file_path).write_text(jpe_code)

            # Save config JSON alongside
            json_path = Path(file_path).with_suffix('.config.json')
            json_data = self.config.to_dict()
            json_data['created_at'] = datetime.now().isoformat()
            json_path.write_text(json.dumps(json_data, indent=2))

            messagebox.showinfo("Success",
                              f"Template saved to:\n{file_path}")

            if self.on_save:
                self.on_save(self.config)

            self.wizard_window.destroy()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to save template: {e}")

    def next_step(self) -> None:
        """Move to next step."""
        current = self.notebook.index(self.notebook.select())
        if current < len(self.notebook.tabs()) - 1:
            self.notebook.select(current + 1)

    def previous_step(self) -> None:
        """Move to previous step."""
        current = self.notebook.index(self.notebook.select())
        if current > 0:
            self.notebook.select(current - 1)


def create_template_builder_window(parent: tk.Widget,
                                   on_save: Optional[Callable] = None) -> tk.Toplevel:
    """Factory function to create and launch the template builder wizard.

    Args:
        parent: Parent widget
        on_save: Optional callback when template is saved

    Returns:
        The wizard window
    """
    wizard = TemplateBuilderWizard(parent, on_save)
    return wizard.create_wizard_window()


if __name__ == "__main__":
    # Standalone testing
    root = tk.Tk()
    root.title("Template Builder Wizard Test")
    root.geometry("200x100")

    def test_callback(config: TemplateConfig) -> None:
        print(f"Template saved: {config.name}")
        print(config.to_jpe())

    ttk.Button(
        root,
        text="Open Wizard",
        command=lambda: create_template_builder_window(root, test_callback)
    ).pack(pady=20)

    root.mainloop()
