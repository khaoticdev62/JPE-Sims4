import argparse
import sys
from pathlib import Path
import os

# Add the project root to sys.path if the script is run directly
if __name__ == "__main__":
    project_root = Path(__file__).parent.parent
    sys.path.insert(0, str(project_root))

from asset_generator.icon_generator import IconGenerator
from asset_generator.button_generator import ButtonGenerator
from asset_generator.progress_bar_generator import ProgressBarGenerator
from asset_generator.text_input_generator import TextInputGenerator
from asset_generator.batch_generator import BatchGenerator
from asset_generator.checkbox_radio_generator import CheckboxRadioGenerator
from asset_generator.slider_generator import SliderGenerator
from design_system.token_manager import design_token_manager
from design_system.token_exporter import TokenExporter
from asset_generator.preview_generator import PreviewGenerator

# ANSI escape codes for basic colors
class Color:
    PURPLE = '\033[95m'
    CYAN = '\033[96m'
    DARKCYAN = '\033[36m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    END = '\033[0m'

def print_colored(text: str, color: str, bold: bool = False):
    """Prints text with color and optional bold formatting."""
    prefix = color
    if bold:
        prefix += Color.BOLD
    print(f"{prefix}{text}{Color.END}")

def list_design_tokens_cli():
    """Prints available design tokens to CLI."""
    tokens = design_token_manager.get_all_tokens()
    print_colored("\n--- Available Design Tokens ---", Color.CYAN, bold=True)

    print_colored("\nColors:", Color.BLUE)
    for key, value in tokens["colors"].items():
        print(f"  {key}: {value}")
    
    print_colored("\nTypography:", Color.BLUE)
    for key, value in tokens["typography"].items():
        print(f"  {key}: {value}")
    
    print_colored("\nSpacing:", Color.BLUE)
    for key, value in tokens["spacing"].items():
        print(f"  {key}: {value}")

    print_colored("\nBorder Radii:", Color.BLUE)
    for key, value in tokens["border_radii"].items():
        print(f"  {key}: {value}")

    print_colored("\nShadows:", Color.BLUE)
    for key, value in tokens["shadows"].items():
        print(f"  {key}: {value}")

def main():
    parser = argparse.ArgumentParser(
        description=f"{Color.BOLD}{Color.CYAN}JPE UI/UX Asset Generator CLI{Color.END}",
        epilog=f"Use '{sys.argv[0]} <command> --help' for more information on a specific command."
    )
    subparsers = parser.add_subparsers(dest="command", help="Primary commands")

    # --- Generate Command Group ---
    parser_generate = subparsers.add_parser("generate", help="Generate UI/UX assets.")
    generate_subparsers = parser_generate.add_subparsers(dest="asset_type", help="Types of assets to generate")

    # Generate Icon
    parser_generate_icon = generate_subparsers.add_parser("icon", help="Generate an icon asset.")
    parser_generate_icon.add_argument("--size", type=int, default=24, help="Size of the icon in pixels (e.g., 16, 24, 32).")
    parser_generate_icon.add_argument("--text", type=str, required=True, help="Text to display on the icon (e.g., 'J', '✓').")
    parser_generate_icon.add_argument("--color", type=str, default="primary_blue", help="Design token key for the icon's foreground color.")
    parser_generate_icon.add_argument("--bgcolor", type=str, default="none", help="Design token key for the icon's background color (use 'none' for transparent).")
    parser_generate_icon.add_argument("--font", type=str, default="body", help="Design token key for the font style.")
    parser_generate_icon.add_argument("--format", type=str, default="png", choices=["png", "svg"], help="Output format for the icon (png or svg).")
    parser_generate_icon.add_argument("--output", type=str, default="generated_assets/icon", help="Output file path (e.g., 'path/to/icon'). Extension will be added based on --format.")
    parser_generate_icon.add_argument("--svgsource", type=str, help="Path to an SVG file to use as the source for icon generation.")

    # Generate Button
    parser_generate_button = generate_subparsers.add_parser("button", help="Generate a button asset.")
    parser_generate_button.add_argument("--width", type=int, required=True, help="Width of the button in pixels.")
    parser_generate_button.add_argument("--height", type=int, required=True, help="Height of the button in pixels.")
    parser_generate_button.add_argument("--label", type=str, required=True, help="Text label for the button.")
    parser_generate_button.add_argument("--bgcolor", type=str, default="primary_blue", help="Design token key for the button's background color. Use 'none' if providing gradient colors.")
    parser_generate_button.add_argument("--textcolor", type=str, default="bg_light", help="Design token key for the button's text color.")
    parser_generate_button.add_argument("--font", type=str, default="body", help="Design token key for the font style.")
    parser_generate_button.add_argument("--radius", type=str, default="medium", help="Design token key for the border radius (e.g., 'small', 'medium').")
    parser_generate_button.add_argument("--shadow", type=str, default="none", help="Design token key for the shadow style (e.g., 'subtle', 'medium', 'none').")
    parser_generate_button.add_argument("--state", type=str, default="normal", choices=["normal", "hover", "pressed", "disabled"], help="Button state (normal, hover, pressed, disabled).")
    parser_generate_button.add_argument("--gradientstartcolor", type=str, help="Design token key for the gradient start color.")
    parser_generate_button.add_argument("--gradientendcolor", type=str, help="Design token key for the gradient end color.")
    parser_generate_button.add_argument("--gradientdirection", type=str, default="top_to_bottom", choices=["top_to_bottom", "bottom_to_top", "left_to_right", "right_to_left"], help="Direction of the linear gradient.")
    parser_generate_button.add_argument("--output", type=str, default="generated_assets/button.png", help="Output file path (e.g., 'path/to/button.png').")

    # Generate Progress Bar
    parser_generate_progressbar = generate_subparsers.add_parser("progressbar", help="Generate a progress bar asset.")
    parser_generate_progressbar.add_argument("--width", type=int, required=True, help="Width of the progress bar in pixels.")
    parser_generate_progressbar.add_argument("--height", type=int, required=True, help="Height of the progress bar in pixels.")
    parser_generate_progressbar.add_argument("--value", type=int, default=0, help="Current progress value.")
    parser_generate_progressbar.add_argument("--maxvalue", type=int, default=100, help="Maximum possible value for the progress bar.")
    parser_generate_progressbar.add_argument("--bgcolor", type=str, default="bg_medium", help="Design token key for the progress bar track's background color.")
    parser_generate_progressbar.add_argument("--fillcolor", type=str, default="primary_blue", help="Design token key for the filled portion's color.")
    parser_generate_progressbar.add_argument("--radius", type=str, default="small", help="Design token key for the border radius.")
    parser_generate_progressbar.add_argument("--label", type=str, default="", help="Optional text label to display on the progress bar (e.g., '50%').")
    parser_generate_progressbar.add_argument("--labelcolor", type=str, default="text_primary", help="Design token key for the label's text color.")
    parser_generate_progressbar.add_argument("--font", type=str, default="small", help="Design token key for the label's font style.")
    parser_generate_progressbar.add_argument("--output", type=str, default="generated_assets/progressbar.png", help="Output file path (e.g., 'path/to/progressbar.png').")

    # Generate Text Input
    parser_generate_text_input = generate_subparsers.add_parser("text_input", help="Generate a text input field asset.")
    parser_generate_text_input.add_argument("--width", type=int, required=True, help="Width of the text input field in pixels.")
    parser_generate_text_input.add_argument("--height", type=int, required=True, help="Height of the text input field in pixels.")
    parser_generate_text_input.add_argument("--placeholder", type=str, default="Enter text...", help="Placeholder text for the input field.")
    parser_generate_text_input.add_argument("--textcolor", type=str, default="text_primary", help="Design token key for the input text color.")
    parser_generate_text_input.add_argument("--placeholdercolor", type=str, default="text_secondary", help="Design token key for the placeholder text color.")
    parser_generate_text_input.add_argument("--bgcolor", type=str, default="bg_light", help="Design token key for the background color.")
    parser_generate_text_input.add_argument("--bordercolor", type=str, default="border", help="Design token key for the border color.")
    parser_generate_text_input.add_argument("--borderwidth", type=int, default=1, help="Width of the border in pixels.")
    parser_generate_text_input.add_argument("--radius", type=str, default="small", help="Design token key for the border radius.")
    parser_generate_text_input.add_argument("--font", type=str, default="body", help="Design token key for the font style.")
    parser_generate_text_input.add_argument("--state", type=str, default="normal", choices=["normal", "focused", "error", "disabled"], help="State of the input field.")
    parser_generate_text_input.add_argument("--output", type=str, default="generated_assets/text_input.png", help="Output file path (e.g., 'path/to/text_input.png').")

    # Generate Batch
    parser_generate_batch = generate_subparsers.add_parser("batch", help="Generate assets from a batch configuration file.")
    parser_generate_batch.add_argument("--config", type=str, required=True, help="Path to the batch configuration file (e.g., 'batch_config.json').")
    parser_generate_batch.add_argument("--output_dir", type=str, default="generated_assets", help="Base directory to save all generated assets.")
    parser_generate_batch.add_argument("--multires", action="store_true", help="Enable multi-resolution generation for assets that support it.")

    # Generate Checkbox/Radio Button
    parser_generate_checkbox_radio = generate_subparsers.add_parser("checkbox_radio", help="Generate a checkbox or radio button asset.")
    parser_generate_checkbox_radio.add_argument("--type", type=str, required=True, choices=["checkbox", "radio"], help="Type of control (checkbox or radio).")
    parser_generate_checkbox_radio.add_argument("--size", type=int, default=20, help="Size of the control itself in pixels (e.g., 20).")
    parser_generate_checkbox_radio.add_argument("--label", type=str, default="", help="Text label next to the control.")
    parser_generate_checkbox_radio.add_argument("--labelcolor", type=str, default="text_primary", help="Design token key for the label's text color.")
    parser_generate_checkbox_radio.add_argument("--font", type=str, default="body", help="Design token key for the label's font.")
    parser_generate_checkbox_radio.add_argument("--checkedcolor", type=str, default="primary_blue", help="Design token key for the fill color when checked.")
    parser_generate_checkbox_radio.add_argument("--uncheckedcolor", type=str, default="border", help="Design token key for the border/background color when unchecked.")
    parser_generate_checkbox_radio.add_argument("--checkmarkcolor", type=str, default="bg_light", help="Design token key for the checkmark or radio dot color.")
    parser_generate_checkbox_radio.add_argument("--disabledcolor", type=str, default="bg_dark", help="Design token key for the color of the control when disabled.")
    parser_generate_checkbox_radio.add_argument("--state", type=str, default="unchecked", choices=["checked", "unchecked", "disabled_checked", "disabled_unchecked"], help="Current state of the control.")
    parser_generate_checkbox_radio.add_argument("--borderwidth", type=int, default=2, help="Width of the border around the control.")
    parser_generate_checkbox_radio.add_argument("--output", type=str, default="generated_assets/checkbox_radio.png", help="Output file path (e.g., 'path/to/checkbox.png').")

    # Generate Slider
    parser_generate_slider = generate_subparsers.add_parser("slider", help="Generate a slider asset.")
    parser_generate_slider.add_argument("--width", type=int, required=True, help="Total width of the slider.")
    parser_generate_slider.add_argument("--height", type=int, required=True, help="Total height of the slider (canvas height).")
    parser_generate_slider.add_argument("--trackheight", type=int, default=8, help="Height of the slider track.")
    parser_generate_slider.add_argument("--thumbsize", type=int, default=20, help="Diameter/side length of the slider thumb.")
    parser_generate_slider.add_argument("--value", type=int, default=0, help="Current slider value.")
    parser_generate_slider.add_argument("--minvalue", type=int, default=0, help="Minimum possible value for the slider.")
    parser_generate_slider.add_argument("--maxvalue", type=int, default=100, help="Maximum possible value for the slider.")
    parser_generate_slider.add_argument("--trackcolor", type=str, default="bg_medium", help="Design token key for the track background color.")
    parser_generate_slider.add_argument("--fillcolor", type=str, default="primary_blue", help="Design token key for the filled portion of the track.")
    parser_generate_slider.add_argument("--thumbcolor", type=str, default="primary_blue", help="Design token key for the thumb color.")
    parser_generate_slider.add_argument("--thumbbordercolor", type=str, default="none", help="Design token key for the thumb's border color.")
    parser_generate_slider.add_argument("--thumbborderwidth", type=int, default=0, help="Width of the thumb's border.")
    parser_generate_slider.add_argument("--trackradius", type=str, default="small", help="Design token key for the track's corner radius.")
    parser_generate_slider.add_argument("--state", type=str, default="normal", choices=["normal", "focused", "disabled"], help="Current state of the slider.")
    parser_generate_slider.add_argument("--output", type=str, default="generated_assets/slider.png", help="Output file path (e.g., 'path/to/slider.png').")


    # --- List Command Group ---
    parser_list = subparsers.add_parser("list", help="List available design system elements.")
    list_subparsers = parser_list.add_subparsers(dest="list_type", help="Type of elements to list")

    # List Tokens
    parser_list_tokens = list_subparsers.add_parser("tokens", help="List all available design tokens.")

    # --- Export Command Group ---
    parser_export = subparsers.add_parser("export", help="Export design system elements to various formats.")
    export_subparsers = parser_export.add_subparsers(dest="export_type", help="Type of elements to export")

    # Export Tokens (CSS Variables)
    parser_export_tokens = export_subparsers.add_parser("tokens", help="Export design tokens as CSS variables.")
    parser_export_tokens.add_argument("--output", type=str, default="generated_assets/jpe_design_tokens.css", help="Output CSS file path (e.g., 'path/to/tokens.css').")

    # Export Tokens (React Native)
    parser_export_rn_tokens = export_subparsers.add_parser("rn-tokens", help="Export design tokens as React Native theme object.")
    parser_export_rn_tokens.add_argument("--output", type=str, default="generated_assets/jpe_design_tokens.js", help="Output JS file path (e.g., 'path/to/tokens.js').")


    # --- Preview Command Group ---
    parser_preview = subparsers.add_parser("preview", help="Generate an HTML preview of generated assets.")
    parser_preview.add_argument("assets", metavar="ASSET_PATH", type=str, nargs="+", help="Paths to the asset files to include in the preview (e.g., 'icon.png button.png').")
    parser_preview.add_argument("--output", type=str, default="generated_assets/asset_preview.html", help="Output HTML file path for the preview.")
    parser_preview.add_argument("--open", action="store_true", help="Automatically open the generated HTML preview in the default web browser.")


    args = parser.parse_args()

    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True) # Ensure output directory exists

    if args.command == "generate":
        if args.asset_type == "icon":
            try:
                # Adjust output filename extension based on format
                output_filename = Path(args.output)
                if output_filename.suffix.lower() not in [f".{args.format}", ""]:
                    output_filename = output_filename.with_suffix(f".{args.format}")
                elif output_filename.suffix == "": # If no suffix, add default based on format
                     output_filename = output_filename.with_suffix(f".{args.format}")
                
                # If SVG source is provided, use it. Otherwise, use text.
                if args.svgsource:
                    generator = IconGenerator(
                        size=args.size,
                        svg_source_path=Path(args.svgsource),
                        color_token=args.color,
                        background_color_token=args.bgcolor,
                        output_format=args.format
                    )
                else:
                    generator = IconGenerator(
                        size=args.size,
                        text=args.text,
                        color_token=args.color,
                        background_color_token=args.bgcolor,
                        font_token=args.font,
                        output_format=args.format
                    )

                generated_asset = generator.generate_icon()
                
                if args.format == "png":
                    generated_asset.save(output_filename)
                elif args.format == "svg":
                    # svgwrite uses saveas, or if from svg_source, it's already a string
                    if args.svgsource:
                        with open(output_filename, "w") as f:
                            f.write(generated_asset)
                    else:
                        generated_asset.saveas(output_filename)
                
                print_colored(f"Successfully generated icon to {output_filename}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error generating icon: {e}", Color.RED)
                sys.exit(1)
        elif args.asset_type == "button":
            try:
                # If gradient colors are provided, set bg_color_token to "none" for ButtonGenerator
                bg_color_to_pass = args.bgcolor
                if args.gradientstartcolor and args.gradientendcolor:
                    bg_color_to_pass = "none" # Gradient will handle background
                
                generator = ButtonGenerator(
                    width=args.width,
                    height=args.height,
                    label=args.label,
                    bg_color_token=bg_color_to_pass,
                    text_color_token=args.textcolor,
                    font_token=args.font,
                    border_radius_token=args.radius,
                    shadow_token=args.shadow,
                    state=args.state,
                    gradient_start_color_token=args.gradientstartcolor,
                    gradient_end_color_token=args.gradientendcolor,
                    gradient_direction=args.gradientdirection
                )
                image = generator.generate_button()
                output_path = Path(args.output)
                image.save(output_path)
                print_colored(f"Successfully generated button to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error generating button: {e}", Color.RED)
                sys.exit(1)
        elif args.asset_type == "progressbar":
            try:
                generator = ProgressBarGenerator(
                    width=args.width,
                    height=args.height,
                    value=args.value,
                    max_value=args.maxvalue,
                    bg_color_token=args.bgcolor,
                    fill_color_token=args.fillcolor,
                    border_radius_token=args.radius,
                    label=args.label,
                    label_color_token=args.labelcolor,
                    font_token=args.font
                )
                image = generator.generate_progressbar()
                output_path = Path(args.output)
                image.save(output_path)
                print_colored(f"Successfully generated progress bar to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error generating progress bar: {e}", Color.RED)
                sys.exit(1)
        elif args.asset_type == "text_input":
            try:
                generator = TextInputGenerator(
                    width=args.width,
                    height=args.height,
                    placeholder=args.placeholder,
                    text_color_token=args.textcolor,
                    placeholder_color_token=args.placeholdercolor,
                    bg_color_token=args.bgcolor,
                    border_color_token=args.bordercolor,
                    border_width=args.borderwidth,
                    border_radius_token=args.radius,
                    font_token=args.font,
                    state=args.state
                )
                image = generator.generate_text_input()
                output_path = Path(args.output)
                image.save(output_path)
                print_colored(f"Successfully generated text input to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error generating text input: {e}", Color.RED)
                sys.exit(1)
        elif args.asset_type == "batch":
            try:
                config_path = Path(args.config)
                output_base_dir = Path(args.output_dir)
                
                batch_gen = BatchGenerator(config_path)
                batch_gen.generate_assets(output_base_dir, multires=args.multires)
                print_colored(f"\nBatch generation initiated from {config_path} to {output_base_dir}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error during batch generation: {e}", Color.RED)
                sys.exit(1)
        elif args.asset_type == "checkbox_radio":
            try:
                generator = CheckboxRadioGenerator(
                    control_type=args.type,
                    size=args.size,
                    label=args.label,
                    label_color_token=args.labelcolor,
                    font_token=args.font,
                    checked_color_token=args.checkedcolor,
                    unchecked_color_token=args.uncheckedcolor,
                    checkmark_color_token=args.checkmarkcolor,
                    disabled_color_token=args.disabledcolor,
                    state=args.state,
                    border_width=args.borderwidth
                )
                image = generator.generate_control()
                output_path = Path(args.output)
                image.save(output_path)
                print_colored(f"Successfully generated {args.type} to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error generating {args.type}: {e}", Color.RED)
                sys.exit(1)
        elif args.asset_type == "slider":
            try:
                generator = SliderGenerator(
                    width=args.width,
                    height=args.height,
                    track_height=args.trackheight,
                    thumb_size=args.thumbsize,
                    value=args.value,
                    min_value=args.minvalue,
                    max_value=args.maxvalue,
                    track_color_token=args.trackcolor,
                    fill_color_token=args.fillcolor,
                    thumb_color_token=args.thumbcolor,
                    thumb_border_color_token=args.thumbbordercolor,
                    thumb_border_width=args.thumbborderwidth,
                    track_border_radius_token=args.trackradius,
                    state=args.state
                )
                image = generator.generate_slider()
                output_path = Path(args.output)
                image.save(output_path)
                print_colored(f"Successfully generated slider to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error generating slider: {e}", Color.RED)
                sys.exit(1)
        else:
            parser_generate.print_help()
    elif args.command == "list":
        if args.list_type == "tokens":
            list_design_tokens_cli()
        else:
            parser_list.print_help()
    elif args.command == "export":
        if args.export_type == "tokens":
            try:
                exporter = TokenExporter()
                css_variables = exporter.to_css_variables()
                output_path = Path(args.output)
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(css_variables)
                print_colored(f"Successfully exported CSS variables to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error exporting tokens: {e}", Color.RED)
                sys.exit(1)
        elif args.export_type == "rn-tokens":
            try:
                exporter = TokenExporter()
                rn_theme_object = exporter.to_react_native_theme_object()
                output_path = Path(args.output)
                with open(output_path, "w", encoding="utf-8") as f:
                    f.write(rn_theme_object)
                print_colored(f"Successfully exported React Native theme object to {output_path}", Color.GREEN)
            except Exception as e:
                print_colored(f"Error exporting React Native tokens: {e}", Color.RED)
                sys.exit(1)
        else:
            parser_export.print_help()
    elif args.command == "preview":
        try:
            asset_paths = [Path(p) for p in args.assets]
            output_path = Path(args.output)

            # Ensure asset paths are absolute for browser to find them correctly, or relative to output_path
            # For simplicity, we'll assume assets are in the same directory or easily resolvable by the browser
            # when the HTML is opened from the output_path's directory.
            
            preview_gen = PreviewGenerator(asset_paths)
            preview_gen.generate_preview(output_path, open_browser=args.open)
            print_colored(f"Successfully generated asset preview to {output_path}", Color.GREEN)
        except Exception as e:
            print_colored(f"Error generating preview: {e}", Color.RED)
            sys.exit(1)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()