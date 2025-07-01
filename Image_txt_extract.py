import cv2
import pytesseract
import os
import re
import pyttsx3

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 170)

def speak(text):
    engine.say(text)
    engine.runAndWait()

class ImgTextExtractor:
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
    
    def extract_text_from_all_images(self, directory):
        # Get list of files in the directory
        files = os.listdir(directory)
        
        # Filter only image files
        image_files = [file for file in files if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
        
        if image_files:
            text_dict = {}
            for image_file in image_files:
                # Load the image file
                image_path = os.path.join(directory, image_file)
                image = cv2.imread(image_path)
                
                # Extract text from the image
                text = self.extract_text_from_image(image)
                
                # Store the extracted text with the file name
                text_dict[image_file] = text
            
            return text_dict
        else:
            speak ("No image files found in the directory")
    
    def main(self):
        directory_path = "/media/idc/USB DISK/bluetooth"
        text_dict = self.extract_text_from_all_images(directory_path)
        
        if isinstance(text_dict, dict):
            for file_name, text in text_dict.items():
                print(f"Text extracted from '{file_name}':\n{text}\n")
                speak(f"Text extracted from {file_name}:")
                speak(text)
        else:
            speak(text_dict)
            speak("No image files found in the directory")
        

#Img_text_extractor = ImgTextExtractor()
#Img_text_extractor.main()
