import Plausible from 'plausible-tracker';

// Initialize Plausible tracking
const plausible = Plausible({
  domain: process.env.REACT_APP_DOMAIN || 'localhost',
  apiHost: process.env.REACT_APP_PLAUSIBLE_HOST || 'https://plausible.io',
  trackLocalhost: process.env.NODE_ENV === 'development'
});

export const logPageview = () => {
  plausible.trackPageview();
};

export const logEvent = (eventName: string, props?: Record<string, any>) => {
  // Only track in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ANALYTICS_ENABLED === 'true') {
    plausible.trackEvent(eventName, {
      props: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...props
      }
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics Event: ${eventName}`, props);
  }
};

// Export the plausible instance for advanced usage
export { plausible };
