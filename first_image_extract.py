import pytesseract
import os
import time
import cv2
import pytesseract
import nltk
from nltk.corpus import words

# Download the words corpus if you haven't already
#nltk.download('words')

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
    return word.lower() in words.words()

# Function to filter out non-words from a sentence
def filter_non_words(sentence):
    words_in_sentence = sentence.split()
    valid_words = [word for word in words_in_sentence if is_word(word)]
    return ' '.join(valid_words)

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

# Create a directory if it doesn't exist
directory = 'ImgToRead'
if not os.path.exists(directory):
    os.makedirs(directory)

def delete_existing_files():
    # Delete all existing files in the directory
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        os.remove(file_path)

def main():
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
                delete_existing_files()  # Delete existing files in the directory
                
                # Generate a filename with current timestamp
                filename = os.path.join(directory, 'image.jpg')
                
                # Save the captured frame as an image
                cv2.imwrite(filename, frame)
                
                print(f'Image saved as: {filename}')
                
                directory_path = "/home/idc/Desktop/Main_Project/read text/ImgToRead"
                text = extract_text_from_first_image(directory_path)
                print("Text extracted:", text)

            elif key == 27:  # ESC key pressed
                break
        
        # Release the webcam
        cap.release()
        cv2.destroyAllWindows()
        
    except KeyboardInterrupt:
        print("\nExiting...")
        pass

if __name__ == "__main__":
    main()


