from socketio import AsyncServer
from modules.face_extractor import FaceExtractor
from modules.deep_face_analyzer import DeepFaceAnalyzer
import base64
import numpy as np
import cv2

# Recursive function to convert numpy types to native Python types
def make_json_serializable(obj):
    if isinstance(obj, dict):
        return {k: make_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(v) for v in obj]
    elif isinstance(obj, np.generic):
        return obj.item()
    else:
        return obj

# Create an instance of AsyncServer
sio = AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Create global instances
face_extractor = FaceExtractor()
deep_face_analyzer = DeepFaceAnalyzer()

# Event handler for client connection
@sio.event
async def connect(sid, environ):
    print(f'Client connected: {sid}')

# Event handler for client disconnection
@sio.event
async def disconnect(sid):
    print(f'Client disconnected: {sid}')

# Event handler for receiving a 'ping' event from the client
@sio.event
async def ping(sid, data):
    print(f'Ping received from {sid}')
    # Respond to the client with a 'pong' event
    await sio.emit('pong', room=sid)

# Event handler for receiving a frame from the client
@sio.event
async def frame(sid, data):
    print(f'Frame received from {sid}: {type(data)}')

    # Step 0: Decode base64 image to numpy array
    try:
        img_bytes = base64.b64decode(data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except Exception as e:
        print(f'Error decoding base64 image: {e}')
        await sio.emit('frame_received', {
            'hasDetectedFace': 'false',
            'error': 'Invalid image data'
        }, room=sid)
        return

    # Step 1: Try to extract the face
    face_img, face_position = face_extractor.extract_face(img)

    if face_img is None:
        # No face detected, return
        await sio.emit('frame_received', {
            'hasDetectedFace': 'false'
            }, room=sid)
        return

    # Step 2: Analyze the face and get all emotions
    emotions_dict = deep_face_analyzer.get_emotions(face_img)

    # Convert all values in emotions_dict to native Python types for JSON serialization
    emotions_dict = make_json_serializable(emotions_dict)

    # Step 3: Return analysis result
    await sio.emit('frame_received', {
        'hasDetectedFace': 'true',
        'emotions': emotions_dict
    }, room=sid)
