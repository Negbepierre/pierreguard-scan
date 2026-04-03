import { useState } from 'react'

function ReportPanel({ report }) {
  const [activeSection, setActiveSection] = useState('critical')

  const sections = [
    { id: 'executive', label: 'Executive Summary', icon: '📊' },
    { id: 'critical', label: 'Critical', icon: '🔴' },
    { id: 'high', label: 'High', icon: '🟠' },
    { id: 'medium', label: 'Medium', icon: '🟡' },
    { id: 'low', label: 'Low', icon: '🟢' },
    { id: 'remediation', label: 'Remediation', icon: '🔧' },
    { id: 'compliance', label: 'Compliance', icon: '✅' },
  ]

  const extractSection = (text, sectionName, nextSectionNum) => {
    const patterns = [
      new RegExp(`${sectionName}[\\s\\S]*?(?=${nextSectionNum}\\.|$)`, 'i'),
      new RegExp(`\\d+\\.\\s*${sectionName}[\\s\\S]*?(?=\\d+\\.|$)`, 'i'),
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[0].trim()
    }
    return null
  }

  const getSectionContent = (id) => {
    if (!report) return ''
    switch (id) {
      case 'executive': return extractSection(report, 'EXECUTIVE SUMMARY', '2') || ''
      case 'critical': return extractSection(report, 'CRITICAL FINDINGS', '3') || ''
      case 'high': return extractSection(report, 'HIGH FINDINGS', '4') || ''
      case 'medium': return extractSection(report, 'MEDIUM FINDINGS', '5') || ''
      case 'low': return extractSection(report, 'LOW FINDINGS', '6') || ''
      case 'remediation': return extractSection(report, 'REMEDIATION PLAN', '8') || ''
      case 'compliance': return extractSection(report, 'COMPLIANCE STATUS', '999') || ''
      default: return ''
    }
  }

  const formatContent = (text) => {
    if (!text) return []
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return { type: 'spacer', content: '', key: i }

      if (trimmed.match(/^\d+\.\s+[A-Z\s]+$/)) {
        return { type: 'heading', content: trimmed, key: i }
      }
      if (trimmed.match(/^User:/i) || trimmed.match(/^Violated Standard:/i)) {
        return { type: 'field', content: trimmed, key: i }
      }
      if (trimmed.match(/^Why this is dangerous:/i)) {
        return { type: 'danger', content: trimmed, key: i }
      }
      if (trimmed.match(/^Remediation:/i) || trimmed.match(/^AWS CLI/i)) {
        return { type: 'fix', content: trimmed, key: i }
      }
      if (trimmed.match(/^aws iam/i)) {
        return { type: 'code', content: trimmed, key: i }
      }
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return { type: 'bullet', content: trimmed.replace(/^[-*]\s*/, ''), key: i }
      }
      if (trimmed.match(/^(PASS|PARTIAL|FAIL)/i)) {
        const isPass = trimmed.match(/^PASS/i)
        const isPartial = trimmed.match(/^PARTIAL/i)
        return { type: isPass ? 'pass' : isPartial ? 'partial' : 'fail', content: trimmed, key: i }
      }
      return { type: 'text', content: trimmed, key: i }
    })
  }

  const content = getSectionContent(activeSection)
  const lines = formatContent(content)

  const renderLine = (line) => {
    switch (line.type) {
      case 'spacer':
        return <div key={line.key} className="h-2" />
      case 'heading':
        return (
          <h3 key={line.key} className="text-sm font-bold mt-4 mb-2 pt-3"
            style={{ color: '#1e293b', borderTop: '1px solid #f1f5f9' }}>
            {line.content}
          </h3>
        )
      case 'field':
        return (
          <p key={line.key} className="text-sm font-semibold mt-3"
            style={{ color: '#1e40af' }}>
            {line.content}
          </p>
        )
      case 'danger':
        return (
          <div key={line.key} className="flex gap-2 mt-1 p-2 rounded-lg"
            style={{ background: '#fef2f2' }}>
            <span className="text-xs" style={{ color: '#dc2626' }}>⚠</span>
            <p className="text-xs leading-relaxed" style={{ color: '#dc2626' }}>
              {line.content}
            </p>
          </div>
        )
      case 'fix':
        return (
          <p key={line.key} className="text-xs font-semibold mt-2"
            style={{ color: '#16a34a' }}>
            {line.content}
          </p>
        )
      case 'code':
        return (
          <div key={line.key} className="mt-1 px-3 py-2 rounded-lg font-mono text-xs overflow-x-auto"
            style={{ background: '#1e293b', color: '#86efac' }}>
            {line.content}
          </div>
        )
      case 'bullet':
        return (
          <div key={line.key} className="flex gap-2 mb-1.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#1e40af' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>
              {line.content}
            </p>
          </div>
        )
      case 'pass':
        return (
          <div key={line.key} className="flex items-center gap-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: '#f0fdf4', color: '#16a34a' }}>PASS</span>
            <p className="text-sm" style={{ color: '#475569' }}>
              {line.content.replace(/^PASS\s*/i, '')}
            </p>
          </div>
        )
      case 'partial':
        return (
          <div key={line.key} className="flex items-center gap-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: '#fffbeb', color: '#d97706' }}>PARTIAL</span>
            <p className="text-sm" style={{ color: '#475569' }}>
              {line.content.replace(/^PARTIAL\s*/i, '')}
            </p>
          </div>
        )
      case 'fail':
        return (
          <div key={line.key} className="flex items-center gap-2 py-1.5">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: '#fef2f2', color: '#dc2626' }}>FAIL</span>
            <p className="text-sm" style={{ color: '#475569' }}>
              {line.content.replace(/^FAIL\s*/i, '')}
            </p>
          </div>
        )
      default:
        return (
          <p key={line.key} className="text-sm leading-relaxed mb-1"
            style={{ color: '#475569' }}>
            {line.content}
          </p>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
      style={{ border: '1px solid #e2e8f0' }}>

      <div className="px-6 py-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <h2 className="text-base font-semibold" style={{ color: '#1e293b' }}>
          Security Audit Report
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
          Generated against PierreGuard Security Standards v1.0
        </p>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="px-4 py-3 text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
            style={{
              color: activeSection === section.id ? '#1e40af' : '#64748b',
              borderBottom: activeSection === section.id
                ? '2px solid #1e40af' : '2px solid transparent',
              background: activeSection === section.id ? '#eff6ff' : 'transparent'
            }}
          >
            <span>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      <div className="p-6 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {lines.length > 0 ? (
          lines.map(line => renderLine(line))
        ) : (
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            No content found for this section.
          </p>
        )}
      </div>
    </div>
  )
}

export default ReportPanel