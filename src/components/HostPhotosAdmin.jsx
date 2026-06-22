import React, { useState, useEffect } from 'react';
import { Camera, Check, X, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function HostPhotosAdmin({ eventId }) {
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'pending'

  const loadPhotos = () => {
    const allPhotos = mockStore.getEventPhotos(eventId);
    setPhotos(allPhotos);
  };

  useEffect(() => {
    loadPhotos();
  }, [eventId]);

  const handleApprove = (photoId) => {
    mockStore.updatePhotoStatus(photoId, 'APPROVED');
    loadPhotos();
  };

  const handleReject = (photoId) => {
    mockStore.updatePhotoStatus(photoId, 'REJECTED');
    loadPhotos();
  };

  const handleDelete = (photoId) => {
    if (window.confirm("Are you sure you want to delete this photo from the album?")) {
      mockStore.deletePhoto(photoId);
      loadPhotos();
    }
  };

  const pendingPhotos = photos.filter(p => p.status === 'PENDING');
  const approvedPhotos = photos.filter(p => p.status === 'APPROVED');

  return (
    <Card style={{ padding: '20px', textAlign: 'left' }} className="glass-surface">
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Album & Moderation</h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant={activeTab === 'approved' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('approved')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Gallery ({approvedPhotos.length})
          </Button>
          <Button 
            variant={activeTab === 'pending' ? 'primary' : 'outline'} 
            onClick={() => setActiveTab('pending')}
            style={{ padding: '6px 12px', fontSize: '0.8rem', position: 'relative' }}
          >
            Pending Queue ({pendingPhotos.length})
            {pendingPhotos.length > 0 && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>
                {pendingPhotos.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div>
          {pendingPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Camera size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
              <p className="text-muted">No photos pending approval.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {pendingPhotos.map(photo => (
                <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                  <img src={photo.url} alt="Pending" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                  <div style={{ padding: '12px' }}>
                    <p style={{ fontSize: '0.8rem', margin: '0 0 4px 0', fontWeight: 600 }}>By: {photo.uploaderName}</p>
                    {photo.caption && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 12px 0' }}>"{photo.caption}"</p>}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button variant="primary" style={{ flex: 1, padding: '6px 0', display: 'flex', justifyContent: 'center' }} onClick={() => handleApprove(photo.id)}>
                        <Check size={16} />
                      </Button>
                      <Button variant="outline" style={{ flex: 1, padding: '6px 0', display: 'flex', justifyContent: 'center', color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleReject(photo.id)}>
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'approved' && (
        <div>
          {approvedPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Camera size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 12px' }} />
              <p className="text-muted">No approved photos in the gallery.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {approvedPhotos.map(photo => (
                <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '1/1' }}>
                  <img src={photo.url} alt="Gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => handleDelete(photo.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
