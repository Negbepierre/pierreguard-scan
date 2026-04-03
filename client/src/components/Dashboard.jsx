import StatsBar from './StatsBar'
import UserRiskTable from './UserRiskTable'
import ReportPanel from './ReportPanel'

function Dashboard({ data, onRescan, user }) {
  const now = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>

      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#e2e8f0' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
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
                Security Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs" style={{ color: '#64748b' }}>
                Scan completed
              </p>
              <p className="text-xs font-medium" style={{ color: '#1e293b' }}>
                {now}
              </p>
            </div>
            <div className="flex items-center gap-3"
              style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#1e293b' }}>
                  {user?.name}
                </p>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  {user?.role} · {user?.id}
                </p>
              </div>
              <button
                onClick={onRescan}
                className="text-xs px-4 py-2 rounded-lg font-medium transition-all"
                style={{ background: '#1e40af', color: 'white' }}
              >
                New Scan
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Stats */}
        <StatsBar data={data} />

        {/* Compliance badges */}
        <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-6"
          style={{ border: '1px solid #e2e8f0' }}>
          <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>
            Compliance Status
          </p>
          <div className="flex items-center gap-3">
            {[
              { name: 'CIS AWS Benchmark', status: 'PARTIAL' },
              { name: 'SOC 2', status: 'PARTIAL' },
              { name: 'ISO 27001', status: 'PARTIAL' },
              { name: 'PierreGuard Standards', status: 'FAIL' },
            ].map((item, i) => {
              const isPass = item.status === 'PASS'
              const isPartial = item.status === 'PARTIAL'
              return (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: isPass ? '#f0fdf4' : isPartial ? '#fffbeb' : '#fef2f2',
                    border: `1px solid ${isPass ? '#bbf7d0' : isPartial ? '#fde68a' : '#fecaca'}`
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isPass ? '#16a34a' : isPartial ? '#d97706' : '#dc2626' }} />
                  <span className="text-xs font-medium"
                    style={{ color: isPass ? '#16a34a' : isPartial ? '#d97706' : '#dc2626' }}>
                    {item.name}
                  </span>
                  <span className="text-xs font-bold"
                    style={{ color: isPass ? '#16a34a' : isPartial ? '#d97706' : '#dc2626' }}>
                    {item.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* User risk table */}
        <UserRiskTable
          userRisks={data.user_risks}
          rawUsers={data.raw?.users}
        />

        {/* Report panel */}
        <ReportPanel report={data.report} />

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            PierreGuard AI Security Platform v1.0 — This report was generated
            using LangChain and AWS Bedrock against PierreGuard Security
            Standards v1.0. All findings should be reviewed by a qualified
            security professional before remediation.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard