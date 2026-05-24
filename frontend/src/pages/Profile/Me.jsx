import { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card, { CardHeader, CardBody } from '../../components/UI/Card';
import UserForm from '../../components/Forms/UserForm';

export default function Me() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  if (!user) return null;

  const handleSave = async (values) => {
    setSaving(true);
    setErrors({});
    try {
      await apiRequest(endpoints.usuario(user.id), {
        method: 'PUT',
        body: values,
      });
      await refreshUser();
      toast.success('Perfil actualizado correctamente.');
      setEditing(false);
    } catch (err) {
      if (err.status === 422) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      } else if (!err.isConnectionError) {
        toast.error('No se pudo actualizar el perfil.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 560, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Mi perfil</h1>
      </div>

      {editing ? (
        <Card>
          <UserForm
            initialValues={{ name: user.name, email: user.email }}
            errors={errors}
            loading={saving}
            onSubmit={handleSave}
            onCancel={() => {
              setEditing(false);
              setErrors({});
            }}
          />
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="row">
              <span
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#e7f0e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  icon="mdi:account"
                  width="32"
                  color="var(--color-primary)"
                />
              </span>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>{user.name}</h2>
                <span className="badge badge-success">
                  {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p>
              <Icon icon="mdi:email-outline" /> {user.email}
            </p>
          </CardBody>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setEditing(true)}
          >
            <Icon icon="mdi:pencil" width="18" />
            Editar perfil
          </button>
        </Card>
      )}
    </div>
  );
}
