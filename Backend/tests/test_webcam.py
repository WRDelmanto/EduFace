import sys
import os
import cv2
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimizations
from modules.camera import Camera


camera = Camera()
if not camera.is_opened():
    print("Failed to open camera")
    sys.exit(1)

while camera.is_opened():
    frame = camera.read_frame()

    if frame is None:
        continue

    cv2.imshow('Webcam Test', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()