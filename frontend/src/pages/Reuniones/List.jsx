import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useFetch from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card, { CardHeader, CardBody, CardFooter } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import SearchInput from '../../components/Common/SearchInput';
import Pagination from '../../components/Common/Pagination';
import FilterBar from '../../components/Filters/FilterBar';
import { formatFechaHora, labelEstado, toMySQLDayStart, toMySQLDayEnd } from '../../utils/formatters';

const ESTADOS = [
  { value: 'pendiente_encuesta', label: 'Pendiente de encuesta' },
  { value: 'programada', label: 'Programada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'realizada', label: 'Realizada' },
];

const estadoBadge = (estado) => {
  if (estado === 'programada') return 'badge-success';
  if (estado === 'cancelada') return 'badge-danger';
  if (estado === 'realizada') return 'badge-info';
  return 'badge-warning';
};

export default function ReunionesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const page = Number(searchParams.get('page')) || 1;

  // Filtros desde la URL → params de la API (fechas en formato MySQL).
  const apiParams = useMemo(
    () => ({
      page,
      estado: searchParams.get('estado') || undefined,
      desde: toMySQLDayStart(searchParams.get('desde')) || undefined,
      hasta: toMySQLDayEnd(searchParams.get('hasta')) || undefined,
    }),
    [searchParams, page]
  );

  const { data, meta, loading, error } = useFetch(endpoints.reuniones, { params: apiParams });
  const reuniones = data || [];

  // Búsqueda local
  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reuniones;
    return reuniones.filter((r) => r.titulo?.toLowerCase().includes(q));
  }, [reuniones, query]);

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Reuniones</h1>
        <div className="row">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar reuniones…" />
          <Link to="/reuniones/create" className="btn btn-primary">
            <Icon icon="mdi:plus" width="18" /> Nueva reunión
          </Link>
        </div>
      </div>

      <FilterBar estados={ESTADOS} />

      {loading && <LoadingSpinner label="Cargando reuniones…" />}

      {error && !error.isConnectionError && (
        <div className="error-banner">No se pudieron cargar las reuniones.</div>
      )}

      {!loading && !error && filtradas.length === 0 && (
        <div className="empty-state">No hay reuniones que coincidan con los filtros.</div>
      )}

      <div className="grid grid-cards">
        {filtradas.map((r) => (
          <Card key={r.id} interactive onClick={() => navigate(`/reuniones/${r.id}`)}>
            <CardHeader>
              <strong>{r.titulo}</strong>
              <span className={`badge ${estadoBadge(r.estado)}`}>{labelEstado(r.estado)}</span>
            </CardHeader>
            <CardBody>
              <span>
                <Icon icon="mdi:calendar-start" /> {formatFechaHora(r.fecha_inicio)}
              </span>
              <span>
                <Icon icon="mdi:calendar-end" /> {formatFechaHora(r.fecha_fin)}
              </span>
            </CardBody>
            <CardFooter>
              <span className="row text-muted" style={{ fontSize: '0.85rem' }}>
                Ver detalle <Icon icon="mdi:arrow-right" width="16" />
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={meta?.current_page || 1}
        lastPage={meta?.last_page || 1}
        onChange={goToPage}
      />
    </div>
  );
}