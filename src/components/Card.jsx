import React from 'react';

export default function Card({ children, className = '', compact = false, ...props }) {
  return (
    <div 
      className={`glass-surface ${compact ? 'card-compact' : ''} ${className}`} 
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: compact ? undefined : 'var(--spacing-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-border)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
