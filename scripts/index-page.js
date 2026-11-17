document.addEventListener("DOMContentLoaded", () => {
  if (!window.StorefrontAPI) return;
  StorefrontAPI.loadCategories("category-grid", { page: "category.html", limit: 6 });
  StorefrontAPI.loadProducts({ containerId: "promo-grid", promo: true, limit: 4 });
  StorefrontAPI.loadProducts({ containerId: "nouveautes-grid", sort: "newest", limit: 4 });
  StorefrontAPI.loadProducts({ containerId: "selection-grid", minPrice: 2800, sort: "price_desc", limit: 4 });
});

document.addEventListener('DOMContentLoaded', () => {
  if (window.StorefrontAPI?.refreshCartBadge) StorefrontAPI.refreshCartBadge();
});

// Prefer server cart drawer when API is available
(function () {
  const original = window.toggleCartDrawer;
  window.toggleCartDrawer = async function (open) {
    if (open && window.StorefrontAPI?.syncCartDrawer) {
      await StorefrontAPI.syncCartDrawer();
    }
    if (typeof original === 'function') original(open);
  };
})();

document.getElementById('site-search')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) window.location.href = 'category.html?q=' + encodeURIComponent(q);
  }
});
document.querySelector('.search-container button')?.addEventListener('click', () => {
  const q = document.getElementById('site-search')?.value.trim();
  if (q) window.location.href = 'category.html?q=' + encodeURIComponent(q);
});
