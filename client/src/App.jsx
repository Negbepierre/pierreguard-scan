import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ScanLanding from './components/ScanLanding'

const API_URL = 'https://pierreguard-scan.onrender.com'

function App() {
  const [user, setUser] = useState(null)
  const [scanData, setScanData] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('pierreguard_user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('pierreguard_user')
    setUser(null)
    setScanData(null)
    setError(null)
  }

  const startScan = async () => {
    setScanning(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/api/scan`, {
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

  if (!user) return <Login onLogin={handleLogin} />

  return scanData ? (
    <Dashboard data={scanData} onRescan={resetScan} user={user} />
  ) : (
    <ScanLanding
      onScan={startScan}
      scanning={scanning}
      error={error}
      user={user}
      onLogout={handleLogout}
    />
  )
}

export default App