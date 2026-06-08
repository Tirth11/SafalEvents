import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`glass-surface ${className}`} 
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-xl)',
        boxShadow: 'var(--shadow-md)',
      }}
      {...props}
    >
      {children}
    </div>
  );
}
