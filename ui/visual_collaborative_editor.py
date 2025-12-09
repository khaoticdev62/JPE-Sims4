"""
Visual Collaborative Editor Preview for JPE Sims 4 Mod Translator.

This module creates visual previews of the collaborative editor interface using Pillow, 
integrating with the design system and asset generation stack.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Optional
from design_system.font_manager import font_manager as design_font_manager


class VisualCollaborativeEditorPreviewGenerator:
    """
    Generates visual previews of the collaborative editor using Pillow, with support for
    the JPE design system and asset generation stack.
    """
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            self.output_dir = Path(__file__).parent / "visual_previews" / "collaborative_editor"
        else:
            self.output_dir = output_dir
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_editor_preview(self, width: int = 1200, height: int = 800) -> Optional[Path]:
        """
        Generate a visual preview of the collaborative editor interface.
        
        Args:
            width: Width of the output image
            height: Height of the image
            
        Returns:
            Path to the generated preview image
        """
        # Create a blank image with light background
        bg_color = "#f8f9fa"
        img = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)
        
        # Header section
        header_height = 60
        header_color = "#2c3e50"
        draw.rectangle([0, 0, width, header_height], fill=header_color)
        
        # Header text
        try:
            header_font = design_font_manager.get_font("JetBrains Mono", 16, "bold")
        except:
            header_font = design_font_manager.get_font("Roboto", 16, "bold")
        
        draw.text((20, 20), "JPE Sims 4 Mod Translator - Collaborative Editor", fill="white", font=header_font)
        
        # Toolbar section
        toolbar_height = 40
        toolbar_y = header_height
        toolbar_color = "#e9ecef"
        draw.rectangle([0, toolbar_y, width, toolbar_y + toolbar_height], fill=toolbar_color)
        
        # Toolbar items
        toolbar_items = ["File", "Edit", "View", "Collaborate", "Help"]
        item_font = header_font
        item_x = 20
        for item in toolbar_items:
            draw.text((item_x, toolbar_y + 12), item, fill="#495057", font=item_font)
            item_x += 100
        
        # Collaborative status indicator
        status_x = width - 200
        status_color = "#28a745"
        draw.ellipse([status_x, toolbar_y + 10, status_x + 12, toolbar_y + 22], fill=status_color)
        draw.text((status_x + 20, toolbar_y + 12), "Online - 3 collaborators", fill="#495057", font=item_font)
        
        # Sidebar (for user list)
        sidebar_width = 200
        sidebar_color = "#ffffff"
        draw.rectangle([0, toolbar_y + toolbar_height, sidebar_width, height - 60], fill=sidebar_color, outline="#dee2e6", width=1)
        
        # Sidebar header
        sidebar_header_color = "#f8f9fa"
        draw.rectangle([0, toolbar_y + toolbar_height, sidebar_width, toolbar_y + toolbar_height + 30], fill=sidebar_header_color)
        draw.text((10, toolbar_y + toolbar_height + 8), "Collaborators", fill="#495057", font=item_font)
        
        # Sample user list
        users = ["Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson"]
        user_font = item_font
        user_y = toolbar_y + toolbar_height + 35
        for i, user in enumerate(users):
            # Draw online status indicator
            status_size = 8
            draw.ellipse([10, user_y + 5, 10 + status_size, user_y + 5 + status_size], fill="#28a745")
            draw.text((25, user_y), user, fill="#495057", font=user_font)
            user_y += 30
        
        # Main content area (code editor)
        editor_x = sidebar_width + 1
        editor_width = width - sidebar_width - 2
        editor_color = "#ffffff"
        draw.rectangle([editor_x, toolbar_y + toolbar_height, editor_x + editor_width, height - 60], 
                      fill=editor_color, outline="#dee2e6", width=1)
        
        # Editor header
        editor_header_color = "#f8f9fa"
        draw.rectangle([editor_x, toolbar_y + toolbar_height, editor_x + editor_width, toolbar_y + toolbar_height + 30], 
                      fill=editor_header_color)
        draw.text((editor_x + 10, toolbar_y + toolbar_height + 8), "main.jpe", fill="#495057", font=item_font)
        
        # Sample code content
        code_font = design_font_manager.get_font("JetBrains Mono", 12, "normal")
        code_content = '''define interaction HelloSims
    name: "HelloSimsInteraction"
    display_name: "Say Hello"
    description: "A friendly hello interaction"
    class: "HelloSimsInteraction"
    
    target: Actor
    icon: "ui/icon_Hello"
    
    test_set: HelloSimsTestSet
    
    loot_actions:
        - show_message: "Hello, Sims!"
        - add_statistic_change: social, 5
        - trigger_animation: hello_gesture
        
define test_set HelloSimsTestSet
    tests:
        - actor_is_human: true
        - actor_has_relationship: target, positive
        - distance_to_target: < 5.0
        
// This is a comment in the JPE language
// Collaborator Bob Smith made changes to the loot actions on line 10'''
        
        # Draw code content
        code_y = toolbar_y + toolbar_height + 35
        line_height = 18
        for line in code_content.split('\n'):
            draw.text((editor_x + 10, code_y), line, fill="#212529", font=code_font)
            code_y += line_height
        
        # Add user cursors to represent collaborative editing
        # Alice's cursor at line 5
        draw.line([(editor_x + 10, toolbar_y + toolbar_height + 35 + 4*line_height), 
                  (editor_x + 10, toolbar_y + toolbar_height + 35 + 5*line_height)], 
                  fill="#007bff", width=2)  # Blue for Alice
        
        # Bob's cursor at line 14
        draw.line([(editor_x + 10, toolbar_y + toolbar_height + 35 + 13*line_height), 
                  (editor_x + 10, toolbar_y + toolbar_height + 35 + 14*line_height)], 
                  fill="#28a745", width=2)  # Green for Bob
        
        # Status bar
        status_bar_height = 30
        status_bar_y = height - status_bar_height
        status_bar_color = "#e9ecef"
        draw.rectangle([0, status_bar_y, width, height], fill=status_bar_color)
        
        status_font = design_font_manager.get_font("Roboto", 10, "normal")
        draw.text((10, status_bar_y + 8), "Ready - Line 17, Col 24", fill="#495057", font=status_font)
        draw.text((width - 150, status_bar_y + 8), "UTF-8 - Python", fill="#495057", font=status_font)
        
        # Add a watermark for identification
        watermark_font = design_font_manager.get_font("Roboto", 14, "normal")
        draw.text((width - 200, 20), "Collaborative Editor Preview", fill=(0,0,0,77), font=watermark_font)  # 77 is ~30% opacity for 0-255 range
        
        # Save the image
        output_path = self.output_dir / "collaborative_editor_preview.png"
        img.save(output_path)
        return output_path


def create_visual_collaborative_editor_preview():
    """
    Create a visual preview of the collaborative editor.
    """
    preview_generator = VisualCollaborativeEditorPreviewGenerator()
    preview_path = preview_generator.generate_editor_preview()
    
    if preview_path:
        print(f"Generated collaborative editor preview: {preview_path}")
        return preview_path
    else:
        print("Failed to generate collaborative editor preview")
        return None


if __name__ == "__main__":
    print("Generating visual collaborative editor preview...")
    create_visual_collaborative_editor_preview()
    print("Visual collaborative editor preview generated successfully!")