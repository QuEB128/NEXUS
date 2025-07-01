import cv2
import pytesseract
import os
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import pyttsx3
import re

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 170)

def speak(text):
    engine.say(text)
    engine.runAndWait()

class TextExtractor:
    def __init__(self):
        # Path to Tesseract executable
        pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        # Download the necessary NLTK resources if you haven't already
        # nltk.download('punkt')
        # nltk.download('wordnet')
        
    # Function to extract text from image using Tesseract OCR
    def extract_text_from_image(self, image):
        # Convert image to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply image thresholding
        _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Use Tesseract to do OCR on the thresholded image
        text = pytesseract.image_to_string(threshold)
        
        return text
    
    # Function to check if a word is a valid English word
    def is_word(self, word):
        return word.lower() in wordnet.words()
    
    # Function to check if a word is an adjective
    def is_adjective(self, word):
        synsets = wordnet.synsets(word)
        for synset in synsets:
            if synset.pos() == 'a':  # 'a' denotes adjective in WordNet
                return True
        return False
    
    # Function to filter out non-words, adjectives, and articles from a sentence
    def filter_words(self, sentence):
        words_in_sentence = nltk.word_tokenize(sentence)
        filtered_words = [word for word in words_in_sentence if self.is_word(word) or word.lower() in ['a', 'an', 'the']]
        adjectives = [word for word in filtered_words if self.is_adjective(word)]
        articles = [word for word in filtered_words if word.lower() in ['a', 'an', 'the']]
        return adjectives, articles
    
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
            # Ensure there is only one white space between each word
            text = re.sub(r'\s+', ' ', text)
            
            return text
        else:
            return "No image files found in the directory"
    
    def main(self):
        print("Press Enter to take a picture. Press Ctrl+C to exit.")
        try:
            # Initialize the webcam
            cap = cv2.VideoCapture(0)
            
            # Check if the webcam is opened correctly
            if not cap.isOpened():
                print("Error: Unable to open webcam.")
                return
            
            while True:
                # Read a frame from the webcam
                ret, frame = cap.read()
                
                # Display the frame
                cv2.imshow('Webcam Feed', frame)
                
                # Check for user input
                key = cv2.waitKey(1)
                if key == 13:  # Enter key pressed
                    # Generate a filename with current timestamp
                    filename = 'image.jpg'
                    
                    # Save the captured frame as an image
                    cv2.imwrite(filename, frame)
                    
                    print(f'Image saved as: {filename}')
                   
                    directory_path = "."
                    text = self.extract_text_from_first_image(directory_path)
                    print("Text extracted:")
                    print(text)
                    speak("Text extracted:")
                    speak(text)

                    # Filter out adjectives and articles from the extracted text
                    #adjectives, articles = self.filter_words(text)
                    #filtered_text = ' '.join(adjectives + articles)
                    #print("Filtered Text:", filtered_text)

                elif key == 27:  # ESC key pressed
                    break
            
            # Release the webcam
            cap.release()
            cv2.destroyAllWindows()
            
        except KeyboardInterrupt:
            print("\nExiting...")
            pass



text_extractor = TextExtractor()
main = text_extractor.main()   
