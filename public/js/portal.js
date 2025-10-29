async function api(path, opts={}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`/api${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  return res.json();
}

async function loadDashboard() {
  const data = await api('/users/me');
  const user = data.user;
  document.getElementById('user-name').textContent = user.name || user.email;
  const avatar = document.getElementById('user-avatar');
  avatar.src = user.avatar_url || '/assets/default-avatar.svg';

  // Loyalty progress (toward 9)
  const mixes = data.loyalty?.mixes_completed || 0;
  const pct = Math.min((mixes % 9) / 9 * 100, 100);
  document.getElementById('loyalty-progress').style.width = pct + '%';
  document.getElementById('loyalty-label').textContent = `${mixes % 9}/9 toward free Mastered Master`;

  // Payments
  const payList = document.getElementById('payments');
  payList.innerHTML = data.payments.map(p => `<li>$${(p.amount_cents/100).toFixed(2)} — ${p.status} — ${new Date(p.created_at).toLocaleDateString()}</li>`).join('');

  // Consultations
  const consList = document.getElementById('consultations');
  consList.innerHTML = data.consultations.map(c => `<li>${new Date(c.start_at).toLocaleString()} — ${c.medium}</li>`).join('');

  // Projects
  const projects = await api('/projects');
  const projList = document.getElementById('projects');
  projList.innerHTML = projects.map(p => {
    const percent = p.status === 'intake' ? 10 : p.status === 'mixing' ? 60 : p.status === 'mastering' ? 85 : p.status === 'revisions' ? 90 : 100;
    const etaStr = p.eta ? new Date(p.eta).toLocaleDateString() : 'N/A';
    return `
      <div class="card">
        <h4>${p.title} <span class="tag">${p.package}</span></h4>
        <div class="progress-bar"><div class="progress" style="width:${percent}%"></div></div>
        <p>Status: ${p.status} — ETA: ${etaStr}</p>
        ${p.status !== 'delivered' ? `
          <div class="actions">
            <button onclick="advance(${p.id}, 'mixing')">Mark Mixing</button>
            <button onclick="advance(${p.id}, 'mastering')">Mark Mastering</button>
            <button onclick="advance(${p.id}, 'revisions')">Mark Revisions</button>
            <button onclick="advance(${p.id}, 'delivered')">Mark Delivered</button>
          </div>
        ` : '<p>Delivered ✔</p>'}
      </div>`;
  }).join('');
}

async function advance(id, next) {
  const body = next === 'mastering' ? { nextStatus: next, etaHours: 12 } : { nextStatus: next };
  const res = await api(`/projects/${id}/advance`, { method:'POST', body: JSON.stringify(body) });
  if (res.error) alert(res.error); else loadDashboard();
}

window.addEventListener('DOMContentLoaded', loadDashboard);
