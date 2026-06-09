import React, { useState, useEffect } from 'react';
import { 
  Building2, CheckCircle2, XCircle, FileText, UserCheck, UserX, 
  History, LogOut, Compass, Eye, Shield, Check, X, ArrowLeft, Mail, Phone, MapPin 
} from 'lucide-react';
import { mockStore } from '../utils/mockStore';
import Button from '../components/Button';
import Card from '../components/Card';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('pending'); // pending, all, logs
  const [users, setUsers] = useState([]);
  const [vlogs, setVlogs] = useState([]);
  const [rejectionHostId, setRejectionHostId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [documentPreview, setDocumentPreview] = useState(null); // File name

  const loadData = () => {
    setUsers(mockStore.getUsers());
    setVlogs(mockStore.getVerificationLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = (userId) => {
    mockStore.updateUserStatus(userId, 'ACTIVE');
    loadData();
    alert('Host registration approved successfully!');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;

    mockStore.updateUserStatus(rejectionHostId, 'REJECTED', rejectReason);
    setRejectionHostId(null);
    setRejectReason('');
    loadData();
    alert('Host registration rejected.');
  };

  const pendingHosts = users.filter(u => u.role === 'host' && u.status === 'PENDING_ADMIN_APPROVAL');
  const activeHosts = users.filter(u => u.role === 'host' && u.status === 'ACTIVE');
  const rejectedHosts = users.filter(u => u.role === 'host' && u.status === 'REJECTED');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Sidebar navigation */}
      <aside style={{
        width: '280px',
        background: 'white',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--spacing-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
          <img src="/logo.png" alt="SafalEvents" style={{ height: '40px', borderRadius: '6px' }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>Superadmin</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button 
            onClick={() => setActiveTab('pending')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'pending' ? 'rgba(79,70,229,0.06)' : 'transparent',
              color: activeTab === 'pending' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <Building2 size={18} /> Pending Approvals ({pendingHosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('all')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'all' ? 'rgba(79,70,229,0.06)' : 'transparent',
              color: activeTab === 'all' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <UserCheck size={18} /> Hosts Directory ({activeHosts.length})
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === 'logs' ? 'rgba(79,70,229,0.06)' : 'transparent',
              color: activeTab === 'logs' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <History size={18} /> Verification Audit Logs ({vlogs.length})
          </button>
        </nav>

        <button 
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--color-border)',
            background: 'none', color: 'var(--color-text-muted)',
            fontWeight: 600, cursor: 'pointer', marginTop: 'auto'
          }}
        >
          <LogOut size={18} /> Exit Admin Portal
        </button>
      </aside>

      {/* Main dashboard content */}
      <main style={{ flex: 1, padding: 'var(--spacing-lg) var(--spacing-xl)', overflowY: 'auto' }}>
        
        {/* --- PENDING APPLICATIONS VIEW --- */}
        {activeTab === 'pending' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Host Registration Approvals</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
              Verify organization registration details and approve accounts to allow event creations.
            </p>

            <div className="flex flex-col gap-md">
              {pendingHosts.length > 0 ? (
                pendingHosts.map(host => (
                  <Card key={host.id} style={{ padding: 'var(--spacing-md)' }} className="glass-surface">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                      <div className="flex flex-col gap-xs" style={{ textAlign: 'left' }}>
                        <div className="flex items-center gap-xs">
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(234,179,8,0.1)', color: '#ca8a04', padding: '2px 8px', borderRadius: '9999px' }}>
                            {host.hostType.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Registered: {new Date(host.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 style={{ fontSize: '1.25rem', margin: '4px 0 2px 0', fontWeight: 700 }}>{host.orgProfile?.orgName}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Compass size={14} /> Org Type: {host.orgProfile?.orgType} | Website: <a href={host.orgProfile?.website} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{host.orgProfile?.website || 'N/A'}</a>
                        </p>

                        <div className="grid-3" style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', margin: '10px 0', fontSize: '0.8rem' }}>
                          <div>
                            <strong>Contact Name:</strong><br />{host.name}
                          </div>
                          <div>
                            <strong>Email (Verified):</strong><br />{host.email}
                          </div>
                          <div>
                            <strong>Phone (Verified):</strong><br />{host.phone}
                          </div>
                        </div>

                        {host.orgProfile?.docs && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>ATTACHMENTS:</span>
                            {host.orgProfile.docs.map((doc, idx) => (
                              <button 
                                key={idx}
                                onClick={() => setDocumentPreview(doc)}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 600 }}
                              >
                                <FileText size={12} /> {doc} <Eye size={12} />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-sm">
                        <Button 
                          variant="ghost" 
                          onClick={() => setRejectionHostId(host.id)}
                          style={{ borderColor: '#ef4444', color: '#ef4444', padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <UserX size={16} /> Reject
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={() => handleApprove(host.id)}
                          style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <UserCheck size={16} /> Approve
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card style={{ padding: '48px', textAlign: 'center' }} className="glass-surface">
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginBottom: '16px' }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 6px 0', fontWeight: 600 }}>Applications Inbox Clear</h3>
                  <p className="text-muted" style={{ fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto' }}>
                    No pending host registration applications await review.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* --- ALL HOSTS DIRECTORY VIEW --- */}
        {activeTab === 'all' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Registered Hosts Directory</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>List of active and rejected host profiles on SafalEvents.</p>

            <Card style={{ padding: 0 }} className="glass-surface">
              {users.filter(u => u.role === 'host').length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Host Name / Org</th>
                        <th>Type</th>
                        <th>Contact Email</th>
                        <th>Contact Phone</th>
                        <th>Status</th>
                        <th>Reason (if rejected)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.role === 'host').map(host => (
                        <tr key={host.id}>
                          <td style={{ fontWeight: 600 }}>
                            {host.hostType === 'organization' ? host.orgProfile?.orgName : host.name}
                            {host.hostType === 'organization' && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Contact: {host.name}</div>}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                              {host.hostType}
                            </span>
                          </td>
                          <td>{host.email}</td>
                          <td>{host.phone}</td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600,
                              background: host.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : host.status === 'PENDING_ADMIN_APPROVAL' ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                              color: host.status === 'ACTIVE' ? '#22c55e' : host.status === 'PENDING_ADMIN_APPROVAL' ? '#ca8a04' : '#ef4444'
                            }}>
                              {host.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: '#dc2626', fontStyle: 'italic', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {host.rejectReason || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center' }} className="text-muted">
                  No hosts found in database.
                </div>
              )}
            </Card>
          </div>
        )}

        {/* --- VERIFICATION AUDIT LOGS VIEW --- */}
        {activeTab === 'logs' && (
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Security Verification Logs</h1>
            <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>Real-time security auditing history logs for multi-channel OTP attempts.</p>

            <Card style={{ padding: 0 }} className="glass-surface">
              {vlogs.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Target Info</th>
                        <th>OTP Type</th>
                        <th>Verification Status</th>
                        <th>IP Address</th>
                        <th>Device User Agent</th>
                        <th>Log Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vlogs.map(log => (
                        <tr key={log.id}>
                          <td style={{ fontSize: '0.8rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{log.targetEmail}</div>
                            {log.targetPhone && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.targetPhone}</div>}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px' }}>
                              {log.type}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.75rem', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600,
                              background: log.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: log.success ? '#22c55e' : '#ef4444'
                            }}>
                              {log.success ? 'SUCCESS' : 'FAILED'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{log.ip}</td>
                          <td style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{log.device}</td>
                          <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-muted" style={{ padding: '32px' }}>
                  No verification audit log entries recorded.
                </div>
              )}
            </Card>
          </div>
        )}

      </main>

      {/* REJECTION COMMENT MODAL */}
      {rejectionHostId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '450px',
            padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-lg)'
          }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }} className="flex items-center gap-xs">
                <UserX size={20} style={{ color: '#ef4444' }} /> Reject Application
              </h3>
              <button onClick={() => setRejectionHostId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleRejectSubmit} className="flex flex-col gap-md">
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '6px', fontWeight: 500 }}>Specify Rejection Reason *</label>
                <textarea 
                  required 
                  placeholder="e.g. Document upload proof is illegible or EIN matches another account." 
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--color-border)', fontFamily: 'inherit' }}
                ></textarea>
              </div>

              <div className="flex gap-sm justify-end" style={{ marginTop: '12px' }}>
                <Button variant="ghost" type="button" onClick={() => setRejectionHostId(null)}>Cancel</Button>
                <Button variant="primary" type="submit" style={{ background: '#ef4444', borderColor: '#ef4444' }}>Reject Registration</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {documentPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '600px',
            padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', gap: '16px'
          }}>
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }} className="flex items-center gap-xs">
                <FileText size={18} style={{ color: 'var(--color-primary)' }} /> Document Viewer
              </h3>
              <button onClick={() => setDocumentPreview(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Simulated document representation */}
            <div style={{
              background: '#f8fafc', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '32px 16px',
              textAlign: 'center', flex: 1, minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '12px'
            }}>
              <FileText size={48} style={{ color: 'var(--color-primary)', opacity: 0.8 }} />
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 600 }}>{documentPreview}</h4>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Simulated File Size: 1.4 MB | Upload Type: PDF/Document</p>
              </div>
              <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} /> Safe Verification Scan Passed
              </div>
            </div>

            <div className="flex justify-end" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <Button variant="ghost" onClick={() => setDocumentPreview(null)}>Close Preview</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
