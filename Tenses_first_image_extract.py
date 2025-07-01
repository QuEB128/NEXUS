import cv2
import pytesseract
import os
import nltk
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer

# Download the necessary NLTK resources if you haven't already
#nltk.download('punkt')
#nltk.download('wordnet')

# Path to Tesseract executable
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

# Function to extract text from image using Tesseract OCR
def extract_text_from_image(image):
    # Convert image to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply image thresholding
    _, threshold = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Use Tesseract to do OCR on the thresholded image
    text = pytesseract.image_to_string(threshold)
    
    return text

# Function to check if a word is valid
def is_word(word):
    return word.lower() in wordnet.words()

# Function to filter out non-words from a sentence
def filter_non_words(sentence):
    words_in_sentence = nltk.word_tokenize(sentence)
    valid_words = [word for word in words_in_sentence if is_word(word)]
    return ' '.join(valid_words)

# Function to lemmatize a word
def lemmatize_word(word):
    lemmatizer = WordNetLemmatizer()
    lemma = lemmatizer.lemmatize(word) 
    return lemma

def extract_text_from_first_image(directory):
    # Get list of files in the directory
    files = os.listdir(directory)
    
    # Filter only image files
    image_files = [file for file in files if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp'))]
    
    if image_files:
        # Load the first image file
        first_image_path = os.path.join(directory, image_files[0])
        image = cv2.imread(first_image_path)
        
        # Extract text from the image
        text = extract_text_from_image(image)
        filtered_sentence = filter_non_words(text)
        
        return filtered_sentence
    else:
        return "No image files found in the directory"

# Example usage:
directory_path = "/home/idc/Desktop/RaspberryPI_main_project/ImgToRead"
text = extract_text_from_first_image(directory_path)
print("Text extracted:", text)