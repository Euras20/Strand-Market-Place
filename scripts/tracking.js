

// ---- extracted from tracking.html ----

const form = document.getElementById('lookup-form');
    const input = document.getElementById('tracking-code');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const result = document.getElementById('result');

    function showError(msg) {
      error.textContent = msg;
      error.classList.remove('hidden');
    }
    function hideError() { error.classList.add('hidden'); }

    function render(data) {
      document.getElementById('order-id').textContent = data.public_id || data.order_id || data.order_number || '—';
      document.getElementById('status-text').textContent = data.status || data.current_status || '—';
      document.getElementById('updated').textContent = data.updated_at || data.last_update || '—';

      const timeline = document.getElementById('timeline');
      const events = data.history || data.events || data.timeline || [];
      if (events.length) {
        timeline.innerHTML = events.map((ev, i) => `
          <div class="flex gap-4">
            <div class="flex flex-col items-center">
              <div class="w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-primary ring-4 ring-primary/20' : 'bg-outline-variant'} shrink-0"></div>
              ${i < events.length - 1 ? '<div class="w-px flex-1 bg-outline-variant/60 mt-1"></div>' : ''}
            </div>
            <div class="pb-1">
              <div class="font-medium">${ev.status || ev.label || ''}</div>
              <div class="text-on-surface-variant text-xs mt-0.5">${ev.created_at || ev.date || ''}</div>
              ${ev.note ? `<div class="text-xs mt-1 text-on-surface-variant">${ev.note}</div>` : ''}
            </div>
          </div>
        `).join('');
      } else {
        timeline.innerHTML = '<p class="text-on-surface-variant text-sm">Aucune étape détaillée pour le moment.</p>';
      }

      result.classList.remove('hidden');
    }

    async function lookupByCode(code) {
      loading.classList.remove('hidden');
      hideError();
      result.classList.add('hidden');
      try {
        const json = await StorefrontAPI.api('/storefront/tracking/lookup', {
          method: 'POST',
          body: JSON.stringify({ tracking_code: code }),
        });
        render(json.data || json);
      } catch (err) {
        showError(err.message || 'Code de suivi introuvable ou invalide.');
      } finally {
        loading.classList.add('hidden');
      }
    }

    async function lookupByToken(token) {
      loading.classList.remove('hidden');
      hideError();
      try {
        const json = await StorefrontAPI.api(`/storefront/tracking/${encodeURIComponent(token)}`);
        render(json.data || json);
      } catch (err) {
        showError('Lien de suivi invalide ou expiré.');
      } finally {
        loading.classList.add('hidden');
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = input.value.trim();
      if (!code) return;
      lookupByCode(code);
    });

    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const code = params.get('code');
    if (token) lookupByToken(token);
    else if (code) {
      input.value = code;
      lookupByCode(code);
    }
