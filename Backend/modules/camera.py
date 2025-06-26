import cv2

class Camera:
    """
    A class to handle camera operations using OpenCV.
    This class provides functionality to capture frames from a camera device.
    """
    def __init__(self, device_index=0):
        """
        Initialize the camera with the specified device index.

        Args:
            device_index (int): Index of the camera device to use (default: 0 for primary camera)
        """
        self.cap = cv2.VideoCapture(device_index)
        
    def read_frame(self):
        """
        Read a single frame from the camera.

        Returns:
            numpy.ndarray or None: The captured frame if successful, None if frame capture failed
        """
        success, frame = self.cap.read()
        if not success:
            print("Ignoring empty camera frame.")
            return None
        return frame
    
    def release(self):
        """
        Release the camera resources and close all OpenCV windows.
        This method should be called when the camera is no longer needed.
        """
        self.cap.release()
        cv2.destroyAllWindows()
        
    def is_opened(self):
        """
        Check if the camera is currently opened and available.

        Returns:
            bool: True if the camera is opened, False otherwise
        """
        return self.cap.isOpened() 