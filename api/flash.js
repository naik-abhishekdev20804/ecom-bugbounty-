/** Fixed Bug 1: end time is now 2 hours in the future, so countdown works. */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'no-store');
  // 2 hours from now
  return res.status(200).json({ endMs: Date.now() + 2 * 60 * 60 * 1000 });
}
