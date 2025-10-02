from PIL import Image
import numpy as np

def preprocess_image(file_path, target_size=(224,224)):
    """Load and resize image; return normalized array."""
    img = Image.open(file_path).convert('RGB')
    img = img.resize(target_size)
    arr = np.array(img) / 255.0
    return arr
