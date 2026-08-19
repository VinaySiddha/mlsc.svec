import os
from PIL import Image

def optimize_image(filepath, max_width=None, quality=85):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    orig_size = os.path.getsize(filepath)
    img = Image.open(filepath)
    orig_w, orig_h = img.size

    # Resize if max_width is specified and image is wider
    if max_width and orig_w > max_width:
        ratio = max_width / float(orig_w)
        new_h = int(float(orig_h) * ratio)
        # Use Lanczos resampling for high quality resizing
        img = img.resize((max_width, new_h), Image.Resampling.LANCZOS)
        print(f"Resized {os.path.basename(filepath)} from {orig_w}x{orig_h} to {max_width}x{new_h}")

    ext = os.path.splitext(filepath)[1].lower()
    temp_filepath = filepath + ".tmp"

    if ext in ['.jpg', '.jpeg']:
        # Convert RGBA to RGB if needed
        if img.mode in ('RGBA', 'LA'):
            img = img.convert('RGB')
        img.save(temp_filepath, 'JPEG', quality=quality, optimize=True)
    elif ext == '.png':
        # Keep transparency, but optimize with palette if possible, or just standard compression
        # For logo.png we resize to 256 max
        img.save(temp_filepath, 'PNG', optimize=True, compress_level=9)
    else:
        print(f"Unsupported format: {ext}")
        return

    # Swap original with optimized if optimized is smaller
    new_size = os.path.getsize(temp_filepath)
    if new_size < orig_size:
        os.replace(temp_filepath, filepath)
        saved = orig_size - new_size
        print(f"Optimized {os.path.basename(filepath)}: {orig_size/1024:.1f} KB -> {new_size/1024:.1f} KB (Saved {saved/1024:.1f} KB, -{saved/orig_size*100:.1f}%)")
    else:
        os.remove(temp_filepath)
        print(f"Skipped {os.path.basename(filepath)}: Optimized size ({new_size/1024:.1f} KB) was larger than original ({orig_size/1024:.1f} KB)")

if __name__ == "__main__":
    public_dir = "public"
    
    # 1. g2.jpg (Technical Hackathons): huge 4MB file, displayed at ~413x310
    optimize_image(os.path.join(public_dir, "g2.jpg"), max_width=1200, quality=80)
    
    # 2. team1.jpg (MLSC Core Assembly): 193KB, displayed at ~541x309
    optimize_image(os.path.join(public_dir, "team1.jpg"), max_width=1000, quality=80)
    
    # 3. mlsc-preview.png (Platform Preview): 1.2MB, displayed at ~694x694
    optimize_image(os.path.join(public_dir, "mlsc-preview.png"), max_width=1200)
    
    # 4. logo.png (MLSC Logo): 562KB, displayed at ~19x19 or 40x40
    optimize_image(os.path.join(public_dir, "logo.png"), max_width=256)
