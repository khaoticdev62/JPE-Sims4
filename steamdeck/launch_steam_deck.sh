#!/bin/bash
# Launch script for JPE Sims 4 Mod Translator Steam Deck Edition

# Set the environment
export DISPLAY=:0
export PYTHONDONTWRITEBYTECODE=1

# Set the working directory to the script's directory
cd "$(dirname "$0")/../"

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
elif [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check if required dependencies are installed
if ! python -c "import pygame" &> /dev/null; then
    echo "Installing pygame dependency..."
    pip install pygame
fi

if ! python -c "import tkinter" &> /dev/null; then
    echo "Tkinter is not available, using pygame-only interface..."
    # pygame will be used as the primary UI framework
fi

# Launch the Steam Deck application
python -m steamdeck.app

# Deactivate virtual environment if it was activated
if [[ "$VIRTUAL_ENV" ]]; then
    deactivate
fi