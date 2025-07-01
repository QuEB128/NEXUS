import os
import cv2
import time

# Create a directory if it doesn't exist
directory = 'ImgExtractObj'
if not os.path.exists(directory):
    os.makedirs(directory)

def delete_existing_files():
    # Delete all existing files in the directory
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        os.remove(file_path)

def main():
    print("Press Enter to take a picture. Press Ctrl+C to exit.")
    try:
        # Initialize the webcam
        cap = cv2.VideoCapture(0)
        
        # Check if the webcam is opened correctly
        if not cap.isOpened():
            print("Error: Unable to open webcam.")
            return
        
        while True:
            # Read a frame from the webcam
            ret, frame = cap.read()
            
            # Display the frame
            cv2.imshow('Webcam Feed', frame)
            
            # Check for user input
            key = cv2.waitKey(1)
            if key == 13:  # Enter key pressed
                delete_existing_files()  # Delete existing files in the directory
                
                # Generate a filename with current timestamp
                filename = os.path.join(directory, 'image.jpg')
                
                # Save the captured frame as an image
                cv2.imwrite(filename, frame)
                
                print(f'Image saved as: {filename}')
            elif key == 27:  # ESC key pressed
                break
        
        # Release the webcam
        cap.release()
        cv2.destroyAllWindows()
        
    except KeyboardInterrupt:
        print("\nExiting...")
        pass

if __name__ == "__main__":
    main()
