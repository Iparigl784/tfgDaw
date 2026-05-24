import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Card, { CardHeader, CardBody, CardFooter } from '../UI/Card';
import { formatFechaHora } from '../../utils/formatters';

/**
 * Card de invitación a ENCUESTA.
 *
 * Solo se muestra mientras `inv.ha_votado === false`. Cuando el usuario vota,
 * la lista padre se refresca y este componente desaparece.
 *
 * Props
 *   inv  item de /api/invitaciones (tipo="encuesta")
 */
export default function EncuestaInvCard({ inv }) {
  return (
    <Card>
      <CardHeader>
        <div className="row" style={{ minWidth: 0 }}>
          <Icon icon="mdi:poll" width="22" color="var(--color-primary)" />
          <strong
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inv.titulo}
          </strong>
        </div>
        <span className="badge badge-warning">Pendiente</span>
      </CardHeader>

      <CardBody>
        {inv.fecha && (
          <span>
            <Icon icon="mdi:clock-outline" /> Fecha límite: {formatFechaHora(inv.fecha)}
          </span>
        )}
        {inv.usuario?.name && (
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            <Icon icon="mdi:account" /> De: {inv.usuario.name}
          </span>
        )}
      </CardBody>

      <CardFooter>
        <Link
          to={`/encuestas/${inv.recurso_id}`}
          className="btn btn-primary btn-sm"
        >
          <Icon icon="mdi:vote-outline" width="16" /> Ver / Votar
        </Link>
      </CardFooter>
    </Card>
  );
}
