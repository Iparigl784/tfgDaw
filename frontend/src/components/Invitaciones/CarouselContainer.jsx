import Carousel from '../Common/Carousel';

/**
 * Contenedor de carrusel para INVITACIONES (encuestas/reuniones).
 *
 * - Si hay ≤ threshold items → grid normal de cards.
 * - Si hay > threshold       → carrusel horizontal con snap.
 *
 * Props
 *   items       array genérico
 *   renderItem  función (item) → JSX (la card que se renderiza por item)
 *   threshold   umbral (def. 3)
 */
export default function CarouselContainer({ items = [], renderItem, threshold = 3 }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  if (items.length <= threshold) {
    return (
      <div className="grid grid-cards">
        {items.map((item) => renderItem(item))}
      </div>
    );
  }

  return (
    <Carousel slideWidth={300} ariaLabel="Invitaciones">
      {items.map((item) => renderItem(item))}
    </Carousel>
  );
}
