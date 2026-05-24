import { Icon } from '@iconify/react';
import styles from '../../pages/modules/SearchInput.module.css';

/**
 * Campo de búsqueda controlado. Filtra en cliente o dispara onChange.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar…',
  ariaLabel = 'Buscar',
}) {
  return (
    <div className={styles.wrapper}>
      <Icon icon="mdi:magnify" className={styles.icon} width="20" />
      <input
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
        >
          <Icon icon="mdi:close" width="18" />
        </button>
      ) : null}
    </div>
  );
}
