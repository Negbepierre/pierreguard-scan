import { useState } from 'react'
import Dashboard from './components/Dashboard'
import ScanLanding from './components/ScanLanding'

function App() {
  const [scanData, setScanData] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  const startScan = async () => {
    setScanning(true)
    setError(null)
    try {
      const response = await fetch('http://127.0.0.1:5001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Scan failed')
      setScanData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const resetScan = () => {
    setScanData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!scanData ? (
        <ScanLanding
          onScan={startScan}
          scanning={scanning}
          error={error}
        />
      ) : (
        <Dashboard
          data={scanData}
          onRescan={resetScan}
        />
      )}
    </div>
  )
}

export default App