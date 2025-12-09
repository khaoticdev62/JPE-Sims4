#!/bin/bash
# Launch script for JPE Sims 4 Mod Translator Steam Deck Edition

# Set the environment
export DISPLAY=:0
export PYTHONDONTWRITEBYTECODE=1

# Set the working directory to the project root
cd "$(dirname "$0")/../.."

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install core dependencies if they're not available
if ! python -c "import pygame" &> /dev/null; then
    echo "Installing pygame dependency..."
    pip install pygame>=2.0.0
fi

if ! python -c "import evdev" &> /dev/null; then
    echo "Installing evdev for Linux input device support..."
    pip install evdev>=1.6.0
fi

if ! python -c "import python-xlib" &> /dev/null; then
    echo "Installing python-xlib for X11 compatibility..."
    pip install python-xlib>=0.31
fi

# Install UI/UX enhancement dependencies
if [ -f "steamdeck/steamdeck_requirements.txt" ]; then
    echo "Installing Steam Deck UI/UX enhancement dependencies..."
    pip install -r steamdeck/steamdeck_requirements.txt
else
    echo "Steam Deck requirements not found, installing essential UI/UX packages..."
    pip install ttkbootstrap>=1.10.0 rich>=12.0.0 Pillow>=8.0.0 pygments>=2.7.0 pyperclip>=1.8.0
fi

# Verify that enhanced UI components are available
if python -c "import ttkbootstrap" &> /dev/null; then
    echo "Enhanced UI components available - Steam Deck app will use modern interface"
else
    echo "Enhanced UI components not available - Steam Deck app will use pygame fallback interface"
fi

# Launch the Steam Deck application
echo "Starting JPE Sims 4 Mod Translator Steam Deck Edition..."
python -m steamdeck.app

# Deactivate virtual environment if it was activated
if [[ "$VIRTUAL_ENV" ]]; then
    deactivate
fi