import { css } from '../../styled-system/css';

// Card styles
export const cardStyles = {
  base: css({
    bg: 'white',
    rounded: '2xl',
    shadow: 'sm',
    border: '1px solid',
    borderColor: 'gray.100',
    p: '6',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    _hover: {
      shadow: 'lg',
      transform: 'translateY(-2px)',
      borderColor: 'gray.200'
    }
  }),

  elevated: css({
    bg: 'white',
    rounded: '2xl',
    shadow: 'lg',
    p: '6',
    position: 'relative',
    overflow: 'hidden'
  }),

  outlined: css({
    bg: 'white',
    rounded: '2xl',
    border: '2px solid',
    borderColor: 'gray.200',
    p: '6',
    position: 'relative',
    overflow: 'hidden'
  })
};

// Button styles
export const buttonStyles = {
  primary: css({
    bg: 'primary.700',
    color: 'white',
    px: '6',
    py: '3',
    rounded: 'xl',
    fontWeight: 'bold',
    fontSize: 'sm',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'primary.800',
      transform: 'translateY(-1px)',
      shadow: 'lg'
    },
    _disabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      transform: 'none'
    }
  }),

  secondary: css({
    bg: 'primary.100',
    color: 'primary.800',
    px: '6',
    py: '3',
    rounded: 'xl',
    fontWeight: 'medium',
    fontSize: 'sm',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'primary.200'
    }
  }),

  danger: css({
    bg: 'red.600',
    color: 'white',
    px: '4',
    py: '2',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'red.700'
    }
  }),

  outline: css({
    bg: 'transparent',
    color: 'primary.700',
    px: '4',
    py: '2',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    border: '1px solid',
    borderColor: 'primary.700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'primary.700',
      color: 'white'
    }
  })
};

// Form styles
export const formStyles = {
  input: css({
    w: 'full',
    px: '4',
    py: '3',
    border: '2px solid',
    borderColor: 'gray.200',
    rounded: 'xl',
    fontSize: 'sm',
    transition: 'all 0.2s',
    _focus: {
      outline: 'none',
      borderColor: 'primary.600',
      shadow: '0 0 0 3px rgba(127, 181, 130, 0.1)'
    },
    _placeholder: {
      color: 'gray.400'
    }
  }),

  label: css({
    display: 'block',
    fontSize: 'sm',
    fontWeight: 'bold',
    color: 'primary.700',
    mb: '2'
  }),

  textarea: css({
    w: 'full',
    px: '4',
    py: '3',
    border: '2px solid',
    borderColor: 'gray.200',
    rounded: 'xl',
    fontSize: 'sm',
    resize: 'vertical',
    transition: 'all 0.2s',
    _focus: {
      outline: 'none',
      borderColor: 'primary.600',
      shadow: '0 0 0 3px rgba(127, 181, 130, 0.1)'
    },
    _placeholder: {
      color: 'gray.400'
    }
  })
};

// Layout styles
export const layoutStyles = {
  container: css({
    maxW: '7xl',
    mx: 'auto',
    px: { base: '4', md: '8' }
  }),

  grid: css({
    display: 'grid',
    gridTemplateColumns: {
      base: '1fr',
      md: 'repeat(2, 1fr)',
      xl: 'repeat(3, 1fr)'
    },
    gap: '6',
    alignItems: 'start'
  }),

  flexCenter: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }),

  flexBetween: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  })
};

// Status styles
export const statusStyles = {
  success: css({
    bg: 'success.50',
    border: '1px solid',
    borderColor: 'success.500',
    color: 'success.700',
    p: '4',
    rounded: 'lg'
  }),

  error: css({
    bg: 'red.50',
    border: '1px solid',
    borderColor: 'red.200',
    color: 'red.800',
    p: '4',
    rounded: 'lg'
  }),

  warning: css({
    bg: 'yellow.50',
    border: '1px solid',
    borderColor: 'yellow.200',
    color: 'yellow.800',
    p: '4',
    rounded: 'lg'
  }),

  info: css({
    bg: 'primary.50',
    border: '1px solid',
    borderColor: 'primary.200',
    color: 'primary.800',
    p: '4',
    rounded: 'lg'
  })
};
