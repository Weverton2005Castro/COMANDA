import React from 'react';
export default function Toast({ toast, onClose }) {
  return (
    <button className={`toast toast-${toast.type}`} onClick={onClose} type="button">
      {toast.message}
    </button>
  );
}
