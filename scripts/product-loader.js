// Load real product by slug and populate the page
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug || !window.StorefrontAPI) return;

  try {
    const product = await StorefrontAPI.api('/storefront/products/' + encodeURIComponent(slug));
    if (!product || !product.name) return;

    const variant = product.variants?.[0] || {};
    const price = Number(variant.price ?? product.price ?? 0);
    const compare = variant.compare_at_price ?? product.compare_at_price ?? null;
    const img = StorefrontAPI.mediaUrl(product.media?.[0]) || product.image || '';

    // Title
    const h1 = document.querySelector('h1');
    if (h1) h1.textContent = product.name;
    const titleMobile = document.getElementById('product-title-mobile');
    if (titleMobile) titleMobile.textContent = product.name;

    // Brand
    const brandEl = document.querySelector('strong');
    if (brandEl && product.brand?.name) brandEl.textContent = product.brand.name;
    const brandMobile = document.getElementById('product-brand-mobile');
    if (brandMobile && product.brand?.name) brandMobile.textContent = product.brand.name;

    // Prices
    const priceHt = document.getElementById('price-ht');
    if (priceHt) priceHt.textContent = StorefrontAPI.formatPrice(price);
    const priceHtMobile = document.getElementById('price-ht-mobile');
    if (priceHtMobile) priceHtMobile.textContent = StorefrontAPI.formatPrice(price) + ' HT';
    const stickyHt = document.getElementById('sticky-price-ht-mobile');
    if (stickyHt) stickyHt.textContent = StorefrontAPI.formatPrice(price);

    const priceTtc = document.getElementById('price-ttc');
    if (priceTtc) priceTtc.textContent = StorefrontAPI.formatPrice(price * 1.2);
    const priceTtcMobile = document.getElementById('price-ttc-mobile');
    if (priceTtcMobile) priceTtcMobile.textContent = 'Soit ' + StorefrontAPI.formatPrice(price * 1.2) + ' TTC';
    const stickyTtc = document.getElementById('sticky-price-ttc-mobile');
    if (stickyTtc) stickyTtc.textContent = 'TTC : ' + StorefrontAPI.formatPrice(price * 1.2);

    const crossed = document.getElementById('crossed-price');
    if (crossed) {
      if (compare && compare > price) {
        crossed.textContent = StorefrontAPI.formatPrice(compare) + ' HT';
        crossed.classList.remove('hidden');
      } else {
        crossed.classList.add('hidden');
      }
    }

    // Main image
    const mainImg = document.getElementById('main-product-img');
    if (mainImg && img) mainImg.src = img;
    const mainImgMobile = document.getElementById('main-product-img-mobile');
    if (mainImgMobile && img) mainImgMobile.src = img;

    // Breadcrumb last item
    const bc = document.getElementById('product-breadcrumb');
    if (bc) {
      const last = bc.querySelector('span:last-child, a:last-child');
      if (last) last.textContent = product.name;
    }
    const bcMobile = document.getElementById('breadcrumb-category-mobile');
    if (bcMobile) bcMobile.textContent = product.name;

    // Update document title
    document.title = product.name + ' — JS Europe';
    const loader = document.getElementById('product-loading');
    if (loader) loader.remove();

    // Store for cart
    window.currentProduct = {
      id: variant.id || product.id,
      name: product.name,
      brand: product.brand?.name || '',
      price: price,
      image: img,
      slug: product.slug,
    };
  } catch (err) {
    console.error('Product load failed:', err);
    const loader = document.getElementById('product-loading');
    if (loader) loader.remove();
  }
});
