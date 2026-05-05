import React, { useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

export default function useConfirm() {
  const [dialog, setDialog] = useState(null);

  function confirm(options) {
    return new Promise((resolve) => {
      setDialog({
        title: options.title || 'Confirmar acao',
        message: options.message || 'Deseja continuar?',
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        }
      });
    });
  }

  const Confirm = () => (dialog ? <ConfirmDialog {...dialog} /> : null);
  return { confirm, Confirm };
}
