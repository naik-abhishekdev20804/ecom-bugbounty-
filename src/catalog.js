export const IMG_QS = '?auto=format&w=800&q=80';
export const IMG_FALLBACK = 'https://placehold.co/800x800/E8E0D0/6B6B70?text=Photo';

export const PRODUCTS = [
  { id: 1, name: 'Truffle Margherita Pizza (12")', cat: 'pizza', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38' + IMG_QS, price: 1299, orig: 1699, rating: 3.3, rev: 1243, badge: 'sale' },
  { id: 2, name: 'Hyderabadi Chicken Dum Biryani', cat: 'indian', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1' + IMG_QS, price: 1499, orig: 1899, rating: 4.0, rev: 876, badge: 'hot' },
  { id: 3, name: 'Butter Chicken & Garlic Naan', cat: 'indian', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288' + IMG_QS, price: 1399, orig: 1699, rating: 2.7, rev: 534, badge: 'new' },
  { id: 4, name: 'Veg Hakka Noodles', cat: 'chinese', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe' + IMG_QS, price: 799, orig: 999, rating: 5.0, rev: 392, badge: 'sale' },
  { id: 5, name: 'Dragon Roll Sushi Platter', cat: 'asian', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754' + IMG_QS, price: 1899, orig: 2299, rating: 3.0, rev: 218, badge: null },
  { id: 6, name: 'Double Smash Burger & Fries', cat: 'american', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd' + IMG_QS, price: 1099, orig: 1399, rating: 4.5, rev: 671, badge: 'new' },
  { id: 7, name: 'Greek Quinoa Power Bowl', cat: 'healthy', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd' + IMG_QS, price: 899, orig: 1099, rating: 2.0, rev: 905, badge: 'hot' },
  { id: 8, name: 'Belgian Waffle & Berries', cat: 'desserts', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0' + IMG_QS, price: 499, orig: 699, rating: 3.8, rev: 2187, badge: 'new' },
  { id: 9, name: 'Thai Green Curry & Jasmine Rice', cat: 'asian', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601' + IMG_QS, price: 1199, orig: 1499, rating: 1.5, rev: 341, badge: null },
  { id: 10, name: 'Classic Caesar Salad', cat: 'healthy', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' + IMG_QS, price: 799, orig: 999, rating: 4.2, rev: 562, badge: 'top' },
  { id: 11, name: 'Grilled Paneer Tikka', cat: 'indian', image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2' + IMG_QS, price: 949, orig: 1199, rating: 3.5, rev: 287, badge: null },
  { id: 12, name: 'Chocolate Lava Cake', cat: 'desserts', image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187' + IMG_QS, price: 499, orig: 649, rating: 2.3, rev: 893, badge: 'new' },
];

export const DEALS = [
  { id: 101, name: 'Family Feast — 4 mains + sides', cat: 'combo', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' + IMG_QS, price: 2499, orig: 3299, rating: 4.6, rev: 3421, badge: 'sale' },
  { id: 102, name: 'Sunday Brunch for Two', cat: 'combo', image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929' + IMG_QS, price: 1899, orig: 2399, rating: 4.7, rev: 891, badge: 'hot' },
  { id: 103, name: 'Party Starter Pack', cat: 'combo', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352' + IMG_QS, price: 1599, orig: 1999, rating: 4.8, rev: 1567, badge: 'sale' },
  { id: 104, name: 'Midnight Munchies Combo', cat: 'combo', image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543' + IMG_QS, price: 1299, orig: 1699, rating: 4.9, rev: 742, badge: 'new' },
];

export const ALL_ITEMS = [...PRODUCTS, ...DEALS];
