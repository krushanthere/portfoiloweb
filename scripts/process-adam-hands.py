import json
from PIL import Image
import numpy as np

# Open image
img = Image.open('public/hands/creation-of-adam.jpg').convert('L')
w, h = img.size
pixels = np.array(img, dtype=np.float32)

print(f"Loaded image size: {w}x{h}")

# The image is 736x491.
# Left hand (Adam): x from ~0 to ~375, y from ~130 to ~430
# Right hand (God): x from ~380 to ~736, y from ~120 to ~390

def extract_halftone_dots(x_start, x_end, y_start, y_end, is_left=True, step=2):
    dots = []
    region = pixels[y_start:y_end, x_start:x_end]
    rh, rw = region.shape
    
    # Threshold for noise cutoff
    bg_thresh = 15.0 # pixels < 15 are treated as pure black background
    
    for y in range(0, rh, step):
        for x in range(0, rw, step):
            block = region[y:min(y+step, rh), x:min(x+step, rw)]
            raw_val = float(np.mean(block))
            
            if raw_val > bg_thresh:
                # Normalized luminance 0.0 to 1.0
                lum = (raw_val - bg_thresh) / (255.0 - bg_thresh)
                
                # Enhanced chiaroscuro contrast
                lum_curved = np.power(lum, 0.85)
                
                # Spatial positioning
                # We want the fingertip of the left hand to end near x = -0.5 in 3D
                # And the fingertip of the right hand to start near x = 0.5 in 3D
                # Total span in 3D: width ~ 3.2 units, height ~ 2.0 units
                
                norm_x = x / float(rw)
                norm_y = y / float(rh)
                
                if is_left:
                    # Adam's hand: left to right (forearm to fingertip)
                    # Coordinates in local space: x from -2.2 to 0.45
                    px = (norm_x * 2.65 - 2.2)
                    py = -(norm_y * 1.8 - 0.9) - 0.05
                else:
                    # God's hand: left to right (fingertip to forearm)
                    # Coordinates in local space: x from -0.45 to 2.2
                    px = (norm_x * 2.65 - 0.45)
                    py = -(norm_y * 1.8 - 0.9) + 0.05
                
                # 3D relief depth approximation
                pz = np.sin(lum_curved * np.pi * 0.5) * 0.22 - 0.05
                
                # Halftone dot radius
                radius = np.clip(0.3 + lum_curved * 0.95, 0.25, 1.25)
                
                dots.append({
                    "x": round(float(px), 4),
                    "y": round(float(py), 4),
                    "z": round(float(pz), 4),
                    "radius": round(float(radius), 3),
                    "brightness": round(float(lum_curved), 3),
                })
                
    return dots

# Split image into left (Adam) and right (God)
split_point = 378

left_dots = extract_halftone_dots(0, split_point, 110, 440, is_left=True, step=2)
right_dots = extract_halftone_dots(split_point - 10, w, 110, 410, is_left=False, step=2)

print(f"Adam (Left Hand): {len(left_dots)} halftone dots.")
print(f"God (Right Hand): {len(right_dots)} halftone dots.")

with open('public/data/hand-robot.json', 'w') as f:
    json.dump(left_dots, f)

with open('public/data/hand-human.json', 'w') as f:
    json.dump(right_dots, f)

print("Successfully regenerated halftone matrices matching Creation of Adam reference image!")
