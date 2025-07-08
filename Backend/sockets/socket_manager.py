import socketio
import base64, cv2, numpy as np
from deepface import DeepFace

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

@sio.event
async def connect(sid, environ):
    print(f"✅ Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Client disconnected: {sid}")

# Rule-based mapping from emotion scores to learning state
def map_scores_to_learning_state(scores):
    happy = scores.get("happy", 0)
    sad = scores.get("sad", 0)
    neutral = scores.get("neutral", 0)
    angry = scores.get("angry", 0)
    disgust = scores.get("disgust", 0)
    fear = scores.get("fear", 0)
    surprise = scores.get("surprise", 0)

    if happy > 60:
        return "engaged"
    elif sad + neutral > 70 and happy < 10:
        return "disengaged"
    elif angry + disgust + fear > 50:
        return "frustrated"
    elif surprise > 60 and neutral < 20:
        return "confused"
    else:
        return "uncertain"

@sio.event
async def frame(sid, data):
    try:
        b64 = data.get('image')
        if not b64:
            return {'error': 'No image received'}

        header, encoded = b64.split(',', 1)
        img = cv2.imdecode(np.frombuffer(base64.b64decode(encoded), np.uint8),
                           cv2.IMREAD_COLOR)

        result = DeepFace.analyze(
            img, actions=['emotion'],
            enforce_detection=False, silent=True
        )

        dom = result[0]['dominant_emotion']
        scores = result[0]['emotion']
        learning_state = map_scores_to_learning_state(scores)

        print(f"🧠 Detected: {dom} → Learning state: {learning_state}")

        return {
            'emotion': dom,
            'scores': scores,
            'learning_state': learning_state
        }

    except Exception as e:
        print("⚠️ DeepFace error:", e)
        return {'error': str(e)}