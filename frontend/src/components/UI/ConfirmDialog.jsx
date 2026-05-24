import { useEffect } from 'react';
import { Icon } from '@iconify/react';
import styles from '../../pages/modules/ConfirmDialog.module.css';

/**
 * Diálogo de confirmación accesible (modal).
 * Props: open, title, message, confirmLabel, cancelLabel, loading, onConfirm, onCancel, danger
 */
export default function ConfirmDialog({
  open,
  title = '¿Confirmar acción?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  danger = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className={styles.dialog}>
        <h2 id="confirm-title" className={styles.title}>
          <Icon icon={danger ? 'mdi:alert-circle-outline' : 'mdi:help-circle-outline'} />
          {title}
        </h2>
        {message ? <p className={styles.message}>{message}</p> : null}
        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
