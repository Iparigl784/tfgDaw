import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { apiRequest } from '../../hooks/useFetch';
import endpoints from '../../services/api';

/**
 * Modal de creación de usuario.
 *
 * Endpoint utilizado: POST /api/register
 *   { name, email, password, password_confirmation }
 *
 * Props
 *   open         boolean – muestra/oculta el modal
 *   onClose      callback al cerrar (cancelar o tras éxito)
 *   onCreated    callback (user) tras crear correctamente (para refrescar lista)
 *
 * Validaciones cliente:
 *   - name: requerido, max 100
 *   - email: requerido, formato válido
 *   - password: requerido, min 8
 *   - password_confirmation: requerido, debe coincidir
 *
 * Errores backend (422): se mostrarán en los campos correspondientes.
 *
 * NO se inyecta el token resultante del registro en la sesión del admin: este
 * modal sirve para que el admin CREE usuarios, no para que cambie su propia
 * sesión. El backend devuelve `token` y `data` (user); aquí ignoramos `token`.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function CrearUsuarioModal({ open, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Resetear el formulario cuando se abre el modal (no acumular datos entre
  // aperturas sucesivas).
  useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
      setErrors({});
      setSaving(false);
    }
  }, [open]);

  // Cerrar con ESC para mejor UX teclado.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'El nombre es obligatorio.';
    if (!email.trim()) e.email = 'El email es obligatorio.';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Email no válido.';
    if (!password) e.password = 'La contraseña es obligatoria.';
    else if (password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (!passwordConfirm) e.password_confirmation = 'Repite la contraseña.';
    else if (password && password !== passwordConfirm)
      e.password_confirmation = 'Las contraseñas no coinciden.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await apiRequest(endpoints.register, {
        method: 'POST',
        body: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          password_confirmation: passwordConfirm,
        },
      });

      toast.success('Usuario creado correctamente.');
      // El endpoint /register devuelve { token, data: <user> } por convención
      // del proyecto; entregamos el `data` al padre.
      const user = res?.data ?? res;
      onCreated?.(user);
      onClose?.();
    } catch (err) {
      if (err.status === 422) {
        // Mapeo de errores Laravel: { errors: { campo: [msg] } } → { campo: msg }
        setErrors(
          Object.fromEntries(
            Object.entries(err.errors || {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        );
      } else if (!err.isConnectionError) {
        toast.error('No se pudo crear el usuario.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crear nuevo usuario"
      onClick={(e) => {
        // Cerrar al hacer click fuera del cuadro (solo en el overlay).
        if (e.target === e.currentTarget && !saving) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-md)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'var(--color-bg-card, #fff)',
          borderRadius: 'var(--radius-md)',
          maxWidth: 480,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 'var(--space-lg)',
          boxShadow: '0 10px 30px rgba(0,0,0,.25)',
        }}
      >
        <div
          className="row"
          style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}
        >
          <h2 className="page-title" style={{ fontSize: '1.25rem', margin: 0 }}>
            <Icon icon="mdi:account-plus" /> Crear usuario
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            className="btn btn-ghost btn-sm"
            disabled={saving}
            onClick={onClose}
          >
            <Icon icon="mdi:close" width="20" />
          </button>
        </div>

        <form className="form" onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="cu-name">
              Nombre *
            </label>
            <input
              id="cu-name"
              className={`form-input ${errors.name ? 'has-error' : ''}`}
              value={name}
              maxLength={100}
              autoFocus
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cu-email">
              Email *
            </label>
            <input
              id="cu-email"
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              value={email}
              maxLength={150}
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cu-pass">
              Contraseña *
            </label>
            <input
              id="cu-pass"
              type="password"
              className={`form-input ${errors.password ? 'has-error' : ''}`}
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cu-pass2">
              Repite la contraseña *
            </label>
            <input
              id="cu-pass2"
              type="password"
              className={`form-input ${errors.password_confirmation ? 'has-error' : ''}`}
              value={passwordConfirm}
              autoComplete="new-password"
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            {errors.password_confirmation && (
              <span className="form-error">{errors.password_confirmation}</span>
            )}
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 'var(--space-md)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
