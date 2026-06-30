import React, { useState, useEffect } from 'react';
import axios from 'axios';

// SMSAlertSettings.js
// Fixes Loophole 7: App-only notifications miss users who don't open the app
// SMS reaches ALL mobile users — even without smartphones or internet
// Particularly important for rural Tamil Nadu voters
//
// Usage in ProfilePage.js:
//   <SMSAlertSettings user={user} onUpdate={() => refetchUser()} />
//
// Backend: PUT /api/auth/sms-preferences (see backend patch)
// Uses MSG91 (Indian SMS provider, supports Tamil, ~₹0.15/SMS)

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const SMS_ALERT_TYPES = [
  {
    id: 'escalation',
    icon: '🔺',
    title: 'Issue Escalation',
    titleTa: 'பிரச்சனை மேல்முறையீடு',
    desc: 'When your issue escalates to a higher official',
    descTa: 'உங்கள் பிரச்சனை உயர் அதிகாரிகளுக்கு அனுப்பப்படும்போது',
    defaultOn: true,
    costPerMonth: '~₹1–5',
  },
  {
    id: 'resolution',
    icon: '✅',
    title: 'Issue Resolved',
    titleTa: 'பிரச்சனை தீர்க்கப்பட்டது',
    desc: 'When your issue is officially marked resolved',
    descTa: 'உங்கள் பிரச்சனை தீர்க்கப்பட்டதாக குறிக்கப்படும்போது',
    defaultOn: true,
    costPerMonth: '~₹1–3',
  },
  {
    id: 'milestone_100',
    icon: '🎯',
    title: '100 Supporters Reached',
    titleTa: '100 ஆதரவாளர்கள்',
    desc: 'When your issue crosses 100 supporters — serious issue status',
    descTa: '100 பேர் ஆதரிக்கும்போது — தீவிர பிரச்சனை அந்தஸ்து',
    defaultOn: true,
    costPerMonth: '~₹1–2',
  },
  {
    id: 'dispute_reopen',
    icon: '⚠️',
    title: 'Dispute Reopen Alert',
    titleTa: 'மீண்டும் திறக்கப்பட்டது',
    desc: 'When a resolved issue is disputed and reopened by citizens',
    descTa: 'தீர்க்கப்பட்ட பிரச்சனை மீண்டும் திறக்கப்படும்போது',
    defaultOn: true,
    costPerMonth: '~₹1',
  },
  {
    id: 'overdue',
    icon: '⏰',
    title: 'SLA Deadline Overdue',
    titleTa: 'காலக்கெடு தாண்டியது',
    desc: 'When the official\'s deadline passes without action',
    descTa: 'அதிகாரியின் காலக்கெடு நடவடிக்கை இல்லாமல் கடந்தால்',
    defaultOn: false,
    costPerMonth: '~₹2–6',
  },
  {
    id: 'district_weekly',
    icon: '📊',
    title: 'Weekly District Summary',
    titleTa: 'வாராந்திர மாவட்ட சுருக்கம்',
    desc: 'Weekly SMS summary of top issues in your district',
    descTa: 'உங்கள் மாவட்டத்தின் முக்கிய பிரச்சனைகளின் வாராந்திர SMS',
    defaultOn: false,
    costPerMonth: '~₹4 (4 SMSes)',
  },
];

const SMSAlertSettings = ({ user, onUpdate }) => {
  const [prefs, setPrefs] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [lang, setLang] = useState('en');

  useEffect(() => {
    if (user?.sms_preferences) {
      setSmsEnabled(user.sms_preferences.enabled || false);
      const prefMap = {};
      SMS_ALERT_TYPES.forEach(t => {
        prefMap[t.id] = user.sms_preferences[t.id] ?? t.defaultOn;
      });
      setPrefs(prefMap);
    } else {
      const defaults = {};
      SMS_ALERT_TYPES.forEach(t => { defaults[t.id] = t.defaultOn; });
      setPrefs(defaults);
    }
  }, [user]);

  const togglePref = (id) => setPrefs(p => ({ ...p, [id]: !p[id] }));

  const savePrefs = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${API_BASE}/api/auth/sms-preferences`,
        { enabled: smsEnabled, ...prefs },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (onUpdate) onUpdate();
    } catch (e) { alert('Failed to save preferences'); }
    setSaving(false);
  };

  const enabledCount = Object.values(prefs).filter(Boolean).length;
  const estimatedMonthly = smsEnabled ? enabledCount * 3 : 0; // rough estimate

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <div style={S.headerLeft}>
          <span style={{ fontSize: 24 }}>📱</span>
          <div>
            <div style={S.title}>SMS Alerts</div>
            <div style={S.subtitle}>
              Receive alerts on <strong>{user?.mobile}</strong> — works even without internet
            </div>
          </div>
        </div>
        {/* Master toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{smsEnabled ? 'ON' : 'OFF'}</span>
          <div
            onClick={() => setSmsEnabled(!smsEnabled)}
            style={{
              width: 48, height: 26, borderRadius: 99, cursor: 'pointer',
              backgroundColor: smsEnabled ? '#B91C1C' : '#e5e7eb',
              position: 'relative', transition: 'background 0.2s',
            }}
          >
            <div style={{
              position: 'absolute', top: 3, width: 20, height: 20,
              backgroundColor: '#fff', borderRadius: '50%',
              transition: 'transform 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transform: smsEnabled ? 'translateX(25px)' : 'translateX(3px)',
            }} />
          </div>
        </div>
      </div>

      {/* Language toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['en','ta'].map(l => (
          <button key={l} onClick={() => setLang(l)} style={{
            ...S.langBtn,
            backgroundColor: lang===l ? '#f3f4f6' : 'transparent',
            fontWeight: lang===l ? 700 : 400,
          }}>{l==='en' ? 'English Alerts' : 'தமிழில் SMS'}</button>
        ))}
      </div>

      {/* Alert type list */}
      <div style={{ opacity: smsEnabled ? 1 : 0.4, pointerEvents: smsEnabled ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
        {SMS_ALERT_TYPES.map(alert => (
          <div key={alert.id} style={{
            ...S.alertRow,
            backgroundColor: prefs[alert.id] ? '#fafafa' : '#fff',
            borderColor: prefs[alert.id] ? '#e5e7eb' : '#f3f4f6',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{alert.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {lang === 'ta' ? alert.titleTa : alert.title}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {lang === 'ta' ? alert.descTa : alert.desc}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                Est. cost: {alert.costPerMonth}/month
              </div>
            </div>
            <div
              onClick={() => togglePref(alert.id)}
              style={{
                width: 40, height: 22, borderRadius: 99, cursor: 'pointer',
                backgroundColor: prefs[alert.id] ? '#16a34a' : '#e5e7eb',
                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 2, width: 18, height: 18,
                backgroundColor: '#fff', borderRadius: '50%',
                transition: 'transform 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                transform: prefs[alert.id] ? 'translateX(20px)' : 'translateX(2px)',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Cost estimate */}
      {smsEnabled && (
        <div style={S.costBox}>
          <span style={{ fontSize: 13, color: '#374151' }}>
            📊 Estimated: <strong>{enabledCount} alert types enabled</strong> — approx <strong>₹{estimatedMonthly}–{estimatedMonthly * 3}/month</strong>
          </span>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            Powered by MSG91 · Tamil & English supported · Works on any mobile
          </div>
        </div>
      )}

      {/* Rural access note */}
      <div style={S.ruralNote}>
        <span style={{ fontSize: 16 }}>🌾</span>
        <div style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
          <strong>Why SMS matters for Tamil Nadu:</strong> Over 60% of rural voters in TN use feature phones or have limited internet access.
          SMS alerts ensure every citizen — not just smartphone users — stays informed about their issues.
        </div>
      </div>

      {/* Save button */}
      <button onClick={savePrefs} disabled={saving} style={S.saveBtn}>
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save SMS Preferences'}
      </button>
    </div>
  );
};

const S = {
  wrapper: { border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 20px', backgroundColor: '#fff', marginBottom: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  title: { fontSize: 16, fontWeight: 700, color: '#111827' },
  subtitle: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  langBtn: { padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 20, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' },
  alertRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderRadius: 8, border: '1px solid', marginBottom: 6, transition: 'all 0.15s' },
  costBox: { backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '10px 14px', marginTop: 12 },
  ruralNote: { display: 'flex', gap: 10, alignItems: 'flex-start', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', margin: '12px 0' },
  saveBtn: { width: '100%', padding: 12, fontSize: 14, fontWeight: 700, backgroundColor: '#B91C1C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' },
};

export default SMSAlertSettings;
