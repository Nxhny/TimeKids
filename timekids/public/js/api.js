// public/js/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralised API client. All requests go through here.
// Automatically attaches the auth token from localStorage.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api';

function getToken() {
  return localStorage.getItem('tk_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status, data });
  }
  return data;
}

// Convenience wrappers
export const api = {
  get:    (path)         => request(path),
  post:   (path, body)   => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => request(path, { method: 'DELETE' }),

  // Multipart/form-data (no Content-Type header — browser sets boundary)
  postForm: async (path, formData) => {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST', body: formData, headers, credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Upload failed'), { data });
    return data;
  },
};

export default api;
