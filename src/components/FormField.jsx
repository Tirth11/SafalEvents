import React from 'react';

export default function FormField({
  label,
  hint,
  optional = true,
  children,
  className = '',
}) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {optional && <span className="form-optional">optional</span>}
        </label>
      )}
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}

export function FormInput({ className = '', ...props }) {
  return <input className={`form-input ${className}`} {...props} />;
}

export function FormTextarea({ className = '', ...props }) {
  return <textarea className={`form-textarea ${className}`} {...props} />;
}

export function FormSelect({ className = '', children, ...props }) {
  return (
    <select className={`form-select ${className}`} {...props}>
      {children}
    </select>
  );
}
