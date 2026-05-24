import { Icon } from '@iconify/react';

/**
 * Pantalla de fallo de conexión con el backend / base de datos.
 * onRetry vuelve a intentar la operación que falló.
 */
export default function ConnectionError({ onRetry }) {
  return (
    <div className="fullscreen-center">
      <Icon icon="mdi:server-network-off" width="64" color="var(--color-danger)" />
      <h1 className="page-title">No se pudo conectar con el servidor</h1>
      <p className="text-muted" style={{ maxWidth: 460 }}>
        No hemos podido contactar con el backend de Meetng. Comprueba que el servidor está
        en marcha y que tu conexión funciona correctamente.
      </p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>
        <Icon icon="mdi:refresh" width="18" />
        Reintentar
      </button>
    </div>
  );
}
