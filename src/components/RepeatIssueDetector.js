import React, { useState, useEffect } from 'react';
import axios from 'axios';

// RepeatIssueDetector.js
// Fixes Loophole 6: Single complaints can be dismissed as isolated.
// This component shows "this problem was reported X times before — never resolved"
// turning individual complaints into SYSTEMIC FAILURE EVIDENCE.
//
// Usage in IssueDetailPage.js:
//   <RepeatIssueDetector issue={issue} />
//
// Usage in RaiseIssuePage.js after submission to warn about duplicates:
//   <RepeatIssueDetector issue={newIssue} showOnRaise={true} />
//
// Backend: GET /api/issues/{id}/similar (see backend patch)

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const RepeatIssueDetector = ({ issue, showOnRaise = false }) => {
  const [similarIssues, setSimilarIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [pattern, setPattern] = useState(null);

  useEffect(() => {
    if (!issue?.id) return;
    fetchSimilar();
  }, [issue?.id]);

  const fetchSimilar = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/issues/${issue.id}/similar`);
      const data = res.data;
      setSimilarIssues(data.similar_issues || []);
      setPattern(analyzePattern(data.similar_issues || []));
    } catch { setSimilarIssues([]); }
    setLoading(false);
  };

  const analyzePattern = (issues) => {
    if (!issues || issues.length === 0) return null;
    const resolved = issues.filter(i => i.status === 'resolved').length;
    const unresolved = issues.filter(i => i.status !== 'resolved').length;
    const oldest = issues.reduce((a, b) => new Date(a.created_at) < new Date(b.created_at) ? a : b, issues[0]);
    const monthsSince = oldest?.created_at
      ? Math.floor((new Date() - new Date(oldest.created_at)) / (1000 * 60 * 60 * 24 * 30))
      : 0;
    const totalSupporters = issues.reduce((sum, i) => sum + (i.support_count || 0), 0);
    return {
      total: issues.length,
      resolved,
      unresolved,
      monthsSince,
      totalSupporters,
      isChronicFailure: issues.length >= 3 && resolved === 0,
      isCyclical: issues.length >= 2 && resolved > 0 && unresolved > 0,
    };
  };

  if (loading) return null;
  if (similarIssues.length === 0) return null;

  const severityColor = pattern?.isChronicFailure ? '#dc2626' : pattern?.isCyclical ? '#ea580c' : '#ca8a04';
  const severityBg = pattern?.isChronicFailure ? '#fee2e2' : pattern?.isCyclical ? '#fff7ed' : '#fef9c3';
  const severityLabel = pattern?.isChronicFailure ? '🔴 Chronic Failure' : pattern?.isCyclical ? '🔄 Recurring Problem' : '⚠️ Repeated Issue';

  return (
    <div style={{ ...S.wrapper, borderColor: severityColor + '60' }}>

      {/* Header banner — always visible */}
      <div style={{ ...S.banner, backgroundColor: severityBg }} onClick={() => setExpanded(!expanded)}>
        <div style={S.bannerLeft}>
          <span style={{ ...S.badge, backgroundColor: severityColor + '20', color: severityColor }}>
            {severityLabel}
          </span>
          <div style={S.bannerTitle}>
            This problem was reported <strong>{pattern?.total + 1} times</strong> {pattern?.monthsSince > 0 ? `over ${pattern.monthsSince} months` : 'recently'}
          </div>
          <div style={S.bannerSub}>
            {pattern?.isChronicFailure
              ? `Never resolved despite ${pattern.total + 1} separate reports from ${pattern.totalSupporters + (issue.support_count||0)} total citizens`
              : pattern?.isCyclical
              ? `Resolved ${pattern.resolved} time(s) but keeps coming back — temporary fixes, not permanent solutions`
              : `This is a recurring local issue that needs systemic attention`}
          </div>
          {/* Tamil version */}
          <div style={S.tamilNote}>
            {pattern?.isChronicFailure
              ? `இந்த பிரச்சனை ${pattern.total + 1} முறை புகாரளிக்கப்பட்டது — ஒருமுறையும் தீர்க்கப்படவில்லை`
              : `இந்த பிரச்சனை மீண்டும் மீண்டும் வருகிறது — நிரந்தர தீர்வு தேவை`}
          </div>
        </div>
        <div style={S.expandBtn}>{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Expanded: similar issues timeline */}
      {expanded && (
        <div style={S.content}>

          {/* Pattern analysis box */}
          <div style={{ ...S.analysisBox, borderColor: severityColor + '40', backgroundColor: severityBg }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: severityColor, marginBottom: 8 }}>
              📊 Pattern Analysis
            </div>
            <div style={S.analysisGrid}>
              <div style={S.analysisStat}>
                <span style={{ fontSize: 22, fontWeight: 800, color: severityColor }}>{pattern?.total + 1}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Total Reports</span>
              </div>
              <div style={S.analysisStat}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{pattern?.resolved}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Times Resolved</span>
              </div>
              <div style={S.analysisStat}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{pattern?.unresolved + 1}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Still Unresolved</span>
              </div>
              <div style={S.analysisStat}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#374151' }}>{(pattern?.totalSupporters||0) + (issue.support_count||0)}</span>
                <span style={{ fontSize: 11, color: '#6b7280' }}>Total Supporters</span>
              </div>
            </div>
            {pattern?.isChronicFailure && (
              <div style={S.chronicAlert}>
                ⚖️ <strong>Legal grounds strengthened:</strong> Multiple unresolved reports with high public support constitutes documented systemic negligence. Include this evidence when filing on CPGRAMS.
              </div>
            )}
          </div>

          {/* Timeline */}
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '16px 0 10px' }}>
            Issue History Timeline
          </div>
          <div style={S.timeline}>
            {/* Current issue */}
            <div style={S.timelineItem}>
              <div style={{ ...S.dot, backgroundColor: '#B91C1C' }} />
              <div style={S.timelineContent}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#B91C1C' }}>NOW — Current Report (This Issue)</div>
                <div style={S.timelineDesc}>{issue.description?.substring(0, 100)}...</div>
                <div style={S.timelineMeta}>{issue.support_count || 0} supporters · Level {issue.current_level}/7</div>
              </div>
            </div>
            {similarIssues.map((sim, i) => (
              <div key={i} style={S.timelineItem}>
                <div style={{
                  ...S.dot,
                  backgroundColor: sim.status === 'resolved' ? '#16a34a' : '#ef4444',
                }} />
                <div style={S.timelineContent}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>
                    {new Date(sim.created_at).toLocaleDateString('en-IN')}
                    <span style={{
                      marginLeft: 8, fontSize: 10, padding: '1px 6px', borderRadius: 10,
                      backgroundColor: sim.status === 'resolved' ? '#dcfce7' : '#fee2e2',
                      color: sim.status === 'resolved' ? '#16a34a' : '#dc2626',
                    }}>
                      {sim.status === 'resolved' ? '✓ Resolved' : '✗ Unresolved'}
                    </span>
                  </div>
                  <div style={S.timelineDesc}>{sim.description?.substring(0, 100)}...</div>
                  <div style={S.timelineMeta}>{sim.support_count || 0} supporters · {sim.local_body_name || sim.ward}</div>
                  {sim.status === 'resolved' && (
                    <div style={S.resolvedNote}>
                      ⚠️ Was resolved but problem returned — indicates temporary fix only
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action CTA */}
          <div style={S.cta}>
            <div style={S.ctaText}>
              Use this history as evidence. When filing on CPGRAMS or escalating to MLA/Minister, mention:
              <br /><em>"This issue has been reported {pattern?.total + 1} times in {pattern?.monthsSince} months with {(pattern?.totalSupporters||0)+(issue.support_count||0)} total citizens affected."</em>
            </div>
            <button
              onClick={() => {
                const text = `Evidence of Systemic Failure:\nIssue: ${issue.category} in ${issue.district}\nReported ${pattern?.total+1} times over ${pattern?.monthsSince} months\nTotal citizens affected: ${(pattern?.totalSupporters||0)+(issue.support_count||0)}\nTimes resolved: ${pattern?.resolved}\nTimes unresolved: ${pattern?.unresolved+1}\n\nView full history: ${window.location.origin}/issues/${issue.id}`;
                navigator.clipboard.writeText(text);
                alert('Evidence text copied to clipboard!');
              }}
              style={S.copyEvidenceBtn}
            >
              📋 Copy Evidence Text for CPGRAMS
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  wrapper: { border: '2px solid', borderRadius: 12, overflow: 'hidden', marginBottom: 20, backgroundColor: '#fff' },
  banner: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', cursor: 'pointer', gap: 12 },
  bannerLeft: { flex: 1 },
  badge: { display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, marginBottom: 6 },
  bannerTitle: { fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 },
  bannerSub: { fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 6 },
  tamilNote: { fontSize: 12, color: '#6b7280', fontStyle: 'italic' },
  expandBtn: { fontSize: 12, color: '#9ca3af', flexShrink: 0 },
  content: { padding: 16, borderTop: '1px solid #f3f4f6' },
  analysisBox: { border: '1px solid', borderRadius: 8, padding: 14, marginBottom: 4 },
  analysisGrid: { display: 'flex', gap: 20, marginBottom: 10 },
  analysisStat: { display: 'flex', flexDirection: 'column', gap: 2 },
  chronicAlert: { fontSize: 12, color: '#92400e', backgroundColor: '#fffbeb', padding: '8px 12px', borderRadius: 6, lineHeight: 1.6 },
  timeline: { position: 'relative', paddingLeft: 20 },
  timelineItem: { display: 'flex', gap: 12, marginBottom: 16, position: 'relative' },
  dot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0, marginTop: 3 },
  timelineContent: { flex: 1 },
  timelineDesc: { fontSize: 13, color: '#374151', marginTop: 4, lineHeight: 1.5 },
  timelineMeta: { fontSize: 11, color: '#9ca3af', marginTop: 3 },
  resolvedNote: { fontSize: 11, color: '#ea580c', marginTop: 4, backgroundColor: '#fff7ed', padding: '4px 8px', borderRadius: 4 },
  cta: { backgroundColor: '#f9fafb', borderRadius: 8, padding: '12px 14px', marginTop: 16 },
  ctaText: { fontSize: 13, color: '#374151', lineHeight: 1.7, marginBottom: 10 },
  copyEvidenceBtn: { padding: '9px 14px', fontSize: 13, fontWeight: 700, backgroundColor: '#B91C1C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
};

export default RepeatIssueDetector;
