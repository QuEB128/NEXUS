# # Install required libraries first:
# # pip install SpeechRecognition pyaudio

# import speech_recognition as sr

# def speech_to_text():
#     # Initialize recognizer
#     recognizer = sr.Recognizer()
    
#     # Capture audio from microphone
#     with sr.Microphone() as source:
#         print("Listening... (Speak now)")
        
#         # Adjust for ambient noise and set timeout
#         recognizer.adjust_for_ambient_noise(source, duration=0.5)
        
#         try:
#             # Listen for up to 5 seconds of audio
#             audio_data = recognizer.listen(source, timeout=10)
#             print("Processing...")
            
#             # Use Google Web Speech API for recognition
#             text = recognizer.recognize_google(audio_data)
#             return text
        
#         except sr.WaitTimeoutError:
#             return "No speech detected. Timeout."
#         except sr.UnknownValueError:
#             return "Could not understand audio."
#         except sr.RequestError as e:
#             return f"API request failed: {e}"

# if __name__ == "__main__":
#     result = speech_to_text()
#     print("Result:", result)



# import threading
# import keyboard
# import speech_recognition as sr
# from queue import Queue
# import time

# def speech_to_text_continuous():
#     # Create a thread-safe queue for audio data
#     audio_queue = Queue()
#     stop_event = threading.Event()
    
#     # Initialize recognizer
#     recognizer = sr.Recognizer()
    
#     def record_audio():
#         """Background thread to capture audio continuously"""
#         with sr.Microphone() as source:
#             recognizer.adjust_for_ambient_noise(source)
#             print("Recording... Press ESC to stop")
            
#             while not stop_event.is_set():
#                 try:
#                     # Capture small audio chunks continuously
#                     audio = recognizer.listen(source, phrase_time_limit=0.5)
#                     audio_queue.put(audio)
#                 except sr.WaitTimeoutError:
#                     # Timeout is normal between speech segments
#                     pass
    
#     # Start recording thread
#     record_thread = threading.Thread(target=record_audio, daemon=True)
#     record_thread.start()
    
#     # Wait for ESC key press
#     keyboard.wait('esc')
#     stop_event.set()
#     print("\nStopping recording... Processing audio")
    
#     # Combine all audio chunks
#     full_audio = b''
#     sample_rate = None
#     sample_width = None
    
#     while not audio_queue.empty():
#         audio = audio_queue.get()
#         full_audio += audio.get_raw_data()
#         if sample_rate is None:
#             sample_rate = audio.sample_rate
#             sample_width = audio.sample_width
    
#     # Create AudioData object from combined audio
#     if sample_rate:
#         audio_data = sr.AudioData(full_audio, sample_rate, sample_width)
#         try:
#             text = recognizer.recognize_google(audio_data)
#             return text
#         except sr.UnknownValueError:
#             return "Could not understand audio"
#         except sr.RequestError as e:
#             return f"API error: {e}"
#     else:
#         return "No audio recorded"

# if __name__ == "__main__":
#     result = speech_to_text_continuous()
#     print("\nTranscription Result:")
#     print(result)


# import threading
# import keyboard
# import speech_recognition as sr
# from queue import Queue
# import time

# def speech_to_text_continuous():
#     # Create a thread-safe queue for audio data
#     audio_queue = Queue()
#     stop_event = threading.Event()
    
#     # Initialize recognizer
#     recognizer = sr.Recognizer()
    
#     def record_audio():
#         """Background thread to capture audio continuously"""
#         with sr.Microphone() as source:
#             recognizer.adjust_for_ambient_noise(source)
#             print("Recording... Press ESC to stop")
            
#             while not stop_event.is_set():
#                 try:
#                     # Capture small audio chunks continuously
#                     audio = recognizer.listen(source, phrase_time_limit= 2)
#                     audio_queue.put(audio)
#                 except sr.WaitTimeoutError:
#                     # Timeout is normal between speech segments
#                     pass
    
#     # Start recording thread
#     record_thread = threading.Thread(target=record_audio, daemon=True)
#     record_thread.start()
    
#     # Wait for ESC key press
#     keyboard.wait('esc')
#     stop_event.set()
#     print("\nStopping recording... Processing audio")
    
#     # Combine all audio chunks
#     full_audio = b''
#     sample_rate = None
#     sample_width = None

    
#     while not audio_queue.empty():
#         audio = audio_queue.get()
#         full_audio += audio.get_raw_data()
#         if sample_rate is None:
#             sample_rate = audio.sample_rate
#             sample_width = audio.sample_width
    
#     # Create AudioData object from combined audio
#     if sample_rate:
#         audio_data = sr.AudioData(full_audio, sample_rate, sample_width)
#         try:
#             text = recognizer.recognize_google(audio_data)
#             return text
#         except sr.UnknownValueError:
#             return "Could not understand audio"
#         except sr.RequestError as e:
#             return f"API error: {e}"
#     else:
#         return "No audio recorded"

# if __name__ == "__main__":
#     result = speech_to_text_continuous()
#     print("\nTranscription Result:")
#     print(result)



import threading
import keyboard
import speech_recognition as sr
from queue import Queue, Empty  # FIX: Import Empty from queue
import time

def speech_to_text_continuous():
    audio_queue = Queue()
    stop_event = threading.Event()
    recognizer = sr.Recognizer()
    combined_text = []  # Store text from each chunk

    def record_audio():
        with sr.Microphone() as source:
            recognizer.adjust_for_ambient_noise(source)
            print("Recording... Press ESC to stop")
            
            while not stop_event.is_set():
                try:
                    audio = recognizer.listen(source, timeout=0.1, phrase_time_limit=10)
                    audio_queue.put(audio)
                except sr.WaitTimeoutError:
                    # Handle timeout between audio chunks
                    continue
                except Exception as e:
                    print(f"Recording error: {e}")
                    break

    def process_audio():
        while not stop_event.is_set() or not audio_queue.empty():
            try:
                audio = audio_queue.get(timeout=1)
                text = recognizer.recognize_google(audio)
                combined_text.append(text)
                print(f"Partial: {text}")
            except Empty:  # FIX: Use directly imported Empty
                continue
            except sr.UnknownValueError:
                pass  # Skip unrecognized audio
            except sr.RequestError as e:
                print(f"API error: {e}")

    # Start recording and processing threads
    record_thread = threading.Thread(target=record_audio, daemon=True)
    process_thread = threading.Thread(target=process_audio, daemon=True)
    
    record_thread.start()
    process_thread.start()
    
    keyboard.wait('esc')
    stop_event.set()
    print("\nStopping...")
    
    # Wait for threads to finish
    record_thread.join(timeout=2.0)
    process_thread.join(timeout=2.0)
    
    return " ".join(combined_text)

if __name__ == "__main__":
    result = speech_to_text_continuous()
    print("\nFinal Transcription:")
    print(result)