import cv2
import mediapipe as mp
from modules.media_pipe import MediaPipe
from modules.camera import Camera

# Initialize MediaPipe Face Mesh and Drawing utilities
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

# Define the drawing specifications (e.g., landmark thickness and circle radius)
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)

def main():
    """
    Main function to run the face detection application.
    This function initializes the camera and face detector, then processes video frames
    in real-time to detect and display face mesh.
    """
    # Initialize camera and face detector
    camera = Camera()
    face_detector = MediaPipe()

    # Main loop for processing video frames
    while camera.is_opened():
        # Read frame from camera
        frame = camera.read_frame()
        if frame is None:
            continue

        # Process frame with face detector
        # Returns the processed frame with face mesh drawn and a boolean indicating if a face was detected
        processed_frame, face_detected = face_detector.process_frame(frame)

        # Display the output frame with face mesh overlay
        cv2.imshow('MediaPipe Face Mesh', processed_frame)

        # Exit loop when the ESC key is pressed (key code 27)
        if cv2.waitKey(5) & 0xFF == 27:
            break

    # Clean up resources
    camera.release()

if __name__ == "__main__":
    main()
