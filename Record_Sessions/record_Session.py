import threading
import keyboard
import speech_recognition as sr
from queue import Queue, Empty
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
            except Empty: 
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
