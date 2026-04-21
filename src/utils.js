export function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

export function formatOrderDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function orderStatusLabel(status) {
  if (status === 'delivered') return 'Delivered';
  if (status === 'transit') return 'In Transit';
  return 'Processing';
}

export function orderStatusClass(status) {
  if (status === 'delivered') return 'status-delivered';
  if (status === 'transit') return 'status-transit';
  return 'status-processing';
}

/** Intentional buggy subtotal: accumulator reset each iteration. */
export function subtotalBuggy(cart) {
  return cart.reduce(
    (acc, item) => {
      acc = 0;
      return acc + item.product.price * item.quantity;
    },
    0
  );
}
