import React, { useState, useEffect } from 'react';
import Card from './Card';
import { MapPin, TrendingUp, PieChart, Trophy, Filter, Calendar as CalendarIcon, DollarSign, Users } from 'lucide-react';

// Brand palette
const NAVY = '#1F3A63';
const GOLD = '#C28C32';
const GREEN = '#00A152';
const RED = '#E03131';
const YELLOW = '#F59F00';
const BG = '#F7F6F2';

// ── Smooth Line helper ──
function smoothPath(pts) {
  if (!pts.length) return '';
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

const ChartTitle = ({ icon: Icon, title, subtitle, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
    <div style={{ 
      width: '40px', height: '40px', borderRadius: '10px', 
      background: color || 'var(--tint-primary-soft)', 
      color: color ? '#fff' : 'var(--color-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0
    }}>
      <Icon size={20} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-heading)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>{subtitle}</p>
    </div>
  </div>
);

// 1. Guest Geography Chart (Horizontal Bar)
export function GuestGeographyChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sampleData = data.length ? data : [
    { label: 'New York', value: 320 },
    { label: 'New Jersey', value: 150 },
    { label: 'Connecticut', value: 65 },
    { label: 'London', value: 28 },
    { label: 'Boston', value: 12 },
  ];

  const max = Math.max(1, ...sampleData.map(d => d.value));

  return (
    <Card className="glass-surface" style={{ padding: '24px' }}>
      <ChartTitle icon={MapPin} title="Guest Demographics" subtitle="Top regions across all events" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sampleData.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '100px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{d.label}</div>
            <div style={{ flex: 1, height: '12px', background: 'var(--color-surface-hover)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: mounted ? `${(d.value / max) * 100}%` : '0%', 
                background: i === 0 ? `linear-gradient(90deg, ${NAVY}, ${GOLD})` : NAVY,
                borderRadius: '6px',
                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>
            <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {d.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 2. Cumulative Earnings Growth Chart
export function EarningsGrowthChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);
  const [hover, setHover] = useState(null);
  const [timeframe, setTimeframe] = useState('6mo');
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sampleData = data.length ? data : timeframe === '30d' ? [
    { label: 'Week 1', value: 800 }, { label: 'Week 2', value: 1500 },
    { label: 'Week 3', value: 2100 }, { label: 'Week 4', value: 3200 }
  ] : timeframe === '1yr' ? [
    { label: 'Q1', value: 4500 }, { label: 'Q2', value: 9200 },
    { label: 'Q3', value: 15400 }, { label: 'Q4', value: 22100 }
  ] : [
    { label: 'Jan', value: 1200 }, { label: 'Feb', value: 2500 },
    { label: 'Mar', value: 3800 }, { label: 'Apr', value: 5100 },
    { label: 'May', value: 7200 }, { label: 'Jun', value: 10450 }
  ];

  const W = 600, H = 220, PX = 40, PT = 20, PB = 30;
  const max = Math.max(1000, ...sampleData.map((d) => d.value));
  const stepX = (W - 2 * PX) / (sampleData.length - 1 || 1);
  const pts = sampleData.map((d, i) => [PX + i * stepX, H - PB - (d.value / max) * (H - PT - PB)]);
  
  const line = smoothPath(pts);
  const area = pts.length ? `${line} L${pts[pts.length - 1][0]},${H - PB} L${pts[0][0]},${H - PB} Z` : '';

  return (
    <Card className="glass-surface" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <ChartTitle icon={TrendingUp} title="Earnings Growth" subtitle="Cumulative revenue over time" />
        <div style={{ display: 'flex', background: 'var(--color-surface-hover)', borderRadius: '8px', padding: '4px' }}>
          <button onClick={() => setTimeframe('30d')} style={{ border: 'none', background: timeframe === '30d' ? '#fff' : 'transparent', color: timeframe === '30d' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: timeframe === '30d' ? 'var(--shadow-sm)' : 'none' }}>30d</button>
          <button onClick={() => setTimeframe('6mo')} style={{ border: 'none', background: timeframe === '6mo' ? '#fff' : 'transparent', color: timeframe === '6mo' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: timeframe === '6mo' ? 'var(--shadow-sm)' : 'none' }}>6mo</button>
          <button onClick={() => setTimeframe('1yr')} style={{ border: 'none', background: timeframe === '1yr' ? '#fff' : 'transparent', color: timeframe === '1yr' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: timeframe === '1yr' ? 'var(--shadow-sm)' : 'none' }}>1yr</button>
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
              <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0, 0.5, 1].map((g) => {
            const y = H - PB - g * (H - PT - PB);
            return (
              <g key={g}>
                <line x1={PX} x2={W - PX} y1={y} y2={y} stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4" />
                <text x={PX - 10} y={y + 4} textAnchor="end" fontSize="10" fill="var(--color-text-muted)" fontWeight="600">
                  ${Math.round(max * g / 1000)}k
                </text>
              </g>
            );
          })}
          {/* Area & Line */}
          <path d={area} fill="url(#earnFill)" opacity={mounted ? 1 : 0} style={{ transition: 'opacity 1s ease' }} />
          <path d={line} fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            pathLength="1" strokeDasharray="1" strokeDashoffset={mounted ? 0 : 1} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
          
          {/* Points & Hover */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={hover === i ? 6 : 4} fill="#fff" stroke={hover === i ? NAVY : GOLD} strokeWidth="2.5"
                opacity={mounted ? 1 : 0} style={{ transition: 'all 0.2s ease' }} />
              <rect x={p[0] - stepX / 2} y={PT} width={stepX} height={H - PT - PB} fill="transparent" 
                onMouseEnter={() => setHover(i)} style={{ cursor: 'pointer' }} />
            </g>
          ))}
          {/* X Axis Labels */}
          {sampleData.map((d, i) => (
            <text key={i} x={pts[i][0]} y={H - 5} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)" fontWeight="600">{d.label}</text>
          ))}
        </svg>
        {/* Tooltip */}
        {hover !== null && (
          <div style={{
            position: 'absolute', left: `${(pts[hover][0] / W) * 100}%`, top: `${(pts[hover][1] / H) * 100}%`,
            transform: 'translate(-50%, -130%)', background: NAVY, color: '#fff', padding: '6px 12px', borderRadius: '8px',
            fontSize: '0.8rem', fontWeight: 700, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, whiteSpace: 'nowrap'
          }}>
            ${sampleData[hover].value.toLocaleString()}<span style={{ opacity: 0.7, fontWeight: 500 }}> • ${sampleData[hover].label}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// 3. Events Stacked Bar Chart
export function EventsStackedBarChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);
  const [timeframe, setTimeframe] = useState('monthly');
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sampleData = data.length ? data : timeframe === 'daily' ? [
    { label: 'Today', going: 12, maybe: 4, declined: 2 }
  ] : timeframe === 'weekly' ? [
    { label: 'This Week', going: 150, maybe: 30, declined: 10 },
    { label: 'Next Week', going: 80, maybe: 20, declined: 5 }
  ] : [
    { label: 'June', going: 320, maybe: 45, declined: 15 },
    { label: 'July', going: 450, maybe: 60, declined: 20 },
    { label: 'August', going: 210, maybe: 35, declined: 10 }
  ];

  const maxTotal = Math.max(1, ...sampleData.map(d => d.going + d.maybe + d.declined));

  return (
    <Card className="glass-surface" style={{ padding: '24px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <ChartTitle icon={PieChart} title="RSVP Overview" subtitle="Total RSVPs across events" />
        <div style={{ display: 'flex', background: 'var(--color-surface-hover)', borderRadius: '8px', padding: '4px' }}>
          <button onClick={() => setTimeframe('daily')} style={{ border: 'none', background: timeframe === 'daily' ? '#fff' : 'transparent', color: timeframe === 'daily' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: timeframe === 'daily' ? 'var(--shadow-sm)' : 'none' }}>Daily</button>
          <button onClick={() => setTimeframe('weekly')} style={{ border: 'none', background: timeframe === 'weekly' ? '#fff' : 'transparent', color: timeframe === 'weekly' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: timeframe === 'weekly' ? 'var(--shadow-sm)' : 'none' }}>Weekly</button>
          <button onClick={() => setTimeframe('monthly')} style={{ border: 'none', background: timeframe === 'monthly' ? '#fff' : 'transparent', color: timeframe === 'monthly' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: timeframe === 'monthly' ? 'var(--shadow-sm)' : 'none' }}>Monthly</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sampleData.map((d, i) => {
          const total = d.going + d.maybe + d.declined;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '80px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{d.label}</div>
              <div style={{ flex: 1, height: '24px', background: 'var(--color-surface-hover)', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ height: '100%', width: mounted ? `${(d.going / maxTotal) * 100}%` : '0%', background: GREEN, transition: 'width 1s ease' }} title={`Going: ${d.going}`} />
                <div style={{ height: '100%', width: mounted ? `${(d.maybe / maxTotal) * 100}%` : '0%', background: YELLOW, transition: 'width 1s ease' }} title={`Maybe: ${d.maybe}`} />
                <div style={{ height: '100%', width: mounted ? `${(d.declined / maxTotal) * 100}%` : '0%', background: RED, transition: 'width 1s ease' }} title={`Declined: ${d.declined}`} />
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
                {total}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', fontSize: '0.8rem', fontWeight: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, background: GREEN, borderRadius: 2 }}/> Going</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, background: YELLOW, borderRadius: 2 }}/> Maybe</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, background: RED, borderRadius: 2 }}/> Declined</div>
      </div>
    </Card>
  );
}


// 4. Top Performing Events
export function TopPerformingEventsChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);
  const [metric, setMetric] = useState('revenue');
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sampleData = data.length ? data : [
    { label: 'Summer Rooftop Mixer', revenue: 3200, guests: 140 },
    { label: 'Stand-up Comedy Night', revenue: 2100, guests: 180 },
    { label: 'Sunset Yoga Series', revenue: 800, guests: 40 },
    { label: 'Networking for HR', revenue: 350, guests: 25 },
  ];

  const rows = [...sampleData].sort((a, b) => b[metric] - a[metric]);
  const max = Math.max(1, ...rows.map(d => d[metric]));

  return (
    <Card className="glass-surface" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <ChartTitle icon={Trophy} title="Top Events" subtitle="Your most successful events" />
        <div style={{ display: 'flex', background: 'var(--color-surface-hover)', borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setMetric('revenue')}
            style={{ border: 'none', background: metric === 'revenue' ? '#fff' : 'transparent', color: metric === 'revenue' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: metric === 'revenue' ? 'var(--shadow-sm)' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          ><DollarSign size={12}/> Revenue</button>
          <button 
            onClick={() => setMetric('guests')}
            style={{ border: 'none', background: metric === 'guests' ? '#fff' : 'transparent', color: metric === 'guests' ? NAVY : 'var(--color-text-muted)', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', boxShadow: metric === 'guests' ? 'var(--shadow-sm)' : 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          ><Users size={12}/> Guests</button>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rows.map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{d.label}</span>
              <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                {metric === 'revenue' ? `$${d.revenue.toLocaleString()}` : `${d.guests} guests`}
              </span>
            </div>
            <div style={{ height: '14px', background: 'var(--color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: mounted ? `${(d[metric] / max) * 100}%` : '0%', 
                background: metric === 'revenue' ? GOLD : NAVY,
                borderRadius: '4px',
                transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 5. Conversion Funnel
export function ConversionFunnelChart({ data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const d = data || { views: 4500, rsvps: 1200, paid: 850, checkins: 620 };
  const stages = [
    { label: 'Event Page Views', value: d.views, color: 'var(--color-surface-hover)' },
    { label: 'RSVPs (Going)', value: d.rsvps, color: NAVY, warning: 'Drop-off here = Weak description/price' },
    { label: 'Paid Tickets', value: d.paid, color: GOLD },
    { label: 'Checked-In', value: d.checkins, color: GREEN, warning: 'Drop-off here = No-show problem' }
  ];
  const max = Math.max(1, d.views);

  return (
    <Card className="glass-surface" style={{ padding: '24px' }}>
      <ChartTitle icon={Filter} title="Conversion Funnel" subtitle="Where guests drop off (Last 30 Days)" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {stages.map((stage, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '130px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {stage.label}
            </div>
            <div style={{ flex: 1, height: '28px', background: i === 0 ? 'transparent' : 'var(--color-surface-hover)', borderRadius: '6px', position: 'relative' }}>
              <div style={{ 
                height: '100%', 
                width: mounted ? `${(stage.value / max) * 100}%` : '0%', 
                background: stage.color,
                borderRadius: '6px',
                transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
              }} />
              {stage.warning && mounted && (
                <div style={{ position: 'absolute', right: '-12px', top: '50%', transform: 'translate(100%, -50%)', whiteSpace: 'nowrap', fontSize: '0.7rem', color: '#E03131', background: '#FEE2E2', padding: '4px 8px', borderRadius: '12px', fontWeight: 600, animation: 'fadeIn 0.5s ease 1s both' }}>
                  ⚠️ {stage.warning}
                </div>
              )}
            </div>
            <div style={{ width: '50px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text)' }}>
              {stage.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 6. Day of Week Chart
export function DayOfWeekChart({ data = [] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const sampleData = data.length ? data : [
    { label: 'Mon', value: 20 },
    { label: 'Tue', value: 45 },
    { label: 'Wed', value: 80 },
    { label: 'Thu', value: 110 },
    { label: 'Fri', value: 190 },
    { label: 'Sat', value: 310 },
    { label: 'Sun', value: 150 },
  ];

  const max = Math.max(1, ...sampleData.map(d => d.value));

  return (
    <Card className="glass-surface" style={{ padding: '24px', height: '100%' }}>
      <ChartTitle icon={CalendarIcon} title="Successful Participation" subtitle="Avg. RSVPs by day" />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px' }}>
        {sampleData.map((d, i) => {
          const isMax = d.value === max;
          const h = (d.value / max) * 100;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '12%' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isMax ? GOLD : 'var(--color-text)' }}>
                {d.value} {isMax && '⭐'}
              </span>
              <div style={{ width: '100%', height: '130px', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{
                  width: '32px',
                  height: mounted ? `${h}%` : '0%',
                  background: isMax ? GOLD : NAVY,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 1s cubic-bezier(0.16, 1, 0.3, 1)'
                }} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
