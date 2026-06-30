import React, { useState } from 'react';

// MultiDeptTagger.js
// Fixes Loophole 3: Multi-department issues cause buck-passing between officials
// A flooded road could be: PWD (roads) + Corporation (drainage) + Revenue (land)
// This component lets citizens tag ALL responsible departments upfront
// so no official can say "not my department"
//
// Usage in RaiseIssuePage.js Step 2 (Category/Details):
//   <MultiDeptTagger category={selectedCategory} onDeptsSelected={(depts) => setFormData({...formData, responsible_depts: depts})} />
//
// Add responsible_depts: [] to IssueCreate model and issue_doc in backend

// Department combinations that commonly overlap
const CATEGORY_DEPT_MAP = {
  'Flooding': {
    primary: 'PWD (Public Works Dept)',
    others: [
      { id: 'corporation', name: 'Corporation / Municipality', reason: 'Storm drain maintenance' },
      { id: 'revenue', name: 'Revenue Dept', reason: 'Land encroachment causing blockage' },
      { id: 'nhai', name: 'NHAI (if near National Highway)', reason: 'Highway drainage overflow', isCentral: true },
    ],
  },
  'Roads': {
    primary: 'PWD (State Highways)',
    others: [
      { id: 'corporation', name: 'Corporation / Municipality', reason: 'City roads maintenance' },
      { id: 'nhai', name: 'NHAI', reason: 'National Highway — Central Govt', isCentral: true },
      { id: 'panchayat', name: 'Village Panchayat', reason: 'Rural panchayat roads' },
    ],
  },
  'Water': {
    primary: 'TWAD (TN Water & Drainage Board)',
    others: [
      { id: 'corporation', name: 'Corporation / CMWSSB', reason: 'Urban water supply' },
      { id: 'panchayat', name: 'Village Panchayat', reason: 'Rural water supply' },
      { id: 'revenue', name: 'Revenue Dept', reason: 'Water body encroachment' },
    ],
  },
  'Garbage': {
    primary: 'Corporation / Municipality',
    others: [
      { id: 'panchayat', name: 'Village Panchayat', reason: 'Rural garbage collection' },
      { id: 'tnpcb', name: 'TNPCB', reason: 'Illegal dumping / pollution' },
      { id: 'revenue', name: 'Revenue Dept', reason: 'Encroachment on govt land' },
    ],
  },
  'Pollution': {
    primary: 'TNPCB (TN Pollution Control Board)',
    others: [
      { id: 'district_collector', name: 'District Collector', reason: 'Industrial area enforcement' },
      { id: 'cpcb', name: 'CPCB (Central)', reason: 'Major industrial pollution', isCentral: true },
      { id: 'corporation', name: 'Corporation', reason: 'Urban pollution / burning' },
    ],
  },
  'Schools': {
    primary: 'TN School Education Dept',
    others: [
      { id: 'local_body', name: 'Local Body', reason: 'School building / infrastructure' },
      { id: 'kvs', name: 'KVS / NVS (Central schools)', reason: 'Kendriya / Navodaya schools', isCentral: true },
      { id: 'ssa', name: 'Samagra Shiksha Abhiyan', reason: 'Central education scheme', isCentral: true },
    ],
  },
  'Health': {
    primary: 'TN Health & Family Welfare Dept',
    others: [
      { id: 'corporation', name: 'Corporation Health Wing', reason: 'Urban primary health' },
      { id: 'central_health', name: 'Central Govt (AIIMS/ESIC)', reason: 'Central hospitals', isCentral: true },
      { id: 'nrhm', name: 'NHM (National Health Mission)', reason: 'Central health scheme', isCentral: true },
    ],
  },
  'Electricity': {
    primary: 'TANGEDCO',
    others: [
      { id: 'local_body', name: 'Local Body', reason: 'Street light maintenance' },
      { id: 'cea', name: 'CEA (Central Electricity Auth)', reason: 'Grid / transmission issues', isCentral: true },
    ],
  },
  'Transport': {
    primary: 'MTC / TNSTC (State)',
    others: [
      { id: 'railways', name: 'Indian Railways', reason: 'Train / station issues', isCentral: true },
      { id: 'airport', name: 'AAI (Airport Auth of India)', reason: 'Airport issues', isCentral: true },
      { id: 'nhai', name: 'NHAI', reason: 'National highway transport', isCentral: true },
    ],
  },
  'Welfare': {
    primary: 'TN Social Welfare Dept',
    others: [
      { id: 'revenue', name: 'Revenue Dept', reason: 'Welfare scheme delivery' },
      { id: 'central_welfare', name: 'Central Ministry (NSAP)', reason: 'Central pension schemes', isCentral: true },
      { id: 'tnscst', name: 'TNSCST', reason: 'SC/ST welfare schemes' },
    ],
  },
  'Corruption': {
    primary: 'DVAC (Directorate of Vigilance)',
    others: [
      { id: 'district_collector', name: 'District Collector', reason: 'District-level corruption' },
      { id: 'cbi', name: 'CBI (Central)', reason: 'Major corruption / scam', isCentral: true },
      { id: 'lokayukta', name: 'Lokayukta / ACB', reason: 'Public servant corruption' },
    ],
  },
};

const MultiDeptTagger = ({ category, onDeptsSelected }) => {
  const [selectedDepts, setSelectedDepts] = useState([]);
  const deptMap = CATEGORY_DEPT_MAP[category];

  if (!deptMap) return null;

  const toggleDept = (id) => {
    const next = selectedDepts.includes(id)
      ? selectedDepts.filter(d => d !== id)
      : [...selectedDepts, id];
    setSelectedDepts(next);
    if (onDeptsSelected) onDeptsSelected([deptMap.primary, ...next]);
  };

  const hasCentralSelected = deptMap.others
    .filter(d => selectedDepts.includes(d.id) && d.isCentral).length > 0;

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <span style={{ fontSize: 16 }}>🏢</span>
        <div>
          <div style={S.title}>Which departments are responsible?</div>
          <div style={S.subtitle}>Tag all involved departments — prevents officials from passing the buck</div>
        </div>
      </div>

      {/* Primary department — always selected */}
      <div style={S.primaryRow}>
        <div style={S.checkCircle}>✓</div>
        <div style={{ flex: 1 }}>
          <div style={S.deptName}>{deptMap.primary}</div>
          <div style={S.deptReason}>Primary responsible department</div>
        </div>
        <span style={S.primaryBadge}>Auto-selected</span>
      </div>

      {/* Other departments to optionally tag */}
      <div style={S.otherTitle}>Also involves:</div>
      {deptMap.others.map(dept => {
        const isSelected = selectedDepts.includes(dept.id);
        return (
          <div
            key={dept.id}
            onClick={() => toggleDept(dept.id)}
            style={{
              ...S.deptRow,
              backgroundColor: isSelected ? (dept.isCentral ? '#eff6ff' : '#f0fdf4') : '#fafafa',
              borderColor: isSelected ? (dept.isCentral ? '#93c5fd' : '#86efac') : '#e5e7eb',
              cursor: 'pointer',
            }}
          >
            <div style={{
              ...S.checkbox,
              backgroundColor: isSelected ? (dept.isCentral ? '#2563eb' : '#16a34a') : '#e5e7eb',
            }}>
              {isSelected && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={S.deptName}>{dept.name}</span>
                {dept.isCentral && (
                  <span style={S.centralBadge}>🇮🇳 Central</span>
                )}
              </div>
              <div style={S.deptReason}>{dept.reason}</div>
            </div>
          </div>
        );
      })}

      {/* Warning if central depts selected */}
      {hasCentralSelected && (
        <div style={S.centralWarning}>
          <div style={S.centralWarningTitle}>🇮🇳 Central Government Departments Involved</div>
          <p style={S.centralWarningText}>
            For the central government departments you've tagged, Tamil Nadu government cannot directly mandate action.
            We'll include a <strong>CPGRAMS filing link</strong> in your issue so you can also report it there for a legally-mandated 21-day response.
          </p>
          <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" style={S.cpgramsBtn}>
            Open CPGRAMS Portal →
          </a>
        </div>
      )}

      {/* Summary */}
      {selectedDepts.length > 0 && (
        <div style={S.summary}>
          ✅ Tagged <strong>{1 + selectedDepts.length} departments</strong> — all will be visible on your issue.
          Officials cannot claim "not my department."
        </div>
      )}
    </div>
  );
};

const S = {
  wrapper: { border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 16px', marginBottom: 16, backgroundColor: '#fff' },
  header: { display: 'flex', gap: 10, marginBottom: 14, alignItems: 'flex-start' },
  title: { fontSize: 14, fontWeight: 700, color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  primaryRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', backgroundColor: '#f0fdf4', borderRadius: 8, marginBottom: 10, border: '1px solid #86efac' },
  checkCircle: { width: 22, height: 22, backgroundColor: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700, flexShrink: 0 },
  deptName: { fontSize: 13, fontWeight: 600, color: '#111827' },
  deptReason: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  primaryBadge: { fontSize: 10, fontWeight: 600, color: '#16a34a', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: 20, flexShrink: 0 },
  otherTitle: { fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 },
  deptRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 6, border: '1px solid', transition: 'all 0.15s' },
  checkbox: { width: 20, height: 20, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.15s' },
  centralBadge: { fontSize: 10, fontWeight: 700, color: '#2563eb', backgroundColor: '#dbeafe', padding: '2px 6px', borderRadius: 20 },
  centralWarning: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 14px', marginTop: 10 },
  centralWarningTitle: { fontSize: 13, fontWeight: 700, color: '#1d4ed8', marginBottom: 6 },
  centralWarningText: { fontSize: 12, color: '#1e40af', lineHeight: 1.6, margin: '0 0 8px' },
  cpgramsBtn: { display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#2563eb', backgroundColor: '#dbeafe', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' },
  summary: { marginTop: 10, padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: 6, fontSize: 13, color: '#166534', border: '1px solid #86efac' },
};

export default MultiDeptTagger;
