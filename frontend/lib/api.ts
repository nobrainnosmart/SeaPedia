import axios from 'axios';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('seapedia_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('seapedia_token');
      localStorage.removeItem('seapedia_user');
      window.location.href = '/auth/login';
    }

    // Global formatting for backend Zod validation error objects
    if (err.response?.data?.error && typeof err.response.data.error === 'object') {
      const errorObj = err.response.data.error;
      let formattedMsg = '';

      if (errorObj.fieldErrors && typeof errorObj.fieldErrors === 'object') {
        const errors = Object.entries(errorObj.fieldErrors)
          .map(([field, msgs]) => {
            const fieldMsgs = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
            return `${field}: ${fieldMsgs}`;
          })
          .join(' | ');
        if (errors) formattedMsg = errors;
      } else if (errorObj.formErrors && Array.isArray(errorObj.formErrors) && errorObj.formErrors.length > 0) {
        formattedMsg = errorObj.formErrors.join(', ');
      } else if (typeof errorObj.message === 'string') {
        formattedMsg = errorObj.message;
      }

      if (formattedMsg) {
        err.response.data.error = formattedMsg;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
