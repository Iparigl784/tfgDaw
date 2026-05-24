import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Card from '../UI/Card';
import StateSelect from './StateSelect';
import DateRange from './DateRange';
import styles from '../../pages/modules/FilterBar.module.css';

/**
 * Panel de filtros (estado + rango de fechas) que persiste en la query string.
 *
 * - Lee/escribe `estado`, `desde`, `hasta` y resetea `page` al aplicar.
 * - Las páginas leen esos mismos parámetros de la URL, por lo que los filtros
 *   se mantienen al paginar.
 *
 * Props: estados [{ value, label }]
 */
export default function FilterBar({ estados = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [estado, setEstado] = useState(searchParams.get('estado') || '');
  const [desde, setDesde] = useState(searchParams.get('desde') || '');
  const [hasta, setHasta] = useState(searchParams.get('hasta') || '');

  const aplicar = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key, value) => {
      if (value) next.set(key, value);
      else next.delete(key);
    };
    setOrDelete('estado', estado);
    setOrDelete('desde', desde);
    setOrDelete('hasta', hasta);
    next.set('page', '1'); // al filtrar, volvemos a la primera página
    setSearchParams(next);
  };

  const limpiar = () => {
    setEstado('');
    setDesde('');
    setHasta('');
    setSearchParams(new URLSearchParams());
  };

  const hayFiltros = estado || desde || hasta;

  return (
    <Card variant="outlined" className={styles.bar}>
      <form className={styles.grid} onSubmit={aplicar}>
        <StateSelect value={estado} onChange={setEstado} options={estados} />
        <DateRange
          desde={desde}
          hasta={hasta}
          onChange={({ desde: d, hasta: h }) => {
            setDesde(d);
            setHasta(h);
          }}
        />
        <div className={styles.actions}>
          <button type="submit" className="btn btn-primary">
            <Icon icon="mdi:filter-variant" width="18" /> Aplicar
          </button>
          {hayFiltros && (
            <button type="button" className="btn btn-secondary" onClick={limpiar}>
              <Icon icon="mdi:filter-remove-outline" width="18" /> Limpiar
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
