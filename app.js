/* ============================================================
   ShiftGen — app.js (AM FIXED + PM UNTOUCHED)
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

function section(title, fieldsHTML, single) {
  return `
    <div class="section-card">
      <div class="section-title">${title}</div>
      <div class="input-grid${single ? ' single' : ''}">${fieldsHTML}</div>
    </div>`;
}

/* ---- Daily targets ---- */
const T = { voice: 43, postpaid: 1, connectivity: 4, cash: 38, mnp: 2 };

/* ---- Load inputs ---- */
function loadInputs() {
  const type = document.getElementById('shiftType').value;
  const div  = document.getElementById('inputs');
  div.innerHTML = '';
  document.getElementById('output').value = '';

  /* ================= AM (FIXED) ================= */
  if(type==='am'){
    div.innerHTML =
      section('Voice',
        staticField('Voice Commitment', '23') +
        field('voiceAch', 'Voice Achievement')) +

      section('Emerald',
        staticField('Emerald Commitment', '1') +
        field('emeraldAch', 'Emerald Achievement')) +

      section('Primo',
        field('primo', 'Primo'), true) +

      section('Cash Service',
        staticField('Cash Commitment', '20') +
        field('cashAch', 'Cash Achievement')) +

      section('Other',
        field('connect', 'Connectivity Ach') +
        field('mnp', 'MNP'));
  }

  /* ================= PM (UNCHANGED) ================= */
  if(type==='pm'){
    div.innerHTML =
      section('Voice Lines',
        staticField('Daily Target', T.voice) +
        field('voiceDaily', 'Daily Ach') +
        field('voiceMtdYesterday', 'MTD Ach Yesterday') +
        field('drAch', 'DR Achievement')) +

      section('Postpaid',
        staticField('Daily Target', T.postpaid) +
        field('postDaily', 'Daily Ach') +
        field('emerald', 'Emerald') +
        field('primoPost', 'Primo') +
        field('postMtdYesterday', 'MTD Ach Yesterday')) +

      section('Connectivity',
        staticField('Daily Target', T.connectivity) +
        field('connDaily', 'Daily Ach') +
        field('ehome', 'E-Home') +
        field('adsl', 'ADSL') +
        field('connMtdYesterday', 'MTD Ach Yesterday')) +

      section('Cash Service',
        staticField('Daily Target', T.cash) +
        field('cashDaily', 'Daily Ach') +
        field('cashMtdYesterday', 'MTD Ach Yesterday')) +

      section('MNP',
        staticField('Daily Target', T.mnp) +
        field('mnpDaily', 'Daily Ach') +
        field('mnpMtdYesterday', 'MTD Ach Yesterday')) +

      section('Totals',
        field('trx', 'Total TRX'), true);
  }

  /* ================= Closing ================= */
  if(type==='closing'){
    div.innerHTML = section('Confirmation', fieldText('reviewed', 'Reviewed By', 'Name'), true);
  }

  const activeTab = document.querySelector('.tab.active');
  if (activeTab) positionSlider(activeTab);
}

/* ---- Helpers ---- */
function val(id) { const el = document.getElementById(id); return el ? (el.value || '0') : '0'; }
function num(id) { return Number(val(id)) || 0; }
function re(ach, target) { return target ? Math.round((ach/target)*100)+'%' : '—'; }

/* ---- Generate message ---- */
function generateMessage() {
  const type = document.getElementById('shiftType').value;
  const output = document.getElementById('output');

  /* ================= AM (FIXED) ================= */
  if(type==='am'){
    output.value =
`Sohag station
${today()}
AM

- Voice Commitment: 23
- Voice Achievement: ${val('voiceAch')}

- Emerald Commitment: 1
- Emerald Achievement: ${val('emeraldAch')}

- Primo: ${val('primo')}

- Cash Commitment: 20
- Cash Achievement: ${val('cashAch')}

- Connectivity Ach: ${val('connect')}

- MNP: ${val('mnp')}`;
  }

  /* ================= PM (UNCHANGED) ================= */
  if(type==='pm'){
    const day = new Date().getDate();

    const vDaily = num('voiceDaily'), vYest = num('voiceMtdYesterday');
    const vMtdAch = vDaily + vYest, vMtdTgt = T.voice * day;

    const pDaily = num('postDaily'), pYest = num('postMtdYesterday');
    const pMtdAch = pDaily + pYest, pMtdTgt = T.postpaid * day;

    const cDaily = num('connDaily'), cYest = num('connMtdYesterday');
    const cMtdAch = cDaily + cYest, cMtdTgt = T.connectivity * day;

    const csDaily = num('cashDaily'), csYest = num('cashMtdYesterday');
    const csMtdAch = csDaily + csYest, csMtdTgt = T.cash * day;

    const mDaily = num('mnpDaily'), mYest = num('mnpMtdYesterday');
    const mMtdAch = mDaily + mYest, mMtdTgt = T.mnp * day;

    const totalTrx = num('trx');
    const dailySum = vDaily + pDaily + cDaily + csDaily + mDaily;
    const cr = totalTrx > 0 ? Math.round((dailySum / totalTrx) * 100) + '%' : '—';

    output.value =
`* *sohag station*  
* ${today()}  
——————————————
** Voice Lines (1300)*  
- Daily Target: ${T.voice}  
- Daily Ach: ${vDaily}
- MTD Target: ${vMtdTgt}
- MTD Ach: ${vMtdAch}
- DR Achievement: ${val('drAch')}  
- *RE: *${re(vMtdAch, vMtdTgt)}

——————————————
* Postpaid (9)*  
- Daily Target: ${T.postpaid}  
- Daily Ach: ${pDaily}
• *Emerald*: ${val('emerald')}
- • *Primo*: ${val('primoPost')}  
- MTD Target: ${pMtdTgt}
- MTD Ach: ${pMtdAch}
- RE: *${re(pMtdAch, pMtdTgt)}*

——————————————
* Connectivity (99)*  
- Daily Target: ${T.connectivity}
- Daily Ach: ${cDaily}
- *E-Home*: ${val('ehome')}
- *ADSL*: ${val('adsl')}
- MTD Target: ${cMtdTgt}
- MTD Ach: ${cMtdAch}
- *RE: *${re(cMtdAch, cMtdTgt)}

——————————————
* Cash Service (1145)*  
- Daily Target: ${T.cash}  
- Daily Ach: ${csDaily}
- MTD Target: ${csMtdTgt}
- MTD Ach: ${csMtdAch}
- RE: *${re(csMtdAch, csMtdTgt)}*

——————————————
* MNP (59)*  
- Daily Target: ${T.mnp}
- Daily Ach: ${mDaily}
- MTD Target: ${mMtdTgt}
- MTD Ach: ${mMtdAch}
- RE: *${re(mMtdAch, mMtdTgt)}*

Total TRX ${totalTrx}
Closing Ratio: ${cr}`;
  }

  /* ================= Closing ================= */
  if(type==='closing'){
    output.value =
`Closing Done ✅

Reviewed By: ${val('reviewed')}`;
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
