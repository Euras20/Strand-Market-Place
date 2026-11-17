

// ---- extracted from checkout.html ----

let currentStep = 1;

                function goToStep(step) {
                    if (step < 1 || step > 3) return;
                    currentStep = step;

                    // Update forms visibility
                    const sec1 = document.getElementById('sectionStep1');
                    const sec2 = document.getElementById('sectionStep2');
                    const sec3 = document.getElementById('sectionStep3');

                    [sec1, sec2, sec3].forEach(s => {
                        if (s) s.classList.add('hidden');
                    });

                    if (step === 1 && sec1) sec1.classList.remove('hidden');
                    if (step === 2 && sec2) {
                        syncRecapData();
                        sec2.classList.remove('hidden');
                    }
                    if (step === 3 && sec3) sec3.classList.remove('hidden');

                    // Update stepper bar width
                    const bar = document.getElementById('stepProgressBar');
                    if (step === 1) bar.style.width = '0%';
                    if (step === 2) bar.style.width = '50%';
                    if (step === 3) bar.style.width = '100%';

                    // Update Stepper Badge States
                    for (let i = 1; i <= 3; i++) {
                        const badge = document.getElementById('stepBadge' + i);
                        const label = document.getElementById('stepLabel' + i);

                        if (i < step) {
                            // Completed step
                            badge.className = 'w-10 h-10 rounded-full flex items-center justify-center font-label-lg text-label-lg transition-colors bg-tertiary text-on-tertiary shadow-sm ring-4 ring-surface';
                            badge.innerHTML = '<span class="material-symbols-outlined text-[20px]">check</span>';
                            label.className = 'mt-2 font-label-caps text-label-caps uppercase text-tertiary tracking-wider font-semibold';
                        } else if (i === step) {
                            // Current step
                            badge.className = 'w-10 h-10 rounded-full flex items-center justify-center font-label-lg text-label-lg transition-colors bg-primary text-on-primary shadow-sm ring-4 ring-surface';
                            badge.textContent = i;
                            label.className = 'mt-2 font-label-caps text-label-caps uppercase text-primary font-bold tracking-wider';
                        } else {
                            // Pending step
                            badge.className = 'w-10 h-10 rounded-full flex items-center justify-center font-label-lg text-label-lg transition-colors bg-surface-container-high text-secondary shadow-sm ring-4 ring-surface';
                            badge.textContent = i;
                            label.className = 'mt-2 font-label-caps text-label-caps uppercase text-secondary tracking-wider';
                        }
                    }

                    // Smooth scroll back to top of checkout container
                    window.scrollTo({top: 0, behavior: 'smooth'});
                }

                function syncRecapData() {
                    const email = document.getElementById('contactEmail').value;
                    const phone = document.getElementById('contactPhone').value;
                    const company = document.getElementById('companyName').value;
                    const siret = document.getElementById('companySiret').value;
                    const fullName = document.getElementById('contactFullName').value;
                    const address = document.getElementById('streetAddress').value;
                    const address2 = document.getElementById('streetAddress2').value;
                    const postal = document.getElementById('postalCode').value;
                    const city = document.getElementById('cityName').value;

                    document.getElementById('recapEmail').textContent = email || 'Non renseigné';
                    document.getElementById('recapPhone').textContent = phone || 'Non renseigné';
                    document.getElementById('recapCompany').textContent = company || 'Société non spécifiée';
                    document.getElementById('recapRecipient').textContent = 'Destinataire : ' + (fullName || 'Non spécifié') + (siret ? ' (SIRET : ' + siret + ')' : '');
                    document.getElementById('recapAddressFull').textContent = address + (address2 ? ', ' + address2 : '') + ', ' + postal + ' ' + city + ', France';
                }

                // Mobile Order Summary Accordion
                const mobileSummaryToggle = document.getElementById('mobileSummaryToggle');
                const mobileSummaryDrawer = document.getElementById('mobileSummaryDrawer');
                const mobileSummaryIcon = document.getElementById('mobileSummaryIcon');

                if (mobileSummaryToggle) {
                    mobileSummaryToggle.addEventListener('click', () => {
                        const isHidden = mobileSummaryDrawer.classList.contains('hidden');
                        if (isHidden) {
                            mobileSummaryDrawer.classList.remove('hidden');
                            mobileSummaryIcon.style.transform = 'rotate(180deg)';
                            mobileSummaryToggle.setAttribute('aria-expanded', 'true');
                        } else {
                            mobileSummaryDrawer.classList.add('hidden');
                            mobileSummaryIcon.style.transform = 'rotate(0deg)';
                            mobileSummaryToggle.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                // Promo Code Accordion
                const promoToggleBtn = document.getElementById('promoToggleBtn');
                const promoDrawer = document.getElementById('promoDrawer');
                const promoIcon = document.getElementById('promoIcon');

                if (promoToggleBtn) {
                    promoToggleBtn.addEventListener('click', () => {
                        const isHidden = promoDrawer.classList.contains('hidden');
                        if (isHidden) {
                            promoDrawer.classList.remove('hidden');
                            promoIcon.style.transform = 'rotate(180deg)';
                            promoToggleBtn.setAttribute('aria-expanded', 'true');
                        } else {
                            promoDrawer.classList.add('hidden');
                            promoIcon.style.transform = 'rotate(0deg)';
                            promoToggleBtn.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                function applyPromo() {
                    const code = document.getElementById('promoInput').value.trim();
                    const feedback = document.getElementById('promoFeedback');
                    if (!code) return;
                    feedback.classList.remove('hidden');
                    if (code.toUpperCase() === 'JSE-BTP2024') {
                        feedback.textContent = 'Code JSE-BTP2024 appliqué : frais de dossier offerts.';
                        feedback.className = 'text-[11px] mt-1 text-tertiary font-body-sm';
                    } else {
                        feedback.textContent = 'Ce code promo est invalide ou expiré.';
                        feedback.className = 'text-[11px] mt-1 text-error font-body-sm';
                    }
                }

                function simulatePayment(btn) {
                    const cgv = document.getElementById('acceptCgv');
                    if (!cgv.checked) {
                        alert('Veuillez accepter les Conditions Générales de Vente pour continuer.');
                        return;
                    }
                    btn.disabled = true;
                    btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">refresh</span><span>Authentification 3D Secure en cours...</span>';
                    setTimeout(() => {
                        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Paiement validé avec succès</span>';
                        btn.className = 'w-full h-14 bg-tertiary text-on-tertiary font-headline-sm text-headline-sm rounded-lg shadow-md flex items-center justify-center gap-space-sm';
                    }, 1600);
                }

                function copyToClipboard(elementId) {
                    const text = document.getElementById(elementId).textContent;
                    navigator.clipboard.writeText(text).then(() => {
                        alert('Copié : ' + text);
                    });
                }

                function handleProofUpload(input) {
                    const status = document.getElementById('uploadStatus');
                    if (input.files && input.files[0]) {
                        status.textContent = 'Fichier sélectionné : ' + input.files[0].name;
                        status.classList.remove('hidden');
                    }
                }

                async function confirmTransfer(btn) {
                    const cgv = document.getElementById('acceptCgv');
                    const file = document.getElementById('proofUpload').files[0];
                    if (!cgv.checked) { alert('Veuillez accepter les CGV.'); return; }
                                        const name = document.getElementById('contactFullName')?.value?.trim();
                    const email = document.getElementById('contactEmail')?.value?.trim();
                    const phone = document.getElementById('contactPhone')?.value?.trim();
                    const address = document.getElementById('streetAddress')?.value?.trim();
                    const address2 = document.getElementById('streetAddress2')?.value?.trim();
                    const postal = document.getElementById('postalCode')?.value?.trim();
                    const city = document.getElementById('cityName')?.value?.trim();

                    if (!name || !email || !address || !postal || !city) {
                        alert('Veuillez remplir tous les champs obligatoires (étape 1).');
                        return;
                    }

                    btn.disabled = true;
                    btn.textContent = 'Enregistrement...';

                    try {
                        const token = window.StorefrontAPI?.getGuestToken?.();
                        const headers = {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Store-Code': 'agri'
                        };
                        if (token) headers['X-Guest-Cart-Token'] = token;

                        const res = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/orders', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                email, phone, name,
                                address_line_1: address,
                                address_line_2: address2 || null,
                                postal_code: postal,
                                city,
                                country_code: 'FR'
                            })
                        });
                        const body = await res.text();
                        if (!res.ok) throw new Error(res.status + ' ' + body);

                        const json = JSON.parse(body);
                        const orderId = json.order?.public_id || json.order?.id;

                        // No proof: send invoice. With proof: pending mail is sent by the API.
                        if (orderId && !file) {
                            fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/orders/' + orderId + '/notify-invoice', {
                                method: 'POST',
                                headers: { 'Accept': 'application/json', 'X-Store-Code': 'agri' }
                            }).catch(() => {});
                        }

                        // Upload proof if we have an order id
                        if (orderId && file) {
                            const fd = new FormData();
                            fd.append('receipt', file);
                            const proofHeaders = { 'Accept': 'application/json', 'X-Store-Code': 'agri' };
                            if (token) proofHeaders['X-Guest-Cart-Token'] = token;
                            const proofRes = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/orders/' + orderId + '/payment-proofs', {
                                method: 'POST',
                                headers: proofHeaders,
                                body: fd
                            });
                            if (!proofRes.ok) {
                                const pt = await proofRes.text();
                                console.warn('Proof upload failed:', proofRes.status, pt);
                                alert('Commande créée, mais preuve non envoyée: ' + pt.slice(0, 200));
                            }
                        }

                        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Commande enregistrée</span>';
                        btn.className = 'w-full h-14 bg-tertiary text-on-tertiary font-headline-sm text-headline-sm rounded-lg shadow-md flex items-center justify-center gap-space-sm';
                        if (orderId) {
                            const ref = document.getElementById('refValue');
                            if (ref) ref.textContent = orderId;
                        }
                        showOrderConfirmed(orderId, json.order);
                    } catch (err) {
                        console.error(err);
                        btn.disabled = false;
                        btn.textContent = 'Réessayer';
                        alert('Erreur: ' + err.message);
                    }
                }

document.addEventListener('DOMContentLoaded', function() {
  if (typeof getCart !== 'function') return;
  const cart = getCart();
  if (cart.length === 0) return;

  const totalHT = getCartTotal();
  const totalTTC = totalHT * 1.20;

  // Update total displays
  document.querySelectorAll('.font-headline-sm, .font-headline-lg, .font-title-md').forEach(el => {
    const text = el.textContent;
    if (text.includes('€') && (text.includes('4 380') || text.includes('4380') || text.includes('Total'))) {
      if (text.includes('TTC') || text.includes('régler')) {
        el.textContent = formatPrice(totalTTC) + (text.includes('TTC') ? ' TTC' : '');
      } else if (text.includes('HT')) {
        el.textContent = formatPrice(totalHT) + ' HT';
      }
    }
  });

  // Update mobile summary total
  const mobileTotal = document.querySelector('#mobileSummaryToggle .font-headline-sm');
  if (mobileTotal) mobileTotal.textContent = formatPrice(totalTTC) + ' TTC';
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('place-order')
    || document.querySelector('button[type="submit"]')
    || document.getElementById('validate-order');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      StorefrontAPI.handleCheckoutSubmit(e, StorefrontAPI.collectAgriForm);
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const card = document.getElementById('summary-card');
  if (!card || !window.StorefrontAPI) return;

  try {
    const token = StorefrontAPI.getGuestToken();
    const headers = { 'Accept': 'application/json', 'X-Store-Code': 'agri' };
    if (token) headers['X-Guest-Cart-Token'] = token;

    const res = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/cart', { headers });
    if (!res.ok) return;
    const data = await res.json();
    const items = data.cart?.items || [];
    const subtotal = Number(data.totals?.subtotal || 0);
    const tva = subtotal * 0.20;
    const total = subtotal + tva;
    const fmt = StorefrontAPI.formatPrice;

    const itemHtml = items.length
      ? items.map(it => {
          const v = it.variant || {};
          const name = v.variant_name || v.sku || 'Produit';
          const sku = v.sku || '';
          const price = Number(it.unit_price ?? v.price ?? 0);
          const qty = it.quantity || 1;
          return `<div class="flex items-start gap-space-md bg-surface-container-low p-space-md rounded-lg">
            <div class="flex-1 min-w-0">
              <h3 class="font-title-md text-title-md text-on-surface leading-tight truncate">${name}</h3>
              <div class="flex items-center justify-between mt-2">
                <span class="font-body-sm text-[11px] text-secondary">Réf. ${sku} · Qté ${qty}</span>
                <span class="font-title-md text-title-md text-on-surface font-bold">${fmt(price)} HT</span>
              </div>
            </div>
          </div>`;
        }).join('')
      : `<p class="text-secondary text-center py-6">Votre panier est vide</p>`;

    card.innerHTML = `
      <div class="flex items-center justify-between pb-space-xs">
        <h2 class="font-headline-sm text-headline-sm text-on-surface">Récapitulatif de commande</h2>
        <span class="font-label-caps text-label-caps uppercase text-secondary bg-surface-container-high px-2 py-0.5 rounded">${items.length} article${items.length>1?'s':''}</span>
      </div>
      ${itemHtml}
      <div class="space-y-2 pt-2 font-body-md text-body-md text-on-surface border-t border-surface-container-highest/60">
        <div class="flex justify-between"><span class="text-secondary">Sous-total HT</span><span class="font-medium">${fmt(subtotal)}</span></div>
        <div class="flex justify-between"><span class="text-secondary">TVA (20%)</span><span class="font-medium">${fmt(tva)}</span></div>
        <div class="flex justify-between items-center pt-2 border-t">
          <span class="font-bold">Total à régler</span>
          <span class="font-headline-sm text-primary font-bold">${fmt(total)}</span>
        </div>
        <p class="text-secondary text-sm">Soit ${fmt(subtotal)} HT</p>
      </div>
    `;
    const payAmt = document.getElementById('payment-amount');
    if (payAmt) payAmt.textContent = fmt(total) + ' TTC';

  } catch (err) {
    console.info('Checkout cart load failed:', err);
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('https://marketplace-app-production-6dae1174.up.railway.app/api/storefront/payment-info', {
      headers: { 'Accept': 'application/json', 'X-Store-Code': 'agri' }
    });
    if (!res.ok) return;
    const info = await res.json();
    document.querySelectorAll('span, p, div').forEach(el => {
      if (el.children.length) return;
      const t = el.textContent.trim();
      if (info.beneficiary && t.includes('JS Europe')) el.textContent = info.beneficiary;
      if (info.iban && t.replace(/\s/g,'').startsWith('FR')) el.textContent = info.iban;
      if (info.bic && /^[A-Z]{6}/.test(t) && t.length < 15) el.textContent = info.bic;
    });
    if (info.iban) {
      const ibanEl = document.getElementById('ibanValue');
      if (ibanEl) ibanEl.textContent = info.iban;
    }
    if (info.bic) {
      const bicEl = document.getElementById('bicValue');
      if (bicEl) bicEl.textContent = info.bic;
    }
  } catch (e) { console.info('payment-info failed', e); }
});

function showOrderConfirmed(orderId, order) {
  const number = order?.order_number || orderId || '';
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:80;background:rgba(28,27,25,.55);display:flex;align-items:center;justify-content:center;padding:24px;';
  overlay.innerHTML = `
    <div style="background:#fff;max-width:480px;width:100%;border-radius:16px;padding:32px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.15);">
      <div style="width:64px;height:64px;border-radius:50%;background:#e7f5ee;color:#0d7a4f;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;">✓</div>
      <h2 style="font-size:22px;font-weight:700;margin:0 0 8px;">Commande confirmée</h2>
      <p style="color:#5c5a57;margin:0 0 16px;">Votre commande a bien été enregistrée. Nous vérifions votre preuve de paiement.</p>
      ${number ? `<p style="font-weight:600;margin:0 0 20px;">Référence : ${number}</p>` : ''}
      <a href="index.html" style="display:inline-block;background:#8a4b08;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:600;">Retour à l'accueil</a>
    </div>`;
  document.body.appendChild(overlay);
}
