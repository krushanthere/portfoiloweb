from PIL import Image, ImageEnhance, ImageOps

def prep(img_path):
    img = Image.open(img_path).convert('RGB')
    w, h = img.size
    
    target_ratio = 16.0 / 9.0
    current_ratio = w / h
    
    if current_ratio < target_ratio:
        new_w = int(h * target_ratio)
        new_h = h
    else:
        new_w = w
        new_h = int(w / target_ratio)
        
    padded = Image.new("RGB", (new_w, new_h), (0, 0, 0))
    offset = ((new_w - w) // 2, (new_h - h) // 2)
    padded.paste(img, offset)
    
    enhanced = ImageOps.autocontrast(padded, cutoff=2)
    
    enhancer = ImageEnhance.Contrast(enhanced)
    enhanced = enhancer.enhance(1.2)
    
    enhanced.save(img_path, quality=90)
    print(f"Processed image: padded to {new_w}x{new_h}, adjusted contrast.")

prep('public/hands/creation-of-adam.jpg')
