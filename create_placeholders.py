from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder_images(assets_dir="branding/assets"):
    os.makedirs(assets_dir, exist_ok=True)

    # 1. Create Installer Icon (16x16 transparent PNG)
    icon_size = (16, 16)
    icon_img = Image.new("RGBA", icon_size, (0, 0, 0, 0)) # Transparent background
    draw = ImageDraw.Draw(icon_img)
    
    # Draw a simple 'J' for JPE
    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()
    
    text = "J"
    text_bbox = draw.textbbox((0,0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    text_x = (icon_size[0] - text_width) // 2
    text_y = (icon_size[1] - text_height) // 2 - 1 # Adjust slightly for better centering
    
    draw.text((text_x, text_y), text, font=font, fill=(44, 95, 153, 255)) # JPE Blue

    icon_path = os.path.join(assets_dir, "jpe_installer_icon.png")
    icon_img.save(icon_path)
    print(f"Created placeholder installer icon: {icon_path}")

    # 2. Create Opaque Background Logo (e.g., 200x100 transparent PNG with "JPE")
    logo_size = (200, 100)
    logo_img = Image.new("RGBA", logo_size, (0, 0, 0, 0)) # Transparent background
    draw = ImageDraw.Draw(logo_img)

    try:
        font = ImageFont.truetype("arial.ttf", 40)
    except IOError:
        font = ImageFont.load_default()
    
    text = "JPE"
    text_bbox = draw.textbbox((0,0), text, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    text_x = (logo_size[0] - text_width) // 2
    text_y = (logo_size[1] - text_height) // 2
    
    draw.text((text_x, text_y), text, font=font, fill=(44, 95, 153, 102)) # JPE Blue, 40% opaque (102/255)

    logo_path = os.path.join(assets_dir, "jpe_background_logo.png")
    logo_img.save(logo_path)
    print(f"Created placeholder background logo: {logo_path}")

if __name__ == "__main__":
    create_placeholder_images()
