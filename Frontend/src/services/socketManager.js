import { io } from 'socket.io-client';

class SocketManager {
    URL = "http://localhost:3000"

    constructor() {
        if (!SocketManager.instance) {
            this.socket = io(this.URL);
            SocketManager.instance = this;
        }

        return SocketManager.instance;
    }

    on(event, callback) {
        this.socket.on(event, callback);
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

const socket = new SocketManager();
Object.freeze(socket); // Prevent re-instantiation

export default socket;
