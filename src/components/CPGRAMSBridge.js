import React, { useState } from 'react';

// CPGRAMSBridge.js
// Fixes Loophole 5: Platform has no legal teeth — officials can ignore it
// When an issue crosses 100 supporters, show a CPGRAMS filing prompt
// This connects citizen-validated issues to the legally-mandated 21-day response system
//
// Usage in IssueDetailPage.js:
//   {issue.support_count >= 100 && <CPGRAMSBridge issue={issue} />}
//
// Also use in auto-escalation notifications when support_count crosses 100

const CATEGORY_TO_MINISTRY = {
  'Water':         { ministry: 'Ministry of Jal Shakti / TN Water Resources', cpgramsCategory: 'Water Supply' },
  'Roads':         { ministry: 'NHAI (if NH) / PWD Tamil Nadu', cpgramsCategory: 'Roads & Highways' },
  'Health':        { ministry: 'Ministry of Health / TN Health Dept', cpgramsCategory: 'Health & Family Welfare' },
  'Electricity':   { ministry: 'TANGEDCO / Ministry of Power', cpgramsCategory: 'Electricity' },
  'Flooding':      { ministry: 'PWD / Revenue Dept Tamil Nadu', cpgramsCategory: 'Disaster Management' },
  'Schools':       { ministry: 'TN School Education / Ministry of Education', cpgramsCategory: 'School Education' },
  'Transport':     { ministry: 'MTC/TNSTC / Ministry of Railways', cpgramsCategory: 'Transport' },
  'Garbage':       { ministry: 'Corporation / Urban Development', cpgramsCategory: 'Urban Development' },
  'Sewage':        { ministry: 'TWAD / CMWSSB', cpgramsCategory: 'Sanitation' },
  'Farming':       { ministry: 'TN Agri Dept / Ministry of Agriculture', cpgramsCategory: 'Agriculture' },
  'Employment':    { ministry: 'TN Labour Dept / Ministry of Labour', cpgramsCategory: 'Employment' },
  'Housing':       { ministry: 'TNHB / Ministry of Housing', cpgramsCategory: 'Housing' },
  'Welfare':       { ministry: 'TN Social Welfare / Ministry of Social Justice', cpgramsCategory: 'Social Welfare' },
  'Corruption':    { ministry: 'DVAC / CVC (Central Vigilance Commission)', cpgramsCategory: 'Anti-Corruption' },
  'Pollution':     { ministry: 'TNPCB / CPCB', cpgramsCategory: 'Environment & Forests' },
  'Public Safety': { ministry: 'TN Police / Ministry of Home Affairs', cpgramsCategory: 'Public Safety' },
};

const CPGRAMSBridge = ({ issue }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const ministryInfo = CATEGORY_TO_MINISTRY[issue.category] || {
    ministry: 'Concerned Ministry / Department',
    cpgramsCategory: 'General Administration',
  };

  // Pre-filled CPGRAMS complaint text
  const cpgramsText = `Subject: ${issue.category} issue - ${issue.district}, ${issue.local_body_name}

District: ${issue.district}
Local Body: ${issue.local_body_name}${issue.ward ? ', ' + issue.ward : ''}
Category: ${issue.category}
Issue ID on Makkal Kural Platform: ${issue.id}

Description:
${issue.description}

Public Validation:
This issue has been publicly validated by ${issue.support_count} citizens on Makkal Kural 
(People's Voice governance platform - ${window.location.origin}).
${Math.round((issue.support_count / Math.max(issue.support_count + issue.oppose_count, 1)) * 100)}% public support rate.

Current Status: ${issue.status} (Escalation Level ${issue.current_level}/7)

This issue has persisted for sufficient time without resolution despite public demand.
Requesting immediate intervention and resolution under the 21-day CPGRAMS mandate.

Evidence: Please refer to the Makkal Kural platform link for photos, comments and escalation timeline:
${window.location.origin}/issues/${issue.id}`;

  const copyText = () => {
    navigator.clipboard.writeText(cpgramsText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const isMilestone100 = issue.support_count >= 100 && issue.support_count < 200;
  const isMilestone200 = issue.support_count >= 200;

  return (
    <div style={S.wrapper}>
      {/* Trigger banner */}
      <div style={S.banner} onClick={() => setExpanded(!expanded)}>
        <div style={S.bannerLeft}>
          <div style={S.legalBadge}>⚖️ Legal Action Available</div>
          <div style={S.bannerTitle}>
            {issue.support_count}+ citizens validated this issue
          </div>
          <div style={S.bannerSub}>
            File on CPGRAMS for a <strong>legally-mandated 21-day response</strong> from government
          </div>
        </div>
        <div style={S.expandIcon}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div style={S.content}>
          {/* What is CPGRAMS */}
          <div style={S.infoBox}>
            <div style={S.infoTitle}>🏛️ What is CPGRAMS?</div>
            <p style={S.infoText}>
              CPGRAMS (Centralised Public Grievance Redress and Monitoring System) is India's official government
              grievance portal. By law, all ministries and state departments must respond within <strong>21 days</strong>.
              It is connected to all Tamil Nadu state departments and central ministries.
            </p>
            <div style={S.statRow}>
              <div style={S.stat}><span style={S.statNum}>21</span><span style={S.statLabel}>day legal deadline</span></div>
              <div style={S.stat}><span style={S.statNum}>91</span><span style={S.statLabel}>central ministries</span></div>
              <div style={S.stat}><span style={S.statNum}>36</span><span style={S.statLabel}>states linked</span></div>
            </div>
          </div>

          {/* Ministry routing */}
          <div style={S.routeBox}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>YOUR ISSUE ROUTES TO:</div>
            <div style={S.routeDept}>{ministryInfo.ministry}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>CPGRAMS Category: <strong>{ministryInfo.cpgramsCategory}</strong></div>
          </div>

          {/* Pre-filled complaint */}
          <div style={S.complaintSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                📋 Pre-filled complaint text (copy & paste into CPGRAMS)
              </div>
              <button onClick={copyText} style={{
                ...S.copyBtn,
                backgroundColor: copied ? '#dcfce7' : '#f3f4f6',
                color: copied ? '#166534' : '#374151',
              }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <pre style={S.complaintText}>{cpgramsText}</pre>
          </div>

          {/* Action steps */}
          <div style={S.stepsBox}>
            <div style={S.stepsTitle}>How to file on CPGRAMS (3 steps):</div>
            {[
              { step: '1', text: 'Click the button below to open CPGRAMS', sub: 'pgportal.gov.in — free, no login needed for basic filing' },
              { step: '2', text: 'Copy the pre-filled text above and paste it', sub: `Select category: "${ministryInfo.cpgramsCategory}"` },
              { step: '3', text: 'Submit and save your registration number', sub: 'Use registration ID to track response. 21-day legal deadline applies.' },
            ].map(s => (
              <div key={s.step} style={S.step}>
                <div style={S.stepNum}>{s.step}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{s.text}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a
            href="https://pgportal.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={S.cpgramsBtn}
          >
            🏛️ Open CPGRAMS Portal →
          </a>

          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
            Filing on CPGRAMS adds legal accountability on top of Makkal Kural's public pressure
          </div>
        </div>
      )}
    </div>
  );
};

const S = {
  wrapper: { border: '2px solid #fbbf24', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
  banner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', backgroundColor: '#fffbeb', cursor: 'pointer', gap: 12 },
  bannerLeft: { flex: 1 },
  legalBadge: { fontSize: 11, fontWeight: 700, color: '#92400e', backgroundColor: '#fde68a', padding: '2px 10px', borderRadius: 20, display: 'inline-block', marginBottom: 4 },
  bannerTitle: { fontSize: 15, fontWeight: 800, color: '#111827', marginBottom: 2 },
  bannerSub: { fontSize: 13, color: '#6b7280' },
  expandIcon: { fontSize: 12, color: '#9ca3af', flexShrink: 0 },
  content: { padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #fde68a' },
  infoBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '12px 14px', marginBottom: 12 },
  infoTitle: { fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#0c4a6e', lineHeight: 1.6, margin: '0 0 10px' },
  statRow: { display: 'flex', gap: 16 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 800, color: '#0369a1' },
  statLabel: { fontSize: 10, color: '#7dd3fc', fontWeight: 500, textAlign: 'center' },
  routeBox: { backgroundColor: '#fafafa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', marginBottom: 12 },
  routeDept: { fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 },
  complaintSection: { marginBottom: 14 },
  copyBtn: { fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.2s' },
  complaintText: { fontSize: 11, color: '#374151', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 180, overflowY: 'auto', fontFamily: 'monospace', lineHeight: 1.6, margin: 0 },
  stepsBox: { backgroundColor: '#fafafa', borderRadius: 8, padding: '12px 14px', marginBottom: 14 },
  stepsTitle: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 },
  step: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  stepNum: { width: 22, height: 22, backgroundColor: '#B91C1C', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 },
  cpgramsBtn: { display: 'block', textAlign: 'center', padding: '13px', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 10, textDecoration: 'none' },
};

export default CPGRAMSBridge;
