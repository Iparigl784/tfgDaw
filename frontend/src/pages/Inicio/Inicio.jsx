import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import styles from '../modules/Inicio.module.css';

export default function Inicio() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="stack">
      <div className="text-center">
        <h1 className="title-display">Hola, {user?.name || 'bienvenido'}</h1>
        <p className="text-muted">¿Qué quieres organizar hoy?</p>
      </div>

      <div className={styles.heroActions}>
        <Card
          variant="action"
          interactive
          onClick={() => navigate('/encuestas/create')}
          className={styles.heroCard}
          aria-label="Crear encuesta"
        >
          <span className={styles.heroIcon}>
            <Icon icon="mdi:poll" width="42" />
          </span>
          <h2>Crear Encuesta</h2>
          <p className="text-muted">
            Propón fechas u opciones y deja que los participantes voten.
          </p>
          <span className="btn btn-primary">
            Empezar
            <Icon icon="mdi:arrow-right" width="18" />
          </span>
        </Card>

        <Card
          variant="action"
          interactive
          onClick={() => navigate('/reuniones/create')}
          className={styles.heroCard}
          aria-label="Crear reunión"
        >
          <span className={styles.heroIcon}>
            <Icon icon="mdi:calendar-plus" width="42" />
          </span>
          <h2>Crear Reunión</h2>
          <p className="text-muted">
            Organiza una reunión, define lugar y fechas e invita a asistentes.
          </p>
          <span className="btn btn-primary">
            Empezar
            <Icon icon="mdi:arrow-right" width="18" />
          </span>
        </Card>
      </div>

      <div className={styles.quickLinks}>
        <Card interactive onClick={() => navigate('/mis-encuestas')}>
          <div className="row">
            <Icon icon="mdi:clipboard-list-outline" width="22" color="var(--color-primary)" />
            <strong>Mis encuestas</strong>
          </div>
        </Card>
        <Card interactive onClick={() => navigate('/mis-reuniones')}>
          <div className="row">
            <Icon icon="mdi:calendar-account" width="22" color="var(--color-primary)" />
            <strong>Mis reuniones</strong>
          </div>
        </Card>
        <Card interactive onClick={() => navigate('/mis-asistencias')}>
          <div className="row">
            <Icon icon="mdi:check-decagram-outline" width="22" color="var(--color-primary)" />
            <strong>Mis asistencias</strong>
          </div>
        </Card>
      </div>
    </div>
  );
}
