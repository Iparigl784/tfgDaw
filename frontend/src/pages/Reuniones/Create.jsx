import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';
import Card from '../../components/UI/Card';
import ReunionForm from '../../components/Forms/ReunionForm';

export default function ReunionCreate() {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleCreate = async (payload) => {
    setSaving(true);
    setErrors({});
    
    try {
      const res = await apiRequest(endpoints.reuniones, {
        method: 'POST',
        body: payload,
      });
      toast.success('Reunión creada correctamente.');
      const nueva = res?.data ?? res;
      if (nueva?.id) navigate(`/reuniones/${nueva.id}`);
      else navigate('/reuniones');
    } catch (err) {
      if (err.status === 422) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
        toast.error('Revisa los campos del formulario.');
      } else if (!err.isConnectionError) {
        toast.error('No se pudo crear la reunión.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 700, margin: '0 auto' }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
        <Icon icon="mdi:arrow-left" width="18" />
        Volver
      </button>
      <h1 className="page-title">Nueva reunión</h1>
      <Card>
        <ReunionForm
          errors={errors}
          loading={saving}
          onSubmit={handleCreate}
          onCancel={() => navigate('/reuniones')}
        />
      </Card>
    </div>
  );
}
