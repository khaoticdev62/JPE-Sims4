#!/usr/bin/env python3
"""Test script to check available font families in Qt."""
import sys
from PySide6.QtWidgets import QApplication
from PySide6.QtGui import QFontDatabase

# Need to initialize QApplication to access fonts
app = QApplication(sys.argv)

# Load bundled fonts
from jpe_studio_qt.fonts import load_bundled_fonts
result = load_bundled_fonts()
print("Fonts loaded:", result.loaded_files)
print("Errors:", result.errors)

# List all available font families
families = QFontDatabase.families()
print(f"\nTotal font families: {len(families)}")
print("="*50)

# Look specifically for Material Symbols fonts
material_fonts = [f for f in families if 'material' in f.lower() or 'symbol' in f.lower()]
print("Material symbol fonts found:")
for font in material_fonts:
    print(f"  - '{font}'")

print("\nFirst 10 fonts (alphabetical):")
for f in sorted(families)[:10]:
    print(f"  - '{f}'")

print("\nAll font families (first 30):")
for f in sorted(families)[:30]:
    print(f"  - '{f}'")

# Clean up
app.quit()