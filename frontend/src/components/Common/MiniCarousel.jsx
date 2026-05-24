import { Icon } from '@iconify/react';
import Carousel from './Carousel';

/**
 * Mini-carrusel para listas COMPACTAS de personas (asistentes, destinatarios).
 *
 * Props
 *   personas    array de { id, name, email, estado?, badgeClass? }
 *   threshold   umbral a partir del cual se usa carrusel (def. 3). Con N ≤ threshold
 *               se usa grid normal; con N > threshold se usa scroll horizontal.
 *   estadoLabel función opcional (estado) → texto
 */
export default function MiniCarousel({ personas = [], threshold = 3, estadoLabel }) {
  const usarCarrusel = personas.length > threshold;

  if (personas.length === 0) return null;

  if (!usarCarrusel) {
    // Grid normal para 1–3 personas.
    return (
      <div className="grid grid-cards">
        {personas.map((p) => (
          <PersonaCardCompact key={p.id} persona={p} estadoLabel={estadoLabel} />
        ))}
      </div>
    );
  }

  // Carrusel horizontal para >3 personas.
  return (
    <Carousel slideWidth={220} ariaLabel="Lista de personas">
      {personas.map((p) => (
        <PersonaCardCompact key={p.id} persona={p} estadoLabel={estadoLabel} />
      ))}
    </Carousel>
  );
}

/**
 * Tarjeta compacta — usada DENTRO del MiniCarousel.
 *
 * Si la persona trae un callback `onDelete`, se muestra un botón X pequeño
 * en la esquina (caso de uso: admin/creador eliminando asistente).
 */
function PersonaCardCompact({ persona, estadoLabel }) {
  const { name, email, estado, badgeClass, onDelete } = persona;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xs)',
        padding: 'var(--space-sm) var(--space-md)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-bg-card, #fff)',
        height: '100%',
        position: 'relative',
      }}
    >
      {onDelete && (
        <button
          type="button"
          aria-label={`Eliminar ${name || 'persona'}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover, #f0f0f0)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon icon="mdi:close" width="14" />
        </button>
      )}

      <div className="row" style={{ alignItems: 'center', gap: 'var(--space-xs)', paddingRight: onDelete ? 20 : 0 }}>
        <Icon icon="mdi:account-circle" width="26" color="var(--color-primary)" />
        <strong style={{ fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name || 'Sin nombre'}
        </strong>
      </div>

      {estado && (
        <span className={`badge ${badgeClass || ''}`} style={{ alignSelf: 'flex-start' }}>
          {estadoLabel ? estadoLabel(estado) : estado}
        </span>
      )}

      {email && (
        <span
          className="text-muted"
          style={{
            fontSize: '0.78rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {email}
        </span>
      )}
    </div>
  );
}
