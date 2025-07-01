import cv2
import pytesseract
import os
import re

class ImgTextExtractor:
    def __init__(self):
        # Path to Tesseract executable
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        
    # Function to extract text from image using Tesseract OCR
    def extract_text_from_image(self, image):
        # Convert image to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply image thresholding
        _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Use Tesseract to do OCR on the thresholded image
        raw_text = pytesseract.image_to_string(threshold)
        
        # Ensure only one white space between words
        cleaned_text = re.sub(r'\s+', ' ', raw_text)
        return cleaned_text.strip()
    
    def extract_text_from_images(self, directory):
        # Get list of files in the directory
        files = os.listdir(directory)
        
        # Filter only image files
        image_files = [file for file in files if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
        
        if not image_files:
            return "No image files found in the directory"
        
        extracted_texts = []
        for image_file in image_files:
            # Load the image file
            image_path = os.path.join(directory, image_file)
            image = cv2.imread(image_path)
            
            # Extract text from the image
            text = self.extract_text_from_image(image)
            extracted_texts.append(text)
        
        return extracted_texts

# Example usage
def main():
    # Create an instance of ImgTextExtractor
    text_extractor = ImgTextExtractor()

    # Directory containing the image(s)
    directory_path = "/home/idc/Desktop/Main_Project/read_text/ImgToRead3"
    
    # Extract text from all images in the directory
    extracted_texts = text_extractor.extract_text_from_images(directory_path)

    # Print the extracted text from each image
    for i, text in enumerate(extracted_texts, start=1):
        print(f"Text extracted from image {i}:", text)

if __name__ == "__main__":
    main()
