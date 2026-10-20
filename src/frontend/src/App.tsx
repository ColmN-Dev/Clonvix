import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Connecting to backend...')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/status/')
      .then(response => {
        if (!response.ok) throw new Error('Request failed')
        return response.json()
      })
      .then(data => setMessage(data.message))
      .catch(() => setMessage('Could not connect to backend'))
  }, [])

  return (
    <main>
      <h1>Clonvix</h1>
      <p>{message}</p>
    </main>
  )
}

export default App