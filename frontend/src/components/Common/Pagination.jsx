import { Icon } from '@iconify/react';
import styles from '../../pages/modules/Pagination.module.css';

/**
 * Paginación basada en Cards (sin tablas).
 * Props: currentPage, lastPage, onChange(page)
 * Compatible con la paginación de Laravel (meta.current_page / meta.last_page).
 */
export default function Pagination({ currentPage, lastPage, onChange }) {
  if (!lastPage || lastPage <= 1) return null;

  const prev = () => currentPage > 1 && onChange(currentPage - 1);
  const next = () => currentPage < lastPage && onChange(currentPage + 1);

  return (
    <nav className={styles.pagination} aria-label="Paginación">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={prev}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
      >
        <Icon icon="mdi:chevron-left" width="18" />
        Anterior
      </button>

      <span className={styles.info} aria-live="polite">
        Página {currentPage} de {lastPage}
      </span>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={next}
        disabled={currentPage >= lastPage}
        aria-label="Página siguiente"
      >
        Siguiente
        <Icon icon="mdi:chevron-right" width="18" />
      </button>
    </nav>
  );
}
