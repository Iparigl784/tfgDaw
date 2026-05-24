import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useFetch from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
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

export default function MisReuniones() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;

  const apiParams = useMemo(
    () => ({
      page,
      estado: searchParams.get('estado') || undefined,
      desde: toMySQLDayStart(searchParams.get('desde')) || undefined,
      hasta: toMySQLDayEnd(searchParams.get('hasta')) || undefined,
    }),
    [searchParams, page]
  );

  const { data, meta, loading, error } = useFetch(endpoints.misReuniones, { params: apiParams });
  const reuniones = data || [];

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Mis reuniones</h1>
      </div>

      <FilterBar estados={ESTADOS} />

      {loading && <LoadingSpinner label="Cargando…" />}
      {error && !error.isConnectionError && (
        <div className="error-banner">No se pudieron cargar tus reuniones.</div>
      )}
      {!loading && !error && reuniones.length === 0 && (
        <div className="empty-state">No hay reuniones que coincidan con los filtros.</div>
      )}

      <div className="grid grid-cards">
        {reuniones.map((r) => (
          <Card key={r.id} interactive onClick={() => navigate(`/reuniones/${r.id}`)}>
            <CardHeader>
              <strong>{r.titulo}</strong>
              <span className={`badge ${estadoBadge(r.estado)}`}>{labelEstado(r.estado)}</span>
            </CardHeader>
            <CardBody>
              <span>
                <Icon icon="mdi:calendar-start" /> {formatFechaHora(r.fecha_inicio)}
              </span>
            </CardBody>
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