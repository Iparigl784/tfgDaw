import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import styles from '../modules/Auth.module.css';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = 'El formato del email no es válido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    else if (form.password.length < 4)
      e.password = 'La contraseña debe tener al menos 4 caracteres.';
    if (form.password !== form.password_confirmation)
      e.password_confirmation = 'Las contraseñas no coinciden.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Cuenta creada correctamente.');
      navigate('/', { replace: true });
    } catch (err) {
      if (err.status === 422) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
        toast.error('Revisa los campos del formulario.');
      } else if (!err.isConnectionError) {
        toast.error('No se pudo crear la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <Icon icon="mdi:account-plus" width="40" color="var(--color-primary)" />
          <h1 className="title-display">Crear cuenta</h1>
        </div>

        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              value={form.email}
              autoComplete="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'has-error' : ''}`}
              value={form.password}
              autoComplete="new-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password_confirmation">
              Repetir contraseña
            </label>
            <input
              id="password_confirmation"
              type="password"
              className={`form-input ${errors.password_confirmation ? 'has-error' : ''}`}
              value={form.password_confirmation}
              autoComplete="new-password"
              onChange={(e) =>
                setForm({ ...form, password_confirmation: e.target.value })
              }
            />
            {errors.password_confirmation && (
              <span className="form-error">{errors.password_confirmation}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creando…' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-muted mt-md">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </Card>
    </div>
  );
}
