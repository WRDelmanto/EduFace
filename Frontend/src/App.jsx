import './App.css'
import { useEffect } from 'react'
import Welcome from './screens/Welcome'
import socket from './services/socket'

const App = () => {
  useEffect(() => {
    console.log("Connecting to backend...")

    socket.on('connect', () => {
      console.log('Connected to backend');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend');
    });
  }, [])

  return (
    <>
      <Welcome />
    </>
  )
}

export default App;
