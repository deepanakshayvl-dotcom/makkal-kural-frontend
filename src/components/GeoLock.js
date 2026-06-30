import React, { useState, useEffect } from 'react';

// GeoLock.js
// Fixes Loophole 2: Ward boundary redraws after elections orphan issues
// This component captures GPS coordinates when an issue is raised.
// Even if ward names change, issues stay geolocated and can be reassigned.
//
// Usage in RaiseIssuePage.js Step 1 (Location):
//   <GeoLock onLocationCaptured={(coords) => setFormData({...formData, gps_lat: coords.lat, gps_lng: coords.lng, gps_accuracy: coords.accuracy})} />
//
// Also add gps_lat, gps_lng, gps_accuracy to your IssueCreate model and issue_doc

const GeoLock = ({ onLocationCaptured, required = false }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error | denied
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [address, setAddress] = useState(null);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        setAccuracy(Math.round(accuracy));
        setStatus('success');
        if (onLocationCaptured) onLocationCaptured({ lat: latitude, lng: longitude, accuracy: Math.round(accuracy) });

        // Reverse geocode using OpenStreetMap Nominatim (free, no key needed)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'ta,en' } }
          );
          const data = await res.json();
          setAddress(data.display_name?.split(',').slice(0, 3).join(', '));
        } catch {
          setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
      },
      (err) => {
        if (err.code === 1) setStatus('denied');
        else setStatus('error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const statusConfig = {
    idle: {
      icon: '📍',
      text: 'Capture your location',
      subtext: required
        ? 'Required — GPS ensures your issue reaches the right official even if ward boundaries change'
        : 'Optional but recommended — protects your issue from ward boundary changes',
      btnText: 'Get My Location',
      btnColor: '#B91C1C',
      bg: '#fafafa',
      border: required ? '#fca5a5' : '#e5e7eb',
    },
    loading: {
      icon: '🔄',
      text: 'Getting your location...',
      subtext: 'Please allow location access when prompted',
      btnText: 'Locating...',
      btnColor: '#9ca3af',
      bg: '#fafafa',
      border: '#e5e7eb',
    },
    success: {
      icon: '✅',
      text: 'Location captured',
      subtext: address || 'GPS coordinates saved',
      btnText: 'Update Location',
      btnColor: '#16a34a',
      bg: '#f0fdf4',
      border: '#86efac',
    },
    error: {
      icon: '⚠️',
      text: 'Location unavailable',
      subtext: 'Could not get GPS signal. Try again or proceed without location.',
      btnText: 'Try Again',
      btnColor: '#ea580c',
      bg: '#fff7ed',
      border: '#fed7aa',
    },
    denied: {
      icon: '🔒',
      text: 'Location permission denied',
      subtext: 'Please allow location access in your browser settings, then try again.',
      btnText: 'Try Again',
      btnColor: '#dc2626',
      bg: '#fff1f2',
      border: '#fecdd3',
    },
  };

  const cfg = statusConfig[status];

  return (
    <div style={{
      border: `1px solid ${cfg.border}`,
      borderRadius: 10,
      padding: '14px 16px',
      backgroundColor: cfg.bg,
      marginBottom: 16,
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>{cfg.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 3 }}>
              {cfg.text}
              {required && <span style={{ fontSize: 11, color: '#dc2626', marginLeft: 6 }}>*Required</span>}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{cfg.subtext}</div>

            {/* Show GPS details on success */}
            {status === 'success' && coords && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={chip}>📐 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
                <span style={chip}>🎯 ±{accuracy}m accuracy</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={captureLocation}
          disabled={status === 'loading'}
          style={{
            padding: '8px 14px',
            backgroundColor: cfg.btnColor,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            opacity: status === 'loading' ? 0.7 : 1,
          }}
        >
          {cfg.btnText}
        </button>
      </div>

      {/* Why this matters — shown in idle/denied */}
      {(status === 'idle' || status === 'denied') && (
        <div style={{
          marginTop: 10,
          padding: '8px 12px',
          backgroundColor: '#fffbeb',
          borderRadius: 6,
          fontSize: 12,
          color: '#92400e',
          borderLeft: '3px solid #FACC15',
        }}>
          🗳️ <strong>Why GPS matters:</strong> Tamil Nadu ward boundaries are redrawn after elections.
          Without GPS, your issue may become unassigned. With GPS, it auto-reassigns to the correct new ward.
        </div>
      )}
    </div>
  );
};

const chip = {
  fontSize: 11,
  padding: '2px 8px',
  backgroundColor: '#dcfce7',
  color: '#166534',
  borderRadius: 20,
  fontWeight: 600,
};

export default GeoLock;
