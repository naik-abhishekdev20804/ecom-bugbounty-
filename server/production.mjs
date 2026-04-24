/**
 * Production-style Node server: API + static `dist/` (Railway, Fly, VPS, or local `npm start`).
 * On Vercel, use serverless `api/*` instead; this file is optional for non-Vercel hosts.
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS, DEALS } from '../lib/catalog.js';
import { computeCartSummary, validateCouponApply } from '../lib/pricing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

const app = express();
const PORT = Number(process.env.PORT || 4173);

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

app.get('/api/products', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=120');
  res.json({ products: PRODUCTS, deals: DEALS });
});

app.get('/api/flash', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ endMs: Date.now() + 2 * 60 * 60 * 1000 });
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

app.use(express.static(dist, { index: false, maxAge: '1h' }));
app.get('*', (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[mealnest] http://127.0.0.1:${PORT}`);
});
