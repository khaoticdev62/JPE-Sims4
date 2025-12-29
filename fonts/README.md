# Font Pack System for JPE Sims 4 Mod Translator

The font pack system provides a customizable and extensible typography solution for the JPE Sims 4 Mod Translator application. It allows users to select from various font packs to optimize their editing experience.

## Features

- **Multiple Font Packs**: Choose from various pre-configured font packs optimized for different use cases
- **Theme Integration**: Font packs are integrated with the application's theme system
- **Bundled Font Collection**: Comprehensive collection of compatible open-source fonts
- **Custom Font Installation**: Install custom fonts for use in the application
- **Font Preview**: Preview font packs before applying them
- **Size Control**: Adjust font size multipliers for accessibility

## Font Packs Included

### Built-in Font Packs
1. **Classic Pack** - Traditional UI fonts for maximum compatibility
2. **Modern Pack** - Modern sans-serif fonts for a clean look
3. **Readable Pack** - Highly readable fonts with excellent contrast
4. **Developer Pack** - Optimized for code reading and editing

### Bundled Font Collections
The application ships with a comprehensive collection of open-source fonts organized by category:

#### Sans-serif Fonts
- **Roboto** - A neo-grotesque sans-serif designed for UI
- **Open Sans** - Humanist sans-serif with excellent readability
- **Lato** - Semi-rounded humanist sans-serif
- **Source Sans Pro** - Simple, straightforward sans-serif family
- **Ubuntu** - Modern, friendly and highly legible typeface
- **Fira Sans** - Humanist sans-serif designed for Mozilla
- **Noto Sans** - Google's font family supporting all languages

#### Serif Fonts
- **Roboto Slab** - Slab-serif version of Roboto
- **Merriweather** - Designed for online reading
- **Source Serif Pro** - Traditional-style serif
- **Crimson Text** - Designed for body text in books and journals
- **PT Serif** - Classical proportional serif

#### Monospace Fonts
- **Roboto Mono** - Monospaced version of Roboto
- **Fira Code** - Monospaced font with programming ligatures
- **Source Code Pro** - Monospaced font for coding environments
- **Ubuntu Mono** - Monospace derivative of Ubuntu
- **Inconsolata** - Monospace font designed for code
- **Cousine** - Metric-compatible with Courier New

#### Display Fonts
- **Oswald** - Semi-condensed uppercase font
- **Montserrat** - Geometric sans-serif inspired by old posters
- **Raleway** - Elegant and simple typeface
- **Playfair Display** - Transitional serif for headings

## Usage

### In Code
```python
from fonts.font_manager import font_manager

# Set a specific font pack
font_manager.set_current_pack("modern")

# Get a font from the current pack
default_font = font_manager.get_font("default")
header_font = font_manager.get_font("header", size_override=16)

# Get bundled font packs
bundled_packs = font_manager.get_bundled_font_packs()
builtin_packs = font_manager.get_builtin_font_packs()
```

### In UI
The font settings panel integrates with the application's settings UI, allowing users to:

- Select from available font packs
- Adjust font size multipliers
- Install bundled fonts
- Install custom fonts
- Preview font changes in real-time

## Installation of Bundled Fonts

The application includes utilities to install bundled fonts to your system:

1. **Automatic Installation**: Run the bundled font installer to install all fonts
2. **Category-based Installation**: Install fonts by category (sans-serif, serif, etc.)

```python
from fonts.bundled_font_installer import install_all_bundled_fonts, install_bundled_fonts_by_category

# Install all bundled fonts
results = install_all_bundled_fonts()

# Install only monospace fonts
monospace_results = install_bundled_fonts_by_category("monospace")
```

## Configuration

Font settings are stored in the application's configuration system:

- `fonts.current_pack` - Current font pack name
- `fonts.size_multiplier` - Multiplier applied to all font sizes
- `fonts.custom_font_paths` - Paths to custom font files
- `fonts.override_defaults` - Font overrides for specific UI elements

## License Compliance

All bundled fonts are open-source or freely distributable fonts with compatible licenses:

- **Apache 2.0 License**: Roboto, Roboto Mono, Roboto Slab, Cousine
- **SIL Open Font License**: Noto Sans, Merriweather, Source Serif Pro, Crimson Text, PT Serif, Inconsolata, Montserrat, Playfair Display, Raleway, Oswald
- **Mozilla Public License**: Fira Sans, Fira Code
- **Ubuntu Font License**: Ubuntu, Ubuntu Mono
- **Adobe Open Source License**: Source Sans Pro, Source Code Pro

## Integration with Themes

Each theme can be associated with a recommended font pack for optimal visual harmony. The theme manager automatically applies the appropriate fonts when a theme is selected.

## Adding Custom Font Packs

You can register additional font packs using the FontManager:

```python
from fonts.font_manager import FontPack, FontDefinition, font_manager

# Create a new font pack
my_pack = FontPack("my_pack", "My custom font pack")
my_pack.add_font("default", FontDefinition(
    name="default",
    family="MyCustomFont",
    size=10,
    weight="normal"
))

# Register the pack
font_manager.register_font_pack(my_pack)
```

## Custom Fonts

Custom fonts can be installed through the Font Installer utility or by placing font files in the `custom_fonts` directory. The system supports TrueType (.ttf) and OpenType (.otf) font formats.

## Accessibility

The font system includes accessibility features:

- Adjustable font sizes to accommodate different vision needs
- High contrast font options for better readability
- Support for system font preferences
- Comprehensive font selection for different use cases

## Visual Components

The font system includes visual components that enhance the user experience:

### Visual Font Preview
- Generates visual previews of font packs using Pillow
- Shows sample text in different font categories (default, header, monospace)
- Integrates with the design system font manager

### Visual Font Selector
- UI component with visual thumbnails of font packs
- Allows users to preview and select fonts with visual feedback
- Uses Pillow-generated previews for intuitive selection

## Usage

### Visual Components in Code
```python
from fonts.visual_font_preview import create_visual_font_previews
from fonts.visual_font_selector import show_visual_font_selector

# Generate visual previews for all font packs
preview_paths = create_visual_font_previews()

# Show the visual font selector
show_visual_font_selector(root_window)
```