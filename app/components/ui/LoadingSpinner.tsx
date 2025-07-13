import { css } from '../../../styled-system/css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = '読み込み中...',
  className 
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={css({
      textAlign: 'center',
      py: '16',
      px: '6'
    }, className)}>
      <div className={css({
        [sizeMap[size]]: true,
        border: '4px solid',
        borderColor: 'blue.200',
        borderTopColor: 'blue.600',
        rounded: 'full',
        animation: 'spin 1s linear infinite',
        mx: 'auto',
        mb: '4'
      })} />
      {text && (
        <p className={css({
          fontSize: 'lg',
          color: 'gray.600'
        })}>
          {text}
        </p>
      )}
    </div>
  );
} 