import React from 'react';
export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="actions end">
          <button className="btn secondary" onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="btn danger" onClick={onConfirm} type="button">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
