/* ============================================================
       Strand Cart System (inlined on every page)
       ============================================================ */
    const CART_KEY = 'strand_cart_v1';
    function getCart() {try {return JSON.parse(localStorage.getItem(CART_KEY)) || [];} catch (e) {return [];} }
    function saveCart(c) {localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCartBadge(); renderCartDrawer();}
    function cartCount() {return getCart().reduce((s, i) => s + (i.qty || 1), 0);}
    function cartTotalHT() {return getCart().reduce((s, i) => s + (i.priceHT * (i.qty || 1)), 0);}
    function addToCart(p) {const c = getCart(); const e = c.find(i => i.id === p.id); if (e) {e.qty = (e.qty || 1) + (p.qty || 1);} else {c.push({...p, qty: p.qty || 1});} saveCart(c); return true;}
    function removeFromCart(id) {saveCart(getCart().filter(i => i.id !== id));}
    function updateQty(id, d) {const c = getCart(); const it = c.find(i => i.id === id); if (!it) return; it.qty = Math.max(1, (it.qty || 1) + d); saveCart(c);}
    function clearCart() {saveCart([]);}
    function fmtEUR(n) {return new Intl.NumberFormat('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).format(n) + ' €';}
    function renderCartBadge() {
      const n = cartCount(), t = cartTotalHT();
      document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = n);
      document.querySelectorAll('[data-cart-total]').forEach(el => el.textContent = fmtEUR(t));
    }
    function renderCartDrawer() {
      const itemsEl = document.getElementById('cart-items');
      const totalEl = document.getElementById('cart-total');
      if (!itemsEl) return;
      const cart = getCart();
      if (cart.length === 0) {
        itemsEl.innerHTML = `<div class="text-center text-secondary py-12 flex flex-col items-center gap-3">
      <span class="material-symbols-outlined text-[48px] text-outline-variant">shopping_bag</span>
      <p class="font-body-md">Votre panier est vide</p>
      <a href="strand.html" class="text-primary font-label-md font-semibold hover:underline">Découvrir le catalogue</a>
    </div>`;
      } else {
        itemsEl.innerHTML = cart.map(it => `
      <div class="flex gap-3 p-3 bg-surface-container-low rounded-lg">
        <div class="w-16 h-16 rounded-lg overflow-hidden bg-surface-container shrink-0">${it.image ? `<img src="${it.image}" alt="" class="w-full h-full object-cover"/>` : ''}</div>
        <div class="flex-1 min-w-0">
          <div class="font-label-caps text-[10px] text-secondary uppercase">${it.brand || ''}</div>
          <div class="font-title-md text-title-md text-on-surface leading-tight">${it.name}</div>
          <div class="text-[11px] text-secondary mt-0.5">Réf. ${it.ref || '—'}</div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center bg-surface-container-lowest rounded-lg">
              <button class="w-7 h-7 flex items-center justify-center hover:bg-surface-container rounded-l-lg" onclick="updateQty('${it.id}',-1)" type="button">−</button>
              <span class="w-8 text-center font-numeric-data text-[13px] font-bold">${it.qty}</span>
              <button class="w-7 h-7 flex items-center justify-center hover:bg-surface-container rounded-r-lg" onclick="updateQty('${it.id}',1)" type="button">+</button>
            </div>
            <div class="text-right"><div class="font-title-md font-bold">${fmtEUR(it.priceHT * it.qty)}</div><div class="text-[10px] text-secondary">HT</div></div>
          </div>
        </div>
        <button class="text-secondary hover:text-error self-start" onclick="removeFromCart('${it.id}')" type="button"><span class="material-symbols-outlined text-[18px]">close</span></button>
      </div>`).join('');
      }
      if (totalEl) totalEl.textContent = fmtEUR(cartTotalHT());
    }
    function toggleCartDrawer(open) {
      const dr = document.getElementById('cart-drawer'), bd = document.getElementById('cart-drawer-backdrop');
      if (!dr || !bd) return;
      if (open) {renderCartDrawer(); bd.classList.remove('hidden'); requestAnimationFrame(() => {bd.classList.remove('opacity-0'); dr.classList.remove('translate-x-full');}); document.body.style.overflow = 'hidden';}
      else {dr.classList.add('translate-x-full'); bd.classList.add('opacity-0'); setTimeout(() => bd.classList.add('hidden'), 300); document.body.style.overflow = '';}
    }
    function buyNow(p) {addToCart({...p, qty: p.qty || 1}); window.location.href = 'checkout.html';}
    function showCartToast(title, message) {
      let t = document.getElementById('global-toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'global-toast';
        t.className = 'fixed bottom-6 right-6 z-[100] transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none';
        t.innerHTML = `<div class="bg-[#252A2D] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 max-w-md"><span class="material-symbols-outlined text-primary text-[24px]">check_circle</span><div><p class="font-title-md font-semibold" data-tt></p><p class="font-body-sm text-secondary-fixed-dim" data-tm></p></div></div>`;
        document.body.appendChild(t);
      }
      t.querySelector('[data-tt]').textContent = title;
      t.querySelector('[data-tm]').textContent = message;
      t.classList.remove('translate-y-24', 'opacity-0'); t.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {t.classList.add('translate-y-24', 'opacity-0'); t.classList.remove('translate-y-0', 'opacity-100');}, 3200);
    }
    document.addEventListener('DOMContentLoaded', () => { if (!window.StorefrontAPI) { renderCartBadge(); renderCartDrawer(); } });
    window.addEventListener('storage', e => {if (e.key === CART_KEY) {renderCartBadge(); renderCartDrawer();} });

    /* ----- Page-specific helpers ----- */
    function toggleCategoryDrawer(open) {
      const dr = document.getElementById('category-drawer'), bd = document.getElementById('category-drawer-backdrop');
      if (!dr || !bd) return;
      if (open) {bd.classList.remove('hidden'); requestAnimationFrame(() => {bd.classList.remove('opacity-0'); dr.classList.remove('-translate-x-full');}); document.body.style.overflow = 'hidden';}
      else {dr.classList.add('-translate-x-full'); bd.classList.add('opacity-0'); setTimeout(() => bd.classList.add('hidden'), 300); document.body.style.overflow = '';}
    }
    function toggleWishlist(btn, name) {
      const icon = btn.querySelector('.material-symbols-outlined');
      const saved = icon.style.fontVariationSettings && icon.style.fontVariationSettings.includes('FILL 1');
      if (saved) {icon.style.fontVariationSettings = "'FILL' 0"; icon.classList.remove('text-primary'); icon.classList.add('text-secondary'); showCartToast('Favoris mis à jour', name + ' retiré');}
      else {icon.style.fontVariationSettings = "'FILL' 1"; icon.classList.remove('text-secondary'); icon.classList.add('text-primary'); showCartToast('Favoris enregistré', name + ' ajouté');}
    }
    function openDevisModal(name = '') {const m = document.getElementById('devis-modal'), i = document.getElementById('devis-product-input'); if (i) i.value = name; if (m) m.classList.remove('hidden');}
    function closeDevisModal() {document.getElementById('devis-modal')?.classList.add('hidden');}
    function handleDevisSubmit(e) {e.preventDefault(); closeDevisModal(); showCartToast('Demande transmise', 'Réponse sous 24h ouvrées.');}
    function handleNewsletterSubmit(e) {e.preventDefault(); const f = document.getElementById('newsletter-feedback'); if (f) f.classList.remove('hidden'); e.target.querySelector('input[type=email]').value = ''; showCartToast('Inscription confirmée', 'Vous recevrez notre prochaine lettre.');}

    const heroSlides = [
      {title: "Les équipements qui font avancer vos projets.", subtitle: "Découvrez une sélection rigoureuse de machines agricoles, outillage d'atelier et matériels BTP certifiés, livrables avec hayon partout en France et en Europe.", counter: "Slide 01 / 03", progress: "33.3%"},
      {title: "Manutention lourde & Terrassement professionnel.", subtitle: "Mini-pelles, dumpers hydrostatiques et matériel de levage inspectés conformes aux normes CE avec garantie constructeur.", counter: "Slide 02 / 03", progress: "66.6%"},
      {title: "Parcs d'engins agricoles & Entretien d'espaces verts.", subtitle: "Micro-tracteurs neufs 4RM, broyeurs forestiers déportés et outillage spécialisé disponibles immédiatement sous 48h.", counter: "Slide 03 / 03", progress: "100%"}
    ];
    let currentSlide = 0;
    function updateHeroSlide() {
      const s = heroSlides[currentSlide];
      document.getElementById('hero-title').innerText = s.title;
      document.getElementById('hero-subtitle').innerText = s.subtitle;
      document.getElementById('hero-slide-counter').innerText = s.counter;
      document.getElementById('hero-progress-bar').style.width = s.progress;
    }
    function nextHeroSlide() {currentSlide = (currentSlide + 1) % heroSlides.length; updateHeroSlide();}
    function prevHeroSlide() {currentSlide = (currentSlide - 1 + heroSlides.length) % heroSlides.length; updateHeroSlide();}
