import { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react';

/**
 * Carrusel horizontal con scroll-snap.
 *
 * Hijos: cada child se renderiza como una slide (con width fijo via `slideWidth`).
 *
 * Props
 *   slideWidth   px / valor CSS de ancho de cada slide (def. 280)
 *   gap          gap entre slides (def. 'var(--space-md)')
 *   ariaLabel    label de accesibilidad para el contenedor
 *   showButtons  fuerza visibilidad de los botones (def. auto: visibles si scroll disponible)
 */
export default function Carousel({
  children,
  slideWidth = 280,
  gap = 'var(--space-md)',
  ariaLabel = 'Carrusel',
  showButtons,
}) {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Recalcular si se puede scrollear cuando cambia el contenido o el tamaño.
  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [children]);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  // Por defecto: solo mostramos botones si hay scroll posible.
  // showButtons puede forzarlo a true/false desde fuera.
  const visiblePrev = showButtons === undefined ? canPrev : showButtons && canPrev;
  const visibleNext = showButtons === undefined ? canNext : showButtons && canNext;

  // Estilos del botón flotante
  const arrowBtnStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 5,
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-card, #fff)',
    boxShadow: '0 2px 6px rgba(0,0,0,.12)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };

  return (
    <div style={{ position: 'relative' }} aria-label={ariaLabel}>
      {visiblePrev && (
        <button
          type="button"
          aria-label="Anterior"
          style={{ ...arrowBtnStyle, left: -8 }}
          onClick={() => scroll(-1)}
        >
          <Icon icon="mdi:chevron-left" width="22" />
        </button>
      )}

      <div
        ref={scrollerRef}
        style={{
          display: 'flex',
          gap,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'thin',
          paddingBottom: 'var(--space-xs)',
          // pequeño padding para que la sombra de la card no se recorte
          paddingTop: 2,
          paddingLeft: 2,
          paddingRight: 2,
        }}
      >
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div
                key={child?.key ?? i}
                style={{
                  flex: `0 0 ${typeof slideWidth === 'number' ? `${slideWidth}px` : slideWidth}`,
                  scrollSnapAlign: 'start',
                }}
              >
                {child}
              </div>
            ))
          : children}
      </div>

      {visibleNext && (
        <button
          type="button"
          aria-label="Siguiente"
          style={{ ...arrowBtnStyle, right: -8 }}
          onClick={() => scroll(1)}
        >
          <Icon icon="mdi:chevron-right" width="22" />
        </button>
      )}
    </div>
  );
}
