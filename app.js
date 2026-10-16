
/* Wallmann V3 TEST — GitHub PWA wrapper (iPad standalone) */
'use strict';
(() => {
  const frame = document.getElementById('app');
  const status = document.getElementById('status');
  const retry = document.getElementById('reload');
  const stateKey = 'wallmann-v3-test-pwa';
  const allowed = new Set(['home', 'login', 'admin']);
  let base;
  try {
    base = new URL(window.WALLMANN_CONFIG.appsScriptUrl);
    if (base.origin !== 'https://script.google.com' ||
        !/^\/(?:macros\/s|a\/macros\/[^/]+\/s)\/[^/]+\/exec$/.test(base.pathname) ||
        base.search || base.hash || base.username || base.password) {
      throw Error('Ugyldig Apps Script-webappadresse.');
    }
  } catch (error) {
    status.textContent = 'Kontrollér Apps Script-adressen i config.js.';
    return;
  }
  const qs = new URLSearchParams(location.search);
  const page = allowed.has(qs.get('page')) ? qs.get('page') : 'home';
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const bridge = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  function load(key, storage) {
    try { return JSON.parse(storage.getItem(stateKey + ':' + key) || 'null'); }
    catch (_) { return null; }
  }
  function save(key, value, storage) {
    try {
      if (value == null) storage.removeItem(stateKey + ':' + key);
      else storage.setItem(stateKey + ':' + key, JSON.stringify(value));
    } catch (_) {
      status.hidden = false;
      status.textContent = 'Kunne ikke gemme sessionen på denne iPad. Undlad at lukke appen under en registrering.';
    }
  }
  function initialState() {
    const admin = load('admin', sessionStorage);
    return {
      kiosk: load('kiosk', localStorage),
      admin,
      pending: load('pending', sessionStorage),
      mode: admin && load('mode', sessionStorage) === 'admin' ? 'admin' : 'kiosk'
    };
  }
  function fromApp(e) {
    // GAS HTML-service kan være indlejret i endnu en Google-frame.
    // Kontrollér Google-origin og 256-bit bridge i stedet for at kræve samme frameWindow.
    if (e.origin !== 'https://script.google.com' &&
        !/^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/i.test(e.origin)) return false;
    const d = e.data;
    return d && typeof d === 'object' && d.app === 'wallmann-v3' && d.bridge === bridge;
  }
  window.addEventListener('message', e => {
    if (!fromApp(e)) return;
    const d = e.data;
    if (d.action === 'ready') {
      // Send only to the exact Google origin from the validated iframe.
      e.source.postMessage({ app: 'wallmann-v3', bridge, action: 'bootstrap', state: initialState() }, e.origin);
      status.hidden = true;
      retry.hidden = true;
    } else if (d.action === 'state' && d.state && typeof d.state === 'object') {
      const s = d.state;
      save('kiosk', s.kiosk || null, localStorage);
      save('admin', s.admin || null, sessionStorage);
      save('pending', s.pending || null, sessionStorage);
      save('mode', s.mode === 'admin' && s.admin ? 'admin' : 'kiosk', sessionStorage);
    } else if (d.action === 'navigate' && allowed.has(d.page)) {
      const next = new URL(location.href);
      if (d.page === 'home') next.search = '?kiosk=1';
      else next.search = '?page=' + encodeURIComponent(d.page) + '&kiosk=1';
      location.assign(next.href);
    }
  });
  let target = new URL(base.href);
  target.searchParams.set('page', page);
  target.searchParams.set('bridge', bridge);
  retry.addEventListener('click', () => location.reload());
  frame.src = target.href;
  setTimeout(() => {
    if (!status.hidden) {
      status.textContent = 'ASTRA svarer ikke endnu. Tryk Prøv igen, eller kontrollér Wi-Fi.';
      retry.hidden = false;
    }
  }, 15000);
})();
