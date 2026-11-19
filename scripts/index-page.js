document.addEventListener("DOMContentLoaded", () => {
  if (!window.StorefrontAPI) return;
  StorefrontAPI.loadCategories("category-grid", { page: "category.html", limit: 6 }).then(() => {
    const src = document.getElementById("category-grid");
    const dst = document.getElementById("category-grid-mobile");
    if (src && dst && !dst.innerHTML.trim()) dst.innerHTML = src.innerHTML;
  });
  StorefrontAPI.loadCategories("category-grid-mobile", { page: "category.html", limit: 6 });
  StorefrontAPI.loadProducts({ containerId: "promo-grid", promo: true, limit: 4 }).then(() => {
    const src = document.getElementById("promo-grid");
    const dst = document.getElementById("promo-grid-mobile");
    if (src && dst && !dst.innerHTML.trim()) dst.innerHTML = src.innerHTML;
  }).catch(() => {
    const g = document.getElementById("promo-grid");
    if (g) g.innerHTML = '<div class="col-span-full text-center py-8 text-secondary">Aucune promotion pour le moment.</div>';
  });
  StorefrontAPI.loadProducts({ containerId: "promo-grid-mobile", promo: true, limit: 4 });
  StorefrontAPI.loadProducts({ containerId: "nouveautes-grid", sort: "newest", limit: 4 }).then(() => {
    const src = document.getElementById("nouveautes-grid");
    const dst = document.getElementById("nouveautes-grid-mobile");
    if (src && dst && !dst.innerHTML.trim()) dst.innerHTML = src.innerHTML;
  });
  StorefrontAPI.loadProducts({ containerId: "nouveautes-grid-mobile", sort: "newest", limit: 4 });
  StorefrontAPI.loadProducts({ containerId: "selection-grid", minPrice: 2800, sort: "price_desc", limit: 4 }).then(() => {
    const src = document.getElementById("selection-grid");
    const dst = document.getElementById("selection-grid-mobile");
    if (src && dst && !dst.innerHTML.trim()) dst.innerHTML = src.innerHTML;
  });
  StorefrontAPI.loadProducts({ containerId: "selection-grid-mobile", minPrice: 2800, sort: "price_desc", limit: 4 });
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
document.getElementById('site-search-mobile')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const q = e.target.value.trim();
    if (q) window.location.href = 'category.html?q=' + encodeURIComponent(q);
  }
});
document.querySelector('.search-container button')?.addEventListener('click', () => {
  const q = document.getElementById('site-search')?.value.trim() || document.getElementById('site-search-mobile')?.value.trim();
  if (q) window.location.href = 'category.html?q=' + encodeURIComponent(q);
});
