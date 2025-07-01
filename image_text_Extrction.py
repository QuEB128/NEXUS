import cv2
import pytesseract
import nltk
from nltk.corpus import words

#Download the words corpus if you haven't already
nltk.download('words')

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

def scan_and_display_text():
    # Initialize webcam
    cap = cv2.VideoCapture(0)

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()
    
        # Display the frame
        cv2.imshow('Live Image', frame)
    
        # Check if the user presses 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
        # Extract text from the frame
        text = extract_text_from_image(frame)
        # Filter non-words from the sentence
        filtered_sentence = filter_non_words(text)
        if filtered_sentence != "":
            print("Extracted Text:", filtered_sentence)            

    # Release the capture
    cap.release()
    cv2.destroyAllWindows()

#scan_and_display_text()
image_path = "/home/idc/Desktop/RaspberryPI_main_project/to read/Screenshot (52).png"
image = cv2.imread(image_path)
        
# Extract text from the image
text = extract_text_from_image(image)
filtered_sentence = filter_non_words(text)
        
print("Text extracted: ", filtered_sentence)