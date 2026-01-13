// Global accessibility styles and utilities

export const a11yStyles = {
  // Видимый фокус для keyboard navigation
  focusVisible: {
    outline: '2px solid #4A90E2',
    outlineOffset: '2px',
    borderRadius: '4px',
  },
  
  // Скрытие фокуса для mouse users
  focusNotVisible: {
    outline: 'none',
  },
  
  // Screen reader only text
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    borderWidth: '0',
  },
  
  // Skip to main content link
  skipLink: {
    position: 'absolute' as const,
    top: '-40px',
    left: '0',
    background: '#4A90E2',
    color: 'white',
    padding: '8px 16px',
    textDecoration: 'none',
    zIndex: 100,
    ':focus': {
      top: '0',
    },
  },
};

// Utility to add focus-visible polyfill behavior
export const addFocusVisibleHandlers = (element: HTMLElement | null) => {
  if (!element) return;
  
  let hadKeyboardEvent = false;
  
  const handleKeyDown = () => {
    hadKeyboardEvent = true;
  };
  
  const handleMouseDown = () => {
    hadKeyboardEvent = false;
  };
  
  const handleFocus = () => {
    if (hadKeyboardEvent) {
      element.setAttribute('data-focus-visible', 'true');
    }
  };
  
  const handleBlur = () => {
    element.removeAttribute('data-focus-visible');
  };
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('mousedown', handleMouseDown);
  element.addEventListener('focus', handleFocus);
  element.addEventListener('blur', handleBlur);
  
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('mousedown', handleMouseDown);
    element.removeEventListener('focus', handleFocus);
    element.removeEventListener('blur', handleBlur);
  };
};
