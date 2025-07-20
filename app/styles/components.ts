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
    bg: 'gray.100',
    color: 'gray.700',
    px: '6',
    py: '3',
    rounded: 'xl',
    fontWeight: 'medium',
    fontSize: 'sm',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'gray.200'
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
    color: 'gray.600',
    px: '4',
    py: '2',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    border: '1px solid',
    borderColor: 'gray.300',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'gray.50',
      borderColor: 'gray.400'
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
    minH: '20',
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

// TODO Card styles
export const todoCardStyles = {
  base: css({
    p: '4',
    bg: 'white',
    rounded: 'lg',
    border: '1px solid',
    borderColor: 'gray.200',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out'
  }),

  completed: css({
    p: '4',
    bg: 'success.50',
    rounded: 'lg',
    border: '1px solid',
    borderColor: 'success.200',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out'
  }),

  completing: css({
    p: '4',
    bg: 'success.100',
    rounded: 'lg',
    border: '1px solid',
    borderColor: 'success.300',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
  }),

  link: css({
    flex: '1',
    textDecoration: 'none',
    color: 'inherit',
    _hover: { color: 'primary.600' }
  }),

  title: css({
    fontSize: 'lg',
    fontWeight: 'bold',
    color: 'primary.800',
    cursor: 'pointer'
  }),

  status: css({
    fontSize: 'sm',
    fontWeight: 'bold'
  }),

  completedStatus: css({
    fontSize: 'sm',
    fontWeight: 'bold',
    color: 'success.600'
  }),

  pendingStatus: css({
    fontSize: 'sm',
    fontWeight: 'bold',
    color: 'amber.600'
  }),

  date: css({
    fontSize: 'xs',
    color: 'gray.500',
    mt: '2'
  }),

  completeButton: css({
    px: '3',
    py: '1',
    bg: 'success.500',
    color: 'white',
    rounded: 'md',
    fontSize: 'xs',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    _hover: { bg: 'success.600' },
    _disabled: { bg: 'gray.300', cursor: 'not-allowed' },
    transition: 'all 0.2s'
  }),

  completedOverlay: css({
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    bg: 'success.500',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'lg',
    fontWeight: 'bold',
    animation: 'slideIn 0.5s ease-out',
    zIndex: '10'
  })
};

// Stat Card styles
export const statCardStyles = {
  base: css({
    bg: 'white',
    rounded: 'xl',
    p: '6',
    shadow: 'md',
    border: '1px solid',
    borderColor: 'gray.200',
    textAlign: 'center'
  }),

  value: css({
    fontSize: '3xl',
    fontWeight: 'bold',
    color: 'primary.800',
    mb: '2'
  }),

  label: css({
    fontSize: 'sm',
    color: 'primary.700'
  })
};

// Section styles
export const sectionStyles = {
  primary: css({
    bg: 'white',
    rounded: 'xl',
    p: '6',
    shadow: 'md',
    border: '1px solid',
    borderColor: 'gray.200'
  }),

  white: css({
    bg: 'white',
    rounded: 'xl',
    p: '6',
    shadow: 'md',
    border: '1px solid',
    borderColor: 'gray.200'
  }),

  title: css({
    fontSize: '2xl',
    fontWeight: 'bold',
    color: 'primary.800',
    mb: '4'
  }),

  emptyState: css({
    textAlign: 'center',
    py: '12',
    color: 'primary.600'
  })
};

// Follow button styles - 薄いデザイン
export const followButtonStyles = {
  base: css({
    px: '3',
    py: '1.5',
    rounded: 'full',
    fontSize: 'xs',
    fontWeight: 'medium',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5',
    _disabled: { 
      opacity: '0.5', 
      cursor: 'not-allowed' 
    }
  }),

  following: css({
    bg: 'gray.50',
    color: 'gray.600',
    border: '1px solid',
    borderColor: 'gray.200',
    _hover: { 
      bg: 'gray.100',
      borderColor: 'gray.300'
    }
  }),

  notFollowing: css({
    bg: 'primary.50',
    color: 'primary.700',
    border: '1px solid',
    borderColor: 'primary.200',
    _hover: { 
      bg: 'primary.100',
      borderColor: 'primary.300'
    }
  }),

  loading: css({
    bg: 'gray.50',
    color: 'gray.500',
    border: '1px solid',
    borderColor: 'gray.200'
  }),

  error: css({
    bg: 'red.50',
    color: 'red.600',
    border: '1px solid',
    borderColor: 'red.200',
    px: '3',
    py: '2',
    rounded: 'md',
    fontSize: 'xs'
  })
};

// AI TODO Suggestion styles
export const aiTodoSuggestionStyles = {
  container: css({
    spaceY: '4'
  }),

  modeToggle: css({
    display: 'flex',
    gap: '2',
    mb: '4'
  }),

  modeButton: css({
    px: '3',
    py: '2',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    cursor: 'pointer'
  }),

  modeButtonActive: css({
    bg: 'primary.600',
    color: 'white',
    _hover: { bg: 'primary.700' }
  }),

  modeButtonInactive: css({
    bg: 'gray.100',
    color: 'gray.700',
    _hover: { bg: 'gray.200' }
  }),

  form: css({
    spaceY: '4',
    p: '4',
    bg: 'gray.50',
    rounded: 'md',
    border: '1px solid',
    borderColor: 'gray.200'
  }),

  formTitle: css({
    fontSize: 'lg',
    fontWeight: 'bold',
    color: 'gray.800',
    mb: '3'
  }),

  resultContainer: css({
    mt: '4',
    p: '4',
    bg: 'success.50',
    border: '1px solid',
    borderColor: 'success.200',
    rounded: 'md'
  }),

  resultHeader: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    mb: '3'
  }),

  resultTitle: css({
    fontSize: 'lg',
    fontWeight: 'bold',
    color: 'success.800'
  }),

  actionButtons: css({
    display: 'flex',
    gap: '2'
  }),

  actionButton: css({
    px: '2',
    py: '1',
    rounded: 'sm',
    fontSize: 'xs',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    cursor: 'pointer'
  }),

  selectAllButton: css({
    bg: 'blue.100',
    color: 'blue.700',
    _hover: { bg: 'blue.200' }
  }),

  deselectAllButton: css({
    bg: 'gray.100',
    color: 'gray.700',
    _hover: { bg: 'gray.200' }
  }),

  stats: css({
    mb: '4',
    p: '3',
    bg: 'white',
    rounded: 'md',
    border: '1px solid',
    borderColor: 'success.200'
  }),

  statsContent: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 'sm',
    color: 'success.700'
  }),

  sectionsContainer: css({
    spaceY: '4',
    maxH: '96',
    overflowY: 'auto'
  }),

  section: css({
    border: '1px solid',
    borderColor: 'success.200',
    rounded: 'md',
    overflow: 'hidden'
  }),

  sectionHeader: css({
    p: '3',
    bg: 'success.100',
    borderBottom: '1px solid',
    borderColor: 'success.200',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer'
  }),

  sectionTitle: css({
    fontSize: 'md',
    fontWeight: 'bold',
    color: 'success.800'
  }),

  sectionInfo: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2'
  }),

  sectionCount: css({
    fontSize: 'xs',
    color: 'success.600'
  }),

  sectionArrow: css({
    fontSize: 'lg',
    color: 'success.600',
    transition: 'transform 0.2s'
  }),

  sectionContent: css({
    p: '3',
    bg: 'white',
    spaceY: '2'
  }),

  todoItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '3',
    p: '2',
    rounded: 'md',
    cursor: 'pointer',
    transition: 'all 0.2s'
  }),

  todoItemSelected: css({
    bg: 'success.50',
    border: '1px solid',
    borderColor: 'success.200'
  }),

  todoItemHover: css({
    _hover: { bg: 'success.50' }
  }),

  todoCheckbox: css({
    w: '4',
    h: '4',
    accentColor: 'success.600',
    cursor: 'pointer'
  }),

  todoContent: css({
    flex: '1',
    minW: '0'
  }),

  todoTask: css({
    fontSize: 'sm',
    color: 'gray.800',
    fontWeight: 'medium'
  }),

  todoMeta: css({
    display: 'flex',
    gap: '3',
    fontSize: 'xs',
    color: 'gray.500',
    mt: '1'
  }),

  todoPriority: css({
    color: 'red.600'
  }),

  todoPriorityMedium: css({
    color: 'orange.600'
  }),

  todoPriorityLow: css({
    color: 'blue.600'
  }),

  bottomActions: css({
    display: 'flex',
    gap: '3',
    mt: '4',
    pt: '3',
    borderTop: '1px solid',
    borderColor: 'success.200'
  }),

  addButton: css({
    px: '4',
    py: '2',
    bg: 'success.600',
    color: 'white',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    cursor: 'pointer',
    _hover: { bg: 'success.700' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' }
  }),

  addAllButton: css({
    px: '4',
    py: '2',
    bg: 'blue.600',
    color: 'white',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    cursor: 'pointer',
    _hover: { bg: 'blue.700' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' }
  }),

  cancelButton: css({
    px: '4',
    py: '2',
    bg: 'gray.500',
    color: 'white',
    rounded: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    _hover: { bg: 'gray.600' },
    _disabled: { opacity: 0.6, cursor: 'not-allowed' },
    transition: 'all 0.2s'
  })
};
