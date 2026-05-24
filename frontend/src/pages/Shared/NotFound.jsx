import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function NotFound() {
  return (
    <div className="empty-state stack" style={{ alignItems: 'center' }}>
      <Icon icon="mdi:compass-off-outline" width="56" color="var(--color-primary)" />
      <h1 className="page-title">Página no encontrada</h1>
      <p className="text-muted">La página que buscas no existe o ha sido movida.</p>
      <Link to="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
