import base64
import os
import pyttsx3
from google import genai
from google.genai import types


def read_text(text):
    """Reads the given text using a text-to-speech engine."""
    engine = pyttsx3.init()

    # Get available voices
    voices = engine.getProperty('voices')

    # Try to find a female voice, else default to the first available voice
    female_voice = None
    for voice in voices:
        if "female" in voice.name.lower() or "Zira" in voice.name or "Samantha" in voice.name:
            female_voice = voice.id
            break

    if female_voice:
        engine.setProperty('voice', female_voice)
    else:
        engine.setProperty('voice', voices[0].id)  # Default to first voice if no female voice is found

    engine.setProperty('rate', 150)  # Set speech rate
    engine.say(text)
    engine.runAndWait()

medical_prompt = """
    you are an AI assistive robot that processes unorganized transcribed consultation sessions.
    your task is to:    
    1. create present the conversation in a dialogue form
        eg: 
        doctor: how are you doing today?
        [patient name]: I am having a headache
        ...
    
    2. Generate a report which would contain the diaogue form of the consultation record without leaving out a word.
    (the report should include the date, time, doctor and patient name)

    3. acter representing the conversation in a dialogue, analyze the transcribed consultaion and patient's 
    complaints, together with the patien's medica record and vital signs. and then generate some possible diagnosis,
    test's to be conducted to confirm the diagnosis, their inferences and finally suggest some type of medications 
    and treatment plans with reasons.
    
"""


def generate(user_input, chat_history):
    client = genai.Client(
        api_key=("AIzaSyC8ZXhnkI7iJJpYLMKm2zaEtMuuQqOEkXQ"), 
    )

    model = "gemini-2.0-flash"

    contents = []
    contents.append(types.Content(role="user",parts=[types.Part.from_text(text= medical_prompt)]))

    for message in chat_history:
        contents.append(types.Content(role=message["role"], parts=[types.Part.from_text(text=message["text"])]))

    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_input)]))

    tools = [
        types.Tool(google_search=types.GoogleSearch())
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        tools=tools,
        response_mime_type="text/plain",
    )

    response = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")
        response += chunk.text

    return response

chat_history = []

while True:
    text = input(">> ")
    response = generate(text, chat_history)
    #read_text(response)
    #print(response)

    chat_history.append({"role": "user", "text": text})
    chat_history.append({"role": "model", "text": response})