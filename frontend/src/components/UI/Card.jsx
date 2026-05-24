import styles from '../../pages/modules/Card.module.css';

/**
 * Card reutilizable — base del diseño (se evitan tablas).
 *
 * Props:
 *  - variant: 'default' | 'outlined' | 'action' | 'highlight' | 'selected'
 *  - as: etiqueta/elemento raíz ('div' por defecto, 'article', 'li', 'button'…)
 *  - onClick / interactive: hace la card accesible por teclado.
 */
export default function Card({
  children,
  variant = 'default',
  as: Tag = 'div',
  className = '',
  interactive = false,
  onClick,
  ...rest
}) {
  const isInteractive = interactive || typeof onClick === 'function';

  const classes = [
    styles.card,
    styles[variant] || '',
    isInteractive ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const interactiveProps = isInteractive
    ? {
        role: Tag === 'button' ? undefined : 'button',
        tabIndex: 0,
        onClick,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.(e);
          }
        },
      }
    : {};

  return (
    <Tag className={classes} {...interactiveProps} {...rest}>
      {children}
    </Tag>
  );
}

export function CardHeader({ children, className = '' }) {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }) {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }) {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
}