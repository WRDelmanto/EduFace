# Disable oneDNN optimizations to prevent potential compatibility issues
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import cv2
import threading
from modules.camera import Camera
from modules.face_extractor import FaceExtractor
from modules.deep_face import DeepFaceAnalyzer

# Global shared variables for thread-safe communication
face_extractor = FaceExtractor()  # Handles face detection and extraction
deep_face_analyzer = DeepFaceAnalyzer()  # Analyzes emotions using DeepFace
face_location = None  # Stores current face position
emotion = None  # Stores current detected emotion
lock = threading.Lock()  # Thread synchronization lock

def analyze_face(frame):
    """
    Analyzes a frame to detect faces and emotions.
    This function runs in a separate thread to avoid blocking the main video stream.
    
    Args:
        frame: The video frame to analyze
    """
    global face_location, emotion

    # Extract face from the frame
    face_img, face_position = face_extractor.extract_face(frame)

    if face_img is not None:
        # If face is detected, analyze its emotion
        emotion = deep_face_analyzer.get_emotion(face_img)
        with lock:
            face_location = face_position
            emotion = emotion
    else:
        # Reset values if no face is detected
        with lock:
            face_location = None
            emotion = None

def main():
    """
    Main function that handles video capture, face analysis, and display.
    Uses threading to perform face analysis without blocking the video stream.
    """
    global face_location, emotion
    camera = Camera()
    analysis_thread = None

    while camera.is_opened():
        frame = camera.read_frame()
        if frame is None:
            continue

        # Start background analysis if not running
        if analysis_thread is None or not analysis_thread.is_alive():
            analysis_thread = threading.Thread(target=analyze_face, args=(frame.copy(),))
            analysis_thread.start()

        # Draw face rectangle and emotion on the frame
        with lock:
            if face_location:
                x, y = face_location['x'], face_location['y']
                w, h = face_location['width'], face_location['height']
                red_color = (0, 0, 255)
                # Draw rectangle around detected face
                cv2.rectangle(frame, (x, y), (x + w, y + h), red_color, 1)
                
                # Display detected emotion above the face
                if emotion:
                    cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, red_color, 1)

        # Display the processed frame
        cv2.imshow('Face Analysis', frame)
        # Break loop if 'ESC' key is pressed
        if cv2.waitKey(5) & 0xFF == 27:
            break

    # Clean up resources
    camera.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
