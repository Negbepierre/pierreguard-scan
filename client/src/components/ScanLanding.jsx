function ScanLanding({ onScan, scanning, error, user, onLogout }) {
    const accountInfo = {
      accountId: '964308144601',
      accountName: 'PierreGuard Technologies',
      region: 'us-east-1',
      iamUser: 'pierreguard-scan-dev',
      status: 'Connected',
      environment: 'Production',
      lastScan: 'Never'
    }
  
    return (
      <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
  
        {/* Header */}
        <header className="bg-white border-b" style={{ borderColor: '#e2e8f0' }}>
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#1e40af' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <span className="font-bold text-sm" style={{ color: '#1e293b' }}>
                  PierreGuard
                </span>
                <span className="text-xs ml-2 px-2 py-0.5 rounded-full font-medium"
                  style={{ background: '#dbeafe', color: '#1e40af' }}>
                  Scan
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#1e293b' }}>
                  {user?.name}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {user?.role} · {user?.id}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ border: '1px solid #e2e8f0', color: '#64748b' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </header>
  
        <main className="max-w-4xl mx-auto px-6 py-12">
  
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#1e293b' }}>
              IAM Security Audit
            </h1>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Review the connected account details below and start your scan.
            </p>
          </div>
  
          {/* Connected account card */}
          <div className="bg-white rounded-2xl overflow-hidden mb-6"
            style={{ border: '1px solid #e2e8f0' }}>
  
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#eff6ff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#1e40af" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                    Connected AWS Account
                  </p>
                  <p className="text-xs" style={{ color: '#64748b' }}>
                    Configured via IAM access credentials
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: '#16a34a' }} />
                <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>
                  {accountInfo.status}
                </span>
              </div>
            </div>
  
            <div className="grid grid-cols-3 gap-0">
              {[
                { label: 'Account ID', value: accountInfo.accountId },
                { label: 'Account Name', value: accountInfo.accountName },
                { label: 'Environment', value: accountInfo.environment },
                { label: 'Region', value: accountInfo.region },
                { label: 'IAM User', value: accountInfo.iamUser },
                { label: 'Last Scan', value: accountInfo.lastScan },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4"
                  style={{
                    borderRight: i % 3 !== 2 ? '1px solid #f1f5f9' : 'none',
                    borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none'
                  }}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
  
          {/* Scan scope card */}
          <div className="bg-white rounded-2xl p-6 mb-6"
            style={{ border: '1px solid #e2e8f0' }}>
            <p className="text-sm font-semibold mb-4" style={{ color: '#1e293b' }}>
              Scan Scope
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'IAM Users', desc: 'All users, policies, and access keys', checked: true },
                { label: 'IAM Roles', desc: 'All roles and trust policies', checked: true },
                { label: 'IAM Policies', desc: 'All custom managed policies', checked: true },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <div className="w-4 h-4 rounded flex items-center justify-center mt-0.5 flex-shrink-0"
                    style={{ background: '#1e40af' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#1e293b' }}>
                      {item.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Standards card */}
          <div className="bg-white rounded-2xl p-6 mb-6"
            style={{ border: '1px solid #e2e8f0' }}>
            <p className="text-sm font-semibold mb-4" style={{ color: '#1e293b' }}>
              Standards Applied
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'PierreGuard Security Standards v1.0', type: 'Primary', color: '#1e40af', bg: '#eff6ff' },
                { name: 'CIS AWS Foundations Benchmark', type: 'Framework', color: '#7c3aed', bg: '#f5f3ff' },
                { name: 'SOC 2 Type II Controls', type: 'Compliance', color: '#0891b2', bg: '#ecfeff' },
                { name: 'ISO 27001 Annex A.9', type: 'Compliance', color: '#16a34a', bg: '#f0fdf4' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: item.bg, border: `1px solid ${item.bg}` }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: item.color }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: item.color }}>
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: item.color, opacity: 0.7 }}>
                      {item.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Scan button */}
          <div className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #e2e8f0' }}>
            {scanning ? (
              <div className="text-center py-4">
                <div className="relative mx-auto mb-4" style={{ width: '48px', height: '48px' }}>
                  <div className="absolute inset-0 rounded-full"
                    style={{ border: '1px solid #dbeafe' }} />
                  <div className="absolute inset-0 rounded-full animate-spin"
                    style={{ border: '3px solid transparent', borderTopColor: '#1e40af' }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: '#1e293b' }}>
                  Scanning PierreGuard Technologies
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Fetching IAM data and running LangChain analysis against security standards...
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#1e40af', animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#1e40af', animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: '#1e40af', animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
                    Ready to scan
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    This will analyse all IAM users, roles, and policies.
                    Takes approximately 30 to 60 seconds.
                  </p>
                </div>
                <button
                  onClick={onScan}
                  className="px-8 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                  style={{ background: '#1e40af', color: 'white' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Start IAM Scan
                </button>
              </div>
            )}
          </div>
  
          {error && (
            <div className="mt-4 px-6 py-4 rounded-xl text-sm"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626'
              }}>
              Scan failed: {error}
            </div>
          )}
        </main>
      </div>
    )
  }
  
  export default ScanLanding