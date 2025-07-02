import { useEffect } from 'react';
import socket from '../services/socket';

const Welcome = () => {
    useEffect(() => {
        socket.on('pong', () => { console.log('pong received') });
    }, []);

    return (
        <>
            <button
                onClick={() => {
                    socket.emit('ping');
                }}
            >Ping
            </button>
        </>
    )
}

export default Welcome;
