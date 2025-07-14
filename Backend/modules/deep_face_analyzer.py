from deepface import DeepFace

# https://github.com/serengil/deepface

class DeepFaceAnalyzer:
    """
    A class that provides emotion analysis functionality using the DeepFace library.
    This class serves as a wrapper around DeepFace's emotion analysis capabilities.
    """
    
    def get_emotion(self, frame):
        """
        Analyzes the emotion in a given frame using DeepFace.
        Returns the dominant emotion as a string (legacy method).
        """
        try:
            emotions = DeepFace.analyze(
                frame,
                actions=['emotion'],
                enforce_detection=False,
                silent=True
            )
            return emotions[0]['dominant_emotion']
        except Exception as e:
            print(f"Error in get_emotion: {str(e)}")
            return None

    def get_emotions(self, frame):
        """
        Analyzes the emotion in a given frame using DeepFace.
        Returns a dictionary of all emotions and their scores, or None if analysis fails.
        """
        try:
            emotions = DeepFace.analyze(
                frame,
                actions=['emotion'],
                enforce_detection=False,
                silent=True
            )
            return emotions[0]['emotion']
        except Exception as e:
            print(f"Error in get_emotions_dict: {str(e)}")
            return None