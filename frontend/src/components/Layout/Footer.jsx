import styles from '../../pages/modules/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className="text-muted">
          Meetng · Gestión de reuniones y encuestas · {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
