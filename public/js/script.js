/* ═══════════════════════════════════════════════════
   LifeFlow — Blood Donation Website
   Shared JS: script.js  (used by portal.html)
   Database : blood  |  Table: donor_blood
═══════════════════════════════════════════════════ */

const API = '';   // same-origin — no base URL needed

// ── Indian States ─────────────────────────────────────────────────────────────
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman & Nicobar Islands","Chandigarh","Dadra & Nagar Haveli","Daman & Diu",
  "Delhi","Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry"
];

// ── Populate state dropdowns ───────────────────────────────────────────────────
function populateStates() {
  ['reg-state', 's-state', 'edit-state'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    STATES.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
  });
}

// ── Tab switching ──────────────────────────────────────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
  if (tab === 'all') loadAllDonors();
}

// ── Toast notification ─────────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : '');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── Blood group badge ──────────────────────────────────────────────────────────
function bgBadge(bg) {
  const cls = bg.startsWith('A') ? '' : bg.startsWith('B') ? 'bg-b' : bg.startsWith('O') ? 'bg-o' : 'bg-ab';
  return `<span class="badge ${cls}">${bg}</span>`;
}

// ── Register donor ─────────────────────────────────────────────────────────────
async function registerDonor(e) {
  e.preventDefault();
  const mob = document.getElementById('reg-mobile').value.trim();
  if (!/^\d{10}$/.test(mob)) return showToast('Enter a valid 10-digit mobile number.', 'error');

  const data = {
    name:          document.getElementById('reg-name').value.trim(),
    age:           parseInt(document.getElementById('reg-age').value),
    gender:        document.getElementById('reg-gender').value,
    blood_group:   document.getElementById('reg-blood').value,
    mobile:        mob,
    email:         document.getElementById('reg-email').value.trim(),
    state:         document.getElementById('reg-state').value,
    city:          document.getElementById('reg-city').value.trim(),
    address:       document.getElementById('reg-address').value.trim(),
    last_donation: document.getElementById('reg-lastdon').value || null,
  };

  if (!data.state || !data.city) return showToast('Please select a state and enter a city.', 'error');

  try {
    const res  = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) return showToast(json.error, 'error');
    showThankyou(data.name);
    clearForm();
  } catch {
    showToast('Server error. Please ensure the backend is running.', 'error');
  }
}

// ── Clear form ─────────────────────────────────────────────────────────────────
function clearForm() {
  document.getElementById('registerForm').reset();
}

// ── Thank you popup ────────────────────────────────────────────────────────────
function showThankyou(name) {
  document.getElementById('ty-name').textContent = `Welcome to the LifeFlow family, ${name}!`;
  document.getElementById('tyOverlay').classList.add('show');
}
function closeThankyou() {
  document.getElementById('tyOverlay').classList.remove('show');
}

// ── Search donors ──────────────────────────────────────────────────────────────
async function searchDonors() {
  const bg    = document.getElementById('s-blood').value;
  const state = document.getElementById('s-state').value;
  const city  = document.getElementById('s-city').value.trim();

  const params = new URLSearchParams();
  if (bg)    params.set('blood_group', bg);
  if (state) params.set('state', state);
  if (city)  params.set('city', city);

  try {
    const res  = await fetch(`${API}/api/search?${params}`);
    const data = await res.json();
    renderResults(data, 'search-results', false);
  } catch {
    showToast('Server error. Make sure the backend is running.', 'error');
  }
}

// ── Load all donors ────────────────────────────────────────────────────────────
async function loadAllDonors() {
  try {
    const res  = await fetch(`${API}/api/donors`);
    const data = await res.json();
    document.getElementById('total-count').textContent = data.length;
    renderResults(data, 'all-results', true);
  } catch {
    document.getElementById('all-results').innerHTML =
      '<div class="empty-state"><div class="icon">⚠️</div><p>Could not load donors. Make sure the backend is running.</p></div>';
  }
}

// ── Render donor table ─────────────────────────────────────────────────────────
function renderResults(donors, containerId, showActions) {
  const el = document.getElementById(containerId);
  if (!donors.length) {
    el.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>No donors found matching your criteria.</p></div>';
    return;
  }
  const rows = donors.map(d => `
    <tr>
      <td>${d.name}</td>
      <td>${d.age}</td>
      <td>${d.gender}</td>
      <td>${bgBadge(d.blood_group)}</td>
      <td>${d.mobile}</td>
      <td>${d.state}</td>
      <td>${d.city}</td>
      <td>${d.last_donation ? new Date(d.last_donation).toLocaleDateString('en-IN') : '—'}</td>
      ${showActions ? `
      <td>
        <div class="action-btns">
          <button class="btn-edit" onclick='openEdit(${JSON.stringify(d)})'>✏️ Edit</button>
          <button class="btn-del"  onclick="deleteDonor(${d.id},'${d.name}')">🗑️ Del</button>
        </div>
      </td>` : ''}
    </tr>`).join('');

  el.innerHTML = `
    <div class="results-header">
      <span class="result-count"><span>${donors.length}</span> donor${donors.length !== 1 ? 's' : ''} found</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Age</th><th>Gender</th>
            <th>Blood</th><th>Mobile</th>
            <th>State</th><th>City</th>
            <th>Last Donated</th>
            ${showActions ? '<th>Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Delete donor ───────────────────────────────────────────────────────────────
async function deleteDonor(id, name) {
  if (!confirm(`Remove ${name} from the donor list?`)) return;
  try {
    const res = await fetch(`${API}/api/donors/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast(`${name} removed successfully.`, 'success'); loadAllDonors(); }
    else showToast('Delete failed.', 'error');
  } catch { showToast('Server error.', 'error'); }
}

// ── Open edit modal ────────────────────────────────────────────────────────────
function openEdit(d) {
  document.getElementById('edit-id').value      = d.id;
  document.getElementById('edit-name').value    = d.name;
  document.getElementById('edit-age').value     = d.age;
  document.getElementById('edit-gender').value  = d.gender;
  document.getElementById('edit-blood').value   = d.blood_group;
  document.getElementById('edit-mobile').value  = d.mobile;
  document.getElementById('edit-email').value   = d.email  || '';
  document.getElementById('edit-state').value   = d.state;
  document.getElementById('edit-city').value    = d.city;
  document.getElementById('edit-address').value = d.address || '';
  document.getElementById('edit-lastdon').value = d.last_donation ? d.last_donation.split('T')[0] : '';
  document.getElementById('editModal').classList.add('open');
}

function closeEdit() {
  document.getElementById('editModal').classList.remove('open');
}

// ── Save edit ──────────────────────────────────────────────────────────────────
async function saveEdit() {
  const id  = document.getElementById('edit-id').value;
  const mob = document.getElementById('edit-mobile').value.trim();
  if (!/^\d{10}$/.test(mob)) return showToast('Enter a valid 10-digit mobile number.', 'error');

  const data = {
    name:          document.getElementById('edit-name').value.trim(),
    age:           parseInt(document.getElementById('edit-age').value),
    gender:        document.getElementById('edit-gender').value,
    blood_group:   document.getElementById('edit-blood').value,
    mobile:        mob,
    email:         document.getElementById('edit-email').value.trim(),
    state:         document.getElementById('edit-state').value,
    city:          document.getElementById('edit-city').value.trim(),
    address:       document.getElementById('edit-address').value.trim(),
    last_donation: document.getElementById('edit-lastdon').value || null,
  };

  try {
    const res  = await fetch(`${API}/api/donors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) return showToast(json.error, 'error');
    showToast('Donor updated successfully!', 'success');
    closeEdit();
    loadAllDonors();
  } catch { showToast('Server error.', 'error'); }
}

// ── Animated blood cells (home page) ──────────────────────────────────────────
function initCells() {
  const container = document.getElementById('cells');
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    const size = 20 + Math.random() * 80;
    cell.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${6 + Math.random() * 10}s;
      animation-delay:${Math.random() * 8}s;
    `;
    container.appendChild(cell);
  }
}

// ── Init on DOM ready ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateStates();
  initCells();

  // Register form submit
  const form = document.getElementById('registerForm');
  if (form) form.addEventListener('submit', registerDonor);

  // Edit modal: close on overlay click
  const modal = document.getElementById('editModal');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeEdit(); });

  // Hash-based tab navigation from index.html buttons
  if (location.hash === '#search') {
    const btn = document.querySelectorAll('.tab-btn')[1];
    if (btn) switchTab('search', btn);
  }
});
