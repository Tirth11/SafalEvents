import React from 'react';
import { Ticket } from 'lucide-react';

export default function EventPassVisual({ style }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...style }}>
      <div style={{ width: '280px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.45)', transform: 'rotate(-2deg)' }}>
        {/* Ticket cover */}
        <div style={{ height: '110px', background: 'linear-gradient(135deg, #1a2744 0%, #2d4a80 100%)', display: 'flex', alignItems: 'flex-end', padding: '14px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', borderRadius: '0 0 0 100%', background: 'rgba(194,140,50,0.2)' }} />
          <div>
            <div style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#C28C32', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Ticket size={10} /> Event Pass
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', lineHeight: 1.2 }}>Startup Mixer Night</div>
          </div>
        </div>

        {/* Tear line */}
        <div style={{ borderTop: '2px dashed rgba(255,255,255,0.2)', background: 'white', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-12px', left: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: '#16305a' }} />
          <div style={{ position: 'absolute', top: '-12px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: '#16305a' }} />
        </div>

        {/* Ticket body */}
        <div style={{ background: 'white', padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Attendee</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>Alex Rivera</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>alex@example.com</div>
            </div>
            <span style={{ background: '#16a34a15', color: '#16a34a', fontSize: '0.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', textTransform: 'uppercase' }}>● Going</span>
          </div>

          {/* Miniature QR */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #e2e8f0' }}>
              <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: '80px', height: '80px', display: 'block' }}>
                <rect x="3" y="3" width="22" height="22" rx="2" fill="#1F3A63"/>
                <rect x="6" y="6" width="16" height="16" rx="1" fill="white"/>
                <rect x="9" y="9" width="10" height="10" rx="1" fill="#1F3A63"/>
                <rect x="55" y="3" width="22" height="22" rx="2" fill="#1F3A63"/>
                <rect x="58" y="6" width="16" height="16" rx="1" fill="white"/>
                <rect x="61" y="9" width="10" height="10" rx="1" fill="#1F3A63"/>
                <rect x="3" y="55" width="22" height="22" rx="2" fill="#1F3A63"/>
                <rect x="6" y="58" width="16" height="16" rx="1" fill="white"/>
                <rect x="9" y="61" width="10" height="10" rx="1" fill="#1F3A63"/>
                <rect x="29" y="29" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="36" y="29" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="43" y="29" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="29" y="36" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="43" y="36" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="36" y="43" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="29" y="43" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="55" y="29" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="62" y="29" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="55" y="36" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="68" y="36" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="62" y="43" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="29" y="55" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="36" y="55" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="43" y="62" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="29" y="62" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="36" y="68" width="5" height="5" rx="1" fill="#1F3A63"/>
                <rect x="43" y="55" width="5" height="5" rx="1" fill="#1F3A63"/>
              </svg>
            </div>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.62rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Show at door · #ALEX-001
          </div>
        </div>
      </div>
    </div>
  );
}
