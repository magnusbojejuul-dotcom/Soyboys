from PIL import Image
import sys
import os

def remove_white_background(image_path):
    try:
        if not os.path.exists(image_path):
            print(f"File not found: {image_path}")
            return
            
        img = Image.open(image_path)
        img = img.convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check for white or near-white pixels and make them transparent
            if item[0] > 230 and item[1] > 230 and item[2] > 230:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Save as PNG
        out_path = os.path.splitext(image_path)[0] + "_transparent.png"
        img.save(out_path, "PNG")
        print(f"Successfully processed: {image_path} -> {out_path}")
        
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_transparent.py <image1> <image2> ...")
        sys.exit(1)
        
    for arg in sys.argv[1:]:
        remove_white_background(arg)
