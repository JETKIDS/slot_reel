import { ReelEditor } from './components/ReelEditor'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Slot Reel Explainer</h1>
        <p>Upload a reel strip, adjust the position, and describe the outcome.</p>
      </header>
      <main>
        <ReelEditor />
      </main>
    </div>
  )
}

export default App
