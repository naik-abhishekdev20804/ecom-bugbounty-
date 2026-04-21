import { IMG_FALLBACK } from './catalog.js';

const BG = {
  pizza: '#FFF5EE',
  indian: '#FFF8F0',
  chinese: '#FFF5F5',
  asian: '#F0FFF8',
  american: '#FFF0F0',
  healthy: '#F0FFF4',
  desserts: '#FFF5FA',
  combo: '#F5F0FF',
};

function imgOnError(e) {
  e.target.onerror = null;
  e.target.src = IMG_FALLBACK;
}

export default function ProductCard({ product, wishlisted, onWish, onAdd }) {
  const pct = Math.round((1 - product.price / product.orig) * 100);
  const bg = BG[product.cat] || '#F5F5F5';
  const fullStars = '★'.repeat(5);

  return (
    <div className="product-card" data-cat={product.cat}>
      <div className="prod-img" style={{ background: bg }}>
        {product.badge ? (
          <span className={`badge ${product.badge}`}>
            {product.badge === 'sale'
              ? `-${pct}%`
              : product.badge.charAt(0).toUpperCase() + product.badge.slice(1)}
          </span>
        ) : null}
        <button type="button" className="wish-btn" title="Save dish" onClick={() => onWish(product.id)}>
          {wishlisted ? '❤️' : '🤍'}
        </button>
        <img
          className="prod-photo"
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          referrerPolicy="no-referrer"
          onError={imgOnError}
        />
      </div>
      <div className="prod-info">
        <div className="prod-cat">{product.cat.charAt(0).toUpperCase() + product.cat.slice(1)}</div>
        <div className="prod-name">{product.name}</div>
        <div className="prod-rating">
          <span className="stars">{fullStars}</span>
          <span className="rating-val">
            {product.rating} ({product.rev.toLocaleString('en-IN')})
          </span>
        </div>
        <div className="prod-bottom">
          <div className="prod-price">
            ₹{product.price.toLocaleString('en-IN')}
            <span className="prod-orig">₹{product.orig.toLocaleString('en-IN')}</span>
          </div>
          <button type="button" className="add-btn" onClick={() => onAdd(product.id)}>
            Add to bag
          </button>
        </div>
      </div>
    </div>
  );
}
