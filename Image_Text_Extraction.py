import os
import cv2
import pytesseract
import pyttsx3
import nltk
from nltk.corpus import words

# Download the words corpus if you haven't already
nltk.download('words')

# Path to Tesseract executable
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"

# Function to extract text from image using Tesseract OCR
def extract_text_from_image(image):
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply image thresholding
    _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Use Tesseract to do OCR on the thresholded image
    text = pytesseract.image_to_string(threshold)
    
    return text

def read_text(text):
    engine = pyttsx3.init()
    engine.setProperty('rate', 150) #set speed of speech
    engine.say(text)
    engine.runAndWait()

# Function to check if a word is valid
def is_word(word):
    return word.lower() in words.words()

# Function to filter out non-words from a sentence
def filter_non_words(sentence):
    words_in_sentence = sentence.split()
    valid_words = [word for word in words_in_sentence if is_word(word)]
    return ' '.join(valid_words)

# Folder containing images
folder_path = r"C:\Users\HP\Documents\Best\new\other stuff\Screenshots\to read"

# Iterate over each image file in the folder
for filename in os.listdir(folder_path):
    if filename.endswith(".png") or filename.endswith(".jpg"): # Assuming only images are present in the folder
        # Load the image from file
        image_path = os.path.join(folder_path, filename)
        image = cv2.imread(image_path)
        
        # Extract text from the image
        text = extract_text_from_image(image)
        filtered_sentence = filter_non_words(text)
        
        print("Text extracted from", filename, ":", filtered_sentence)
        
        # read the extracted text
        # read_text(filtered_sentence)
