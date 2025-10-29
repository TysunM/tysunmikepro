// Helpers
const token = localStorage.getItem('token');
const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

async function getJSON(url) {
  const res = await fetch(url, { headers });
  return res.json();
}
async function postJSON(url, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  return res.json();
}

const state = { projects: [], usersById: {}, files: [], payments: [], consultations: [] };

// Load data
async function loadData() {
  // Admin view: fetch everything. You likely have protected admin endpoints; here we reuse existing + new ones.
  const [projectsRes, paymentsRes, consultationsRes, usersRes, filesRes] = await Promise.all([
    getJSON('/api/admin/projects'),            // Create this endpoint to list all projects
    getJSON('/api/admin/payments'),            // Create this endpoint to list all payments
    getJSON('/api/admin/consultations'),       // Create this endpoint to list all consultations
    getJSON('/api/admin/users'),               // Create this endpoint to list all users basic info
    getJSON('/api/admin/files')                // Create this endpoint to list all project_files joined with users/projects
  ]);

  state.projects = projectsRes.projects || [];
  state.payments = paymentsRes.payments || [];
  state.consultations = consultationsRes.consultations || [];
  state.files = filesRes.files || [];
  state.usersById = (usersRes.users || []).reduce((acc,u)=>{acc[u.id]=u;return acc;}, {});
  renderAll();
}

function renderAll() {
  renderProjects();
  renderFiles();
  renderPayments();
  renderConsultations();
}

// Render projects
function renderProjects() {
  const tbody = document.getElementById('projects-body');
  const filterPkg = document.getElementById('filter-package').value;
  const filterStatus = document.getElementById('filter-status').value;
  const query = document.getElementById('admin-search').value.toLowerCase().trim();

  const rows = state.projects
    .filter(p => !filterPkg || p.package === filterPkg)
    .filter(p => !filterStatus || p.status === filterStatus)
    .filter(p => {
      if (!query) return true;
      const user = state.usersById[p.user_id] || {};
      return [p.title, p.package, p.status, user.email, user.name].some(v => (v||'').toLowerCase().includes(query));
    })
    .map(p => {
      const user = state.usersById[p.user_id] || {};
      const statusClass = `status-${p.status}`;
      const eta = p.eta ? new Date(p.eta).toLocaleDateString() : '—';
      const updated = p.updated_at ? new Date(p.updated_at).toLocaleString() : '—';
      return `
      <tr data-id="${p.id}">
        <td><input type="checkbox" class="row-check"></td>
        <td><strong>${p.title}</strong></td>
        <td>${user.name || user.email || '—'}</td>
        <td>${p.package}</td>
        <td><span class="status-tag ${statusClass}">${p.status}</span></td>
        <td>${eta}</td>
        <td>${p.size || 'normal'}</td>
        <td>${updated}</td>
        <td>
          <button class="btn btn-primary" data-action="advance" data-next="mixing">Mixing</button>
          <button class="btn btn-primary" data-action="advance" data-next="mastering">Mastering</button>
          <button class="btn" data-action="advance" data-next="revisions">Revisions</button>
          <button class="btn" data-action="advance" data-next="delivered">Delivered</button>
        </td>
      </tr>`;
    }).join('');
  tbody.innerHTML = rows;
}

// Render files
function renderFiles() {
  const tbody = document.getElementById('files-body');
  tbody.innerHTML = state.files.map(f => {
    const p = state.projects.find(x => x.id === f.project_id) || {};
    const u = state.usersById[p.user_id] || {};
    const up = f.uploaded_at ? new Date(f.uploaded_at).toLocaleString() : '—';
    const tagClass = f.status === 'awaiting_upload' ? 'file-awaiting'
                   : f.status === 'files_received' ? 'file-received'
                   : 'file-review';
    return `
    <tr data-id="${f.id}" data-project="${f.project_id}">
      <td>${p.title || '—'}</td>
      <td>${u.name || u.email || '—'}</td>
      <td><a href="${f.file_url}" target="_blank">View file</a></td>
      <td><span class="file-status ${tagClass}">${f.status}</span></td>
      <td>${up}</td>
      <td>
        <select class="file-status-select">
          <option value="awaiting_upload" ${f.status==='awaiting_upload'?'selected':''}>Awaiting</option>
          <option value="files_received" ${f.status==='files_received'?'selected':''}>Received</option>
          <option value="in_review" ${f.status==='in_review'?'selected':''}>In review</option>
        </select>
        <button class="btn btn-primary" data-action="update-file">Update</button>
      </td>
    </tr>`;
  }).join('');
}

// Render payments
function renderPayments() {
  const tbody = document.getElementById('payments-body');
  tbody.innerHTML = state.payments.map(p => {
    const user = state.usersById[p.user_id] || {};
    const amount = `$${(p.amount_cents/100).toFixed(2)}`;
    const date = new Date(p.created_at).toLocaleString();
    return `
    <tr>
      <td>${user.name || user.email || '—'}</td>
      <td>${p.project_id || '—'}</td>
      <td>${amount}</td>
      <td>${p.status}</td>
      <td>${date}</td>
    </tr>`;
  }).join('');
}

// Render consultations
function renderConsultations() {
  const tbody = document.getElementById('consultations-body');
  tbody.innerHTML = state.consultations.map(c => {
    const user = state.usersById[c.user_id] || {};
    const start = new Date(c.start_at).toLocaleString();
    return `
    <tr>
      <td>${user.name || user.email || '—'}</td>
      <td>${c.project_id || '—'}</td>
      <td>${start}</td>
      <td>${c.medium}</td>
    </tr>`;
  }).join('');
}

// Select all projects
document.getElementById('select-all-projects').addEventListener('change', (e) => {
  document.querySelectorAll('#projects-body .row-check').forEach(cb => cb.checked = e.target.checked);
});

// Apply bulk status
document.getElementById('apply-bulk-status').addEventListener('click', async () => {
  const status = document.getElementById('bulk-status').value;
  if (!status) return alert('Choose a status');
  const ids = Array.from(document.querySelectorAll('#projects-body .row-check'))
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.closest('tr').dataset.id, 10));
  if (!ids.length) return alert('Select projects');
  const res = await postJSON('/api/admin/projects/bulk-update', { ids, status });
  if (res.updated >= 0) loadData(); else alert('Bulk update failed');
});

// Apply bulk ETA (client-side calc, you can create an API to adjust ETAs if stored as dates)
document.getElementById('apply-bulk-eta').addEventListener('click', async () => {
  const mode = document.getElementById('bulk-eta').value;
  if (!mode) return alert('Choose ETA adjustment');
  const deltaDays = mode === 'extend-1d' ? 1 : mode === 'extend-2d' ? 2 : mode === 'reduce-1d' ? -1 : 0;
  const ids = Array.from(document.querySelectorAll('#projects-body .row-check'))
    .filter(cb => cb.checked)
    .map(cb => parseInt(cb.closest('tr').dataset.id, 10));
  if (!ids.length) return alert('Select projects');

  // Create an endpoint to adjust ETA by deltaDays
  const res = await postJSON('/api/admin/projects/eta-adjust', { ids, deltaDays });
  if (res.updated >= 0) loadData(); else alert('ETA adjust failed');
});

// Row actions: advance status
document.getElementById('projects-table').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="advance"]');
  if (!btn) return;
  const tr = btn.closest('tr'); const id = parseInt(tr.dataset.id, 10);
  const next = btn.dataset.next;
  const res = await postJSON(`/api/admin/projects/${id}/status`, { status: next });
  if (res.id) loadData(); else alert('Update failed');
});

// File status update
document.getElementById('files-table').addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action="update-file"]'); if (!btn) return;
  const tr = btn.closest('tr'); const id = parseInt(tr.dataset.id, 10);
  const select = tr.querySelector('.file-status-select');
  const status = select.value;
  const res = await postJSON('/api/admin/files/update', { id, status });
  if (res.ok) loadData(); else alert('File status update failed');
});

// Filters + search
document.getElementById('filter-package').addEventListener('change', renderProjects);
document.getElementById('filter-status').addEventListener('change', renderProjects);
document.getElementById('admin-search').addEventListener('input', renderProjects);

// Refresh
document.getElementById('refresh-data').addEventListener('click', loadData);

// Logout
document.getElementById('logout').addEventListener('click', () => { localStorage.removeItem('token'); location.href='/login'; });

// Init
window.addEventListener('DOMContentLoaded', loadData);
