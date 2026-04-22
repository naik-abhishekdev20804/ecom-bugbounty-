# MealNest (bug bounty lab app)

React + Vite UI with a **small Node API** used as a **practice / evaluation** food-delivery app.  
**Only the seven issues below are intentional** for scoring. Anything else should be treated as out of scope unless you add it deliberately.

> **Evaluators:** Keep this README internal if participants should discover issues on their own. If you publish it, you are effectively giving away the rubric.

---

## Architecture (hiding pricing logic from the browser bundle)

- **Browser:** Layout, navigation, cart **lines** (how items are added), star **display**, checkout **modal buttons**, and order history UI. Participants can still read minified JS and **Network** responses; nothing stops a determined person.
- **Server (`/api/*`, `lib/`):** Menu **catalog** (prices), **cart totals** (subtotal, delivery, discount, total), **coupon validation**, and **flash timer end** timestamp. The **pricing bugs (1, 4, 5, 6)** and **coupon rules** live here, **not** in the Vite bundle.
- **Still in the browser (by design):** Bug **2** (always five stars), **3** (separate bag rows per add), **7** (Track Order clears cart vs Back to menu does not).

**Important:** If your **GitHub repo is public**, participants can still read `lib/pricing.js` and the API code. For stronger confidentiality, use a **private** repo and only deploy the built site + serverless API.

---

## The seven intentional bugs (simple descriptions)

These are the **only** bugs that count for evaluation. Reports about other behavior may be noted but should **not** decide pass/fail unless you choose to expand the scope.

### Bug 1 — Flash timer (happy hour countdown)

The app loads a **flash sale end time from the server** that is effectively **“right now”**, so the countdown **stays at 00:00:00** and never counts down like a real offer timer.

---

### Bug 2 — Star ratings

Every dish **shows five filled stars** in the row of stars, **no matter what** the real rating number is next to it. So the **visual stars do not match** the numeric rating.

---

### Bug 3 — Same item added twice → many rows

If you add the **same dish more than once**, the bag creates **a new line each time** instead of increasing **quantity on one line**. So you can see **several rows for the same product**.

---

### Bug 4 — Subtotal

The subtotal is calculated on the **server** with a **broken reduce**: the running total is **reset inside the loop**, so the subtotal only reflects the **last line** in the bag (not the sum of all lines).

---

### Bug 5 — Discount on food **and** delivery

On the **server**, the percentage coupon is applied to **subtotal + delivery fee** together, not only to the food subtotal. So the **delivery portion is also discounted**, which is often not what you want in a simple “10% off order” rule.

---

### Bug 6 — Delivery / free-delivery rule

**Free delivery** is decided on the **server** using the **same wrong subtotal** as in Bug 4. So whether you get **free delivery** can be **wrong** when you have multiple lines. Also, the rule uses **strictly greater than ₹999** (`> 999`), not “₹999 and above,” which can disagree with the marketing copy.

---

### Bug 7 — After placing an order: cart depends on which button you press

After you confirm an order, **“Track Order”** clears the bag and sends you to orders. **“Back to menu”** only closes the popup: **items stay in the bag**, so the cart **does not match** a clean “order completed” flow.

---

## Development

```bash
npm install
npm run dev
```

Runs **Vite** (with `/api` proxied to `http://127.0.0.1:8787`) and the **local API** (`server/local.mjs`). Both must run; if you only start Vite, the menu and totals will fail.

### Production build (static files only)

```bash
npm run build
```

Output: `dist/`. This bundle **does not** include `lib/` or server pricing logic.

### Full-stack local production (API + `dist`)

```bash
npm run build
npm start
```

Serves `dist/` and `/api/*` on **PORT** (default `4173`). Use this to mirror a single Node host (Railway, Fly.io, VPS).

### Deploy on Vercel

- **Build command:** `npm run build`
- **Output directory:** `dist`
- Serverless routes live under **`/api`** (see `api/` and `vercel.json` rewrites so the SPA does not swallow API paths).
- Optional env: see `.env.example` (`VITE_API_BASE` only if UI and API are on different origins).

---

## Legacy static version

The older single-file HTML/JS version is kept under `_legacy/` for reference only.
