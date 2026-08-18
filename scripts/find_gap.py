from PIL import Image
import numpy as np

img = Image.open('public/hands/creation-of-adam.jpg').convert('L')
w, h = img.size

# Ascii print of center section
cx, cy = w // 2, h // 2
box_w, box_h = 300, 150
crop = img.crop((cx - box_w//2, cy - box_h//2, cx + box_w//2, cy + box_h//2))

small = crop.resize((60, 30))
arr = np.array(small)
chars = " .:-=+*#%@"
for row in arr:
    line = ""
    for val in row:
        idx = int((val / 255.0) * 9)
        line += chars[idx]
    print(line)

print("Center of image was:", cx, cy)
print("Crop box top-left:", cx - box_w//2, cy - box_h//2)
