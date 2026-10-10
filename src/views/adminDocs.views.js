import { generateAdminDocs } from '../services/docs.service.js';

export const adminDocsPage = (_req, res) => {
  res.status(200).send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Docs - Hidden Endpoints</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; font-family:system-ui,-apple-system,sans-serif; }
body { background:#0f172a; color:#e2e8f0; min-height:100vh; }
.nav { display:flex; justify-content:space-between; align-items:center; padding:1rem 2rem; background:#1e293b; border-bottom:1px solid #334155; }
.nav h1 { font-size:1.15rem; }
.nav a { color:#60a5fa; text-decoration:none; font-size:.9rem; margin-left:1rem; }
.container { max-width:860px; margin:2rem auto; padding:0 1rem; }
.warn { background:#422006; border:1px solid #92400e; color:#fbbf24; padding:.8rem 1.2rem; border-radius:8px; font-size:.85rem; margin-bottom:1.5rem; }
.card { background:#1e293b; padding:1.5rem; border-radius:12px; margin-bottom:1.5rem; border:1px solid #334155; }
.mono { font-family:ui-monospace,monospace; }
.method { display:inline-block; padding:.15rem .6rem; border-radius:6px; font-size:.78rem; font-weight:700; margin-right:.5rem; }
.method.post { background:#064e3b; color:#34d399; }
.path { font-family:ui-monospace,monospace; font-size:.95rem; color:#93c5fd; }
h2 { font-size:1rem; margin-bottom:.8rem; }
h3 { font-size:.85rem; color:#94a3b8; margin:1rem 0 .4rem; }
pre { background:#0f172a; border:1px solid #334155; border-radius:8px; padding:1rem; font-size:.78rem; overflow-x:auto; color:#a5f3fc; line-height:1.5; }
p.desc { font-size:.88rem; color:#cbd5e1; margin-bottom:.8rem; }
table { width:100%; border-collapse:collapse; margin:.5rem 0; }
th, td { padding:.5rem .7rem; text-align:left; font-size:.8rem; border-bottom:1px solid #334155; }
th { color:#94a3b8; font-weight:600; }
td.mono-cell { font-family:ui-monospace,monospace; color:#a5f3fc; }
.section { font-size:.85rem; color:#cbd5e1; line-height:1.6; }
.hidden { display:none; }
.login-hint { text-align:center; padding:3rem 1rem; color:#94a3b8; }
</style>
</head>
<body>
<nav class="nav">
  <h1>Admin Docs — Hidden Endpoints</h1>
  <div>
    <a href="/admin">&larr; Dashboard</a>
    <a href="#" id="logout">Logout</a>
  </div>
</nav>
<div class="container">
  <div class="warn"><strong>RAHASIA:</strong> Endpoint di halaman ini tidak ditampilkan di /api/docs publik. Jangan bagikan halaman atau URL ini ke user.</div>
  <div id="content" class="hidden">
    <div class="card">
      <h2>Autentikasi</h2>
      <p class="desc" id="authDesc"></p>
      <pre id="authExample"></pre>
    </div>
    <div id="endpoints"></div>
    <div class="card">
      <h2>Nilai Status (cek-key)</h2>
      <div class="section" id="statusValues"></div>
    </div>
  </div>
  <div id="loginHint" class="login-hint">Memeriksa sesi admin…</div>
</div>
<script>
const token = localStorage.getItem('adminToken');
if (!token) { location.href = '/admin/login'; }

const j = (o) => JSON.stringify(o, null, 2);
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

fetch('/admin/api/docs', { headers: { 'Authorization': 'Bearer ' + token } })
  .then((r) => {
    if (r.status === 401) { localStorage.removeItem('adminToken'); location.href = '/admin/login'; }
    return r.json();
  })
  .then((json) => {
    if (!json.success) return;
    const d = json.data;
    document.getElementById('loginHint').style.display = 'none';
    document.getElementById('content').classList.remove('hidden');
    document.getElementById('authDesc').textContent = d.authentication.description;
    document.getElementById('authExample').textContent = d.authentication.example;

    document.getElementById('endpoints').innerHTML = d.endpoints.map((ep) => {
      const payloadRows = Object.entries(ep.payload || {}).map(([k, v]) =>
        '<tr><td class="mono-cell">' + esc(k) + '</td><td>' + esc(v) + '</td></tr>'
      ).join('');
      return '<div class="card">'
        + '<h2><span class="method post">' + ep.method + '</span> <span class="path">' + ep.path + '</span></h2>'
        + '<p class="desc">' + esc(ep.description) + '</p>'
        + '<h3>Payload (JSON body)</h3>'
        + (payloadRows ? '<table><tr><th>Field</th><th>Keterangan</th></tr>' + payloadRows + '</table>' : '')
        + '<h3>Contoh request</h3><pre>' + esc(j(ep.exampleRequest)) + '</pre>'
        + '<h3>Contoh response</h3><pre>' + esc(j(ep.exampleResponse)) + '</pre>'
        + '</div>';
    }).join('');

    document.getElementById('statusValues').innerHTML = Object.entries(d.statusValues).map(([k, v]) =>
      '<div><strong class="mono">' + esc(k) + '</strong> — ' + esc(v) + '</div>'
    ).join('');
  });

document.getElementById('logout').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  location.href = '/admin/login';
});
</script>
</body>
</html>`);
};
