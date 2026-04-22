import { computeCartSummary } from '../../lib/pricing.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { lines, couponCode } = req.body ?? {};
    const summary = computeCartSummary(lines, couponCode);
    return res.status(200).json(summary);
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Bad request' });
  }
}
