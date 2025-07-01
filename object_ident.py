import cv2
import pyttsx3

# Initialize the TTS engine
engine = pyttsx3.init()
engine.setProperty('rate', 170)

def speak(text):
    engine.say(text)
    engine.runAndWait()


#thres = 0.45 # Threshold to detect object

classNames = []
classFile = "/home/idc/Desktop/Main_Project/Detections/Object_Detection_Files/coco.names"
with open(classFile,"rt") as f:
    classNames = f.read().rstrip("\n").split("\n")

configPath = "/home/idc/Desktop/Main_Project/Detections/Object_Detection_Files/ssd_mobilenet_v3_large_coco_2020_01_14.pbtxt"
weightsPath = "/home/idc/Desktop/Main_Project/Detections/Object_Detection_Files/frozen_inference_graph.pb"

net = cv2.dnn_DetectionModel(weightsPath,configPath)
net.setInputSize(320,320)
net.setInputScale(1.0/ 127.5)
net.setInputMean((127.5, 127.5, 127.5))
net.setInputSwapRB(True)


def getObjects(img, thres, nms, draw=True, objects=[], exclude_objects=[]):
    classIds, confs, bbox = net.detect(img,confThreshold=thres,nmsThreshold=nms)
    #print(classIds,bbox)
    if len(objects) == 0: objects = classNames
    objectInfo =[]
    if len(classIds) != 0:
        for classId, confidence,box in zip(classIds.flatten(),confs.flatten(),bbox):
            className = classNames[classId - 1]
            if className in objects and className not in exclude_objects:
                objectInfo.append([box,className])
                if (draw):
                    cv2.rectangle(img,box,color=(0,255,0),thickness=2)
                    cv2.putText(img,classNames[classId-1].upper(),(box[0]+10,box[1]+30),
                    cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)
                    cv2.putText(img,str(round(confidence*100,2)),(box[0]+200,box[1]+30),
                    cv2.FONT_HERSHEY_COMPLEX,1,(0,255,0),2)

    return img,objectInfo



def main():
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)
    cap.set(10, 70)
    
    exclude_objects = []
    while True:
        speak("Would you like to exclude Objects?")
        choice = input("(yes/no): ").lower()
        if choice == "yes":
            speak("mention objects to exclude")
            exclude_objects_input = input(" (comma-separated): ")
            exclude_objects = [obj.strip() for obj in exclude_objects_input.split(",")]
            break  
        elif choice == "no":
            speak("Turning on camera")
            break  
        else:
            speak("Sorry, I didn't understand you.")

    while True:
        success, img = cap.read()
        if not success:
            speak("Failed to read from camera")
            break

        result, objectInfo = getObjects(img, 0.45, 0.2, objects=[], exclude_objects=exclude_objects)
        if objectInfo:
            for info in objectInfo:
                print("Detected:", info[1])  # Print the name of the detected object
        cv2.imshow("Output", img)
        # Check for 'Esc' key press
        key = cv2.waitKey(1)
        if key == 27:  # 'Esc' key
            break

    cap.release()
    cv2.destroyAllWindows()

#main()

