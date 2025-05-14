from deepface import DeepFace

class DeepFaceAnalyzer:
    """
    A class that provides emotion analysis functionality using the DeepFace library.
    This class serves as a wrapper around DeepFace's emotion analysis capabilities.
    """
    
    def get_emotion(self, frame):
        """
        Analyzes the emotion in a given frame using DeepFace.
        
        Args:
            frame: The image frame containing a face to analyze
            
        Returns:
            str: The dominant emotion detected in the frame, or None if analysis fails
        """
        try:
            # Analyze the frame for emotions using DeepFace
            emotions = DeepFace.analyze(
                frame,
                actions = ['emotion'],  # Only analyze emotions, not other attributes
                enforce_detection=False,  # Don't enforce face detection to avoid errors
                silent=True  # Suppress DeepFace's internal logging
            )

            # Return the dominant emotion from the analysis
            return emotions[0]['dominant_emotion']
        except Exception as e:
            print(f"Error in get_emotion: {str(e)}")
            return None