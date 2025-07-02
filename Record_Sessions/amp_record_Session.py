# import threading
# import keyboard
# import speech_recognition as sr
# from queue import Queue, Empty
# import time
# import numpy as np
# from scipy.signal import butter, lfilter
# import sounddevice as sd

# class AudioProcessor:
#     def __init__(self, gain=3.0, samplerate=44100):
#         self.gain = gain
#         self.samplerate = samplerate
        
#     # Bandpass filter for speech frequencies (300 Hz – 3400 Hz)
#     def butter_bandpass(self, lowcut=300, highcut=3400, order=6):
#         nyq = 0.5 * self.samplerate
#         low = lowcut / nyq
#         high = highcut / nyq
#         return butter(order, [low, high], btype='band')

#     def apply_bandpass_filter(self, data, lowcut=300, highcut=3400):
#         b, a = self.butter_bandpass(lowcut, highcut)
#         return lfilter(b, a, data)

#     def amplify_audio(self, audio_data):
#         # Convert AudioData to numpy array
#         audio_np = np.frombuffer(audio_data.get_raw_data(), dtype=np.int16)
#         audio_np = audio_np.astype(np.float32) / 32768.0  # Normalize to [-1, 1]
        
#         # Apply processing
#         filtered = self.apply_bandpass_filter(audio_np)
#         amplified = filtered * self.gain
#         amplified = np.clip(amplified, -1.0, 1.0)
        
#         # Convert back to bytes
#         amplified_bytes = (amplified * 32768.0).astype(np.int16).tobytes()
#         return sr.AudioData(amplified_bytes, audio_data.sample_rate, audio_data.sample_width)

# def speech_to_text_continuous():
#     audio_queue = Queue()
#     stop_event = threading.Event()
#     recognizer = sr.Recognizer()
#     audio_processor = AudioProcessor(gain=3.0)  # Increased gain for distant speakers
#     combined_text = []  # Store text from each chunk

#     def record_audio():
#         with sr.Microphone() as source:
#             recognizer.adjust_for_ambient_noise(source, duration=1)
#             print("Recording... Press ESC to stop")
            
#             while not stop_event.is_set():
#                 try:
#                     audio = recognizer.listen(source, timeout=0.1, phrase_time_limit=10)
#                     # Process audio with amplification
#                     processed_audio = audio_processor.amplify_audio(audio)
#                     audio_queue.put(processed_audio)
#                 except sr.WaitTimeoutError:
#                     # Handle timeout between audio chunks
#                     continue
#                 except Exception as e:
#                     print(f"Recording error: {e}")
#                     break

#     def process_audio():
#         while not stop_event.is_set() or not audio_queue.empty():
#             try:
#                 audio = audio_queue.get(timeout=1)
#                 text = recognizer.recognize_google(audio)
#                 combined_text.append(text)
#                 print(f"Partial: {text}")
#             except Empty:
#                 continue
#             except sr.UnknownValueError:
#                 pass  # Skip unrecognized audio
#             except sr.RequestError as e:
#                 print(f"API error: {e}")

#     # Start recording and processing threads
#     record_thread = threading.Thread(target=record_audio, daemon=True)
#     process_thread = threading.Thread(target=process_audio, daemon=True)
    
#     record_thread.start()
#     process_thread.start()
    
#     keyboard.wait('esc')
#     stop_event.set()
#     print("\nStopping...")
    
#     # Wait for threads to finish
#     record_thread.join(timeout=2.0)
#     process_thread.join(timeout=2.0)
    
#     return " ".join(combined_text)

# if __name__ == "__main__":
#     result = speech_to_text_continuous()
#     print("\nFinal Transcription:")
#     print(result)


import threading
import keyboard
import speech_recognition as sr
from queue import Queue, Empty
import numpy as np
from scipy.signal import butter, lfilter, sosfilt
import sounddevice as sd

class EnhancedAudioProcessor:
    def __init__(self, initial_gain=5.0, max_gain=10.0, samplerate=44100):
        self.initial_gain = initial_gain
        self.max_gain = max_gain
        self.samplerate = samplerate
        self.current_gain = initial_gain
        
    def butter_bandpass(self, lowcut=200, highcut=4000, order=5):
        nyq = 0.5 * self.samplerate
        low = lowcut / nyq
        high = highcut / nyq
        sos = butter(order, [low, high], btype='band', output='sos')
        return sos

    def apply_compression(self, audio_np, threshold=0.1, ratio=4):
        """Simple dynamic range compressor"""
        peaks = np.abs(audio_np)
        over_threshold = peaks > threshold
        compressed = np.where(over_threshold, 
                            threshold + (peaks - threshold)/ratio, 
                            peaks)
        return np.sign(audio_np) * compressed

    def automatic_gain_control(self, audio_np, target_level=0.3):
        """Automatically adjust gain based on signal level"""
        rms = np.sqrt(np.mean(audio_np**2))
        if rms > 0:
            desired_gain = min(target_level / rms, self.max_gain)
            self.current_gain = 0.9 * self.current_gain + 0.1 * desired_gain
        return audio_np * self.current_gain

    def process_audio(self, audio_data):
        # Convert AudioData to numpy array
        audio_np = np.frombuffer(audio_data.get_raw_data(), dtype=np.int16)
        audio_np = audio_np.astype(np.float32) / 32768.0  # Normalize to [-1, 1]
        
        # Apply processing chain
        sos = self.butter_bandpass()
        filtered = sosfilt(sos, audio_np)
        
        # Dynamic processing
        compressed = self.apply_compression(filtered)
        amplified = self.automatic_gain_control(compressed)
        
        # Final limiting to prevent clipping
        processed = np.clip(amplified, -0.99, 0.99)
        
        # Convert back to bytes
        amplified_bytes = (processed * 32768.0).astype(np.int16).tobytes()
        return sr.AudioData(amplified_bytes, audio_data.sample_rate, audio_data.sample_width)

def speech_to_text_continuous():
    audio_queue = Queue()
    stop_event = threading.Event()
    recognizer = sr.Recognizer()
    audio_processor = EnhancedAudioProcessor(initial_gain=6.0, max_gain=15.0)
    combined_text = []

    def record_audio():
        with sr.Microphone(sample_rate=44100) as source:
            recognizer.adjust_for_ambient_noise(source, duration=2)
            print("Recording... Press ESC to stop")
            
            while not stop_event.is_set():
                try:
                    audio = recognizer.listen(source, timeout=0.1, phrase_time_limit=15)
                    processed_audio = audio_processor.process_audio(audio)
                    audio_queue.put(processed_audio)
                except sr.WaitTimeoutError:
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
                print("[Could not understand audio]")
            except sr.RequestError as e:
                print(f"API error: {e}")

    record_thread = threading.Thread(target=record_audio, daemon=True)
    process_thread = threading.Thread(target=process_audio, daemon=True)
    
    record_thread.start()
    process_thread.start()
    
    keyboard.wait('esc')
    stop_event.set()
    print("\nStopping...")
    
    record_thread.join(timeout=2.0)
    process_thread.join(timeout=2.0)
    
    return " ".join(combined_text)

if __name__ == "__main__":
    print("Enhanced Speech-to-Text with Strong Amplification")
    print("Initial gain: 6.0, Max gain: 15.0")
    result = speech_to_text_continuous()
    print("\nFinal Transcription:")
    print(result)