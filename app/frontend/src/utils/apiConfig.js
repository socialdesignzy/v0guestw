/**
 * Centralized API configuration
 * Use this in all components to get the correct API base URL
 */

export const getApiBaseUrl = () => {
  // Check for explicit environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Production fallback
  if (process.env.NODE_ENV === 'production') {
    return 'https://api.guestworker.app';
  }
  
  // Development fallback
  return `http://${window.location.hostname}:8000`;
};

export const getApiUrl = () => {
  return `${getApiBaseUrl()}/api`;
};

