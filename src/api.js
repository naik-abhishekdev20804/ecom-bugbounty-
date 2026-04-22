/** Same-origin `/api/*` in dev (Vite proxy) and production (Vercel or Node server). */
const PREFIX = import.meta.env.VITE_API_BASE || '';

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function apiGet(path) {
  const res = await fetch(`${PREFIX}${path}`, { credentials: 'same-origin' });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || data.raw || res.statusText);
  return data;
}

export async function apiPost(path, body) {
  const res = await fetch(`${PREFIX}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body ?? {}),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data.error || data.raw || res.statusText);
  return data;
}
