// public/js/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralised API client with:
//   • Auto token-refresh on 401 (re-reads cookie, retries once)
//   • Rate-limit (429) feedback with countdown
//   • Network-offline detection
//   • Retry on transient 503
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api';

function getToken() {
  return localStorage.getItem('tk_token');
}

let _isRefreshing  = false;
let _refreshQueue  = [];

/** Show a rate-limit toast with countdown */
function showRateLimitToast(retryAfterSec) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  const id    = 'rate-limit-toast';
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  let secs = retryAfterSec || 60;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = 'toast warning';
  toast.style.cssText = 'pointer-events:auto;min-width:260px;';
  toast.innerHTML = `<span>⏳</span> Too many requests — wait <strong id="${id}-count">${secs}s</strong>`;
  toastContainer.appendChild(toast);

  const interval = setInterval(() => {
    secs--;
    const el = document.getElementById(`${id}-count`);
    if (el) el.textContent = `${secs}s`;
    if (secs <= 0) { clearInterval(interval); toast.remove(); }
  }, 1000);
}

/** Core fetch wrapper */
async function request(path, options = {}, _retry = false) {
  // Offline check
  if (!navigator.onLine) {
    throw Object.assign(new Error('You are offline. Check your connection.'), { status: 0, offline: true });
  }

  const token   = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers, credentials: 'include' });
  } catch (netErr) {
    throw Object.assign(new Error('Network error — server unreachable.'), { status: 0, network: true });
  }

  // ── 429 Rate limited ────────────────────────────────────────────────────
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('Retry-After') || '60');
    showRateLimitToast(retryAfter);
    throw Object.assign(new Error('Too many requests. Please wait a moment.'), { status: 429 });
  }

  // ── 401 — session expired, try once to refresh via cookie ───────────────
  if (res.status === 401 && !_retry && !path.includes('/auth/login')) {
    // If another refresh is already in flight, queue this request
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject, path, options });
      });
    }

    _isRefreshing = true;
    try {
      // Server may have refreshed the token via the httpOnly refresh cookie
      // Just retry once — if that also fails, redirect to login
      const retried = await request(path, options, true);
      _refreshQueue.forEach(({ resolve, path: p, options: o }) =>
        request(p, o, true).then(resolve).catch(resolve)
      );
      return retried;
    } catch {
      // Truly expired — clear local state and redirect
      localStorage.removeItem('tk_token');
      localStorage.removeItem('tk_user');
      // Small delay so any current toast is visible
      setTimeout(() => { window.location.href = '/login'; }, 600);
      throw Object.assign(new Error('Session expired. Redirecting to login…'), { status: 401 });
    } finally {
      _isRefreshing = false;
      _refreshQueue = [];
    }
  }

  // ── 503 — retry once after 1s ────────────────────────────────────────────
  if (res.status === 503 && !_retry) {
    await new Promise(r => setTimeout(r, 1000));
    return request(path, options, true);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(
      new Error(data.error || `Request failed (${res.status})`),
      { status: res.status, data }
    );
  }
  return data;
}

// ── Convenience wrappers ───────────────────────────────────────────────────

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),

  /** Multipart upload — browser sets the correct Content-Type boundary */
  postForm: async (path, formData) => {
    if (!navigator.onLine) throw new Error('You are offline.');
    const token   = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
      res = await fetch(`${BASE}${path}`, { method: 'POST', body: formData, headers, credentials: 'include' });
    } catch {
      throw new Error('Network error — upload failed.');
    }

    if (res.status === 429) { showRateLimitToast(60); throw new Error('Too many requests.'); }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error || 'Upload failed'), { data });
    return data;
  },
};

export default api;
