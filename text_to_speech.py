import pyttsx3

# Initialize the TTS engine
engine = pyttsx3.init()

# Set properties (optional)
engine.setProperty('rate', 150)  # Speed of speech

# Text to be spoken
text = "Hello, welcome to Raspberry Pi text-to-speech."

# Speak the text
engine.say(text)

# Wait for speech to finish
engine.runAndWait()
