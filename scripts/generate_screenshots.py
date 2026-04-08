"""
Mock Screenshot Generator for JPE Sims 4 Mod Translator UI/UX Enhancements.

This script generates sample screenshots showcasing the various UI/UX enhancements
implemented in the project.
"""

from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path


def create_main_editor_screenshot():
    """Create a mock screenshot of the main editor interface."""
    width, height = 1400, 900
    img = Image.new('RGB', (width, height), color='#2c3e50')  # Dark background
    draw = ImageDraw.Draw(img)

    # Header section with branding
    header_height = 60
    draw.rectangle([0, 0, width, header_height], fill='#1a2530')  # Darker header

    # Title
    try:
        # Try to use a better font if available
        title_font = ImageFont.truetype("arial.ttf", 24)
    except:
        title_font = ImageFont.load_default()

    draw.text((20, 15), "JPE Sims 4 Mod Translator Studio", fill='#2EC4B6', font=title_font)  # Brand accent color

    # Menu bar
    menu_height = 30
    draw.rectangle([0, header_height, width, header_height + menu_height], fill='#34495e')  # Menu bar color

    # Draw menu items
    menu_items = ["File", "Edit", "View", "Project", "Build", "Tools", "Help"]
    x_pos = 10
    for item in menu_items:
        draw.text((x_pos, header_height + 8), item, fill='white')
        x_pos += 80

    # Toolbar
    toolbar_height = 50
    draw.rectangle([0, header_height + menu_height, width, header_height + menu_height + toolbar_height], fill='#3d566e')

    # Draw toolbar buttons (simple rectangles with text)
    button_x = 10
    for i in range(8):
        draw.rectangle([button_x, header_height + menu_height + 10, button_x + 40, header_height + menu_height + 40],
                      fill='#2EC4B6', outline='white')
        draw.text((button_x + 10, header_height + menu_height + 18), f"Btn{i+1}", fill='white')
        button_x += 50

    # Content area with three panels (simulating a typical IDE layout)
    content_y_start = header_height + menu_height + toolbar_height
    left_width = 250
    right_width = 250

    # Draw panel separators
    draw.rectangle([0, content_y_start, width, height - 40], fill='#34495e')  # Main content background

    # Left panel (file explorer/toolbox)
    draw.rectangle([0, content_y_start, left_width, height - 40], fill='#3d566e')
    draw.text((10, content_y_start + 10), "Project Explorer", fill='white')

    # Sample file structure
    file_items = ["mods/", "  main.jpe", "  interactions/", "    greet.jpe", "    social.jpe", "  buffs/", "    mood.jpe"]
    y_offset = content_y_start + 30
    for item in file_items:
        indent = 20 if item.startswith("  ") else 10
        color = '#95a5a6' if item.startswith("  ") else '#ecf0f1'
        draw.text((indent, y_offset), item, fill=color)
        y_offset += 20

    # Editor area
    editor_x_start = left_width + 5
    editor_width = width - left_width - right_width - 10
    draw.rectangle([editor_x_start, content_y_start, editor_x_start + editor_width, height - 40], fill='#1e2a3a')

    # Editor header
    draw.rectangle([editor_x_start, content_y_start, editor_x_start + editor_width, content_y_start + 25], fill='#2c3e50')
    draw.text((editor_x_start + 10, content_y_start + 5), "main.jpe", fill='#2EC4B6')

    # Sample editor content
    code_y = content_y_start + 30
    code_lines = [
        "define interaction GreetNeighbor",
        "    name: \"GreetNeighborInteraction\"",
        "    display_name: \"Greet Neighbor\"",
        "    description: \"Politely greet a nearby neighbor\"",
        "    class: \"GreetNeighborInteraction\"",
        "    ",
        "    target: Actor",
        "    icon: \"ui/icon_GreetNeighbor\"",
        "    ",
        "    test_set: GreetNeighborTestSet",
        "    ",
        "    loot_actions:",
        "        - show_message: \"Hello, nice to meet you!\"",
        "        - add_statistic_change: social, 5",
        "        - trigger_animation: wave_hello",
        "end"
    ]

    for line in code_lines:
        draw.text((editor_x_start + 15, code_y), line, fill='#ecf0f1')
        code_y += 20

    # Right panel (properties)
    right_x_start = editor_x_start + editor_width + 5
    draw.rectangle([right_x_start, content_y_start, width, height - 40], fill='#34495e')
    draw.text((right_x_start + 10, content_y_start + 10), "Properties", fill='white')

    # Sample properties
    prop_y = content_y_start + 30
    properties = [
        ("Name", "GreetNeighborInteraction"),
        ("Display Name", "Greet Neighbor"),
        ("Target", "Actor"),
        ("Icon", "ui/icon_GreetNeighbor")
    ]

    for name, value in properties:
        draw.text((right_x_start + 10, prop_y), f"{name}:", fill='#bdc3c7')
        draw.text((right_x_start + 100, prop_y), value, fill='#ecf0f1')
        prop_y += 20

    # Status bar
    status_height = 40
    draw.rectangle([0, height - 40, width, height], fill='#1a2530')
    draw.text((10, height - 30), "Ready - Line 15, Col 8", fill='#2EC4B6')
    draw.text((width - 150, height - 30), "Python - UTF-8", fill='#ecf0f1')

    # Save image
    output_path = Path("screenshots/main_editor_mockup.png")
    img.save(output_path)
    print(f"Created main editor screenshot: {output_path.absolute()}")
    
    # Menu bar
    menu_height = 30
    draw.rectangle([0, header_height, width, header_height + menu_height], fill='#34495e')  # Menu bar color
    
    # Draw menu items
    menu_items = ["File", "Edit", "View", "Project", "Build", "Tools", "Help"]
    x_pos = 10
    for item in menu_items:
        draw.text((x_pos, header_height + 8), item, fill='white')
        x_pos += 80
    
    # Toolbar
    toolbar_height = 50
    draw.rectangle([0, header_height + menu_height, width, header_height + menu_height + toolbar_height], fill='#3d566e')
    
    # Draw toolbar buttons (simple rectangles with text)
    button_x = 10
    for i in range(8):
        draw.rectangle([button_x, header_height + menu_height + 10, button_x + 40, header_height + menu_height + 40], 
                      fill='#2EC4B6', outline='white')
        draw.text((button_x + 10, header_height + menu_height + 18), f"Btn{i+1}", fill='white')
        button_x += 50
    
    # Main content area - split with paned window
    content_y_start = header_height + menu_height + toolbar_height
    
    # Left panel (file explorer/toolbox)
    left_width = 250
    draw.rectangle([0, content_y_start, left_width, height - 60], fill='#34495e')
    draw.text((10, content_y_start + 20), "File Explorer", fill='white', font=title_font)
    
    # Draw file structure
    file_y = content_y_start + 50
    files = [
        "main.jpe",
        "interactions/",
        "  - greet_neighbor.jpe",
        "  - social_interactions.jpe",
        "buffs/",
        "  - mood_buffs.jpe",
        "traits/",
        "  - personality_traits.jpe"
    ]
    
    for file in files:
        indent = 20 if file.startswith("  -") else 10
        draw.text((indent, file_y), file, fill='#ecf0f1')
        file_y += 25
    
    # Center panel (editor)
    editor_x_start = left_width
    editor_width = width - left_width - 250  # Leave space for right panel
    draw.rectangle([editor_x_start, content_y_start, editor_x_start + editor_width, height - 60], fill='#1e2a3a')
    
    # Editor title bar
    draw.rectangle([editor_x_start, content_y_start, editor_x_start + editor_width, content_y_start + 30], fill='#2c3e50')
    draw.text((editor_x_start + 10, content_y_start + 8), "main.jpe", fill='#2EC4B6')
    
    # Code content area
    code_y = content_y_start + 35
    code_lines = [
        "# Define a simple interaction",
        "define interaction GreetNeighbor",
        "    name: \"GreetNeighborInteraction\"",
        "    display_name: \"Greet Neighbor\"",
        "    description: \"Politely greet a nearby neighbor\"",
        "    class: \"GreetNeighborInteraction\"",
        "    ",
        "    target: Actor",
        "    icon: \"ui/icon_GreetNeighbor\"",
        "    ",
        "    test_set: GreetNeighborTestSet",
        "    ",
        "    loot_actions:",
        "        - show_message: \"Hello, nice to meet you!\"",
        "        - add_statistic_change: social, 5",
        "        - trigger_animation: wave_hello",
        "end",
        "",
        "# Define corresponding test set", 
        "define test_set GreetNeighborTestSet",
        "    tests:",
        "        - actor_is_human: true",
        "        - actor_has_relationship: target, positive",
        "        - distance_to_target: < 5.0",
        "end"
    ]
    
    for line in code_lines:
        draw.text((editor_x_start + 15, code_y), line, fill='#ecf0f1', font=ImageFont.load_default())
        code_y += 20
    
    # Right panel (properties)
    right_x_start = editor_x_start + editor_width
    draw.rectangle([right_x_start, content_y_start, width, height - 60], fill='#34495e')
    draw.text((right_x_start + 10, content_y_start + 20), "Properties", fill='white', font=title_font)
    
    # Property items
    prop_y = content_y_start + 50
    properties = [
        ("Name", "GreetNeighborInteraction"),
        ("Display Name", "Greet Neighbor"),
        ("Description", "Politely greet a nearby neighbor"),
        ("Class", "GreetNeighborInteraction"),
        ("Target", "Actor"),
        ("Icon", "ui/icon_GreetNeighbor"),
        ("Enabled", "True"),
        ("Version", "1.0.0")
    ]
    
    for name, value in properties:
        draw.text((right_x_start + 10, prop_y), f"{name}:", fill='#bdc3c7')
        draw.text((right_x_start + 100, prop_y), value, fill='#ecf0f1')
        prop_y += 25
    
    # Status bar
    status_height = 40
    status_y = height - status_height
    draw.rectangle([0, status_y, width, height], fill='#1a2530')
    
    # Status text
    draw.text((10, status_y + 10), "Ready", fill='#2EC4B6')
    draw.text((width - 200, status_y + 10), "Ln 15, Col 8", fill='#ecf0f1')
    
    # Save image
    output_path = Path("screenshots/main_editor_mockup.png")
    img.save(output_path)
    print(f"Created main editor screenshot: {output_path.absolute()}")


def create_theme_comparison_screenshot():
    """Create a mock screenshot comparing different theme options."""
    width, height = 1200, 800
    img = Image.new('RGB', (width, height), color='#ecf0f1')
    draw = ImageDraw.Draw(img)
    
    # Title
    title_font = ImageFont.load_default()
    draw.text((20, 20), "Theme Comparison - JPE Sims 4 Mod Translator", fill='#2c3e50')
    
    # Create theme comparison boxes
    themes = [
        ("Cyberpunk", "#0a0a0a", "#00ff8c"),
        ("Sunset Glow", "#ffecd2", "#d62828"),
        ("Forest Twilight", "#2d5016", "#e0f7c4"),
        ("Ocean Depths", "#0c1e3e", "#a7c5eb"),
        ("Vintage Paper", "#f4e4bc", "#5c4b51"),
        ("Cosmic Void", "#050026", "#c5b3e6")
    ]
    
    box_width = 350
    box_height = 200
    margin = 30
    y_pos = 60
    
    for i, (name, bg_color, fg_color) in enumerate(themes):
        row = i // 2
        col = i % 2
        x_pos = margin + col * (box_width + margin)
        
        # Draw theme box
        draw.rectangle([x_pos, y_pos + row * (box_height + margin), 
                       x_pos + box_width, y_pos + row * (box_height + margin) + box_height], 
                      fill=bg_color, outline='#bdc3c7', width=2)
        
        # Draw sample UI elements in the theme
        sample_y = y_pos + row * (box_height + margin) + 10
        draw.text((x_pos + 10, sample_y), f"Theme: {name}", fill=fg_color)
        
        sample_y += 25
        draw.text((x_pos + 10, sample_y), "Sample text in theme", fill=fg_color)
        
        sample_y += 20
        # Draw a button
        draw.rectangle([x_pos + 10, sample_y, x_pos + 100, sample_y + 25], 
                      fill=fg_color if bg_color != "#0a0a0a" else "#2EC4B6", outline=fg_color)
        draw.text((x_pos + 20, sample_y + 5), "Button", fill=bg_color if bg_color != "#0a0a0a" else "white")
        
        sample_y += 35
        # Draw a progress bar
        progress_width = 150
        draw.rectangle([x_pos + 10, sample_y, x_pos + 10 + progress_width, sample_y + 10], 
                      fill="#cccccc", outline=fg_color)
        draw.rectangle([x_pos + 10, sample_y, x_pos + 10 + progress_width * 0.7, sample_y + 10], 
                      fill=fg_color)
    
    output_path = Path("screenshots/theme_comparison_mockup.png")
    img.save(output_path)
    print(f"Created theme comparison screenshot: {output_path.absolute()}")


def create_font_preview_screenshot():
    """Create a mock screenshot showing the font system preview."""
    width, height = 1000, 700
    img = Image.new('RGB', (width, height), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Title
    draw.text((20, 20), "Font Pack System - Preview", fill='#2c3e50')
    
    # Draw font pack samples
    font_packs = [
        ("Classic Pack", "The quick brown fox jumps over the lazy dog.", "serif", 12),
        ("Modern Pack", "The quick brown fox jumps over the lazy dog.", "sans-serif", 12),
        ("Readable Pack", "The quick brown fox jumps over the lazy dog.", "sans-serif", 14),
        ("Developer Pack", "def example_function(param): return param * 2", "monospace", 12),
        ("Bundled Sans-serif", "ABCDEFG abcdefg 1234567890", "sans-serif", 11),
        ("Bundled Serif", "ABCDEFG abcdefg 1234567890", "serif", 12),
        ("Bundled Monospace", "def greet(): return 'Hello'", "monospace", 12),
        ("Bundled Display", "JPE Sims 4 Mod Translator", "sans-serif", 16)
    ]
    
    box_width = 450
    box_height = 120
    margin = 25
    y_pos = 60
    
    for i, (name, sample_text, font_family, font_size) in enumerate(font_packs):
        row = i // 2
        col = i % 2
        x_pos = margin + col * (box_width + margin)
        
        # Draw font preview box
        draw.rectangle([x_pos, y_pos + row * (box_height + margin), 
                       x_pos + box_width, y_pos + row * (box_height + margin) + box_height], 
                      fill='white', outline='#bdc3c7', width=1)
        
        # Draw font name
        draw.text((x_pos + 10, y_pos + row * (box_height + margin) + 10), name, fill='#2c3e50')
        
        # Draw sample text
        try:
            # Try to use a specific font if available, otherwise use default
            sample_font = ImageFont.load_default()
            draw.text((x_pos + 10, y_pos + row * (box_height + margin) + 35), 
                     sample_text, fill='#444444', font=sample_font)
        except:
            draw.text((x_pos + 10, y_pos + row * (box_height + margin) + 35), 
                     sample_text, fill='#444444')
    
    output_path = Path("screenshots/font_preview_mockup.png")
    img.save(output_path)
    print(f"Created font preview screenshot: {output_path.absolute()}")


def create_collaboration_screenshot():
    """Create a mock screenshot showing the collaboration features."""
    width, height = 1000, 700
    img = Image.new('RGB', (width, height), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Title
    draw.text((20, 20), "Collaboration Features - Multi-user Editing", fill='#2c3e50')
    
    # Draw editor area
    draw.rectangle([50, 60, width - 50, height - 100], fill='white', outline='#bdc3c7', width=2)
    
    # Draw sample code
    code_y = 80
    code_lines = [
        "# Collaborative editing session - User: Alice",
        "define interaction CollaborativeGreet",
        "    name: \"CollaborativeGreet\"",
        "    display_name: \"Collaborative Greet\"",
        "    description: \"Greet with collaboration\"",
        "    class: \"CollaborativeGreetInteraction\"",
        "    ",
        "    target: Actor",
        "    icon: \"ui/icon_CollaborativeGreet\"",
        "    ",
        "    test_set: CollaborativeGreetTestSet",
        "    ", 
        "    loot_actions:",
        "        - show_message: \"Greeting collaboratively!\"  # Line being edited by Bob",
        "        - add_statistic_change: social, 10  # Line being edited by Carol",
        "        - trigger_animation: collaborative_wave  # Line being edited by Alice",
        "end"
    ]
    
    for i, line in enumerate(code_lines):
        # Add visual indicators showing different users editing different lines
        y_pos = code_y + i * 20
        draw.text((70, y_pos), line, fill='#333333')
        
        # Add user cursors/selections
        if i == 13:  # "show_message" line - Bob's cursor
            draw.ellipse([55, y_pos, 65, y_pos + 15], fill='#3498db')  # Blue for Bob
        elif i == 14:  # "add_statistic_change" line - Carol's cursor
            draw.ellipse([55, y_pos, 65, y_pos + 15], fill='#9b59b6')  # Purple for Carol
        elif i == 15:  # "trigger_animation" line - Alice's cursor
            draw.ellipse([55, y_pos, 65, y_pos + 15], fill='#2ecc71')  # Green for Alice
    
    # Draw collaborator indicators
    draw.text((70, height - 80), "Collaborators: Alice (🟢), Bob (🔵), Carol (🟣)", fill='#2c3e50')
    
    # Draw chat window simulation
    draw.rectangle([width - 200, 60, width - 50, height - 100], fill='#ecf0f1', outline='#bdc3c7', width=1)
    draw.text((width - 190, 70), "Chat", fill='#2c3e50')
    
    chat_messages = [
        "Alice: Working on this section",
        "Bob: I'm adding a new action",
        "Carol: Testing the loot actions",
        "Alice: All good here!",
        "Bob: Updated the message text",
        "Carol: Changed social gain to 10"
    ]
    
    msg_y = 100
    for msg in chat_messages:
        draw.text((width - 190, msg_y), msg, fill='#444444', font=ImageFont.load_default())
        msg_y += 18
    
    output_path = Path("screenshots/collaboration_mockup.png")
    img.save(output_path)
    print(f"Created collaboration screenshot: {output_path.absolute()}")


def create_mobile_interface_screenshot():
    """Create a mock screenshot showing the mobile interface."""
    width, height = 400, 800  # Portrait mobile dimensions
    img = Image.new('RGB', (width, height), color='#2c3e50')
    draw = ImageDraw.Draw(img)
    
    # Mobile header
    header_height = 80
    draw.rectangle([0, 0, width, header_height], fill='#1a2530')
    draw.text((20, 20), "JPE Mobile", fill='#2EC4B6', font=ImageFont.load_default())
    draw.text((20, 45), "Sims 4 Mod Trans.", fill='#ecf0f1')
    
    # Hamburger menu button
    draw.rectangle([width - 50, 20, width - 20, 50], fill='#2EC4B6')
    draw.text((width - 42, 25), "☰", fill='white')
    
    # Navigation tabs at bottom
    tab_height = 60
    tab_y = height - tab_height
    draw.rectangle([0, tab_y, width, height], fill='#34495e')
    
    # Draw navigation icons
    tab_width = width // 4
    tabs = [("🏠", "Home"), ("📝", "Edit"), ("📁", "Files"), ("⚙️", "Settings")]
    
    for i, (icon, label) in enumerate(tabs):
        x_start = i * tab_width
        draw.rectangle([x_start, tab_y, x_start + tab_width, height], fill='#2c3e50')
        draw.text((x_start + tab_width//2 - 10, tab_y + 10), icon, fill='white', font=ImageFont.load_default())
        draw.text((x_start + tab_width//2 - 15, tab_y + 30), label, fill='white')
    
    # Main content area
    content_area = [20, header_height + 20, width - 20, tab_y - 20]
    draw.rectangle(content_area, fill='#3a506b')
    
    # Draw mobile-optimized interface elements
    content_y = header_height + 30
    
    # Large touch-friendly buttons
    button_width = width - 40
    button_height = 60
    button_spacing = 20
    
    buttons = [
        ("Create New Mod", "#27ae60"),
        ("Open Project", "#2980b9"),
        ("Build Mod", "#f39c12"),
        ("Settings", "#8e44ad")
    ]
    
    for i, (text, color) in enumerate(buttons):
        btn_y = content_y + i * (button_height + button_spacing)
        draw.rectangle([20, btn_y, 20 + button_width, btn_y + button_height], 
                      fill=color, outline='#ecf0f1', width=2)
        draw.text((20 + button_width//2 - len(text)*3, btn_y + button_height//2 - 10), 
                 text, fill='white')
    
    # Draw status area
    status_area = [20, content_y + len(buttons) * (button_height + button_spacing) + 20, 
                   width - 20, tab_y - 40]
    draw.rectangle(status_area, fill='#1e2a3a', outline='#bdc3c7', width=1)
    draw.text((30, status_area[1] + 10), "Recent Projects:", fill='#ecf0f1')
    
    projects = ["MySimsMod", "NewInteraction", "BuffSystem"]
    proj_y = status_area[1] + 30
    for proj in projects:
        draw.text((40, proj_y), f"• {proj}", fill='#bdc3c7')
        proj_y += 20
    
    output_path = Path("screenshots/mobile_interface_mockup.png")
    img.save(output_path)
    print(f"Created mobile interface screenshot: {output_path.absolute()}")


def create_animation_demo_screenshot():
    """Create a mock screenshot showing animation capabilities."""
    width, height = 1000, 600
    img = Image.new('RGB', (width, height), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Title
    draw.text((20, 20), "Animation System Demo - UI Elements", fill='#2c3e50')
    
    # Draw animated element samples
    element_width = 200
    element_height = 150
    margin = 30
    y_pos = 60
    
    elements = [
        ("Progress Bar", "Shows build progress"),
        ("Loading Spinner", "Indicates processing"),
        ("Hover Animation", "Button interaction effect"),
        ("Slide Animation", "Transition effects")
    ]
    
    for i, (name, description) in enumerate(elements):
        x_pos = margin + i * (element_width + margin)
        
        # Draw element box
        draw.rectangle([x_pos, y_pos, x_pos + element_width, y_pos + element_height], 
                      fill='white', outline='#bdc3c7', width=2)
        
        # Draw element name
        draw.text((x_pos + 10, y_pos + 10), name, fill='#2c3e50')
        
        # Draw element description
        draw.text((x_pos + 10, y_pos + 30), description, fill='#7f8c8d')
        
        # Draw animation sample representation
        if i == 0:  # Progress bar
            # Draw progress bar
            bar_x = x_pos + 10
            bar_y = y_pos + 60
            bar_width = element_width - 20
            bar_height = 20
            draw.rectangle([bar_x, bar_y, bar_x + bar_width, bar_y + bar_height], 
                          fill='#ecf0f1', outline='#bdc3c7')
            # Fill 75% of progress bar
            draw.rectangle([bar_x, bar_y, bar_x + bar_width * 0.75, bar_y + bar_height], 
                          fill='#2EC4B6')
            draw.text((bar_x + 10, bar_y + 25), "75%", fill='#2c3e50')
        
        elif i == 1:  # Loading spinner
            # Draw circular loading indicator
            center_x = x_pos + element_width // 2
            center_y = y_pos + 80
            radius = 30
            # Draw a partial circle to represent spinner
            draw.arc([center_x - radius, center_y - radius, center_x + radius, center_y + radius],
                    start=0, end=270, fill='#2EC4B6', width=5)
            draw.text((center_x - 20, center_y + 40), "Loading...", fill='#7f8c8d')
        
        elif i == 2:  # Hover animation
            # Draw a button that appears to be hovered
            btn_x = x_pos + 10
            btn_y = y_pos + 60
            draw.rectangle([btn_x, btn_y, btn_x + 180, btn_y + 40], 
                          fill='#1abc9c', outline='#16a085', width=2)  # Hover effect
            draw.text((btn_x + 40, btn_y + 10), "Hover Effect", fill='white')
        
        elif i == 3:  # Slide animation
            # Draw multiple overlapping rectangles to represent slide effect
            rect_x = x_pos + 10
            rect_y = y_pos + 60
            for j in range(3):
                offset = j * 15
                draw.rectangle([rect_x + offset, rect_y + offset, 
                               rect_x + element_width - 20 - offset, 
                               rect_y + 60 - offset], 
                              fill='#3498db' if j == 0 else 
                              '#2980b9' if j == 1 else 
                              '#1f618d', outline='#1a5276', width=1)
            draw.text((rect_x + 10, rect_y + 70), "Slide Effect", fill='#7f8c8d')
    
    output_path = Path("screenshots/animation_demo_mockup.png")
    img.save(output_path)
    print(f"Created animation demo screenshot: {output_path.absolute()}")


def main():
    """Generate all mock screenshots."""
    print("Generating mock screenshots for UI/UX enhancement showcase...")
    
    create_main_editor_screenshot()
    create_theme_comparison_screenshot()
    create_font_preview_screenshot()
    create_collaboration_screenshot()
    create_mobile_interface_screenshot()
    create_animation_demo_screenshot()
    
    print("\nAll screenshots generated successfully!")
    print("Screenshots saved to the 'screenshots/' directory:")


if __name__ == "__main__":
    main()