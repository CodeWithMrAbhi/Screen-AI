// script.js — ScreenAI Frontend
// Complete JS — handles UI, file upload, backend connection, and results display

// ─────────────────────────────────────────
// BACKEND URL — change this if needed
// ─────────────────────────────────────────
const BACKEND = "http://127.0.0.1:8000";

// ─────────────────────────────────────────
// DOM READY
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  // ── Test backend connection on page load ──
  fetch(BACKEND + "/")
    .then(r => r.json())
    .then(d => console.log("✅ Backend connected:", d.status))
    .catch(() => console.warn("⚠️ Backend not reachable on " + BACKEND));
});

// ─────────────────────────────────────────
// UI UTILS
// ─────────────────────────────────────────
window.UIUtils = {
  toggleElement: (selector) => {
    const el = document.querySelector(selector);
    if (el) el.style.display = el.style.display === 'none' ? '' : 'none';
  }
};

// ─────────────────────────────────────────
// FILE UPLOAD
// ─────────────────────────────────────────
const uploadZone = document.querySelector('.upload-zone');
const fileInput  = document.createElement('input');
fileInput.type     = 'file';
fileInput.accept   = '.pdf';
fileInput.multiple = true;
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

uploadZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const files = Array.from(fileInput.files).slice(0, 10);

  // Update count label
  const countEl = document.getElementById('file-count-label');
  if (countEl) countEl.textContent = `Uploaded Files (${files.length}/10)`;

  // Build file list
  const colors = ['#3ecf8e','#60a5fa','#f472b6','#a78bfa','#fb923c',
                  '#34d399','#818cf8','#f87171','#fbbf24','#38bdf8'];

  let html = '';
  files.forEach((file, i) => {
    const c = colors[i % colors.length];
    html += `
      <div class="file-row" style="border-left:2px solid ${c};">
        <div style="width:8px;height:8px;border-radius:50%;background:${c};box-shadow:0 0 6px ${c};flex-shrink:0;"></div>
        <span style="font-size:13px;color:#e5e7eb;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${file.name}</span>
        <span style="font-size:11px;color:rgba(255,255,255,0.3);">${(file.size/1024).toFixed(0)} KB</span>
      </div>`;
  });

  const container = document.getElementById('file-list-container');
  if (container) container.innerHTML = html;
});

// ─────────────────────────────────────────
// ANALYSE BUTTON
// ─────────────────────────────────────────
document.querySelector('.btn-analyse').addEventListener('click', async () => {

  const files   = fileInput.files;
  const jdText  = document.querySelector('.jd-textarea').value.trim();
  const btnSpan = document.querySelector('.btn-analyse span');

  // Validate
  if (!files || files.length === 0) { alert('⚠️ Please upload at least 1 CV PDF!'); return; }
  if (files.length > 10)            { alert('⚠️ Maximum 10 CVs allowed!'); return; }
  if (!jdText)                      { alert('⚠️ Please enter a job description!'); return; }

  // Loading state
  btnSpan.textContent = '⏳ Analysing CVs...';

  // Build FormData
  const formData = new FormData();
  for (let file of files) formData.append('cvs', file);
  formData.append('jd', jdText);

  try {

    // ── First check if backend is alive ──
    const ping = await fetch(BACKEND + "/").catch(() => null);
    if (!ping || !ping.ok) {
      alert('❌ Cannot reach backend!\n\nMake sure you ran:\nuvicorn main:app --reload\n\nin your backend folder.');
      btnSpan.textContent = '✦ Analyse All CVs with AI →';
      return;
    }

    // ── Send CVs to backend ──
   const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 120000); // 2 min timeout

const response = await fetch(BACKEND + "/screen", {
  method: 'POST',
  body:   formData,
  signal: controller.signal
});
clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      alert('Backend error: ' + (err.detail || 'Something went wrong.'));
      btnSpan.textContent = '✦ Analyse All CVs with AI →';
      return;
    }

    const data = await response.json();
    showResults(data.results);

  } catch (error) {
    alert('❌ Cannot reach backend!\n\nMake sure you ran:\nuvicorn main:app --reload\n\nin your backend folder.');
    console.error('Fetch error:', error);
  }

  btnSpan.textContent = '✦ Analyse All CVs with AI →';
});

// ─────────────────────────────────────────
// SHOW RESULTS
// ─────────────────────────────────────────
function showResults(results) {
  if (!results || results.length === 0) {
    alert('No results returned from AI.');
    return;
  }

  const rankColors = {
    1: { badge:'linear-gradient(135deg,#f5c842,#f59e0b)', shadow:'rgba(245,200,66,0.5)',  score:'#f5c842' },
    2: { badge:'linear-gradient(135deg,#c0c0c0,#a8a8a8)', shadow:'rgba(192,192,192,0.4)', score:'#c0c0c0' },
    3: { badge:'linear-gradient(135deg,#cd7f32,#a0522d)', shadow:'rgba(205,127,50,0.4)',  score:'#cd7f32' }
  };

  let cardsHTML = '';
  results.forEach((cv, i) => {
    const rankNum  = cv.rank || (i + 1);
    const color    = rankColors[rankNum] || rankColors[3];
    const barWidth = Math.min((cv.score / 10) * 100, 100).toFixed(1);
    const matched  = (cv.matched_skills || []).map(s => `<span class="tag tag-match">${s}</span>`).join('');
    const missing  = (cv.missing_skills || []).map(s => `<span class="tag tag-miss">${s}</span>`).join('');

    cardsHTML += `
      <div class="glass-card" style="padding:16px 18px;margin-bottom:10px;animation:fadeUp 0.5s ease-out ${i*0.12}s both;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:28px;height:28px;border-radius:50%;background:${color.badge};box-shadow:0 0 10px ${color.shadow};display:flex;align-items:center;justify-content:center;font-family:var(--font-heading);font-size:10px;font-weight:700;color:#000;flex-shrink:0;">#${rankNum}</div>
            <div>
              <h3 style="font-size:15px;font-weight:700;color:#fff;line-height:1.2;">${cv.name}</h3>
              <p style="font-family:var(--font-body);font-size:11px;color:rgba(255,255,255,0.45);">${cv.filename}</p>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            <div style="font-family:var(--font-heading);font-size:22px;font-weight:700;color:${color.score};text-shadow:0 0 12px ${color.shadow};">${parseFloat(cv.score).toFixed(1)}</div>
            <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:-2px;">/10</div>
          </div>
        </div>
        <div class="progress-track">
          <div style="height:100%;width:${barWidth}%;border-radius:999px;background:linear-gradient(90deg,#7c6af7,${color.score});box-shadow:0 0 8px ${color.shadow};transition:width 900ms cubic-bezier(0.4,0,0.2,1);"></div>
        </div>
        <p style="font-family:var(--font-body);font-size:12px;color:rgba(255,255,255,0.6);line-height:1.55;margin-bottom:10px;">${cv.reason}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">${matched}${missing}</div>
      </div>`;
  });

  const topScore  = results.length > 0 ? parseFloat(results[0].score).toFixed(1) : '—';
  const strongCVs = results.filter(r => r.score >= 7).length;

  const statsHTML = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:4px;">
      <div class="glass-stat" style="padding:12px 14px;text-align:center;">
        <span style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:#3ecf8e;">${strongCVs}</span>
        <p style="font-family:var(--font-body);font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-top:4px;">Strong Matches</p>
      </div>
      <div class="glass-stat" style="padding:12px 14px;text-align:center;">
        <span style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:#f5c842;text-shadow:0 0 10px rgba(245,200,66,0.6);">${topScore}</span>
        <p style="font-family:var(--font-body);font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-top:4px;">Top Score</p>
      </div>
      <div class="glass-stat" style="padding:12px 14px;text-align:center;">
        <span style="font-family:var(--font-heading);font-size:18px;font-weight:700;color:#fff;">${results.length}</span>
        <p style="font-family:var(--font-body);font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);margin-top:4px;">CVs Ranked</p>
      </div>
    </div>`;

  // Hide empty state
  const emptyState = document.getElementById('empty-state');
  if (emptyState) emptyState.style.display = 'none';

  // Clear old results
  const container = document.getElementById('results-container');
  if (container) {
    container.innerHTML = cardsHTML + statsHTML;
  } else {
    // Fallback — inject into right panel
    const rightPanel = document.querySelector('section:last-of-type');
    rightPanel.querySelectorAll('.glass-card,.glass-stat,div[style*="grid-template-columns"]').forEach(el => el.remove());
    rightPanel.insertAdjacentHTML('beforeend', cardsHTML + statsHTML);
  }
}