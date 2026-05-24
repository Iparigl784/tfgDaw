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
import { useAuth } from '../../contexts/AuthContext';
import { formatFecha, labelEstado, toMySQLDayStart, toMySQLDayEnd } from '../../utils/formatters';

const ESTADOS = [
  { value: 'activa', label: 'Activa' },
  { value: 'cerrada', label: 'Cerrada' },
  { value: 'expirada', label: 'Expirada' },
];

export default function EncuestasList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

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

  const { data, meta, loading, error } = useFetch(endpoints.encuestas, { params: apiParams });
  const encuestas = data || [];

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return encuestas;
    return encuestas.filter(
      (e) => e.titulo?.toLowerCase().includes(q) || e.descripcion?.toLowerCase().includes(q)
    );
  }, [encuestas, query]);

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Encuestas</h1>
        <div className="row">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar encuestas…" />
          <Link to="/encuestas/create" className="btn btn-primary">
            <Icon icon="mdi:plus" width="18" /> Nueva encuesta
          </Link>
        </div>
      </div>

      <FilterBar estados={ESTADOS} />

      {loading && <LoadingSpinner label="Cargando encuestas…" />}

      {error && !error.isConnectionError && (
        <div className="error-banner">No se pudieron cargar las encuestas.</div>
      )}

      {!loading && !error && filtradas.length === 0 && (
        <div className="empty-state">No hay encuestas que coincidan con los filtros.</div>
      )}

      <div className="grid grid-cards">
        {filtradas.map((e) => {
          const miVoto = e.respuestas?.find((r) => r.user_id === user?.id);
          const opcionVotadaId = miVoto?.opcion_encuesta_id;

          return (
            <Card
              key={e.id}
              interactive
              variant={opcionVotadaId ? 'selected' : 'default'}
              onClick={() => navigate(`/encuestas/${e.id}`)}
            >
              <CardHeader>
                <strong>{e.titulo}</strong>
                <span
                  className={`badge ${e.estado === 'activa' ? 'badge-success' : 'badge-danger'}`}
                >
                  {labelEstado(e.estado)}
                </span>
              </CardHeader>
              <CardBody>
                {e.descripcion && <p>{e.descripcion}</p>}
                <span>
                  <Icon icon="mdi:clock-outline" /> Hasta {formatFecha(e.fecha_limite)}
                </span>
                {opcionVotadaId && (
                  <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>
                    Ya has votado
                  </span>
                )}
              </CardBody>
              <CardFooter>
                <span className="row text-muted" style={{ fontSize: '0.85rem' }}>
                  Ver y votar <Icon icon="mdi:arrow-right" width="16" />
                </span>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Pagination
        currentPage={meta?.current_page || 1}
        lastPage={meta?.last_page || 1}
        onChange={goToPage}
      />
    </div>
  );
}