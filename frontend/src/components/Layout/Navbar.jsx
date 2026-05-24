import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../pages/modules/Navbar.module.css';

// Solo enlaces principales en la cabecera.
const mainLinks = [
  { to: '/', label: 'Inicio', icon: 'mdi:home-outline', end: true },
  { to: '/reuniones', label: 'Reuniones', icon: 'mdi:calendar-multiple' },
  { to: '/encuestas', label: 'Encuestas', icon: 'mdi:poll' },
];

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Cierra el submenú de perfil al hacer clic fuera o pulsar Escape.
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    const onKey = (e) => e.key === 'Escape' && setProfileOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    closeAll();
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link to="/" className={styles.brand} onClick={closeAll}>
          <img src="/logo.png" alt="Meetng" className={styles.logo} />
        </Link>

        <button
          type="button"
          className={styles.burger}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Icon icon={menuOpen ? 'mdi:close' : 'mdi:menu'} width="26" />
        </button>

        <nav
          className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`}
          aria-label="Navegación principal"
        >
          {isAuthenticated && (
            <div className={styles.navLinks}>
              {mainLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                  }
                  onClick={closeAll}
                >
                  <Icon icon={l.icon} width="18" />
                  {l.label}
                </NavLink>
              ))}
            </div>
          )}

          {isAuthenticated ? (
            <div className={styles.profile} ref={profileRef}>
              <button
                type="button"
                className={styles.profileTrigger}
                aria-haspopup="menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
              >
                <Icon icon="mdi:account-circle-outline" width="22" />
                <span>{user?.name || 'Perfil'}</span>
                <Icon icon="mdi:chevron-down" width="18" />
              </button>

              <div
                className={`${styles.profileMenu} ${profileOpen ? styles.profileMenuOpen : ''}`}
                role="menu"
              >
                <NavLink
                  to="/me"
                  role="menuitem"
                  className={styles.profileItem}
                  onClick={closeAll}
                >
                  <Icon icon="mdi:account-outline" width="18" />
                  Mi perfil
                </NavLink>

                <NavLink
                  to="/mis-invitaciones"
                  role="menuitem"
                  className={styles.profileItem}
                  onClick={closeAll}
                >
                  <Icon icon="mdi:email-receive-outline" width="18" />
                  Mis invitaciones
                </NavLink>

                {isAdmin && (
                  <NavLink
                    to="/usuarios"
                    role="menuitem"
                    className={styles.profileItem}
                    onClick={closeAll}
                  >
                    <Icon icon="mdi:account-cog-outline" width="18" />
                    Gestión de usuarios
                  </NavLink>
                )}

                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.profileItem} ${styles.signout}`}
                  onClick={handleLogout}
                >
                  <Icon icon="mdi:logout" width="18" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <NavLink to="/login" className={styles.navLink} onClick={closeAll}>
                Entrar
              </NavLink>
              <NavLink to="/register" className={styles.cta} onClick={closeAll}>
                Crear cuenta
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
