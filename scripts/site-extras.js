// Floating WhatsApp + dynamic category drawer
(function () {
  const WA_NUMBER = '33189402210'; // change to the real number
  const WA_TEXT = encodeURIComponent('Bonjour, je souhaite des informations.');

  function addWhatsApp() {
    if (document.getElementById('wa-float')) return;
    const a = document.createElement('a');
    a.id = 'wa-float';
    a.href = `https://wa.me/${WA_NUMBER}?text=${WA_TEXT}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', 'WhatsApp');
    a.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:60;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.2);';
    a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0 0 2.1 17.8L1 23l5.3-1.1A11 11 0 0 0 20.5 3.5zm-8.5 17a9.1 9.1 0 0 1-4.6-1.3l-.3-.2-3.1.7.7-3-.2-.3A9.1 9.1 0 1 1 12 20.5zm5-6.8c-.3-.1-1.6-.8-1.8-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.2-.3a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.5 4 15 15 0 0 0 1.5.6 3.6 3.6 0 0 0 1.7.1 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z"/></svg>';
    document.body.appendChild(a);
  }

  async function loadCategoryDrawer() {
    const drawer = document.getElementById('category-drawer');
    if (!drawer || !window.StorefrontAPI) return;
    const list = document.getElementById('category-list') || document.getElementById('category-accordion') || drawer.querySelector('.flex-1.overflow-y-auto');
    if (!list) return;

    const icons = {
      'energie': 'bolt',
      'bois-de-chauffage': 'local_fire_department',
      'chauffage': 'thermostat',
      'jardin-et-espaces-verts': 'yard',
      'agricole': 'agriculture',
      'remorques': 'local_shipping',
      'deneigement': 'ac_unit',
      'btp-et-manutention': 'construction',
      'conteneurs-et-modulaires': 'inventory_2',
      'garage-et-atelier': 'handyman',
      'machines-outils': 'precision_manufacturing',
      'pompes-et-arrosage': 'water_drop',
      'rangement-et-atelier': 'shelves',
      'cuisine-professionnelle': 'restaurant',
      'divers': 'category',
    };

    try {
      const json = await StorefrontAPI.api('/storefront/categories');
      const cats = Array.isArray(json) ? json : (json.data || []);
      if (!cats.length) return;

      // Group by parent
      const parents = cats.filter(c => !c.parent_id);
      const childrenOf = {};
      cats.forEach(c => {
        if (c.parent_id) {
          (childrenOf[c.parent_id] = childrenOf[c.parent_id] || []).push(c);
        }
      });

      list.innerHTML = parents.map(parent => {
        const kids = childrenOf[parent.id] || [];
        const icon = icons[parent.slug] || 'category';
        const kidsHtml = kids.map(k =>
          `<a class="block py-2 px-3 rounded hover:bg-surface-container-low text-on-surface-variant hover:text-primary font-body-sm" href="category.html?category=${encodeURIComponent(k.slug)}">${k.name}</a>`
        ).join('');

        return `
          <div class="border-b border-surface-container-highest/40">
            <button class="w-full flex items-center justify-between p-3 rounded-lg hover:bg-surface-container-low transition-colors text-left" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.accordion-icon').textContent = this.nextElementSibling.classList.contains('hidden') ? 'expand_more' : 'expand_less';" type="button">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-[22px]">${icon}</span>
                <span class="font-label-md text-label-md font-semibold text-on-surface">${parent.name}</span>
              </div>
              <span class="material-symbols-outlined text-[20px] text-secondary accordion-icon">expand_more</span>
            </button>
            <div class="hidden pl-10 pb-2 space-y-1 accordion-content">
              <a class="block py-2 px-3 rounded hover:bg-surface-container-low text-on-surface font-semibold font-body-sm" href="category.html?category=${encodeURIComponent(parent.slug)}">Tous</a>
              ${kidsHtml}
            </div>
          </div>`;
      }).join('');
    } catch (e) {
      console.info('Category drawer load failed', e);
    }
  }

  
  function attachLiveSearch() {
    const input = document.getElementById('site-search') || document.querySelector('input[type="search"]');
    if (!input || input.dataset.live) return;
    input.dataset.live = '1';
    input.setAttribute('autocomplete', 'off');

    const box = document.createElement('div');
    box.id = 'search-suggest';
    box.style.cssText = 'position:absolute;z-index:60;left:0;right:0;top:100%;margin-top:6px;background:#fff;border:1px solid #e6e8ec;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.08);max-height:360px;overflow:auto;display:none;';
    const wrap = input.closest('.search-container') || input.parentElement;
    if (wrap && getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    (wrap || input.parentElement).appendChild(box);

    let timer = null;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) { box.style.display = 'none'; return; }
      timer = setTimeout(() => search(q), 250);
    });
    document.addEventListener('click', (e) => { if (!box.contains(e.target) && e.target !== input) box.style.display = 'none'; });

    async function search(q) {
      try {
        const json = await StorefrontAPI.api('/storefront/products?q=' + encodeURIComponent(q));
        const list = (Array.isArray(json) ? json : (json.data || [])).slice(0, 8);
        if (!list.length) {
          box.innerHTML = '<div style="padding:12px 14px;color:#6b7280;font-size:13px;">Aucun résultat</div>';
          box.style.display = 'block';
          return;
        }
        box.innerHTML = list.map(p => {
          const chars = (p.attribute_values || p.attributeValues || [])
            .map(a => a.value_text).filter(Boolean).slice(0, 2).join(' · ');
          const img = StorefrontAPI.mediaUrl?.(p.media?.[0]) || '';
          return `<a href="product.html?slug=${encodeURIComponent(p.slug)}" style="display:flex;gap:10px;align-items:center;padding:10px 12px;text-decoration:none;color:#1f2937;border-bottom:1px solid #f3f4f6;">
            <span style="width:40px;height:40px;border-radius:8px;background:#f4f5f7;overflow:hidden;flex:none;">${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;">` : ''}</span>
            <span style="min-width:0;">
              <span style="display:block;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</span>
              <span style="display:block;font-size:12px;color:#6b7280;">${p.category?.name || ''} ${chars ? '· ' + chars : ''}</span>
            </span>
          </a>`;
        }).join('');
        box.style.display = 'block';
      } catch (e) { box.style.display = 'none'; }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    attachLiveSearch();
    addWhatsApp();
    loadCategoryDrawer();
  });
})();
