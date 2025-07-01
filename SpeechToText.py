import speech_recognition as sr
import time

# Initialize the recognizer
recognizer = sr.Recognizer()

# Function to convert speech to text
def speech_to_text():
    with sr.Microphone() as source:
        print("Listening...")  # Prompt the user to speak
        recognizer.adjust_for_ambient_noise(source)  # Adjust for ambient noise
        audio = recognizer.listen(source)  # Listen for audio input

    try:
        print("Recognizing...")  # Prompt the user that recognition is in progress
        text = recognizer.recognize_google(audio)  # Use Google Speech Recognition to convert audio to text
        return text
    except sr.UnknownValueError:
        print("Sorry, could not understand audio.")
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")

# Main function
def main():
    text = speech_to_text()
    if text:
        print("You said:", text)

while True:
    main()
    time.sleep(2)
