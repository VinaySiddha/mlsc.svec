import os
from fontTools.ttLib import TTFont

def convert_ttf_to_woff2(ttf_path):
    if not os.path.exists(ttf_path):
        print(f"File not found: {ttf_path}")
        return

    woff2_path = os.path.splitext(ttf_path)[0] + ".woff2"
    orig_size = os.path.getsize(ttf_path)
    
    print(f"Converting {os.path.basename(ttf_path)}...")
    try:
        font = TTFont(ttf_path)
        font.flavor = 'woff2'
        font.save(woff2_path)
        
        new_size = os.path.getsize(woff2_path)
        saved = orig_size - new_size
        print(f"Saved: {woff2_path}")
        print(f"Size reduction: {orig_size/1024/1024:.2f} MB -> {new_size/1024:.1f} KB (Saved {saved/1024/1024:.2f} MB, -{saved/orig_size*100:.1f}%)")
    except Exception as e:
        print(f"Failed to convert {ttf_path}: {e}")

if __name__ == "__main__":
    fonts_dir = os.path.join("public", "fonts")
    if not os.path.exists(fonts_dir):
        print(f"Fonts directory not found: {fonts_dir}")
    else:
        for file in os.listdir(fonts_dir):
            if file.lower().endswith(".ttf"):
                ttf_path = os.path.join(fonts_dir, file)
                convert_ttf_to_woff2(ttf_path)
