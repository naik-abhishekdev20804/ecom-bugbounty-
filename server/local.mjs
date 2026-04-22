/**
 * Local API for `npm run dev` (Vite proxies /api here).
 */
import express from 'express';
import { PRODUCTS, DEALS } from '../lib/catalog.js';
import { computeCartSummary, validateCouponApply } from '../lib/pricing.js';

const app = express();
const PORT = Number(process.env.API_PORT || 8787);

app.use(express.json({ limit: '64kb' }));

app.get('/api/products', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=120');
  res.json({ products: PRODUCTS, deals: DEALS });
});

app.get('/api/flash', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ endMs: Date.now() });
});

app.post('/api/cart/summary', (req, res) => {
  try {
    const { lines, couponCode } = req.body ?? {};
    res.json(computeCartSummary(lines, couponCode));
  } catch (e) {
    res.status(400).json({ error: e.message || 'Bad request' });
  }
});

app.post('/api/coupon/apply', (req, res) => {
  res.json(validateCouponApply(req.body?.code));
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[mealnest-api] http://127.0.0.1:${PORT}`);
});
