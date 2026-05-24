import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import styles from '../modules/Auth.module.css';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      e.email = 'El formato del email no es válido.';
    if (!form.password) e.password = 'La contraseña es obligatoria.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('¡Bienvenido de nuevo!');
      // Volver a la ruta desde la que vino el usuario o a "/" por defecto
      const dest = location.state?.from?.pathname || '/';
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.status === 422) {
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])));
      } else if (err.status === 401) {
        toast.error(err.data?.message || 'Credenciales incorrectas.');
      } else if (!err.isConnectionError) {
        toast.error('No se pudo iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <Icon icon="mdi:account-group" width="40" color="var(--color-primary)" />
          <h1 className="title-display">Meetng</h1>
        </div>
        <p className="text-muted text-center">Inicia sesión para gestionar tus reuniones</p>

        <form className="form" onSubmit={onSubmit} noValidate>
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
              autoComplete="current-password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-muted mt-md">
          ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
        </p>
      </Card>
    </div>
  );
}
