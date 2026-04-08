import json
from pathlib import Path
from typing import Dict, Any, Optional

# Import all asset generators
from asset_generator.icon_generator import IconGenerator
from asset_generator.button_generator import ButtonGenerator
from asset_generator.progress_bar_generator import ProgressBarGenerator
from asset_generator.text_input_generator import TextInputGenerator
from asset_generator.checkbox_radio_generator import CheckboxRadioGenerator
from asset_generator.slider_generator import SliderGenerator

class BatchGenerator:
    """
    Parses a batch configuration file and orchestrates the generation of multiple assets.
    """
    def __init__(self, config_file: Path):
        self.config_file = config_file
        self.asset_generators = {
            "icon": IconGenerator,
            "button": ButtonGenerator,
            "progressbar": ProgressBarGenerator,
            "text_input": TextInputGenerator,
            "checkbox_radio": CheckboxRadioGenerator,
            "slider": SliderGenerator
        }

    def _load_config(self) -> list:
        """Loads and parses the JSON batch configuration file."""
        if not self.config_file.exists():
            raise FileNotFoundError(f"Batch configuration file not found: {self.config_file}")
        
        with open(self.config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        if not isinstance(config, list):
            raise ValueError("Batch configuration file must contain a JSON array of asset definitions.")
        
        return config

    def generate_assets(self, output_base_dir: Path, multires: bool = False): # Added multires parameter
        """
        Generates assets defined in the batch configuration file.
        :param output_base_dir: The base directory where all assets will be saved.
        :param multires: If True, enable multi-resolution generation from config.
        """
        configurations = self._load_config()
        generated_count = 0
        failed_count = 0

        for asset_config in configurations:
            asset_type = asset_config.get("type")
            asset_args = asset_config.get("args", {})
            
            generate_multires = multires or asset_config.get("multires", False) 
            resolutions_config = asset_config.get("resolutions") if generate_multires else None
            
            output_format = asset_config.get("output_format", "png") 
            
            if not asset_type:
                print(f"Skipping asset: 'type' field is missing in configuration: {asset_config}")
                failed_count += 1
                continue
            
            if asset_type not in self.asset_generators:
                print(f"Skipping asset: Unsupported asset type '{asset_type}'. Configuration: {asset_config}")
                failed_count += 1
                continue

            # --- Extract output_base_name and remove it from args before passing to generator ---
            # This needs to be done once per asset_config, outside the resolution loop
            # and before any generator_class(**args) call
            temp_asset_args = asset_args.copy() # Use a temporary copy for initial parsing
            base_output_name = temp_asset_args.pop("output_base_name", None)
            
            # Remove 'output' argument if it exists, as it's handled by BatchGenerator
            temp_asset_args.pop("output", None) 

            # --- Handle Multi-Resolution Generation ---
            if resolutions_config:
                if not base_output_name:
                     print(f"Skipping asset: 'output_base_name' is required in 'args' when 'resolutions' are specified. Configuration: {asset_config}")
                     failed_count += 1
                     continue
                
                for res_config in resolutions_config:
                    res_args = temp_asset_args.copy() # Start with cleaned base args for each resolution

                    # Apply resolution-specific arguments and scaling
                    if asset_type == "icon":
                        if "size" not in res_config:
                            print(f"Skipping resolution: 'size' is required for icon resolutions. Config: {res_config}")
                            failed_count += 1
                            continue
                        res_args["size"] = res_config["size"]
                    else: 
                        if "scale" not in res_config:
                            print(f"Skipping resolution: 'scale' is required for {asset_type} resolutions. Config: {res_config}")
                            failed_count += 1
                            continue
                        
                        scale = res_config["scale"]
                        if "width" in res_args: res_args["width"] = int(res_args["width"] * scale)
                        if "height" in res_args: res_args["height"] = int(res_args["height"] * scale)
                        if "track_height" in res_args: res_args["track_height"] = int(res_args["track_height"] * scale)
                        if "thumb_size" in res_args: res_args["thumb_size"] = int(res_args["thumb_size"] * scale)
                        if "border_width" in res_args: res_args["border_width"] = max(1, int(res_args["border_width"] * scale))
                        if "control_size" in res_args: res_args["control_size"] = int(res_args["control_size"] * scale)
                    
                    # Construct output path for this resolution
                    output_suffix = res_config.get("output_suffix", "")
                    output_filename = f"{base_output_name}{output_suffix}.{output_format}"
                    output_path = output_base_dir / output_filename
                    output_path.parent.mkdir(parents=True, exist_ok=True)

                    if asset_type == "icon": 
                        res_args["output_format"] = output_format 

                    try:
                        if asset_type == "icon" and res_args.get("svg_source_path"):
                            res_args["svg_source_path"] = Path(res_args["svg_source_path"])

                        generator_class = self.asset_generators[asset_type]
                        generator_instance = generator_class(**res_args)
                        
                        # Dynamic method call for generation
                        if asset_type == "checkbox_radio": # Special handling for checkbox_radio
                            generated_asset = generator_instance.generate_control()
                        elif asset_type == "slider": # Special handling for slider
                             generated_asset = generator_instance.generate_slider() 
                        else:
                            generated_asset = getattr(generator_instance, f"generate_{asset_type}")()
                        
                        if output_format == "png":
                            generated_asset.save(output_path)
                        elif output_format == "svg":
                            # If svg_source_path was used, generate_icon returns string (raw SVG content)
                            if asset_type == "icon" and res_args.get("svg_source_path"):
                                with open(output_path, "w", encoding="utf-8") as f:
                                    f.write(generated_asset)
                            else: # Text-based SVG generation (returns svgwrite.Drawing object)
                                generated_asset.saveas(output_path) 
                        else:
                            print(f"Unsupported output format '{output_format}' for {asset_type}. Skipping {output_path}")
                            failed_count += 1
                            continue

                        print(f"Generated {asset_type} (resolution: {output_suffix}) to {output_path}")
                        generated_count += 1

                    except Exception as e:
                        print(f"Error generating {asset_type} (resolution: {output_suffix}) from config {asset_config}: {e}")
                        failed_count += 1
            # --- Handle Single-Resolution Generation (Fallback) ---
            else:
                # Use base_output_name if available, otherwise fallback to "output" key in args
                final_output_name = base_output_name if base_output_name else asset_args.get("output")
                if not final_output_name:
                    print(f"Skipping asset: 'output' path not specified for asset type '{asset_type}' and no 'resolutions' defined. Configuration: {asset_config}")
                    failed_count += 1
                    continue
                
                output_path = output_base_dir / final_output_name
                output_path.parent.mkdir(parents=True, exist_ok=True)

                if asset_type == "icon": 
                    temp_asset_args["output_format"] = output_format 

                try:
                    if asset_type == "icon" and temp_asset_args.get("svg_source_path"):
                        temp_asset_args["svg_source_path"] = Path(temp_asset_args["svg_source_path"])

                    generator_class = self.asset_generators[asset_type]
                    generator_instance = generator_class(**temp_asset_args) # Pass the cleaned args
                    
                    # Dynamic method call for generation
                    if asset_type == "checkbox_radio": # Special handling for checkbox_radio
                        generated_asset = generator_instance.generate_control()
                    elif asset_type == "slider": # Special handling for slider
                        generated_asset = generator_instance.generate_slider()
                    else:
                        generated_asset = getattr(generator_instance, f"generate_{asset_type}")()
                    
                    if output_format == "png":
                        generated_asset.save(output_path)
                    elif output_format == "svg":
                        if asset_type == "icon" and temp_asset_args.get("svg_source_path"):
                            with open(output_path, "w", encoding="utf-8") as f:
                                f.write(generated_asset)
                        else:
                            generated_asset.saveas(output_path)
                    else:
                        print(f"Unsupported output format '{output_format}' for {asset_type}. Skipping {output_path}")
                        failed_count += 1
                        continue

                    print(f"Generated {asset_type} to {output_path}")
                    generated_count += 1

                except Exception as e:
                    print(f"Error generating {asset_type} from config {asset_config}: {e}")
                    failed_count += 1
        
        print(f"\nBatch generation complete: {generated_count} assets generated, {failed_count} failed.")

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)
    batch_config_file = Path("example_batch_config.json")

    # Create a dummy example_batch_config.json if it doesn't exist for demonstration
    if not batch_config_file.exists():
        print(f"Creating a dummy {batch_config_file} for example usage...")
        dummy_config_content = [
            {
                "type": "icon",
                "args": {
                    "text": "A",
                    "color_token": "primary_blue",
                    "background_color_token": "bg_light",
                    "font_token": "body",
                    "output_base_name": "batch_icon_A"
                },
                "output_format": "png",
                "multires": True,
                "resolutions": [
                    {"size": 16, "output_suffix": "_16"},
                    {"size": 32, "output_suffix": "_32"}
                ]
            },
            {
                "type": "button",
                "args": {
                    "width": 100, "height": 40, "label": "Batch Btn",
                    "bg_color_token": "success", "text_color_token": "bg_light",
                    "font_token": "body", "border_radius_token": "small",
                    "output_base_name": "batch_button_success"
                },
                "multires": True,
                "resolutions": [
                    {"scale": 0.5, "output_suffix": "_small"},
                    {"scale": 1.0, "output_suffix": "_normal"},
                    {"scale": 1.5, "output_suffix": "_large"}
                ]
            },
            {
                "type": "slider",
                "args": {
                    "width": 200, "height": 40, "track_height": 8, "thumb_size": 20,
                    "value": 75, "min_value": 0, "max_value": 100,
                    "track_color_token": "bg_medium", "fill_color_token": "primary_blue",
                    "thumb_color_token": "primary_blue", "track_border_radius_token": "small",
                    "output_base_name": "batch_slider_75"
                },
                "multires": True,
                "resolutions": [
                    {"scale": 0.8, "output_suffix": "_compact"},
                    {"scale": 1.0, "output_suffix": "_default"}
                ]
            },
             {
                "type": "checkbox_radio",
                "args": {
                    "control_type": "checkbox", "size": 20, "label": "Batch Checkbox",
                    "state": "checked", "font_token": "body", "border_width": 2,
                    "output_base_name": "batch_checkbox_checked"
                },
                "multires": True,
                "resolutions": [
                    {"scale": 0.8, "output_suffix": "_compact"},
                    {"scale": 1.0, "output_suffix": "_default"}
                ]
            }
        ]
        with open(batch_config_file, "w", encoding="utf-8") as f:
            json.dump(dummy_config_content, f, indent=4)
        print(f"Dummy config created at {batch_config_file}")

    try:
        bg = BatchGenerator(batch_config_file)
        bg.generate_assets(output_dir, multires=True) # Explicitly enable multires from CLI
    except Exception as e:
        print(f"An error occurred during example usage: {e}")