import speech_recognition as sr
import pyttsx3

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)

# Initialize the recognizer
recognizer = sr.Recognizer()

def speak(text):
    engine.say(text)
    engine.runAndWait()

def speech_to_text():
    with sr.Microphone() as source:
        speak("...Listening...")  # Prompt the user to speak
        recognizer.adjust_for_ambient_noise(source)  # Adjust for ambient noise
        audio = recognizer.listen(source)  # Listen for audio input

    try:
        speak("...analyzing...")  # Prompt the user that recognition is in progress
        text = recognizer.recognize_google(audio)  # Use Google Speech Recognition to convert audio to text
        return text
    except sr.UnknownValueError:
        speak("...Sorry, I do not understand you")
        speech_to_text()
    except sr.RequestError as e:
        speak("...please make sure you are online")
        return "."
    
def add_avtivity():
    # Get activity and time from user
    speak("...mention activity: ")
    activity = speech_to_text()
    speak("...mention time to be reminded")
    reminder_time = speech_to_text()

    # Write activity and time to files
    with open("_Activity.txt", "a") as activity_file:
        activity_file.write(activity + "\n")

    with open("_Time.txt", "a") as time_file:
        time_file.write(reminder_time + "\n")
    speak("....activities successfully updated")


def delete_activity_by_name(activity_name):
    # Read all activities from the file
    with open("_Activity.txt", "r") as activity_file:
        activities = activity_file.readlines()

    # Find the index of the activity to be deleted
    index = None
    for i, activity in enumerate(activities):
        if activity.strip() == activity_name:
            index = i
            break

    # Check if the activity was found
    if index is not None:
        # Remove the activity from the list
        deleted_activity = activities.pop(index)

        # Write the updated activities list back to the file
        with open("_Activity.txt", "w") as activity_file:
            activity_file.writelines(activities)

        # Read all times from the time file
        with open("_Time.txt", "r") as time_file:
            times = time_file.readlines()

        # Remove the corresponding time from the list
        deleted_time = times.pop(index)

        # Write the updated times list back to the file
        with open("_Time.txt", "w") as time_file:
            time_file.writelines(times)

        txt = f"Deleted activity: {deleted_activity.strip()} and its corresponding time: {deleted_time.strip()}"
        speak(txt)
    else:
        speak("...Activity not found.")


def print_activities_and_times():
    # Read activities from the Activity.txt file
    with open("_Activity.txt", "r") as activity_file:
        activities = activity_file.readlines()

    # Read times from the Time.txt file
    with open("_Time.txt", "r") as time_file:
        times = time_file.readlines()

    # Print activities and corresponding times
    speak("...checking for activities...")
    for activity, time in zip(activities, times):
        if activity.strip() == "":
            speak("...you have no activity")
        else:
            txt = f"...activity... {activity.strip()}  time... {time.strip()}"
            speak(txt)



def reminder_options():
    speak("...Do you want to: add activity , delete activity or view activities")
    choice = speech_to_text()

    if any(keyword in choice.lower() for keyword in ["add activity", "add activities", "add", "update"]):
        add_avtivity()
    elif any(keyword in choice.lower() for keyword in ["delete activity", "delete activities", "remove", "delete"]):
        speak("...Mention the name of activity to delete ")
        activity_name = speech_to_text()
        delete_activity_by_name(activity_name)
    elif any(keyword in choice.lower() for keyword in ["view activity", "view activities", "view", "list", "show"]):
        print_activities_and_times()
    elif any(keyword in choice.lower() for keyword in ["exit", "none", "back", "return home", "quit"]):
        return True
    else:
        reminder_options()
        
 

#reminder_options()

