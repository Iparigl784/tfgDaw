import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import useFetch from '../../hooks/useFetch';
import endpoints from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import Pagination from '../../components/Common/Pagination';
import SearchInput from '../../components/Common/SearchInput';
import CrearUsuarioModal from '../../components/Users/CrearUsuarioModal';

/**
 * Listado de usuarios + acción "Crear usuario" (solo admin).
 *
 * El botón abre un modal con formulario (CrearUsuarioModal) que llama a
 * POST /api/register. Al crear correctamente se refresca la lista.
 */
export default function ListUsers() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [openCrear, setOpenCrear] = useState(false);

  const { data, meta, loading, error, refetch } = useFetch(endpoints.usuarios, {
    params: { page },
  });

  const usuarios = Array.isArray(data) ? data : [];
  const safeMeta = meta ?? {};

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return usuarios;
    return usuarios.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    );
  }, [usuarios, query]);

  return (
    <div className="stack">
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <div className="row" style={{ gap: 'var(--space-sm)' }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar usuarios…" />
          {/* Botón Crear usuario — solo visible para admin */}
          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setOpenCrear(true)}
            >
              <Icon icon="mdi:account-plus" width="18" /> Crear usuario
            </button>
          )}
        </div>
      </div>

      {loading && <LoadingSpinner label="Cargando usuarios…" />}

      {error && !error.isConnectionError && (
        <div className="error-banner">No se pudieron cargar los usuarios.</div>
      )}

      {!loading && !error && filtrados.length === 0 && (
        <div className="empty-state">No hay usuarios que coincidan con la búsqueda.</div>
      )}

      <div className="grid grid-cards">
        {filtrados.map((u) => (
          <Card
            key={u.id}
            interactive
            onClick={() => navigate(`/usuarios/${u.id}`, { state: { usuario: u } })}
          >
            <CardHeader>
              <div className="row">
                <Icon icon="mdi:account-circle" width="34" color="var(--color-primary)" />
                <strong>{u.name}</strong>
              </div>
              <span className={`badge ${u.rol === 'admin' ? 'badge-success' : ''}`}>
                {u.rol === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </CardHeader>
            <CardBody>
              <span>
                <Icon icon="mdi:email-outline" /> {u.email}
              </span>
            </CardBody>
          </Card>
        ))}
      </div>

      {!query && (
        <Pagination
          currentPage={safeMeta.current_page ?? page}
          lastPage={safeMeta.last_page ?? 1}
          onChange={setPage}
        />
      )}

      {/* Modal de creación (solo se renderiza si isAdmin abrió el botón) */}
      <CrearUsuarioModal
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        onCreated={() => {
          // Refrescar la lista para que aparezca el nuevo usuario.
          refetch();
        }}
      />
    </div>
  );
}
