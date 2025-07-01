import './App.css'
import { useEffect } from 'react'
import Welcome from './screens/Welcome'
import socket from './services/socketManager'

const App = () => {
  useEffect(() => {
    console.log("Conneting to backend...")

    socket.on('pong', () => {
      console.log('pong received');
    });

    socket.emit('ping');
  }, [])

  return (
    <>
      <Welcome />
    </>
  )
}

export default App;
