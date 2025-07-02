import { io } from 'socket.io-client';

// Singleton class to manage socket.io connection throughout the app
class SocketManager {
    // The URL of the backend socket server
    URL = "http://localhost:3000"

    constructor() {
        // Ensure only one instance of SocketManager exists (Singleton pattern)
        if (!SocketManager.instance) {
            // Initialize the socket connection
            this.socket = io(this.URL);
            SocketManager.instance = this;
        }

        // Return the singleton instance
        return SocketManager.instance;
    }

    // Listen for a specific event from the server
    on(event, callback) {
        this.socket.on(event, callback);
    }

    // Emit an event to the server with optional data
    emit(event, data) {
        this.socket.emit(event, data);
    }

    // Disconnect the socket connection
    disconnect() {
        this.socket.disconnect();
    }
}

// Create a single instance of SocketManager for use throughout the app
const socket = new SocketManager();
Object.freeze(socket); // Prevent re-instantiation

// Export the singleton socket instance
export default socket;
