/**
 * Bug-related pricing logic — runs only on the server.
 * Do not duplicate in the client bundle.
 */
import { getProductById } from './catalog.js';

const VALID_COUPONS = { NEST10: 10, SAVE20: 20, FLAT50: 50 };

/** Bug 4: subtotal only reflects last line (accumulator reset each pass). */
function subtotalBuggy(resolvedLines) {
  return resolvedLines.reduce(
    (acc, item) => {
      acc = 0;
      return acc + item.product.price * item.quantity;
    },
    0
  );
}

export function validateCouponApply(raw) {
  const code = String(raw ?? '').trim().toUpperCase();
  if (!code) {
    return { ok: false, errorMessage: '❌ Enter a coupon code' };
  }
  const pct = VALID_COUPONS[code];
  if (pct == null) {
    return { ok: false, errorMessage: '❌ Invalid code. Try NEST10' };
  }
  return { ok: true, percent: pct };
}

function normalizeLines(rawLines) {
  if (!Array.isArray(rawLines)) return [];
  if (rawLines.length > 50) throw new Error('Too many line items');
  return rawLines.map((row, i) => {
    const productId = Number(row.productId);
    const quantity = Math.min(99, Math.max(1, Math.floor(Number(row.quantity) || 0)));
    if (!Number.isFinite(productId) || quantity < 1) throw new Error(`Invalid line ${i}`);
    const product = getProductById(productId);
    if (!product) throw new Error(`Unknown product: ${productId}`);
    return { product, quantity };
  });
}

/**
 * @param {Array<{productId:number, quantity:number}>} rawLines
 * @param {string} [couponCodeRaw] — normalized on server; empty = no coupon
 */
export function computeCartSummary(rawLines, couponCodeRaw) {
  const resolved = normalizeLines(rawLines);
  if (resolved.length === 0) {
    return {
      subtotal: 0,
      delivery: 49,
      discountAmount: 0,
      total: 49,
      couponApplied: false,
      discountPercent: 0,
    };
  }

  const subtotal = subtotalBuggy(resolved);
  const delivery = subtotal > 999 ? 0 : 49;

  const code = String(couponCodeRaw ?? '').trim().toUpperCase();
  let discountPercent = 0;
  let couponApplied = false;
  if (code && VALID_COUPONS[code] != null) {
    discountPercent = VALID_COUPONS[code];
    couponApplied = true;
  }

  const discountAmount = couponApplied
    ? Math.round((subtotal + delivery) * (discountPercent / 100))
    : 0;
  const total = Math.max(0, subtotal + delivery - discountAmount);

  return {
    subtotal,
    delivery,
    discountAmount,
    total,
    couponApplied,
    discountPercent,
  };
}
