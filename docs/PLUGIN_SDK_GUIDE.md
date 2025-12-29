# JPE Studio Plugin SDK Guide 🛠️

This guide provides technical instructions for developers who want to extend the capabilities of the JPE Sims 4 Mod Translator by creating custom plugins.

## 1. Plugin Architecture

JPE Studio uses a modular plugin architecture that allows you to hook into three primary phases of the mod development lifecycle:

1.  **Extraction**: Converting raw game XML or other formats into JPE IR.
2.  **Transformation**: Modifying the Intermediate Representation (IR) before generation.
3.  **Generation**: Creating final tuning files from JPE source.

## 2. Creating Your First Plugin

A JPE plugin is a Python module that implements the `BasePlugin` interface.

### Directory Structure
Place your plugin in the `plugins/` directory:
```
plugins/
└── my_custom_plugin/
    ├── __init__.py
    ├── manifest.json
    └── plugin.py
```

### The Plugin Class
```python
from engine.plugins.base import BasePlugin
from engine.ir import ProjectIR

class MyCustomPlugin(BasePlugin):
    def name(self) -> str:
        return "My Custom Optimizer"
        
    def version(self) -> str:
        return "1.0.0"
        
    def transform(self, ir: ProjectIR) -> tuple[ProjectIR, list[EngineError]]:
        # Your optimization logic here
        return ir, []
```

## 3. Hooking into the AI Assistant

You can register custom "Auto-Fix" patterns that the AI Assistant will prioritize when resolving specific diagnostic codes.

```python
from jpe_studio_qt.ai.auto_fix import register_fix_pattern

register_fix_pattern(
    error_code="MY_PLUGIN_001",
    fix_template="id: {id}\nstatus: reviewed\nend"
)
```

## 4. UI Extensions

If your plugin requires a custom settings panel, implement the `get_settings_widget` method:

```python
from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel

def get_settings_widget(self, parent=None) -> QWidget:
    widget = QWidget(parent)
    layout = QVBoxLayout(widget)
    layout.addWidget(QLabel("My Plugin Configuration"))
    return widget
```

## 5. Security & Distribution

-   **Sandboxing**: Plugins run in the same process as JPE Studio. Ensure your code is performant and does not block the main UI thread.
-   **Manifest**: Your `manifest.json` must include a unique `plugin_id` and specify the required game version.
-   **Marketplace**: To submit to the Marketplace, your plugin must pass the `ClaudeApiGradingBenchmark` for code quality and brand alignment.

---

For detailed API references, see `docs/JPE_API_REFERENCE.md`.
