"""
Visual Template Builder for JPE Sims 4 Mod Translator.

This module provides visual representations of templates using Pillow, integrating with
the design system and asset generation stack to create preview images of JPE templates.
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from typing import Optional, List, Dict, Any
from design_system.font_manager import font_manager as design_font_manager


class VisualTemplatePreviewGenerator:
    """
    Generates visual previews of JPE templates using Pillow, with support for
    the JPE design system and asset generation stack.
    """
    
    def __init__(self, output_dir: Optional[Path] = None):
        if output_dir is None:
            self.output_dir = Path(__file__).parent / "visual_previews" / "templates"
        else:
            self.output_dir = output_dir
        
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_template_preview(
        self, 
        template_name: str, 
        template_content: str, 
        width: int = 800, 
        height: int = 600,
        bg_color: str = "#f0f0f0",
        text_color: str = "#000000",
        highlight_color: str = "#007acc"
    ) -> Optional[Path]:
        """
        Generate a visual preview of a JPE template with syntax highlighting.
        
        Args:
            template_name: Name of the template
            template_content: Content of the template
            width: Width of the output image
            height: Height of the output image
            bg_color: Background color
            text_color: Text color
            highlight_color: Syntax highlighting color
            
        Returns:
            Path to the generated preview image
        """
        # Create a blank image with specified background color
        img = Image.new('RGB', (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)
        
        # Title
        try:
            title_font = design_font_manager.get_font("JetBrains Mono", 24, "bold")
        except:
            title_font = design_font_manager.get_font("Roboto", 24, "bold")
        
        draw.text((20, 20), f"Template: {template_name}", fill=highlight_color, font=title_font)
        
        # Draw a separator
        draw.line([(20, 60), (width - 20, 60)], fill=highlight_color, width=2)
        
        # Content area
        content_area = (20, 70, width - 20, height - 20)
        
        # Split template content into lines
        lines = template_content.split('\n')
        
        # Calculate line height based on font
        try:
            sample_font = design_font_manager.get_font("JetBrains Mono", 14, "normal")
        except:
            sample_font = design_font_manager.get_font("Roboto", 14, "normal")
        
        # Get the height of a single line
        bbox = draw.textbbox((0, 0), "Ay", font=sample_font)
        line_height = bbox[3] - bbox[1]
        
        # Draw each line with basic syntax highlighting
        y_pos = content_area[1]
        for line in lines:
            if y_pos > content_area[3] - line_height:  # Stop if we run out of space
                break
                
            # Simple syntax highlighting based on common JPE patterns
            highlighted_text = self._apply_syntax_highlighting(line, draw, sample_font)
            
            # Draw the line
            draw.text((content_area[0], y_pos), line, fill=text_color, font=sample_font)
            
            y_pos += line_height
        
        # Add a scroll indicator if content exceeds the display area
        if len(lines) * line_height > (content_area[3] - content_area[1]):
            scrollbar_color = "#cccccc"
            scrollbar_width = 10
            scrollbar_x = width - 20
            scrollbar_y_start = content_area[1]
            scrollbar_y_end = content_area[3]
            draw.rectangle([scrollbar_x, scrollbar_y_start, scrollbar_x + scrollbar_width, scrollbar_y_end], 
                          fill=scrollbar_color, outline="#999999", width=1)
        
        # Save the image
        output_path = self.output_dir / f"{template_name}_preview.png"
        img.save(output_path)
        return output_path
    
    def _apply_syntax_highlighting(self, line: str, draw: ImageDraw.Draw, font: ImageFont.ImageFont) -> str:
        """
        Apply basic syntax highlighting to a line of JPE template content.
        This is a simplified approach - a real implementation would have more sophisticated parsing.
        """
        # For now, just return the original line
        # In a more sophisticated implementation, we would identify:
        # - Keywords (define, interaction, trait, etc.)
        # - Strings (in quotes)
        # - Comments
        # - Variables
        return line
    
    def create_sample_templates(self) -> Dict[str, str]:
        """
        Create sample JPE templates for demonstration purposes.
        """
        templates = {
            "Basic Interaction": '''define interaction BasicHello
    name: "Basic Hello Interaction"
    display_name: "Say Hello"
    description: "A simple hello interaction"
    class: "HelloInteraction"
    
    target: Actor
    icon: "ui/icon_Hello"
    
    test_set: BasicHelloTestSet
    
    loot_actions:
        - show_message: "Hello, Sims!"
        
define test_set BasicHelloTestSet
    tests:
        - actor_is_human: true
        - actor_has_relationship: target, positive''',
            
            "Advanced Buff": '''define buff AdvancedBuff
    name: "AdvancedBuff"
    display_name: "Advanced Buff"
    description: "A buff with multiple effects"
    class: "AdvancedBuff"
    
    icon: "ui/icon_buff_advanced"
    moodlet: true
    
    statistics:
        - skill_gain_rate: +0.5
        - energy: +10
        - fun: +15
        
    trait_effects:
        - social_bonus: +5
        - skill_gain: +10%
        
define trait AdvancedTrait
    name: "AdvancedTrait"
    display_name: "Advanced Trait"
    description: "A complex trait with multiple effects"
    class: "AdvancedTrait"
    
    icon: "ui/icon_trait_advanced"
    
    modifiers:
        - buff: AdvancedBuff
        - interaction_multiplier: 1.2''',
            
            "Complex Statistic": '''define statistic ComplexStat
    name: "ComplexStat"
    display_name: "Complex Statistic"
    description: "A statistic with complex behavior"
    class: "ComplexStat"
    
    min_value: 0
    max_value: 100
    initial_value: 50
    
    change_rate: 1.0
    decay_rate: 0.1
    
    effects:
        - mood_multiplier: value / 100
        - skill_gain: value * 0.1
        
    thresholds:
        - value: 25, effect: "Low Stat Effect"
        - value: 50, effect: "Medium Stat Effect"
        - value: 75, effect: "High Stat Effect"'''
        }
        
        return templates
    
    def generate_all_sample_previews(self) -> List[Path]:
        """
        Generate previews for all sample templates.
        
        Returns:
            List of paths to generated preview images
        """
        sample_templates = self.create_sample_templates()
        preview_paths = []
        
        for name, content in sample_templates.items():
            preview_path = self.generate_template_preview(name, content)
            if preview_path:
                preview_paths.append(preview_path)
        
        return preview_paths


def create_visual_template_previews():
    """
    Create visual previews for all sample templates.
    """
    preview_generator = VisualTemplatePreviewGenerator()
    preview_paths = preview_generator.generate_all_sample_previews()
    
    print(f"Generated {len(preview_paths)} template previews:")
    for path in preview_paths:
        print(f"  - {path}")
    
    return preview_paths


if __name__ == "__main__":
    print("Generating visual template previews...")
    create_visual_template_previews()
    print("Visual template previews generated successfully!")