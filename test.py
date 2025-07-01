import os
import pyttsx3
import speech_recognition as sr
import google.generativeai as genai
from PIL import Image
import io
import cv2
import time
import gpiozero
from gpiozero import Button
import time
from picamera import PiCamera
from picamera.array import PiRGBArray

#led = gpiozero.LED(17)
#button2 = Button(24)
#exit_button = Button(2)
led = gpiozero.LED(17)
button1 = Button(5) #voice select mode
button2 = Button(4) #button select mode
exit_button = Button(2) #back button
#GPIO.setup(17, GPIO.OUT)
#GPIO.setup(button, GPIO.IN)
#GPIO.setup(exit_button, GPIO.IN)

def read_text(text):
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()

def recognize_speech():
      recognizer = sr.Recognizer()
      with sr.Microphone() as source:
          read_text("Please say your command.")
          recognizer.adjust_for_ambient_noise(source)
          audio = recognizer.listen(source)
      try:
          command = recognizer.recognize_google(audio).lower()
          return command
      except sr.UnknownValueError:
          return "hi"
      except sr.RequestError:
          read_text("Sorry, I'm having trouble accessing the Google API.")

def wait_with_button_check(duration):
    start_time = time.time()
    while time.time() - start_time < duration:
        if button1.is_pressed:
            return "v_select"
        if button2.is_pressed:
            return "b_select"
        if exit_button.is_pressed:
            return "exit"  # Indicate to exit
        time.sleep(0.1)  # Short sleep to avoid busy waiting
    return False

class STEWARD:
    def __init__(self):
        genai.configure(api_key="AIzaSyC7vnVvZM1pnZ0s0vWF-uLnwwFa596uK-s")
        
        self.directory = 'image_to_examine'
        if not os.path.exists(self.directory):
            os.makedirs(self.directory)
        
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"}
            ],
            generation_config={
                "temperature": 1,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 8192,
                "response_mime_type": "text/plain"
            }
        )
        self.chat_session = self.model.start_chat(history=[])

    def delete_existing_files(self):
        # Delete all existing files in the directory
        for filename in os.listdir(self.directory):
            file_path = os.path.join(self.directory, filename)
            os.remove(file_path)
        
    def captureImg(self):
        read_text("Keep the camera steady before clicking the button")
        filename = None

        try:
            # Initialize the PiCamera
            camera = PiCamera()
            camera.resolution = (640, 480)  # Set an appropriate resolution
            rawCapture = PiRGBArray(camera)

            # Allow the camera to warm up
            time.sleep(0.1)

            while True:
                # Capture a frame from the camera
                camera.capture(rawCapture, format="bgr")
                frame = rawCapture.array

                # Display the frame
                cv2.imshow('Camera Feed', frame)

                # Check for button presses
                if button2.is_pressed:
                    print("Button pressed")

                    # Delete existing files in the directory
                    self.delete_existing_files()  # Ensure this function is defined elsewhere

                    # Generate a filename with the current timestamp
                    filename = os.path.join(self.directory, 'image.jpg')

                    # Save the captured frame as an image
                    cv2.imwrite(filename, frame)

                    print(f'Image saved as: {filename}')
                    break

                elif exit_button.is_pressed:
                    print("Exit button pressed")
                    break

                # Clear the raw capture for the next frame
                rawCapture.truncate(0)

                # Handle OpenCV window events
                key = cv2.waitKey(1)
                if key == 27:  # ESC key pressed
                    break

            # Clean up
            cv2.destroyAllWindows()

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            camera.close()  # Ensure the camera is properly closed

        return filename  # Return the filename of the captured image

    def start_chat(self):   #for general image description
        #GPIO.output(17, GPIO.HIGH)
        led.on()
        self.captureImg()
        # Load image from a directory
        image_path = r"/home/idc/Desktop/Main_Project/image_to_examine/image.jpg"
        image = Image.open(image_path)

        # Convert image to base64 string
        image = image.convert("RGB")

        #store image data in memory bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_data = image_bytes.getvalue()

        # Send the image as input to the chat session
        response = self.chat_session.send_message("describe this as though you are a vision assistant to a blind person")
        response = self.chat_session.send_message(image)
        resp = response.text
        _response = resp.replace("*","")
        print(_response)
        read_text(_response)
        led.off()
        return True

        
            
    def start_plus_chat(self):   #for general image description
        #GPIO.output(17, GPIO.HIGH)
        led.on()
        self.captureImg()
        # Load image from a directory
        image_path = r"/home/idc/Desktop/Main_Project/image_to_examine/image.jpg"
        image = Image.open(image_path)

        # Convert image to base64 string
        image = image.convert("RGB")

        #store image data in memory bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_data = image_bytes.getvalue()

        # Send the image as input to the chat session
        response = self.chat_session.send_message(image)
        resp = response.text
        _response = resp.replace("*","")
        print(_response)
        read_text(_response)

        while True:
            text = input("> ")
            # text = self.recognize_speech()
#             if any(keyword in text.lower() for keyword in ["exit", "back","reverse", "break", "undo"]):
#                 led.off()
#                 break
            if exit_button.is_pressed:
                led.off()
                #GPIO.output(17, GPIO.LOW)
                break
            response = self.chat_session.send_message(text)
            resp = response.text
            _response = resp.replace("*","")
            print(_response)
            read_text(_response)

    def detect_currency(self):
        #GPIO.output(17, GPIO.HIGH)
        led.on()
        self.captureImg()
        # Load image from a directory
        image_path = r"/home/idc/Desktop/Main_Project/image_to_examine/image.jpg"
        image = Image.open(image_path)

        # Convert image to base64 string
        image = image.convert("RGB")

        #store image data in memory bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_data = image_bytes.getvalue()

        # Send the image as input to the chat session
        response = self.chat_session.send_message("detect currency and amount")
        response = self.chat_session.send_message(image)
        resp = response.text
        _response = resp.replace("*","")
        print(_response)
        read_text(_response)
        led.off()

    def translate_language(self):
        #GPIO.output(17, GPIO.HIGH)
        led.on()
        self.captureImg()
        # Load image from a directory
        image_path = r"/home/idc/Desktop/Main_Project/image_to_examine/image.jpg"
        image = Image.open(image_path)

        # Convert image to base64 string
        image = image.convert("RGB")

        #store image data in memory bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_data = image_bytes.getvalue()

        # Send the image as input to the chat session
        response = self.chat_session.send_message("translate the text in the image to english")
        response = self.chat_session.send_message(image)
        resp = response.text
        _response = resp.replace("*","")
        print(_response)
        read_text(_response)
        led.off()
            
    def chat(self):
        read_text("...activating ai mode")
        response = self.chat_session.send_message("hi")
        #GPIO.output(17, GPIO.HIGH)
        led.on()
        read_text("... ai mode activated")
        read_text(response.text)
        
        while True:
            text = input("> ")
            # text = self.recognize_speech()
            if any(keyword in text.lower() for keyword in ["exit", "back","reverse", "break", "undo"]):
                break
            if exit_button.is_pressed:
                break
            elif any(keyword in text.lower() for keyword in ["describe", "detect","view", "read", "capture", "image"]):
                self.start_chat()
            response = self.chat_session.send_message("generate a short respond")
            response = self.chat_session.send_message(text)
            resp = response.text
            _response = resp.replace("*","")
            print(_response)
            read_text(_response)
        led.off()
    
    def text_extraction(self):
        #GPIO.output(17, GPIO.HIGH)
        led.on()
        self.captureImg()
        # Load image from a directory
        image_path = r"/home/idc/Desktop/Main_Project/image_to_examine/image.jpg"
        image = Image.open(image_path)

        # Convert image to base64 string
        image = image.convert("RGB")

        #store image data in memory bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format='JPEG')
        image_data = image_bytes.getvalue()

        # Send the image as input to the chat session
        response = self.chat_session.send_message("please extract all text if it is not in english, translate it to english")
        response = self.chat_session.send_message(image)
        resp = response.text
        _response = resp.replace("*","")
        print(_response)
        read_text(_response)

        #self.chat()
        led.off()

# Create an instance of the AIChatBot class
def start_chat():
    chatbot = STEWARD()
    chatbot.start_chat()
    
def chatmain():
    chatbot = STEWARD()
    chatbot.chat()
    
def translate_language():
    chatbot = STEWARD()
    chatbot.translate_language()
    
def detect_currency():
    chatbot = STEWARD()
    chatbot.detect_currency()
    
def ai_extract_text():
    chatbot = STEWARD()
    chatbot.ai_extract_text()
    
def text_extraction():
    chatbot = STEWARD()
    chatbot.text_extraction()
    
#detect_currency()

