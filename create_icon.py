from PIL import Image

def create_icon(path, size=(32, 32), color=(44, 95, 153)): # JPE Blue
    """Creates a simple ICO file."""
    img = Image.new('RGB', size, color)
    img.save(path, format='ICO')

if __name__ == '__main__':
    import os
    icon_path = os.path.join("branding", "assets", "jpe_icon.ico")
    os.makedirs(os.path.dirname(icon_path), exist_ok=True)
    create_icon(icon_path)
    print(f"Created placeholder icon at: {icon_path}")
