import sys
import os
import cv2
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimizations
from modules.face_extractor import FaceExtractor
from modules.camera import Camera

camera = Camera()
face_extractor = FaceExtractor()

while camera.is_opened():
    frame = camera.read_frame()

    if frame is None:
        continue

    face_img, face_position = face_extractor.extract_face(frame)

    if face_img is not None:
        print("hasDetectedFace: true")
    else:
        print("hasDetectedFace: false")

    cv2.imshow('Face Detection Test', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()