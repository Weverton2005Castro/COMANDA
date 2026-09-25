import React from 'react';

export default function StampButton({ className = '', children, stamped = false, ...props }) {
  return <button className={`stamp-button ${stamped ? 'is-stamped' : ''} ${className}`.trim()} {...props}>{children}</button>;
}
