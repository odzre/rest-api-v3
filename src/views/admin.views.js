export const loginPage = (_req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:system-ui,-apple-system,sans-serif; }
body { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f172a; color:#e2e8f0; }
.card { background:#1e293b; padding:2rem; border-radius:12px; width:100%; max-width:380px; box-shadow:0 10px 40px rgba(0,0,0,.3); }
h1 { font-size:1.4rem; margin-bottom:.4rem; }
p.sub { color:#94a3b8; font-size:.9rem; margin-bottom:1.5rem; }
label { display:block; font-size:.85rem; color:#94a3b8; margin-bottom:.35rem; }
input { width:100%; padding:.65rem .8rem; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#e2e8f0; margin-bottom:1rem; font-size:.95rem; }
input:focus { outline:none; border-color:#3b82f6; }
button { width:100%; padding:.7rem; background:#3b82f6; color:#fff; border:none; border-radius:8px; font-size:1rem; cursor:pointer; font-weight:600; }
button:hover { background:#2563eb; }
.error { color:#f87171; font-size:.85rem; margin-bottom:1rem; display:none; }
</style>
</head>
<body>
<div class="card">
  <h1>Admin Login</h1>
  <p class="sub">Masuk untuk mengelola API key.</p>
  <div class="error" id="err"></div>
  <form id="f">
    <label for="email">Email</label>
    <input type="email" id="email" required autocomplete="email">
    <label for="password">Password</label>
    <input type="password" id="password" required autocomplete="current-password">
    <button type="submit">Login</button>
  </form>
</div>
<script>
const f = document.getElementById('f');
const err = document.getElementById('err');
f.addEventListener('submit', async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  const res = await fetch('/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value }),
  });
  const json = await res.json();
  if (json.success) {
    localStorage.setItem('adminToken', json.data.token);
    location.href = '/admin';
  } else {
    err.textContent = json.message;
    err.style.display = 'block';
  }
});
</script>
</body>
</html>`);
};

export const dashboardPage = (_req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard - API Keys</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:system-ui,-apple-system,sans-serif; }
body { background:#0f172a; color:#e2e8f0; min-height:100vh; }
.nav { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; background:#1e293b; border-bottom:1px solid #334155; }
.nav h1 { font-size:1.15rem; }
.nav .right { display:flex; gap:1rem; align-items:center; }
.nav a { color:#60a5fa; text-decoration:none; font-size:.9rem; }
.container { max-width:960px; margin:2rem auto; padding:0 1rem; }
.section-title { font-size:1rem; margin-bottom:1rem; color:#94a3b8; }
.form-card { background:#1e293b; padding:1.5rem; border-radius:12px; margin-bottom:2rem; }
.form-row { display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-end; }
.field { flex:1; min-width:200px; }
label { display:block; font-size:.8rem; color:#94a3b8; margin-bottom:.3rem; }
input { width:100%; padding:.55rem .7rem; background:#0f172a; border:1px solid #334155; border-radius:8px; color:#e2e8f0; font-size:.9rem; }
input:focus { outline:none; border-color:#3b82f6; }
button.btn { padding:.6rem 1.2rem; background:#3b82f6; color:#fff; border:none; border-radius:8px; cursor:pointer; font-size:.9rem; font-weight:600; }
button.btn:hover { background:#2563eb; }
table { width:100%; border-collapse:collapse; background:#1e293b; border-radius:12px; overflow:hidden; }
th, td { padding:.75rem 1rem; text-align:left; font-size:.85rem; border-bottom:1px solid #334155; }
th { background:#0f172a; color:#94a3b8; font-weight:600; }
td .mono { font-family:monospace; font-size:.8rem; }
.badge { display:inline-block; padding:.15rem .5rem; border-radius:99px; font-size:.72rem; font-weight:600; }
.badge.active { background:#064e3b; color:#34d399; }
.badge.revoked { background:#7f1d1d; color:#f87171; }
.badge.expired { background:#78350f; color:#fbbf24; }
.badge.inactive { background:#374151; color:#9ca3af; }
.actions { display:flex; gap:.4rem; flex-wrap:wrap; }
.actions button { padding:.3rem .6rem; border:none; border-radius:6px; cursor:pointer; font-size:.75rem; font-weight:600; }
.actions .revoke { background:#7f1d1d; color:#f87171; }
.actions .activate { background:#064e3b; color:#34d399; }
.actions .delete { background:#1f2937; color:#e2e8f0; border:1px solid #334155; }
.key-result { background:#0f172a; border:1px solid #334155; border-radius:8px; padding:1rem; margin-top:1rem; display:none; }
.key-result .lbl { font-size:.75rem; color:#94a3b8; margin-bottom:.3rem; }
.key-result code { font-family:monospace; color:#34d399; font-size:.85rem; word-break:break-all; }
.key-result .warn { color:#fbbf24; font-size:.78rem; margin-top:.5rem; }
.empty { text-align:center; color:#64748b; padding:2rem; background:#1e293b; border-radius:12px; }
.toast { position:fixed; top:1rem; right:1rem; background:#1e293b; border:1px solid #334155; padding:.75rem 1.25rem; border-radius:8px; font-size:.85rem; display:none; z-index:99; }
.toast.ok { border-color:#065f46; color:#34d399; }
.toast.err { border-color:#7f1d1d; color:#f87171; }
</style>
</head>
<body>
<nav class="nav">
  <h1>API Key Dashboard</h1>
  <div class="right">
    <a href="/admin/docs">Docs Admin</a>
    <a href="/api/docs" target="_blank">API Docs</a>
    <a href="#" id="logout">Logout</a>
  </div>
</nav>
<div class="container">
  <div class="form-card">
    <div class="section-title">Buat API Key Baru</div>
    <form id="createForm">
      <div class="form-row">
        <div class="field">
          <label for="keyName">Nama / Label</label>
          <input type="text" id="keyName" placeholder="contoh: Production Server" required>
        </div>
        <div class="field" style="max-width:180px;">
          <label for="keyNomor">Nomor HP (opsional)</label>
          <input type="text" id="keyNomor" placeholder="08xxxxxxxxxx">
        </div>
        <div class="field" style="max-width:220px;">
          <label for="expiry">Kedaluwarsa (opsional)</label>
          <input type="date" id="expiry">
        </div>
        <button type="submit" class="btn">Buat Key</button>
      </div>
      <div class="form-row" style="margin-top:.75rem; align-items:center;">
        <label style="margin:0; display:flex; align-items:center; gap:.5rem; cursor:pointer; font-size:.85rem; color:#e2e8f0;">
          <input type="checkbox" id="isAdminKey" style="width:auto; margin:0;">
          Key admin (hanya bisa akses endpoint admin tersembunyi — lihat Docs Admin)
        </label>
      </div>
    </form>
    <div class="key-result" id="keyResult">
      <div class="lbl">API Key (hanya ditampilkan sekali — simpan sekarang):</div>
      <code id="keyVal"></code>
      <div class="warn">Key ini tidak akan ditampilkan lagi. Jika hilang, buat key baru.</div>
    </div>
  </div>

  <div class="form-card">
    <div class="section-title">GetContact Settings</div>
    <p style="font-size:.8rem;color:#64748b;margin-bottom:1rem;">Konfigurasi untuk endpoint /api/get-contact/profile dan /api/get-contact/tag. Nilai sensitif hanya ditampilkan sebagian (••••). Kosongkan field jika tidak ingin mengubahnya.</p>
    <form id="gcForm">
      <div class="form-row">
        <div class="field">
          <label for="gcFinalKey">Final Key</label>
          <input type="text" id="gcFinalKey" placeholder="•••••••• (klik load untuk lihat)" style="font-family:monospace;">
        </div>
        <div class="field">
          <label for="gcToken">Token</label>
          <input type="text" id="gcToken" placeholder="•••••••• (klik load untuk lihat)" style="font-family:monospace;">
        </div>
      </div>
      <div class="form-row" style="margin-top:.5rem;">
        <div class="field">
          <label for="gcBaseURL">Base URL (opsional)</label>
          <input type="text" id="gcBaseURL" placeholder="https://pbssrv-centralevents.com" style="font-family:monospace;">
        </div>
        <div class="field" style="max-width:120px;">
          <label for="gcCountry">Country Code</label>
          <input type="text" id="gcCountry" placeholder="id">
        </div>
        <button type="submit" class="btn">Simpan</button>
        <button type="button" class="btn" id="gcReset" style="background:#334155;">Reset</button>
      </div>
    </form>
  </div>

  <div class="section-title">Daftar API Keys</div>
  <div id="tableWrap"></div>
</div>
<div class="toast" id="toast"></div>

<script>
const API = '/admin/api';
let token = localStorage.getItem('adminToken');

if (!token) { location.href = '/admin/login'; }

const toast = (msg, ok=true) => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (ok ? 'ok' : 'err');
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 3000);
};

const authFetch = (url, opts = {}) => {
  return fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      ...(opts.headers || {}),
    },
  });
};

const checkAuth = (res) => {
  if (res.status === 401) {
    localStorage.removeItem('adminToken');
    location.href = '/admin/login';
    return false;
  }
  return true;
};

const fmtDate = (s) => {
  if (!s) return 'Permanen';
  return new Date(s).toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' });
};

const statusBadge = (rec) => {
  if (String(rec.active) !== '1') return '<span class="badge inactive">Revoked</span>';
  if (rec.expiresAt && new Date(rec.expiresAt).getTime() < Date.now()) {
    return '<span class="badge expired">Expired</span>';
  }
  return '<span class="badge active">Active</span>';
};

const typeBadge = (r) => {
  if ((r.type || 'user') === 'admin') {
    return '<span class="badge" style="background:#4c1d95;color:#c4b5fd;">Admin</span>';
  }
  return '<span class="badge" style="background:#1e3a8a;color:#93c5fd;">User</span>';
};

const loadKeys = async () => {
  const res = await authFetch(API + '/keys');
  if (!checkAuth(res)) return;
  const json = await res.json();
  if (!json.success) { toast(json.message, false); return; }

  const wrap = document.getElementById('tableWrap');
  if (!json.data || json.data.length === 0) {
    wrap.innerHTML = '<div class="empty">Belum ada API key. Buat key baru di atas.</div>';
    return;
  }

  let rows = json.data.map(r => {
    const active = String(r.active) === '1';
    let actions = '';
    if (active) {
      actions += '<button class="revoke" onclick="revokeKey(\\''+r.id+'\\')">Revoke</button>';
    } else {
      actions += '<button class="activate" onclick="activateKey(\\''+r.id+'\\')">Activate</button>';
    }
    actions += '<button class="delete" onclick="deleteKey(\\''+r.id+'\\')">Delete</button>';
    return '<tr>'
      + '<td><span class="mono">'+r.name+'</span></td>'
      + '<td>'+typeBadge(r)+'</td>'
      + '<td><span class="mono">'+(r.nomor || '-')+'</span></td>'
      + '<td>'+statusBadge(r)+'</td>'
      + '<td>'+fmtDate(r.expiresAt)+'</td>'
      + '<td>'+fmtDate(r.createdAt)+'</td>'
      + '<td><div class="actions">'+actions+'</div></td>'
      + '</tr>';
  }).join('');

  wrap.innerHTML = '<table><thead><tr><th>Nama</th><th>Tipe</th><th>Nomor</th><th>Status</th><th>Kedaluwarsa</th><th>Dibuat</th><th>Aksi</th></tr></thead><tbody>'+rows+'</tbody></table>';
};

document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const expiresAt = document.getElementById('expiry').value;
  const body = {
    name: document.getElementById('keyName').value,
    nomor: document.getElementById('keyNomor').value,
  };
  if (document.getElementById('isAdminKey').checked) {
    body.type = 'admin';
  }
  if (expiresAt) {
    body.expiresAt = new Date(expiresAt + 'T23:59:59').toISOString();
  }
  const res = await authFetch(API + '/keys', { method: 'POST', body: JSON.stringify(body) });
  if (!checkAuth(res)) return;
  const json = await res.json();
  if (json.success) {
    document.getElementById('keyResult').style.display = 'block';
    document.getElementById('keyVal').textContent = json.data.key;
    toast('API key berhasil dibuat.');
    loadKeys();
  } else {
    toast(json.message, false);
  }
});

window.revokeKey = async (id) => {
  if (!confirm('Cabut API key ini? Key tidak bisa digunakan lagi sampai diaktifkan kembali.')) return;
  const res = await authFetch(API + '/keys/' + id + '/revoke', { method: 'PATCH' });
  if (!checkAuth(res)) return;
  const json = await res.json();
  toast(json.message, json.success);
  loadKeys();
};

window.activateKey = async (id) => {
  const res = await authFetch(API + '/keys/' + id + '/activate', { method: 'PATCH' });
  if (!checkAuth(res)) return;
  const json = await res.json();
  toast(json.message, json.success);
  loadKeys();
};

window.deleteKey = async (id) => {
  if (!confirm('Hapus API key ini permanen? Tidak bisa dikembalikan.')) return;
  const res = await authFetch(API + '/keys/' + id, { method: 'DELETE' });
  if (!checkAuth(res)) return;
  const json = await res.json();
  toast(json.message, json.success);
  loadKeys();
};

// GetContact config
const loadGcConfig = async () => {
  const res = await authFetch(API + '/config/getcontact');
  if (!checkAuth(res)) return;
  const json = await res.json();
  if (!json.success) { toast(json.message, false); return; }
  const c = json.data || {};
  gcFinalKey.placeholder = c.finalKey || 'belum di-set';
  gcToken.placeholder = c.token || 'belum di-set';
  gcBaseURL.value = c.baseURL || '';
  gcCountry.value = c.countryCode || '';
  gcFinalKey.value = '';
  gcToken.value = '';
};

document.getElementById('gcForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = {};
  if (gcFinalKey.value.trim()) body.finalKey = gcFinalKey.value.trim();
  if (gcToken.value.trim()) body.token = gcToken.value.trim();
  if (gcBaseURL.value.trim()) body.baseURL = gcBaseURL.value.trim();
  if (gcCountry.value.trim()) body.countryCode = gcCountry.value.trim();
  if (Object.keys(body).length === 0) { toast('Tidak ada perubahan.', false); return; }
  const res = await authFetch(API + '/config/getcontact', { method: 'PUT', body: JSON.stringify(body) });
  if (!checkAuth(res)) return;
  const json = await res.json();
  toast(json.message, json.success);
  if (json.success) loadGcConfig();
});

document.getElementById('gcReset').addEventListener('click', async () => {
  gcFinalKey.value = '';
  gcToken.value = '';
  loadGcConfig();
});

document.getElementById('logout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  location.href = '/admin/login';
});

loadKeys();
loadGcConfig();
</script>
</body>
</html>`);
};
