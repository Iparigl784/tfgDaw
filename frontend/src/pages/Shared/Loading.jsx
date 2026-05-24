import { Icon } from '@iconify/react';

// Pantalla completa de carga.
export default function Loading({ mensaje = 'Cargando…' }) {
  return (
    <div className="fullscreen-center" role="status" aria-live="polite">
      <Icon icon="mdi:account-group" width="48" color="var(--color-primary)" />
      <span className="spinner" style={{ width: 40, height: 40 }} />
      <p className="text-muted">{mensaje}</p>
    </div>
  );
}
