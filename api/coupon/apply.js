import { validateCouponApply } from '../../lib/pricing.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const result = validateCouponApply(req.body?.code);
  return res.status(200).json(result);
}
