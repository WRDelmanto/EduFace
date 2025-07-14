import sys
import os
import cv2
import socketio
import base64

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimizations
from modules.camera import Camera

# Socket.IO client setup
sio = socketio.Client()

@sio.event
def connect():
    print('Connected to socket server')

@sio.event
def disconnect():
    print('Disconnected from socket server')

@sio.on('frame_received')
def on_frame_received(data):
    print('Server response:', data)
    sio.disconnect()

@sio.on('pong')
def on_pong(data=None):
    print('Pong received from server')

if __name__ == '__main__':
    camera = Camera()

    if not camera.is_opened():
        print("Failed to open camera")
        sys.exit(1)

    try:
        sio.connect('http://localhost:3000')

        # Read one frame and send to server
        frame = camera.read_frame()

        if frame is not None:
            # Encode frame as JPEG
            _, buffer = cv2.imencode('.jpg', frame)
            jpg_bytes = buffer.tobytes()

            # Encode as base64
            jpg_b64 = base64.b64encode(jpg_bytes).decode('utf-8')
            sio.emit('frame', jpg_b64)

            # Wait for server response
            sio.wait()
        else:
            print("No frame captured from webcam.")
    except Exception as e:
        print(f"Socket test error: {e}")
    finally:
        camera.release()
        cv2.destroyAllWindows() 