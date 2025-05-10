import cv2
import mediapipe as mp

# Initialize MediaPipe Face Mesh and Drawing utilities
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils

# Define the drawing specifications (e.g., landmark thickness and circle radius)
drawing_spec = mp_drawing.DrawingSpec(thickness=1, circle_radius=1)

# Start video capture from the default webcam (device index 0)
cap = cv2.VideoCapture(0)

# Initialize the FaceMesh model with real-time settings
with mp_face_mesh.FaceMesh(
    static_image_mode=False,       # Use continuous input for video stream
    max_num_faces=1,               # Detect only one face
    refine_landmarks=True,         # Refine landmarks (e.g., around eyes and lips)
    min_detection_confidence=0.5,  # Minimum confidence threshold for detection
    min_tracking_confidence=0.5    # Minimum confidence threshold for tracking
) as face_mesh:

    # Process frames continuously from the webcam
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Ignoring empty camera frame.")
            continue

        # Convert the BGR image to RGB (MediaPipe uses RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb_frame.flags.writeable = False  # Improve performance by marking the frame as read-only

        # Perform face mesh detection
        results = face_mesh.process(rgb_frame)

        # Set the frame back to writeable and convert it back to BGR for OpenCV display
        rgb_frame.flags.writeable = True
        frame = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2BGR)

        # If face landmarks are detected, iterate through each face (in this case, only one)
        # and draw the mesh (landmarks and connections) on the frame using the tessellation style
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=mp_face_mesh.FACEMESH_TESSELATION,  # Predefined mesh connections (triangular tessellation)
                    landmark_drawing_spec=drawing_spec,              # Style for individual landmarks
                    connection_drawing_spec=drawing_spec             # Style for connecting lines
                )

        # Display the output frame with face mesh overlay
        cv2.imshow('MediaPipe Face Mesh', frame)

        # Exit loop when the ESC key is pressed
        if cv2.waitKey(5) & 0xFF == 27:
            break

# Release webcam and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
