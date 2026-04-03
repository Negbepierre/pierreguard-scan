import { useState } from 'react'

const DEMO_USERS = [
  { email: 'pierre@pierreguard.ai', password: 'pierre2026', name: 'Pierre Inegbenose', role: 'Chief Security Officer', id: 'PG-001' },
  { email: 'analyst@pierreguard.ai', password: 'analyst2026', name: 'Sarah Chen', role: 'Security Analyst', id: 'PG-002' },
  { email: 'auditor@pierreguard.ai', password: 'auditor2026', name: 'James Wright', role: 'IAM Auditor', id: 'PG-003' },
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const user = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (user) {
      localStorage.setItem('pierreguard_user', JSON.stringify(user))
      onLogin(user)
    } else {
      setError('Invalid email or password.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#f0f4f8' }}>

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16"
        style={{ background: '#ffffff', borderRight: '1px solid #e2e8f0' }}>

        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#1e40af' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>
                PierreGuard
              </h1>
              <p className="text-xs" style={{ color: '#64748b' }}>AI Security Platform</p>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-4 leading-tight"
              style={{ color: '#1e293b' }}>
              Intelligent IAM<br />Security Auditing
            </h2>
            <p className="text-base leading-relaxed" style={{ color: '#64748b' }}>
              Powered by AWS Bedrock and LangChain. Scans your entire IAM
              configuration against the PierreGuard Security Standards and
              produces a detailed risk report in seconds.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '⚡', title: 'Real-time scanning', desc: 'Live IAM data pulled directly from AWS' },
              { icon: '🎯', title: 'Standards-based', desc: 'Every finding mapped to PierreGuard Security Standards' },
              { icon: '📋', title: 'Remediation ready', desc: 'AWS CLI commands provided for every issue' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8" style={{ borderTop: '1px solid #e2e8f0' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            PierreGuard AI Security Platform v1.0 — All scans are logged for compliance purposes.
          </p>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#1e40af' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1e293b' }}>PierreGuard</h1>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm"
            style={{ border: '1px solid #e2e8f0' }}>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#1e293b' }}>
                Sign in
              </h2>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Access the PierreGuard Security Dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2"
                  style={{ color: '#374151' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@pierreguard.ai"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2"
                  style={{ color: '#374151' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    color: '#1e293b',
                    outline: 'none'
                  }}
                />
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626'
                  }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: loading ? '#93c5fd' : '#1e40af',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: '#1e40af' }}>
                Demo credentials
              </p>
              <div className="space-y-1">
                <p className="text-xs" style={{ color: '#64748b' }}>
                  pierre@pierreguard.ai / pierre2026
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  analyst@pierreguard.ai / analyst2026
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  auditor@pierreguard.ai / auditor2026
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login