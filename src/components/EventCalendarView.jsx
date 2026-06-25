import React, { useState } from 'react';
import Card from './Card';
import { ChartTitle } from './DashboardCharts';
import { Calendar as CalendarIcon, CheckCircle2, Clock, Activity, CalendarDays, X, Users, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_COLORS = {
  'Published': '#22c55e', // Green
  'Draft': '#eab308',     // Yellow
  'Ongoing': '#3b82f6',   // Blue
  'Completed': '#1e293b', // Navy / Dark Gray
  'Cancelled': '#ef4444'  // Red
};

// ----------------------------------------------------------------------------
// 1. KPI Cards Row
// ----------------------------------------------------------------------------
function CalendarKPICards() {
  const metrics = [
    { title: 'Upcoming Events', value: '32', icon: Clock },
    { title: 'Ongoing Events', value: '5', icon: Activity },
    { title: 'Completed Events', value: '87', icon: CheckCircle2 }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
      {metrics.map((m, i) => (
        <Card key={i} className="glass-surface" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'var(--color-surface-hover)', padding: '12px', borderRadius: '12px', color: 'var(--color-primary)' }}>
            <m.icon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{m.title}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{m.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 2. Events Per Day Mini Graph
// ----------------------------------------------------------------------------
function EventsVolumeChart() {
  const data = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 2 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 3 },
    { day: 'Fri', count: 8 },
    { day: 'Sat', count: 10 },
    { day: 'Sun', count: 5 }
  ];
  
  const max = Math.max(...data.map(d => d.count));

  return (
    <Card className="glass-surface" style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ChartTitle icon={Activity} title="Events Volume" subtitle="Weekly event frequency" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
        {data.map(d => (
          <div key={d.day} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '30px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{d.day}</div>
            <div style={{ flex: 1, height: '16px', background: 'var(--color-surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${(d.count / max) * 100}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '20px', fontSize: '0.8rem', fontWeight: 800, textAlign: 'right' }}>{d.count}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ----------------------------------------------------------------------------
// 3. Main Event Activity Calendar Component
// ----------------------------------------------------------------------------
export default function EventCalendarView({ onManageEvent }) {
  const [view, setView] = useState('monthly');
  const [selectedDay, setSelectedDay] = useState(null);

  // Mock Data
  const MOCK_MONTH = "June 2026";
  const MOCK_DATE_RANGE = "Monday, 22 Jun — Sunday, 28 Jun";
  const MOCK_DATE_DAILY = "Wednesday, 24 Jun 2026";

  const MOCK_EVENTS = {
    4: [{ title: 'Tech Meetup', status: 'Completed', time: '06:00 PM' }],
    8: [{ title: 'Startup Night', status: 'Published', time: '07:00 PM' }, { title: 'Product Demo', status: 'Completed', time: '02:00 PM' }],
    18: [{ title: 'Music Fest', status: 'Ongoing', time: '04:00 PM' }],
    22: [{ title: 'Webinar', status: 'Published', time: '09:00 AM' }],
    24: [
      { title: 'Product Launch', status: 'Published', time: '11:00 AM' },
      { title: 'Startup Meetup', status: 'Ongoing', time: '03:00 PM' },
      { title: 'Team Gathering', status: 'Draft', time: '05:00 PM' },
      { title: 'Networking Event', status: 'Published', time: '07:00 PM' },
      { title: 'Founder Dinner', status: 'Published', time: '09:00 PM' }
    ],
    28: [{ title: 'Networking Event', status: 'Draft', time: '07:00 PM' }]
  };

  const renderDailyView = () => {
    const events = MOCK_EVENTS[24] || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0' }}>{MOCK_DATE_DAILY}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px', background: 'var(--color-surface)', border: `1px solid var(--color-border)`, borderRadius: '8px', borderLeft: `4px solid ${STATUS_COLORS[e.status]}` }}>
              <div style={{ width: '80px', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{e.time}</div>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>{e.title}</div>
                  <div style={{ fontSize: '0.8rem', color: STATUS_COLORS[e.status], fontWeight: 600, display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: `${STATUS_COLORS[e.status]}15`, marginTop: '4px' }}>
                    {e.status}
                  </div>
                </div>
                {onManageEvent && (
                  <button onClick={() => onManageEvent(e.id || '1')} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Manage Event</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const days = [
      { date: '22 Jun', day: 'Mon', num: 22 },
      { date: '23 Jun', day: 'Tue', num: 23 },
      { date: '24 Jun', day: 'Wed', num: 24 },
      { date: '25 Jun', day: 'Thu', num: 25 },
      { date: '26 Jun', day: 'Fri', num: 26 },
      { date: '27 Jun', day: 'Sat', num: 27 },
      { date: '28 Jun', day: 'Sun', num: 28 }
    ];

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 20px 0', textAlign: 'center' }}>{MOCK_DATE_RANGE}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' }}>
          {days.map(d => {
            const evts = MOCK_EVENTS[d.num] || [];
            return (
              <div key={d.day} style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--color-surface)', padding: '12px 8px', borderRadius: '8px', border: '1px solid var(--color-border)', minHeight: '300px' }}>
                <div style={{ textAlign: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text)' }}>{d.day}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{d.date}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>{evts.length} Event{evts.length !== 1 && 's'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {evts.map((e, i) => (
                    <div key={i} style={{ background: `${STATUS_COLORS[e.status]}15`, color: STATUS_COLORS[e.status], padding: '6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.2 }}>
                      <div style={{ color: 'var(--color-text)', fontSize: '0.7rem', opacity: 0.7, marginBottom: '2px' }}>{e.time}</div>
                      {e.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    // 5 rows, 7 cols
    const daysInGrid = Array.from({ length: 35 }, (_, i) => i - 4); // start from previous month days
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{MOCK_MONTH}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ padding: '4px', background: 'var(--color-surface-hover)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
            <button style={{ padding: '4px', background: 'var(--color-surface-hover)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><ChevronRight size={16} /></button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} style={{ background: 'var(--color-surface-hover)', padding: '8px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              {day}
            </div>
          ))}
          
          {daysInGrid.map((dayNum, i) => {
            const isCurrentMonth = dayNum > 0 && dayNum <= 30;
            const evts = isCurrentMonth ? (MOCK_EVENTS[dayNum] || []) : [];
            const displayEvts = evts.slice(0, 2);
            const hasMore = evts.length > 2;

            return (
              <div key={i} style={{ background: 'var(--color-surface)', minHeight: '100px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', opacity: isCurrentMonth ? 1 : 0.4 }}>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, paddingRight: '4px', color: isCurrentMonth ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  {dayNum > 0 ? (dayNum <= 30 ? dayNum : dayNum - 30) : dayNum + 31}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {displayEvts.map((e, j) => (
                    <div 
                      key={j} 
                      onClick={() => setSelectedDay({ day: dayNum, events: evts })}
                      style={{ 
                        background: `${STATUS_COLORS[e.status]}15`, 
                        borderLeft: `3px solid ${STATUS_COLORS[e.status]}`,
                        padding: '4px', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        color: 'var(--color-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        cursor: 'pointer'
                      }}
                    >
                      {e.title}
                    </div>
                  ))}
                  {hasMore && (
                    <div 
                      onClick={() => setSelectedDay({ day: dayNum, events: evts })}
                      style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'center', cursor: 'pointer', padding: '2px', background: 'var(--color-surface-hover)', borderRadius: '4px' }}
                    >
                      +{evts.length - 2} More
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <CalendarKPICards />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
        {/* Main Calendar View */}
        <Card className="glass-surface" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
            <ChartTitle icon={CalendarIcon} title="Event Activity Calendar" subtitle="Schedule & status" />
            
            <div style={{ display: 'flex', background: 'var(--color-surface-hover)', borderRadius: '8px', padding: '4px' }}>
              {['daily', 'weekly', 'monthly'].map(t => (
                <button 
                  key={t}
                  onClick={() => setView(t)} 
                  style={{ 
                    border: 'none', 
                    background: view === t ? '#fff' : 'transparent', 
                    color: view === t ? 'var(--color-text)' : 'var(--color-text-muted)', 
                    padding: '6px 12px', 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    boxShadow: view === t ? 'var(--shadow-sm)' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative' }}>
            {view === 'daily' && renderDailyView()}
            {view === 'weekly' && renderWeeklyView()}
            {view === 'monthly' && renderMonthlyView()}

            {/* Modal Overlay for specific day */}
            {selectedDay && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
                <Card style={{ width: '400px', maxWidth: '90%', padding: '24px', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Events on Jun {selectedDay.day}</h3>
                    <button onClick={() => setSelectedDay(null)} style={{ background: 'var(--color-surface-hover)', border: 'none', padding: '6px', borderRadius: '50%', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedDay.events.map((e, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', borderLeft: `4px solid ${STATUS_COLORS[e.status]}` }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{e.time}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text)' }}>{e.title}</div>
                          <div style={{ fontSize: '0.75rem', color: STATUS_COLORS[e.status], fontWeight: 600, marginTop: '2px' }}>{e.status}</div>
                        </div>
                        {onManageEvent && (
                          <div style={{ marginLeft: 'auto' }}>
                            <button onClick={() => { setSelectedDay(null); onManageEvent(e.id || '1'); }} style={{ background: 'var(--color-primary)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Manage</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color }} />
                {status}
              </div>
            ))}
          </div>
        </Card>

        {/* Side Mini Graph */}
        <EventsVolumeChart />
      </div>
    </div>
  );
}
