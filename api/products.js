import { PRODUCTS, DEALS } from '../lib/catalog.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
  return res.status(200).json({ products: PRODUCTS, deals: DEALS });
}
