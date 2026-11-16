// Checkout flow — creates order from current server cart
async function placeOrder(formData) {
  const token = StorefrontAPI.getGuestToken();
  const headers = {};
  if (token) headers['X-Guest-Cart-Token'] = token;

  const json = await StorefrontAPI.api('/storefront/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(formData),
  });

  return json;
}

async function submitPaymentProof(orderPublicId, file) {
  const token = StorefrontAPI.getGuestToken();
  const form = new FormData();
  form.append('receipt', file);

  const headers = {};
  if (token) headers['X-Guest-Cart-Token'] = token;

  // Use raw fetch because of FormData
  const res = await fetch(`${window.API_BASE || '/api'}/storefront/orders/${orderPublicId}/payment-proofs`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: form,
  });

  if (!res.ok) throw new Error(`Proof upload failed: ${res.status}`);
  return res.json();
}

function collectAdultForm() {
  return {
    email: document.getElementById('email')?.value || 'guest@example.com',
    phone: document.getElementById('phone')?.value || null,
    name: document.getElementById('name')?.value || '',
    address_line_1: document.getElementById('address')?.value || '',
    postal_code: document.getElementById('postal')?.value || '',
    city: document.getElementById('city')?.value || '',
    country_code: (document.getElementById('country')?.value || 'FR').slice(0, 2).toUpperCase(),
  };
}

function collectAgriForm() {
  // Agri form field ids may differ; fall back to common names
  const get = (id) => document.getElementById(id)?.value || document.querySelector(`[name="${id}"]`)?.value || '';
  return {
    email: get('email') || 'guest@example.com',
    phone: get('phone') || get('tel') || null,
    name: get('name') || get('fullname') || get('nom') || '',
    address_line_1: get('address') || get('address_line_1') || get('rue') || '',
    postal_code: get('postal') || get('postal_code') || get('cp') || '',
    city: get('city') || get('ville') || '',
    country_code: (get('country') || get('country_code') || 'FR').slice(0, 2).toUpperCase(),
  };
}

async function handleCheckoutSubmit(e, collector) {
  e?.preventDefault?.();
  const btn = e?.target?.querySelector?.('button[type="submit"], #validate-order, #place-order') || null;
  if (btn) btn.disabled = true;

  try {
    const data = collector();
    if (!data.name || !data.address_line_1 || !data.postal_code || !data.city) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const result = await placeOrder(data);
    const order = result.order || result;
    const publicId = order.public_id || order.id;

    // Store for confirmation / proof step
    try { localStorage.setItem('last_order', JSON.stringify(order)); } catch {}

    // If proof input exists and has a file, upload it
    const proofInput = document.getElementById('proof') || document.querySelector('input[type="file"]');
    if (proofInput?.files?.[0] && publicId) {
      await submitPaymentProof(publicId, proofInput.files[0]);
    }

    // Success feedback — keep existing design
    alert('Commande créée avec succès.' + (publicId ? ` Référence : ${publicId}` : ''));
    // Optional redirect
    // window.location.href = `tracking.html?id=${publicId}`;
  } catch (err) {
    console.error(err);
    alert('Impossible de créer la commande. Vérifiez votre panier et réessayez.');
  } finally {
    if (btn) btn.disabled = false;
  }
}

window.StorefrontAPI = {
  ...window.StorefrontAPI,
  placeOrder,
  submitPaymentProof,
  collectAdultForm,
  collectAgriForm,
  handleCheckoutSubmit,
};
