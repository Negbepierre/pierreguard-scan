function UserRiskTable({ userRisks, rawUsers }) {
    const getRiskBadge = (risk) => {
      const styles = {
        CRITICAL: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
        HIGH: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
        MEDIUM: { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
        LOW: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
        CLEAN: { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
      }
      const s = styles[risk] || styles.CLEAN
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
          {risk}
        </span>
      )
    }
  
    const getRiskDot = (risk) => {
      const colors = {
        CRITICAL: '#dc2626',
        HIGH: '#d97706',
        MEDIUM: '#ca8a04',
        LOW: '#16a34a',
        CLEAN: '#0891b2',
      }
      return (
        <div className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: colors[risk] || '#94a3b8' }} />
      )
    }
  
    const getUserData = (username) => {
      if (!rawUsers) return null
      return rawUsers.find(u =>
        u.username.toLowerCase().replace(/-/g, '') ===
        username.toLowerCase().replace(/-/g, '')
      )
    }
  
    const sorted = [...(userRisks || [])].sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, CLEAN: 4 }
      return (order[a.risk] ?? 5) - (order[b.risk] ?? 5)
    })
  
    return (
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: '1px solid #e2e8f0' }}>
  
        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#1e293b' }}>
              User Risk Assessment
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              {sorted.length} users assessed against PierreGuard Security Standards
            </p>
          </div>
          <div className="flex items-center gap-2">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'CLEAN'].map(r => (
              <div key={r} className="flex items-center gap-1">
                {getRiskDot(r)}
                <span className="text-xs" style={{ color: '#64748b' }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
  
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}>User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}>Risk Level</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}>Finding</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}>Groups</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}>Policies</th>
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#64748b' }}>Access Keys</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((user, i) => {
                const raw = getUserData(user.username)
                return (
                  <tr key={i}
                    className="transition-colors hover:bg-gray-50"
                    style={{ borderBottom: '1px solid #f1f5f9' }}>
  
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getRiskDot(user.risk)}
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1e293b' }}>
                            {user.username}
                          </p>
                          {raw && (
                            <p className="text-xs" style={{ color: '#94a3b8' }}>
                              Created {new Date(raw.created).toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
  
                    <td className="px-6 py-4">
                      {getRiskBadge(user.risk)}
                    </td>
  
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                        {user.reason}
                      </p>
                    </td>
  
                    <td className="px-6 py-4">
                      {raw && raw.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {raw.groups.map((g, j) => (
                            <span key={j} className="px-2 py-0.5 rounded text-xs"
                              style={{ background: '#eff6ff', color: '#1e40af' }}>
                              {g}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#94a3b8' }}>No group</span>
                      )}
                    </td>
  
                    <td className="px-6 py-4">
                      {raw && raw.policies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {raw.policies.slice(0, 2).map((p, j) => (
                            <span key={j} className="px-2 py-0.5 rounded text-xs"
                              style={{
                                background: p.includes('Admin') || p.includes('Full')
                                  ? '#fef2f2' : '#f0fdf4',
                                color: p.includes('Admin') || p.includes('Full')
                                  ? '#dc2626' : '#16a34a'
                              }}>
                              {p.replace('arn:aws:iam::aws:policy/', '')}
                            </span>
                          ))}
                          {raw.policies.length > 2 && (
                            <span className="px-2 py-0.5 rounded text-xs"
                              style={{ background: '#f1f5f9', color: '#64748b' }}>
                              +{raw.policies.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#94a3b8' }}>Via group</span>
                      )}
                    </td>
  
                    <td className="px-6 py-4">
                      {raw && raw.access_keys.length > 0 ? (
                        <div className="space-y-1">
                          {raw.access_keys.map((k, j) => (
                            <div key={j} className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full"
                                style={{ background: k.status === 'Active' ? '#16a34a' : '#94a3b8' }} />
                              <span className="text-xs font-mono" style={{ color: '#64748b' }}>
                                {k.id}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: '#94a3b8' }}>None</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  
  export default UserRiskTable