/* ============================================================
   ShiftGen — app.js
   ============================================================ */

function today() {
  const d = new Date();
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
  slider.style.width = `calc(${100 / total}% - 2px)`;
  slider.style.left  = `calc(${(idx / total) * 100}% + 5px)`;
}

/* ---- Field builders ---- */
function field(id, label) {
  return `<div class="field">
    <label for="${id}">${label}</label>
    <input id="${id}" type="number" placeholder="0" autocomplete="off" min="0">
  </div>`;
}

function fieldText(id, label, placeholder) {
  return `<div class="field">
    <label for="${id}">${label}</label>
    <input id="${id}" type="text" placeholder="${placeholder || ''}" autocomplete="off">
  </div>`;
}

function staticField(label, value) {
  return `<div class="field">
    <label>${label}</label>
    <div class="static-value">${value}</div>
  </div>`;
}

/* Editable target field — shows default value, double-click to edit */
function editableTargetField(id, label, defaultValue) {
  return `<div class="field">
    <label for="${id}">${label}</label>
    <input id="${id}" type="number" value="${defaultValue}" autocomplete="off" min="0" class="editable-target" title="Double-click to edit" readonly ondblclick="makeEditable(this)" onblur="lockEditable(this)">
  </div>`;
}

function section(title, fieldsHTML, single) {
  return `
    <div class="section-card">
      <div class="section-title">${title}</div>
      <div class="input-grid${single ? ' single' : ''}">${fieldsHTML}</div>
    </div>`;
}

/* ---- Make target editable on double-click ---- */
function makeEditable(el) {
  el.removeAttribute('readonly');
  el.classList.add('editing');
  el.focus();
  el.select();
}

function lockEditable(el) {
  el.setAttribute('readonly', true);
  el.classList.remove('editing');
}

/* ---- Load inputs ---- */
function loadInputs() {
  const type = document.getElementById('shiftType').value;
  const div  = document.getElementById('inputs');
  div.innerHTML = '';
  document.getElementById('output').value = '';

  /* ================= AM ================= */
  if(type==='am'){
    div.innerHTML =
      section('Voice',
        editableTargetField('voiceCommit', 'Voice Commitment', 25) +
        field('voiceAch', 'Voice Achievement')) +

      section('Emerald',
        editableTargetField('emeraldCommit', 'Emerald Commitment', 1) +
        field('emeraldAch', 'Emerald Achievement')) +

      section('Primo',
        field('primo', 'Primo'), true) +

      section('Cash Service',
        editableTargetField('cashCommit', 'Cash Commitment', 23) +
        field('cashAch', 'Cash Achievement')) +

      section('Other',
        field('connect', 'Connectivity Ach') +
        field('mnp', 'MNP'));
  }

  /* ================= PM ================= */
  if(type==='pm'){
    div.innerHTML =
      section('Voice Lines',
        editableTargetField('voiceTarget', 'Daily Target', 50) +
        field('voiceDaily', 'Daily Ach') +
        field('voiceMtdYesterday', 'MTD Ach Yesterday')) +

      section('Postpaid',
        editableTargetField('postTarget', 'Daily Target', 1) +
        field('postDaily', 'Daily Ach') +
        field('emerald', 'Emerald') +
        field('primoPost', 'Primo') +
        field('postMtdYesterday', 'MTD Ach Yesterday')) +

      section('Connectivity',
        editableTargetField('connTarget', 'Daily Target', 4) +
        field('connDaily', 'Daily Ach') +
        field('ehome', 'E-Home') +
        field('adsl', 'ADSL') +
        field('connMtdYesterday', 'MTD Ach Yesterday')) +

      section('Cash Service',
        editableTargetField('cashTarget', 'Daily Target', 47) +
        field('cashRefund', 'Refund') +
        field('cashDaily', 'Daily Ach') +
        field('cashMtdYesterday', 'MTD Ach Yesterday')) +

      section('MNP',
        editableTargetField('mnpTarget', 'Daily Target', 2) +
        field('mnpDaily', 'Daily Ach') +
        field('mnpMtdYesterday', 'MTD Ach Yesterday')) +

      section('Totals',
        field('trx', 'Total TRX'), true);
  }

  /* ================= Closing ================= */
  if(type==='closing'){
    div.innerHTML = section('Confirmation', fieldText('reviewedBy', 'Reviewed By', 'Name'), true);
  }

  const activeTab = document.querySelector('.tab.active');
  if (activeTab) positionSlider(activeTab);
}

/* ---- Helpers ---- */
function val(id) { const el = document.getElementById(id); return el ? (el.value || '0') : '0'; }
function num(id) { return Number(val(id)) || 0; }
function re(ach, target) { return target ? Math.round((ach / target) * 100) + '%' : '—'; }

/* ---- Generate message ---- */
function generateMessage() {
  const type = document.getElementById('shiftType').value;
  const output = document.getElementById('output');

  /* ================= AM ================= */
  if(type==='am'){
    output.value =
`Sohag station
${today()}
AM

- Voice Commitment: ${val('voiceCommit')}
- Voice Achievement: ${val('voiceAch')}

- Emerald Commitment: ${val('emeraldCommit')}
- Emerald Achievement: ${val('emeraldAch')}

- Primo: ${val('primo')}

- Cash Commitment: ${val('cashCommit')}
- Cash Achievement: ${val('cashAch')}

- Connectivity Ach: ${val('connect')}

- MNP: ${val('mnp')}`;
  }

  /* ================= PM ================= */
  if(type==='pm'){
    const day = new Date().getDate();

    // ---- Voice ----
    const vTarget  = num('voiceTarget');
    const vDaily   = num('voiceDaily');
    const vYest    = num('voiceMtdYesterday');
    const vMtdAch  = vDaily + vYest;
    const vMtdTgt  = vTarget * day;

    // ---- Postpaid ----
    const pTarget  = num('postTarget');
    const pDaily   = num('postDaily');
    const pYest    = num('postMtdYesterday');
    const pMtdAch  = pDaily + pYest;
    const pMtdTgt  = Math.min(pTarget * day, 10);

    // ---- Connectivity ----
    const cTarget  = num('connTarget');
    const cDaily   = num('connDaily');
    const cYest    = num('connMtdYesterday');
    const cMtdAch  = cDaily + cYest;
    const cMtdTgt  = cTarget * day;

    // ---- Cash Service ----
    const csTarget = num('cashTarget');
    const csRefund = num('cashRefund');
    const csRaw    = num('cashDaily');
    const csDaily  = csRaw - csRefund;          // Daily Ach = raw - refund
    const csYest   = num('cashMtdYesterday');
    const csMtdAch = csRaw + csYest;            // MTD Ach = raw daily + yesterday MTD
    const csMtdTgt = csTarget * day;

    // ---- MNP ----
    const mTarget  = num('mnpTarget');
    const mDaily   = num('mnpDaily');
    const mYest    = num('mnpMtdYesterday');
    const mMtdAch  = mDaily + mYest;
    const mMtdTgt  = mTarget * day;

    // ---- Totals ----
    const totalTrx = num('trx');
    // Closing Ratio = Voice Daily Ach / Total TRX * 100
    const cr = totalTrx > 0 ? Math.round((vDaily / totalTrx) * 100) + '%' : '—';

    output.value =
`sohag station
${today()}
——————————————
Voice Lines (1509)
- Daily Target: ${vTarget}
- Daily Ach: ${vDaily}
- MTD Target: ${vMtdTgt}
- MTD Ach: ${vMtdAch}
- RE: ${re(vMtdAch, vMtdTgt)}
——————————————
Postpaid (10)
- Daily Target: ${pTarget}
- Daily Ach: ${pDaily}
• Emerald: ${val('emerald')}
• Primo: ${val('primoPost')}
- MTD Target: ${pMtdTgt}
- MTD Ach: ${pMtdAch}
- RE: ${re(pMtdAch, pMtdTgt)}
——————————————
Connectivity (105)
- Daily Target: ${cTarget}
- Daily Ach: ${cDaily}
- E-Home: ${val('ehome')}
- ADSL: ${val('adsl')}
- MTD Target: ${cMtdTgt}
- MTD Ach: ${cMtdAch}
- RE: ${re(cMtdAch, cMtdTgt)}
——————————————
Cash Service (1427)
- Daily Target: ${csTarget}
- Daily Ach: ${csDaily}
- MTD Target: ${csMtdTgt}
- MTD Ach: ${csMtdAch}
- RE: ${re(csMtdAch, csMtdTgt)}
——————————————
MNP (64)
- Daily Target: ${mTarget}
- Daily Ach: ${mDaily}
- MTD Target: ${mMtdTgt}
- MTD Ach: ${mMtdAch}
- RE: ${re(mMtdAch, mMtdTgt)}
——————————————
Total TRX ${totalTrx}
Closing Ratio: ${cr}`;
  }

  /* ================= Closing ================= */
  if(type==='closing'){
    const d = new Date();
    const dateStr = d.getDate() + '-' + (d.getMonth()+1) + '-' + d.getFullYear();
    output.value =
`Sohag Station
${dateStr}
Closing Confirmation

Quality
 ☑︎ Contracts revision
 ☑︎ Forms revision
 ☑︎ Win cash over 1000 LE
 ☑︎ Pending Cash in/out
 ☑︎ Returned dials/status
 ☑︎ Migration/change ownership SDF

Stock
 ☑︎ QOH
 ☑︎ Low stock

Cash
 ☑︎ M-commerce revised
 ☑︎ Staff drawers closing
 ☑︎ Any over/short Cash (0)

Reviewed By ${val('reviewedBy')}`;
  }
}

/* ---- Copy ---- */
function copyMessage() {
  const text = document.getElementById('output').value;
  if (!text.trim()) return;

  navigator.clipboard.writeText(text);

  const toast = document.getElementById('toast');
  if(toast){
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }
}

/* ---- WhatsApp Share ---- */
function shareMessage() {
  const text = document.getElementById('output').value;
  if (!text.trim()) return;

  window.open(
    'https://wa.me/?text=' + encodeURIComponent(text),
    '_blank'
  );
}

/* ---- Init ---- */
window.addEventListener('DOMContentLoaded', loadInputs);
