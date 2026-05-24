import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useFetch from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';
import FilterBar from '../../components/Filters/FilterBar';
import { formatFecha, labelEstado, toMySQLDayStart, toMySQLDayEnd } from '../../utils/formatters';

const ESTADOS = [
  { value: 'activa', label: 'Activa' },
  { value: 'expirada', label: 'Expirada' },
];

export default function MisEncuestas() {
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

  const { data, meta, loading, error } = useFetch(endpoints.misEncuestas, { params: apiParams });
  const encuestas = data || [];

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Mis encuestas</h1>
        <Link to="/encuestas/create" className="btn btn-primary">
          <Icon icon="mdi:plus" width="18" /> Nueva encuesta
        </Link>
      </div>

      <FilterBar estados={ESTADOS} />

      {loading && <LoadingSpinner label="Cargando…" />}
      {error && !error.isConnectionError && (
        <div className="error-banner">No se pudieron cargar tus encuestas.</div>
      )}
      {!loading && !error && encuestas.length === 0 && (
        <div className="empty-state">No hay encuestas que coincidan con los filtros.</div>
      )}

      <div className="grid grid-cards">
        {encuestas.map((e) => (
          <Card key={e.id} interactive onClick={() => navigate(`/encuestas/${e.id}`)}>
            <CardHeader>
              <strong>{e.titulo}</strong>
              <span className={`badge ${e.estado === 'activa' ? 'badge-success' : 'badge-danger'}`}>
                {labelEstado(e.estado)}
              </span>
            </CardHeader>
            <CardBody>
              {e.descripcion && <p>{e.descripcion}</p>}
              <span>
                <Icon icon="mdi:clock-outline" /> Hasta {formatFecha(e.fecha_limite)}
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