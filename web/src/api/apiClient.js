const BASE_URL = '/api';

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object' && !isFormData) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
};

export const api = {
  get: (endpoint, options) => apiClient(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => apiClient(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => apiClient(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options) => apiClient(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options) => apiClient(endpoint, { method: 'DELETE', ...options }),
  upload: (endpoint, formData, options) => apiClient(endpoint, { method: 'POST', body: formData, ...options }),
};
