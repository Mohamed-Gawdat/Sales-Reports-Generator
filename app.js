/* ============================================================
   ShiftGen — app.js
   ============================================================ */

function today() {
  let d = new Date();
  return d.getDate() + " / " + d.toLocaleString('en', { month: 'short' }) + " / " + d.getFullYear();
}

/* ---- Tab switching ---- */
function selectTab(btn, value) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('shiftType').value = value;
  positionSlider(btn);
  loadInputs();
}

function positionSlider(activeTab) {
  const slider = document.getElementById('tabSlider');
  const group  = document.getElementById('tabGroup');
  const tabs   = [...group.querySelectorAll('.tab')];
  const idx    = tabs.indexOf(activeTab);
  const total  = tabs.length;
  const pct    = (idx / total) * 100;
  const w      = 100 / total;
  slider.style.width = `calc(${w}% - 2px)`;
  slider.style.left  = `calc(${pct}% + 5px)`;
}

/* ---- Build inputs ---- */
function field(id, label, placeholder) {
  return `<div class="field"><label for="${id}">${label}</label><input id="${id}" placeholder="${placeholder}" autocomplete="off"></div>`;
}

function staticField(label, value) {
  return `<div class="field"><label>${label}</label><div class="static-value">${value}</div></div>`;
}

function section(title, fieldsHTML, single = false) {
  return `
    <div class="section-card">
      <div class="section-title">${title}</div>
      <div class="input-grid${single ? ' single' : ''}">${fieldsHTML}</div>
    </div>`;
}

function loadInputs() {
  const type = document.getElementById('shiftType').value;
  const div  = document.getElementById('inputs');
  div.innerHTML = '';

  // Clear output
  document.getElementById('output').value = '';

  if (type === 'am') {
    div.innerHTML =
      section('Voice',
        staticField('Voice Commitment', '23') +
        field('voiceAch', 'Voice Achievement', '0')) +
      section('Emerald',
        staticField('Emerald Commitment', '1') +
        field('emeraldAch', 'Emerald Achievement', '0')) +
      section('Primo', field('primo', 'Primo', '0'), true) +
      section('Cash Service',
        staticField('Cash Commitment', '20') +
        field('cashAch', 'Cash Achievement', '0')) +
      section('Other',
        field('connect', 'Connectivity Ach', '0') +
        field('mnp', 'MNP', '0'));
  }

  if (type === 'bm') {
    div.innerHTML =
      section('Voice Lines',
        field('voiceDailyAch', 'Daily Ach', '0') +
        field('voiceTotalMTD', 'Total MTD Ach', '0') +
        field('drAch', 'DR Achievement', '0'), false) +
      section('Postpaid',
        field('postDaily', 'Daily Ach', '0') +
        field('emerald', 'Emerald', '0') +
        field('primoPost', 'Primo', '0') +
        field('postTotalMTD', 'Total MTD Ach', '0')) +
      section('Connectivity',
        field('connDaily', 'Daily Ach', '0') +
        field('ehome', 'E-Home', '0') +
        field('adsl', 'ADSL', '0') +
        field('connTotalMTD', 'Total MTD Ach', '0')) +
      section('Cash Service',
        field('cashDaily', 'Daily Ach', '0') +
        field('cashTotalMTD', 'Total MTD Ach', '0')) +
      section('MNP',
        field('mnpDaily', 'Daily Ach', '0') +
        field('mnpMTD', 'MTD Ach', '0')) +
      section('Final',
        field('trx', 'Total TRX', '0'), true);
  }

  if (type === 'closing') {
    div.innerHTML = section('Confirmation', field('reviewed', 'Reviewed By', 'Name'), true);
  }

  // Re-init slider position
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) positionSlider(activeTab);
}

/* ---- Helpers ---- */
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}
function num(id) { return Number(val(id)) || 0; }

/* ---- Generate message ---- */
function generateMessage() {
  const type   = document.getElementById('shiftType').value;
  const output = document.getElementById('output');

  if (type === 'am') {
    output.value = `Sohag station
${today()}
Am

-Voice Commitment:  23
-Voice Achievement:  ${val('voiceAch')}

-Emerald Commitment:  1
-Emerald Achievement:  ${val('emeraldAch')}

-Primo:   ${val('primo')}

-Cash Commitment:  20
-Cash Achievement:  ${val('cashAch')}

-Connectivity Ach :  ${val('connect')}

-MNP:  ${val('mnp')}`;
  }

  if (type === 'bm') {
    const voiceMTD    = num('voiceTotalMTD') + num('voiceDailyAch');
    const voiceRE     = ((voiceMTD / 585) * 100).toFixed(1);
    const postMTD     = num('postTotalMTD')  + num('postDaily');
    const postRE      = ((postMTD / 3) * 100).toFixed(1);
    const connMTD     = num('connTotalMTD')  + num('connDaily');
    const connRE      = ((connMTD / 52) * 100).toFixed(1);
    const cashMTD     = num('cashTotalMTD')  + num('cashDaily');
    const cashRE      = ((cashMTD / 494) * 100).toFixed(1);
    const mnpRE       = ((num('mnpMTD') / 28) * 100).toFixed(1);
    const closingRatio = num('trx') > 0
      ? ((num('voiceDailyAch') / num('trx')) * 100).toFixed(1) + '%'
      : '—';

    output.value = `Sohag station
${today()}

══════════════════════════
Voice Lines (1396)
  Daily Target : 45
  Daily Ach    : ${val('voiceDailyAch')}
  MTD Target   : 585
  MTD Ach      : ${voiceMTD}
  DR Ach       : ${val('drAch')}
  RE           : ${voiceRE} %

══════════════════════════
Postpaid (10)
  Daily Target : 1
  Daily Ach    : ${val('postDaily')}
  Emerald      : ${val('emerald')}
  Primo        : ${val('primoPost')}
  MTD Target   : 3
  MTD Ach      : ${postMTD}
  RE           : ${postRE} %

══════════════════════════
Connectivity (100)
  Daily Target : 4
  Daily Ach    : ${val('connDaily')}
  E-Home       : ${val('ehome')}
  ADSL         : ${val('adsl')}
  MTD Target   : 52
  MTD Ach      : ${connMTD}
  RE           : ${connRE} %

══════════════════════════
Cash Service (1175)
  Daily Target : 38
  Daily Ach    : ${val('cashDaily')}
  MTD Target   : 494
  MTD Ach      : ${cashMTD}
  RE           : ${cashRE} %

══════════════════════════
MNP (55)
  Daily Target : 2
  Daily Ach    : ${val('mnpDaily')}
  MTD Target   : 28
  MTD Ach      : ${val('mnpMTD')}
  RE           : ${mnpRE} %

══════════════════════════
Total TRX      : ${val('trx')}
Closing Ratio  : ${closingRatio}`;
  }

  if (type === 'closing') {
    output.value = `Sohag station
${today()}

Closing Confirmation ✅

─────────────────────────
Quality
  ☑ Contracts revision
  ☑ Forms revision
  ☑ Win cash over 1000 LE
  ☑ Pending Cash in/out
  ☑ Returned dials/status
  ☑ Migration/change ownership SDF

─────────────────────────
Stock
  ☑ QOH
  ☑ Low stock

─────────────────────────
Cash
  ☑ M-commerce revised
  ☑ Staff drawers closing
  ☑ Any over/short Cash 0

─────────────────────────
Reviewed By: ${val('reviewed')}`;
  }

  // Animate output area
  const wrap = document.getElementById('outputWrap');
  wrap.style.borderColor = 'rgba(79,168,255,0.5)';
  setTimeout(() => { wrap.style.borderColor = ''; }, 800);

  // Scroll to output
  wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ---- Copy ---- */
function copyMessage() {
  const text = document.getElementById('output').value;
  if (!text.trim()) return;
  navigator.clipboard.writeText(text);
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---- Share to WhatsApp ---- */
function shareMessage() {
  const text = document.getElementById('output').value;
  if (!text.trim()) return;
  const encoded = encodeURIComponent(text);
  window.open('https://wa.me/?text=' + encoded, '_blank');
}

/* ---- Init ---- */
window.addEventListener('DOMContentLoaded', () => {
  loadInputs();
  // Position slider on first tab
  const firstTab = document.querySelector('.tab.active');
  if (firstTab) positionSlider(firstTab);
});
