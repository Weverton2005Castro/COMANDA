import React from 'react';
export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="actions end">
          <button className="btn secondary small" onClick={onCancel} type="button">
            cancelar
          </button>
          <button className="btn danger small" onClick={onConfirm} type="button">
            confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
