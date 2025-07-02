from socketio import AsyncServer

# Create an instance of AsyncServer
sio = AsyncServer(async_mode='asgi', cors_allowed_origins='*')

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
