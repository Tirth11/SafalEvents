import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function RsvpFlow() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(`/e/${eventId}`);
  }, [eventId, navigate]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-text-muted)' }}>
      <p>Redirecting to event invitation...</p>
    </div>
  );
}

