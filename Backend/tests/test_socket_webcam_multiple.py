import sys
import os
import cv2
import socketio
import base64
import time

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Disable oneDNN optimizations
from modules.camera import Camera

# Socket.IO client setup
sio = socketio.Client()

responses = []
frames_to_send = 5  # Number of frames to send

@sio.event
def connect():
    print('Connected to socket server')

@sio.event
def disconnect():
    print('Disconnected from socket server')

@sio.on('frame_received')
def on_frame_received(data):
    print('Server response:', data)
    responses.append(data)

    # Disconnect after all responses received
    if len(responses) >= frames_to_send:
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

        for i in range(frames_to_send):
            frame = camera.read_frame()

            if frame is not None:
                # Encode frame as JPEG
                _, buffer = cv2.imencode('.jpg', frame)
                jpg_bytes = buffer.tobytes()

                # Encode as base64
                jpg_b64 = base64.b64encode(jpg_bytes).decode('utf-8')

                sio.emit('frame', jpg_b64)

                print(f'Sent frame {i+1}')
                time.sleep(0.2)  # Small delay between frames
            else:
                print(f"No frame captured from webcam for frame {i+1}.")

        # Wait for all responses
        sio.wait()
    except Exception as e:
        print(f"Socket test error: {e}")
    finally:
        camera.release()
        cv2.destroyAllWindows()