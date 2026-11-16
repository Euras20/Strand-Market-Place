// Core API helper — agri site
const API_BASE = window.API_BASE || 'https://marketplace-app-production-6dae1174.up.railway.app/api';
window.API_BASE = API_BASE;
const STORE_CODE = window.STORE_CODE || 'agri';

async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const { headers: extraHeaders, ...rest } = options;
  const token = getGuestToken();
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Store-Code': STORE_CODE,
      ...(token ? { 'X-Guest-Cart-Token': token } : {}),
      ...(extraHeaders || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return {};
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (json && json.guest_token) setGuestToken(json.guest_token);
  return json;
}

function mediaUrl(media) {
  if (!media) return null;
  if (media.url) return media.url;
  if (media.storage_path) {
    if (media.storage_disk === 'url' || /^https?:\/\//i.test(media.storage_path)) {
      return media.storage_path;
    }
    // Prefix with backend origin so images work from Netlify
    const origin = API_BASE.replace(/\/api\/?$/, '');
    return `${origin}/storage/${media.storage_path}`;
  }
  return null;
}

function formatPrice(n) {
  return Number(n).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

const PLACEHOLDER = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="100%" height="100%" fill="#e8edff"/></svg>'
);

const CART_TOKEN_KEY = 'storefront_guest_cart_token';

function getGuestToken() {
  try { return localStorage.getItem(CART_TOKEN_KEY) || null; } catch { return null; }
}
function setGuestToken(token) {
  if (!token) return;
  try { localStorage.setItem(CART_TOKEN_KEY, token); } catch {}
}

window.StorefrontAPI = {
  api,
  mediaUrl,
  formatPrice,
  PLACEHOLDER,
  getGuestToken,
  setGuestToken,
};
