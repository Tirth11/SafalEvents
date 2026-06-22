import React, { useState, useEffect } from 'react';
import { Camera, Upload, Trash2, X, Plus } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { mockStore } from '../utils/mockStore';

export default function PhotosTab({ event, currentUser, existingRsvp }) {
  const [photos, setPhotos] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploadUrl, setUploadUrl] = useState('');

  const loadPhotos = () => {
    const allPhotos = mockStore.getEventPhotos(event.id);
    
    // Guests only see APPROVED photos or their own. Host sees all.
    const isHost = currentUser && currentUser.email === event.hostEmail;
    
    if (isHost) {
      setPhotos(allPhotos);
    } else {
      setPhotos(allPhotos.filter(p => p.status === 'APPROVED' || (currentUser && p.uploaderEmail === currentUser.email)));
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [event.id, currentUser]);

  const canUpload = () => {
    if (!currentUser) return false;
    if (currentUser.email === event.hostEmail) return true;
    if (event.photoUploadPermission === 'guests' && existingRsvp && existingRsvp.status !== 'waitlist') return true;
    return false;
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadUrl.trim()) return;

    const isHost = currentUser && currentUser.email === event.hostEmail;
    const initialStatus = (isHost || !event.requirePhotoApproval) ? 'APPROVED' : 'PENDING';

    mockStore.uploadPhoto(event.id, {
      url: uploadUrl.trim(),
      caption: caption.trim(),
      uploaderName: currentUser?.name || 'Guest',
      uploaderEmail: currentUser?.email,
      uploaderRole: isHost ? 'host' : 'guest',
      status: initialStatus
    });

    setUploadUrl('');
    setCaption('');
    setShowUploadModal(false);
    loadPhotos();
    
    if (initialStatus === 'PENDING') {
      alert("Photo uploaded successfully! It is pending host approval.");
    }
  };

  const handleDelete = (photoId) => {
    if (window.confirm("Are you sure you want to delete this photo?")) {
      mockStore.deletePhoto(photoId);
      loadPhotos();
    }
  };

  return (
    <div className="flex flex-col gap-md animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>
          Event Photos
        </h3>
        {canUpload() && (
          <Button variant="outline" onClick={() => setShowUploadModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Camera size={16} /> Add Photos
          </Button>
        )}
      </div>

      {photos.length === 0 ? (
        <Card style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
          <Camera size={48} style={{ color: 'var(--color-border)', margin: '0 auto 16px' }} />
          <p className="text-muted">No photos have been added to this album yet.</p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {photos.map((photo, index) => (
            <div key={photo.id} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', aspectRatio: '1/1', cursor: 'pointer', background: 'var(--color-bg)' }}>
              <img 
                src={photo.url} 
                alt={photo.caption || 'Event photo'} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onClick={() => setLightboxIndex(index)}
              />
              
              {/* Overlay for Pending state */}
              {photo.status === 'PENDING' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>PENDING APPROVAL</span>
                </div>
              )}

              {/* Delete button for uploader or host */}
              {currentUser && (currentUser.email === event.hostEmail || currentUser.email === photo.uploaderEmail) && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Viewer */}
      {lightboxIndex !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <button 
            onClick={() => setLightboxIndex(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}
          >
            <X size={32} />
          </button>
          
          <img 
            src={photos[lightboxIndex].url} 
            alt={photos[lightboxIndex].caption}
            style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain' }}
          />
          
          <div style={{ color: 'white', marginTop: '16px', textAlign: 'center', maxWidth: '600px' }}>
            {photos[lightboxIndex].caption && <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{photos[lightboxIndex].caption}</p>}
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Added by {photos[lightboxIndex].uploaderName}</p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <Card className="animate-fade-in" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Upload Photo</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-sm">
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Image URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>For demo purposes, paste a direct image URL.</p>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>Caption (optional)</label>
                <input 
                  type="text" 
                  placeholder="Describe this moment..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }}
                />
              </div>

              <Button type="submit" variant="primary" style={{ marginTop: '8px' }}>
                {event.requirePhotoApproval && (!currentUser || currentUser.email !== event.hostEmail) ? 'Submit for Approval' : 'Upload'}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
