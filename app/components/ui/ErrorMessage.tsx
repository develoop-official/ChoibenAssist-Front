import { css } from '../../../styled-system/css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning';
  actions?: React.ReactNode;
  className?: string;
}

export default function ErrorMessage({ 
  title = 'エラーが発生しました',
  message,
  type = 'error',
  actions,
  className 
}: ErrorMessageProps) {
  const colorScheme = type === 'error' ? 'red' : 'yellow';

  return (
    <div className={css({
      textAlign: 'center',
      py: '16',
      px: '6'
    }, className)}>
      <div className={css({
        p: '6',
        bg: `${colorScheme}.50`,
        border: '1px solid',
        borderColor: `${colorScheme}.200`,
        rounded: 'lg',
        maxW: 'md',
        mx: 'auto'
      })}>
        <div className={css({
          w: '12',
          h: '12',
          bg: `${colorScheme}.100`,
          rounded: 'full',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: '4'
        })}>
          <span className={css({
            fontSize: 'xl'
          })}>
            {type === 'error' ? '❌' : '⚠️'}
          </span>
        </div>
        <h3 className={css({
          fontSize: 'lg',
          fontWeight: 'bold',
          color: `${colorScheme}.800`,
          mb: '2'
        })}>
          {title}
        </h3>
        <p className={css({
          fontSize: 'sm',
          color: `${colorScheme}.700`,
          mb: '4',
          lineHeight: 'relaxed'
        })}>
          {message}
        </p>
        {actions && (
          <div className={css({
            display: 'flex',
            gap: '3',
            justifyContent: 'center'
          })}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
} 