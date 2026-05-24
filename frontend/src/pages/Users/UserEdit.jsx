import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card from '../../components/UI/Card';
import UserForm from '../../components/Forms/UserForm';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

// IDs de rol según RolSeeder (admin, user).
const ROL_IDS = { admin: 1, user: 2 };

export default function UserEdit() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(location.state?.usuario || null);
  const [loadingUser, setLoadingUser] = useState(!location.state?.usuario);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await apiRequest(endpoints.usuario(id));
        if (active) {
          setUsuario(res?.data ?? res);
        }
      } catch (err) {
        if (!err.isConnectionError) toast.error('No se pudo cargar el usuario.');
      } finally {
        if (active) setLoadingUser(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSave = async (values) => {
    setSaving(true);
    setErrors({});
    try {
      const res = await apiRequest(endpoints.usuario(id), { method: 'PUT', body: values });
      setUsuario(res?.data ?? res);
      toast.success('Usuario actualizado correctamente.');
    } catch (err) {
      if (err.status === 422) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      } else if (!err.isConnectionError) {
        toast.error('No se pudo actualizar el usuario.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRol = async (nuevoRol) => {
    try {
      await apiRequest(endpoints.usuarioRol(id), {
        method: 'PUT',
        body: { rol_id: ROL_IDS[nuevoRol] },
      });
      setUsuario((u) => ({ ...u, rol: { ...u.rol, slug: nuevoRol } }));
      toast.success('Rol actualizado correctamente.');
    } catch (err) {
      if (!err.isConnectionError) toast.error('No se pudo cambiar el rol.');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiRequest(endpoints.usuario(id), { method: 'DELETE' });
      toast.success('Usuario eliminado correctamente.');
      navigate('/usuarios');
    } catch (err) {
      if (!err.isConnectionError) toast.error('No se pudo eliminar el usuario.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loadingUser) return <LoadingSpinner label="Cargando usuario…" />;
  if (!usuario) return <div className="empty-state">Usuario no encontrado.</div>;

  return (
    <div className="stack" style={{ maxWidth: 560, margin: '0 auto' }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/usuarios')}>
        <Icon icon="mdi:arrow-left" width="18" />
        Volver
      </button>

      <div className="page-header">
        <h1 className="page-title">Editar usuario</h1>
        <span className={`badge ${usuario.rol?.slug === 'admin' ? 'badge-success' : ''}`}>
          {usuario.rol?.nombre}
        </span>
      </div>

      <Card>
        <UserForm
          initialValues={{ name: usuario.name, email: usuario.email }}
          errors={errors}
          loading={saving}
          onSubmit={handleSave}
        />
      </Card>

      <Card>
        <h2 style={{ fontSize: '1.1rem' }}>Rol</h2>
        <p className="text-muted">Cambia los permisos de este usuario.</p>
        <div className="row">
          <button
            type="button"
            className={`btn ${usuario.rol === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRol('admin')}
            disabled={usuario.rol === 'admin'}
          >
            Administrador
          </button>
          <button
            type="button"
            className={`btn ${usuario.rol === 'user' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleRol('user')}
            disabled={usuario.rol === 'user'}
          >
            Usuario
          </button>
        </div>
      </Card>

      <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
          <Icon icon="mdi:trash-can-outline" width="18" />
          Eliminar usuario
      </button>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Eliminar usuario"
        message={`¿Seguro que quieres eliminar a ${usuario.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
