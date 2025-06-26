from fer import FER

class FerAnalyzer:
    """
    A class that provides emotion analysis using the FER library.
    """

    def __init__(self):
        self.detector = FER()

    def get_emotion(self, frame):
        """
        Analyze the emotion from a face image using FER.
        Args:
            frame: Image with a face
        Returns:
            str: Dominant emotion or None
        """
        try:
            emotion, score = self.detector.top_emotion(frame)
            
            return emotion or None
        except Exception as e:
            print(f"FER error: {str(e)}")
            return None
