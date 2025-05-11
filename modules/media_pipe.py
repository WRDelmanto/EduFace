import cv2
import mediapipe as mp

class MediaPipe:
    """
    A class to handle face detection and mesh visualization using MediaPipe Face Mesh.
    This class provides functionality to detect facial landmarks and draw them on video frames.
    """
    def __init__(self, 
                 static_image_mode=False,
                 max_num_faces=1,
                 refine_landmarks=True,
                 min_detection_confidence=0.5,
                 min_tracking_confidence=0.5):
        """
        Initialize the FaceDetector with MediaPipe Face Mesh.

        Args:
            static_image_mode (bool): If True, treats input as a single image rather than a video stream
            max_num_faces (int): Maximum number of faces to detect
            refine_landmarks (bool): Whether to refine landmarks around eyes and lips
            min_detection_confidence (float): Minimum confidence threshold for face detection
            min_tracking_confidence (float): Minimum confidence threshold for face tracking
        """
        # Initialize MediaPipe Face Mesh and drawing utilities
        self.mp_face_mesh = mp.solutions.face_mesh
        self.mp_drawing = mp.solutions.drawing_utils
        
        # Configure drawing specifications for landmarks and connections
        self.drawing_spec = self.mp_drawing.DrawingSpec(thickness=1, circle_radius=1)
        
        # Initialize the Face Mesh model with specified parameters
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=static_image_mode,
            max_num_faces=max_num_faces,
            refine_landmarks=refine_landmarks,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

    def process_frame(self, frame):
        """
        Process a single frame to detect and draw face mesh.

        Args:
            frame (numpy.ndarray): Input frame in BGR format

        Returns:
            tuple: (processed_frame, face_detected)
                - processed_frame: Frame with face mesh drawn (if detected)
                - face_detected: Boolean indicating if a face was detected
        """
        # Convert the BGR image to RGB (MediaPipe uses RGB)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        rgb_frame.flags.writeable = False  # Improve performance by marking frame as read-only

        # Perform face mesh detection
        results = self.face_mesh.process(rgb_frame)

        # Set the frame back to writeable and convert it back to BGR for OpenCV display
        rgb_frame.flags.writeable = True
        frame = cv2.cvtColor(rgb_frame, cv2.COLOR_RGB2BGR)

        # Draw face mesh if landmarks are detected
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                # Draw the face mesh using MediaPipe's drawing utilities
                self.mp_drawing.draw_landmarks(
                    image=frame,
                    landmark_list=face_landmarks,
                    connections=self.mp_face_mesh.FACEMESH_TESSELATION,  # Use triangular mesh connections
                    landmark_drawing_spec=self.drawing_spec,              # Style for individual landmarks
                    connection_drawing_spec=self.drawing_spec             # Style for connecting lines
                )

        return frame, results.multi_face_landmarks is not None 