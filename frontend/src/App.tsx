import { useState } from 'react'
import { Button } from '@astryxdesign/core/Button'
import './App.css'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Social Media Content Analysis System</h1>
      <p>Frontend environment initialized with React 19 and Meta's Astryx Design System.</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button
          label={`Astryx Button Clicked: ${count}`}
          variant="primary"
          onClick={() => setCount((prev) => prev + 1)}
        />
      </div>
    </main>
  )
}
