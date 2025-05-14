import cv2

class FaceExtractor:
    def __init__(self):
        """
        Initialize the face extractor with OpenCV's face detection cascade.
        """
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def extract_face(self, frame):
        """
        Extract face from the frame and resize it to 128x128 pixels.
        
        Args:
            frame: Input frame from camera
            
        Returns:
            tuple: (extracted_face, face_location) where:
                - extracted_face: The face image resized to 128x128 pixels (None if no face detected)
                - face_location: Dictionary with face coordinates (None if no face detected)
        """
        # Convert frame to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        # If no faces detected, return None
        if len(faces) == 0:
            return None, None
            
        # Get the first face (assuming we want the most prominent face)
        x, y, w, h = faces[0]
        
        # Extract face ROI
        face_img = frame[y:y+h, x:x+w]
        
        # Create face location dictionary
        face_location = {
            'x': int(x),
            'y': int(y),
            'width': int(w),
            'height': int(h)
        }
        
        return face_img, face_location 