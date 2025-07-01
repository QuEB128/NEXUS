import cv2
import pytesseract
import os
import re

class TextExtractor:
    def __init__(self):
        # Path to Tesseract executable
        pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"
        
    # Function to extract text from image using Tesseract OCR
    def extract_text_from_image(self, image):
        # Use Tesseract to do OCR on the image
        raw_text = pytesseract.image_to_string(image)
        # Ensure only one white space between words
        cleaned_text = re.sub(r'\s+', ' ', raw_text)
        return cleaned_text.strip()
    
    def extract_text_from_first_image(self, directory):
        # Get list of files in the directory
        files = os.listdir(directory)
        
        # Filter only image files
        image_files = [file for file in files if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
        
        if image_files:
            # Load the first image file
            first_image_path = os.path.join(directory, image_files[0])
            image = cv2.imread(first_image_path)
            
            # Extract text from the image
            text = self.extract_text_from_image(image)
            
            return text
        else:
            return "No image files found in the directory"
    
    def main(self):
        directory_path = "/home/idc/Desktop/Main_Project/ImgToRead2"
        text = self.extract_text_from_first_image(directory_path)
        print("Text extracted:", text)

if __name__ == "__main__":
    text_extractor = TextExtractor()
    text_extractor.main()
