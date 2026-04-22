# MealNest (bug bounty lab app)

React + Vite front-end used as a **practice / evaluation** food-delivery UI.  
**Only the seven issues below are intentional** for scoring. Anything else should be treated as out of scope unless you add it deliberately.

> **Evaluators:** Keep this README internal if participants should discover issues on their own. If you publish it, you are effectively giving away the rubric.

---

## The seven intentional bugs (simple descriptions)

These are the **only** bugs that count for evaluation. Reports about other behavior may be noted but should **not** decide pass/fail unless you choose to expand the scope.

### Bug 1 — Flash timer (happy hour countdown)

The countdown on the flash banner is wired to an end time that is effectively **“right now”**, so the timer **stays at 00:00:00** and never counts down like a real offer timer.

---

### Bug 2 — Star ratings

Every dish **shows five filled stars** in the row of stars, **no matter what** the real rating number is next to it. So the **visual stars do not match** the numeric rating.

---

### Bug 3 — Same item added twice → many rows

If you add the **same dish more than once**, the bag creates **a new line each time** instead of increasing **quantity on one line**. So you can see **several rows for the same product**.

---

### Bug 4 — Subtotal

The subtotal is calculated with a **broken reduce**: the running total is **reset inside the loop**, so the subtotal only reflects the **last line** in the bag (not the sum of all lines).

---

### Bug 5 — Discount on food **and** delivery

The percentage coupon is applied to **subtotal + delivery fee** together, not only to the food subtotal. So the **delivery portion is also discounted**, which is often not what you want in a simple “10% off order” rule.

---

### Bug 6 — Delivery / free-delivery rule

**Free delivery** is decided using the **same wrong subtotal** as in Bug 4. So whether you get **free delivery** can be **wrong** when you have multiple lines. Also, the rule uses **strictly greater than ₹999** (`> 999`), not “₹999 and above,” which can disagree with the marketing copy.

---

### Bug 7 — After placing an order: cart depends on which button you press

After you confirm an order, **“Track Order”** clears the bag and sends you to orders. **“Back to menu”** only closes the popup: **items stay in the bag**, so the cart **does not match** a clean “order completed” flow.

---

## Development

```bash
npm install
npm run dev
```

Production build (e.g. Vercel): `npm run build` — output in `dist/`. Set the Vercel **Output Directory** to `dist`.

---

## Legacy static version

The older single-file HTML/JS version is kept under `_legacy/` for reference only.
