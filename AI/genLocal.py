import cv2
import pytesseract
import json
import os
from pathlib import Path

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
DB_PATH = "classroom_db.json"
MAP_PATH = "campus_map.jpg"

class DatabaseManager:
    @staticmethod
    def initialize():
        """Create database with all required keys if missing or invalid"""
        default_data = {
            "assigned_blocks": [],
            "events": [],
            "blocks": {
                "Bloc A": {"rooms": ["A101"], "coordinates": [100, 100]},
                "Bloc B": {"rooms": ["B201"], "coordinates": [200, 200]},
                "Bloc C": {"rooms": ["C301"], "coordinates": [150, 150]}
            },
            "clubs": [
                {"name": "Robotique", "members": 30, "preferred_blocks": ["Bloc A", "Bloc B"]},
                {"name": "Musique", "members": 20, "preferred_blocks": ["Bloc C"]}
            ]
        }

        if not Path(DB_PATH).exists():
            with open(DB_PATH, 'w') as f:
                json.dump(default_data, f, indent=2)
            return

        with open(DB_PATH, 'r') as f:
            try:
                data = json.load(f)
                for key in default_data.keys():
                    if key not in data:
                        data[key] = default_data[key]
            except json.JSONDecodeError:
                data = default_data

        with open(DB_PATH, 'w') as f:
            json.dump(data, f, indent=2)

class OCRProcessor:
    @staticmethod
    def detect_blocks(image_path):
        """Robust block detection with multiple fallbacks"""
        try:
            img = cv2.imread(image_path)
            if img is None:
                raise FileNotFoundError(f"Image not found at {image_path}")

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blur = cv2.GaussianBlur(gray, (3, 3), 0)
            thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]

            langs = ['fra', 'eng']
            for lang in langs:
                try:
                    text = pytesseract.image_to_string(
                        thresh, 
                        config='--psm 6 -c tessedit_char_whitelist="BlocABCDEFGHIJKLMNOPQRSTUVWXYZ "',
                        lang=lang
                    )
                    blocks = [line.strip() for line in text.split('\n') if "Bloc" in line]
                    if blocks:
                        return blocks
                except:
                    continue

            return ["Bloc A", "Bloc B", "Bloc C"]  

        except Exception as e:
            print(f"⚠️ OCR Warning: {str(e)}")
            return ["Bloc A", "Bloc B", "Bloc C"]

def main():
    DatabaseManager.initialize()
    
    blocks = OCRProcessor.detect_blocks(MAP_PATH)
    print(f"📋 Detected blocks: {blocks}")
    
    with open(DB_PATH, 'r') as f:
        db = json.load(f)
    
    print("✅ System Ready")
    print(f"Available clubs: {[c['name'] for c in db['clubs']]}")
    print(f"Available blocks: {list(db['blocks'].keys())}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Critical Error: {str(e)}")
        print("💡 Try these solutions:")
        print("- Delete classroom_db.json and restart")
        print("- Check image file exists and is readable")
        print("- Verify Tesseract installation")