/** Bug 1: end time is “now”, so countdown stays at 00:00:00. */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ endMs: Date.now() });
}
