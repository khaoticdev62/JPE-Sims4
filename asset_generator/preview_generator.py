import webbrowser
from pathlib import Path
from typing import List, Optional

class PreviewGenerator:
    """
    Generates an HTML file to preview a list of asset files.
    """
    def __init__(self, asset_paths: List[Path], title: str = "Asset Preview"):
        self.asset_paths = asset_paths
        self.title = title

    def _generate_html_content(self) -> str:
        """Generates the HTML content for the preview."""
        
        # Basic CSS for styling
        css_style = """
        body { font-family: sans-serif; margin: 20px; background-color: #f0f0f0; }
        h1 { color: #333; text-align: center; }
        .asset-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .asset-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 10px;
            text-align: center;
            background-color: #fff;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .asset-item img, .asset-item embed {
            max-width: 100%;
            height: auto;
            max-height: 150px; /* Limit height for uniform display */
            object-fit: contain;
            margin-bottom: 10px;
            border: 1px dashed #eee;
        }
        .asset-item p {
            font-size: 0.8em;
            color: #555;
            word-break: break-all;
        }
        """

        # Generate asset HTML elements
        asset_elements = []
        for asset_path in self.asset_paths:
            relative_path = asset_path.name # Use just the filename for display in preview
            
            if asset_path.suffix.lower() == ".svg":
                # For SVG, use embed tag for better handling of interactive SVGs and scaling
                element_tag = f'<embed src="{relative_path}" type="image/svg+xml" />'
            else:
                # For other image types (like PNG), use img tag
                element_tag = f'<img src="{relative_path}" alt="{relative_path}" />'
            
            asset_elements.append(f"""
            <div class="asset-item">
                {element_tag}
                <p>{relative_path}</p>
            </div>
            """)

        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{self.title}</title>
            <style>
                {css_style}
            </style>
        </head>
        <body>
            <h1>{self.title}</h1>
            <div class="asset-container">
                {"".join(asset_elements)}
            </div>
        </body>
        </html>
        """
        return html_content

    def generate_preview(self, output_path: Path, open_browser: bool = False):
        """
        Generates the HTML preview file and optionally opens it in a browser.
        :param output_path: The path where the HTML preview file will be saved.
        :param open_browser: If True, opens the generated HTML file in the default web browser.
        """
        html_content = self._generate_html_content()
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        
        print(f"Generated asset preview to {output_path}")

        if open_browser:
            webbrowser.open_new_tab(f"file://{output_path.resolve()}")
            print("Opened preview in default web browser.")

# Example Usage:
if __name__ == "__main__":
    output_dir = Path("generated_assets")
    output_dir.mkdir(exist_ok=True)

    # Example asset paths (these files would need to exist for the preview to show them)
    example_assets = [
        output_dir / "icon_jpe_24.png",
        output_dir / "icon_warning_48.svg",
        output_dir / "batch_button_confirm_normal.png",
        output_dir / "batch_progressbar_60.png",
        output_dir / "batch_text_input_focused_username.png"
    ]
    
    # Filter out non-existent paths for the example
    existing_assets = [p for p in example_assets if p.exists()]

    if existing_assets:
        preview_gen = PreviewGenerator(existing_assets, title="JPE CLI Generated Assets")
        preview_file = output_dir / "asset_preview.html"
        preview_gen.generate_preview(preview_file, open_browser=False) # Set open_browser=True to auto-open
    else:
        print("No example assets found. Please generate some assets first using the CLI.")
