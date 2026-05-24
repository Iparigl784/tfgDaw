import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Card, { CardHeader, CardBody, CardFooter } from '../UI/Card';
import { formatFechaHora } from '../../utils/formatters';

/**
 * Card de invitación a REUNIÓN.
 *
 * Solo se muestra mientras `inv.estado === 'pendiente'`. Al confirmar/rechazar,
 * la lista padre se refresca y este componente desaparece.
 *
 * Props
 *   inv          item de /api/invitaciones (tipo="reunion")
 *   enProgreso   'confirmar' | 'rechazar' | undefined — deshabilita los botones
 *                mientras se procesa la respuesta (evita doble click).
 *   onResponder  callback(accion: 'confirmar'|'rechazar')
 */
export default function ReunionInvCard({ inv, enProgreso, onResponder }) {
  return (
    <Card>
      <CardHeader>
        <div className="row" style={{ minWidth: 0 }}>
          <Icon icon="mdi:calendar-account" width="22" color="var(--color-primary)" />
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
            <Icon icon="mdi:calendar-clock" /> {formatFechaHora(inv.fecha)}
          </span>
        )}
        {inv.usuario?.name && (
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            <Icon icon="mdi:account" /> De: {inv.usuario.name}
          </span>
        )}
      </CardBody>

      <CardFooter>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!!enProgreso}
          onClick={() => onResponder('confirmar')}
        >
          <Icon icon="mdi:check" width="16" />
          {enProgreso === 'confirmar' ? 'Confirmando…' : 'Confirmar'}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={!!enProgreso}
          onClick={() => onResponder('rechazar')}
        >
          <Icon icon="mdi:close" width="16" />
          {enProgreso === 'rechazar' ? 'Rechazando…' : 'Rechazar'}
        </button>
        <Link
          to={`/reuniones/${inv.recurso_id}`}
          className="btn btn-ghost btn-sm"
        >
          Ver <Icon icon="mdi:arrow-right" width="16" />
        </Link>
      </CardFooter>
    </Card>
  );
}
