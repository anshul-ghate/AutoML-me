interface EventProperties {
  [key: string]: string | number | boolean;
}

export const logPageview = () => {
  if (process.env.NODE_ENV === 'production' && window.plausible) {
    window.plausible('pageview');
  }
};

export const logEvent = (name: string, props?: EventProperties) => {
  if (process.env.NODE_ENV === 'production' && window.plausible) {
    window.plausible(name, { props });
  } else {
    // Development logging
    console.log(`📊 Analytics Event: ${name}`, props);
  }
};

// Enhanced error tracking
export const logError = (error: Error, context?: string) => {
  logEvent('error', {
    message: error.message,
    stack: error.stack?.substring(0, 500) || '',
    context: context || 'unknown',
    timestamp: new Date().toISOString()
  });
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`🚨 Error in ${context}:`, error);
  }
};

// Performance tracking
export const logPerformance = (name: string, duration: number, metadata?: EventProperties) => {
  logEvent('performance', {
    metric: name,
    duration,
    ...metadata
  });
};

// User interaction tracking
export const logUserAction = (action: string, details?: EventProperties) => {
  logEvent('user_action', {
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Extend window type for TypeScript
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: EventProperties }) => void;
  }
}
