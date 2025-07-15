import { io, Socket } from 'socket.io-client';

// Singleton class to manage socket.io connection throughout the app
class SocketManager {
    private static instance: SocketManager;
    private socket!: Socket;
    private URL = "http://localhost:3000";
  connected: any;

    constructor() {
        // Ensure only one instance of SocketManager exists (Singleton pattern)
        if (!SocketManager.instance) {
            // Initialize the socket connection
            this.socket = io(this.URL);
            this.setupConnectionHandlers();
            SocketManager.instance = this;
        }

        // Return the singleton instance
        return SocketManager.instance;
    }

    private setupConnectionHandlers(): void {
        this.socket.on('connect', () => {
            console.log('Connected to server with ID:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('Connection error:', error);
        });
    }

    // Listen for a specific event from the server
    on(event: string, callback: (...args: any[]) => void): void {
        this.socket.on(event, callback);
    }

    // Emit an event to the server with optional data
    emit(event: string, data?: any): void {
        this.socket.emit(event, data);
    }

    // Disconnect the socket connection
    disconnect(): void {
        this.socket.disconnect();
    }

    // Get connection status
    isConnected(): boolean {
        return this.socket.connected;
    }

    // Get the raw socket instance (this is what your WebcamBox is calling)
    getSocket(): Socket {
        return this.socket;
    }

    // Alternative: you can also keep the getter version
    get rawSocket(): Socket {
        return this.socket;
    }
}

// Create a single instance of SocketManager for use throughout the app
const socket = new SocketManager();
Object.freeze(socket); // Prevent re-instantiation

// Export the singleton socket instance
export default socket;
