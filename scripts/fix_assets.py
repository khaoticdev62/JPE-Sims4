from PIL import Image
import os

def fix_icons():
    print("Fixing icons...")
    try:
        # Load the source into memory and CLOSE handle
        with Image.open('public/icon.png') as img:
            img.load()
            source = img.copy()
        
        # 1. Save as a REAL PNG (512x512)
        print("Creating valid PNG...")
        source.resize((512, 512), Image.Resampling.LANCZOS).save('public/icon.png', 'PNG')
        
        # 2. Save as a REAL ICO (Multi-size)
        print("Creating valid ICO...")
        icon_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
        source.save('public/icon.ico', sizes=icon_sizes)
        
        # 3. Save as a REAL ICNS
        print("Creating valid ICNS...")
        source.save('public/icon.icns')
        
        # 4. Fix build assets
        print("Fixing build assets...")
        with Image.open('build/installerSidebar.bmp') as img:
            img.load()
            img.save('build/installerSidebar.bmp', 'BMP')
        
        with Image.open('build/dmg-background.png') as img:
            img.load()
            img.save('build/dmg-background.png', 'PNG')
        
        print("All assets fixed successfully.")
    except Exception as e:
        print(f"Error fixing icons: {e}")

if __name__ == "__main__":
    fix_icons()
