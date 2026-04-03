function StatsBar({ data }) {
    const userRisks = data.user_risks || []
    const critical = userRisks.filter(u => u.risk === 'CRITICAL').length
    const high = userRisks.filter(u => u.risk === 'HIGH').length
    const medium = userRisks.filter(u => u.risk === 'MEDIUM').length
    const low = userRisks.filter(u => u.risk === 'LOW').length
    const clean = userRisks.filter(u => u.risk === 'CLEAN').length
  
    const reportText = data.report || ''
    const scoreMatch = reportText.match(/risk score[:\s]+(\d+)/i)
    const riskScore = scoreMatch ? parseInt(scoreMatch[1]) : null
  
    const getRiskColor = (score) => {
      if (score >= 8) return { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' }
      if (score >= 5) return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' }
      return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' }
    }
  
    const scoreColors = riskScore ? getRiskColor(riskScore) : null
  
    const stats = [
      { label: 'Users Scanned', value: data.users_scanned, color: '#1e40af', bg: '#eff6ff' },
      { label: 'Roles Scanned', value: data.roles_scanned, color: '#7c3aed', bg: '#f5f3ff' },
      { label: 'Policies Scanned', value: data.policies_scanned, color: '#0891b2', bg: '#ecfeff' },
    ]
  
    const findings = [
      { label: 'Critical', value: critical, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
      { label: 'High', value: high, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
      { label: 'Medium', value: medium, color: '#ca8a04', bg: '#fefce8', border: '#fef08a' },
      { label: 'Low', value: low, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
      { label: 'Clean', value: clean, color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
    ]
  
    return (
      <div className="space-y-4">
  
        {/* Risk score + scan stats */}
        <div className="grid grid-cols-4 gap-4">
          {riskScore && (
            <div className="rounded-xl p-5 flex items-center justify-between"
              style={{
                background: scoreColors.bg,
                border: `1px solid ${scoreColors.border}`
              }}>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: scoreColors.text }}>
                  Overall Risk Score
                </p>
                <p className="text-3xl font-bold" style={{ color: scoreColors.text }}>
                  {riskScore}<span className="text-lg font-normal">/10</span>
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: scoreColors.border }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke={scoreColors.text} strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>
          )}
  
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-5 flex items-center justify-between"
              style={{ border: '1px solid #e2e8f0' }}>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>
                  {stat.label}
                </p>
                <p className="text-3xl font-bold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: stat.bg }}>
                <div className="w-3 h-3 rounded-full" style={{ background: stat.color }} />
              </div>
            </div>
          ))}
        </div>
  
        {/* Findings breakdown */}
        <div className="grid grid-cols-5 gap-3">
          {findings.map((f, i) => (
            <div key={i} className="rounded-xl p-4 text-center"
              style={{
                background: f.bg,
                border: `1px solid ${f.border}`
              }}>
              <p className="text-2xl font-bold mb-1" style={{ color: f.color }}>
                {f.value}
              </p>
              <p className="text-xs font-medium" style={{ color: f.color }}>
                {f.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  export default StatsBar