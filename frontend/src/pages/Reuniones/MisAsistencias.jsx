import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useFetch from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';
import { formatFechaHora, labelEstado } from '../../utils/formatters';

export default function MisAsistencias() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;

  const { data, meta, loading, error } = useFetch(endpoints.misAsistencias, {
    params: { page }
  });

  const reuniones = data || [];

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
  };

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Mis asistencias</h1>
      </div>

      {loading && <LoadingSpinner label="Cargando…" />}
      {error && !error.isConnectionError && (
        <div className="error-banner">No se pudieron cargar tus asistencias.</div>
      )}
      {!loading && !error && reuniones.length === 0 && (
        <div className="empty-state">No tienes asistencias confirmadas.</div>
      )}

      <div className="grid grid-cards">
        {reuniones.map((r) => (
          <Card key={r.id} interactive onClick={() => navigate(`/reuniones/${r.id}`)}>
            <CardHeader>
              <strong>{r.titulo}</strong>
              <span className="badge badge-success">{labelEstado(r.estado)}</span>
            </CardHeader>
            <CardBody>
              <span>
                <Icon icon="mdi:calendar-check" /> {formatFechaHora(r.fecha_inicio)}
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