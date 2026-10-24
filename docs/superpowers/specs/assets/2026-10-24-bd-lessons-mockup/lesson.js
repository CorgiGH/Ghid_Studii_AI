const ROWS = [
  { nume: 'Popescu', prenume: 'Ionuț', an: 2, bursa: '450' },
  { nume: 'Pavel', prenume: 'Maria', an: 3, bursa: '250' },
  { nume: 'Marinescu', prenume: 'Alexandru', an: 1, bursa: '350' },
  { nume: 'Ionescu', prenume: 'Ana', an: 1, bursa: null },
];
const COLS = ['nume', 'prenume', 'an', 'bursa'];

function show(id) { document.getElementById(id).classList.add('show'); }

// The query machine: FROM -> WHERE -> SELECT -> ORDER BY on ROWS.
// With predict: true, the WHERE step asks for a guess before revealing.
function machine(root, opts) {
  const predict = !!(opts && opts.predict);
  const steps = [
    { chip: 'FROM studenti', h: 'FROM: de unde iau datele',
      p: 'Pornim cu tot tabelul studenti: toate rândurile, toate coloanele. Încă nu s-a filtrat nimic.' },
    { chip: 'WHERE an = 1', h: 'WHERE: aceeași întrebare pentru fiecare rând',
      p: predict ? 'Dă click pe rândurile care crezi că rămân după „an = 1”, apoi apasă Verifică.'
                 : 'Fiecare rând primește întrebarea „an = 1?”. Popescu are 2: fals, iese. Pavel are 3: iese și el. Rămân Marinescu și Ionescu.',
      after: 'Fiecare rând a primit întrebarea „an = 1?”. Popescu (2) și Pavel (3): fals, ies. Marinescu și Ionescu: adevărat, rămân.' },
    { chip: 'SELECT nume, bursa', h: 'SELECT: ce coloane arăt',
      p: 'Din rândurile rămase păstrez doar coloanele cerute. Prenumele și anul dispar. Bursa Anei e NULL: nu se știe.' },
    { chip: 'ORDER BY nume', h: 'ORDER BY: în ce ordine',
      p: 'La final, rândurile se sortează după nume, de la A la Z: Ionescu înaintea lui Marinescu.' },
  ];
  root.innerHTML = `
    <div class="chips"></div>
    <div class="machine">
      <div class="scroll"><table class="t"></table></div>
      <div><h3></h3><p class="mp"></p>
        <div class="btns check"><button class="btn primary">Verifică</button></div>
        <p class="score"></p>
        <div class="stepnav"><button class="btn back">◀ Înapoi</button><button class="btn primary next">Pasul următor ▶</button><span class="count"></span></div>
      </div>
    </div>`;
  const $ = s => root.querySelector(s);
  let k = 0, checked = !predict;
  const guess = new Set();

  function render() {
    $('.chips').innerHTML = steps.map((s, i) => `<span class="chip ${i < k ? 'done' : i === k ? 'cur' : ''}">${s.chip}</span>`).join('');
    const shown = k >= 2 ? ['nume', 'bursa'] : COLS;
    const asking = predict && k === 1 && !checked;
    const reveal = k >= 2 || (k === 1 && checked);
    let list = ROWS.slice();
    if (k >= 3) list = list.filter(r => r.an === 1).sort((a, b) => a.nume.localeCompare(b.nume));
    const extra = predict && k === 1 ? `<th>${checked ? 'ai ghicit' : 'rămâne?'}</th>` : (!predict && k === 1 ? '<th>an = 1 ?</th>' : '');
    let html = '<tr>' + COLS.map(c => `<th class="${shown.includes(c) ? '' : 'dim'}">${c}</th>`).join('') + extra + '</tr>';
    for (const r of list) {
      const keep = r.an === 1;
      let cls = reveal ? (keep ? 'keep' : 'drop') : '';
      if (asking) cls = 'clickable' + (guess.has(r.nume) ? ' guess' : '');
      html += `<tr class="${cls}" data-n="${r.nume}">` + COLS.map(c =>
        `<td class="${shown.includes(c) ? '' : 'dim'}${r[c] === null ? ' null' : ''}">${r[c] === null ? 'NULL' : r[c]}</td>`).join('');
      if (predict && k === 1) {
        if (!checked) html += `<td class="mark">${guess.has(r.nume) ? 'rămâne' : '—'}</td>`;
        else { const ok = guess.has(r.nume) === keep; html += `<td class="mark ${ok ? 'ok' : 'bad'}">${ok ? '✓ corect' : '✗ ' + (keep ? 'rămânea' : 'ieșea')}</td>`; }
      } else if (!predict && k === 1) {
        html += keep ? '<td class="mark ok">adevărat ✓</td>' : `<td class="mark bad">${r.an} = 1 → fals ✗</td>`;
      }
      html += '</tr>';
    }
    $('table').innerHTML = html;
    if (asking) root.querySelectorAll('tr.clickable').forEach(tr => tr.onclick = () => {
      const n = tr.dataset.n; guess.has(n) ? guess.delete(n) : guess.add(n); render();
    });
    $('h3').textContent = steps[k].h;
    $('.mp').textContent = (k === 1 && predict && checked) ? steps[1].after : steps[k].p;
    $('.count').textContent = `Pasul ${k + 1} din ${steps.length}`;
    $('.check').style.display = asking ? 'flex' : 'none';
    if (k !== 1) $('.score').textContent = '';
    $('.next').disabled = asking || k === steps.length - 1;
    $('.back').disabled = k === 0;
  }
  $('.check button').onclick = () => {
    checked = true;
    const ok = ROWS.filter(r => guess.has(r.nume) === (r.an === 1)).length;
    $('.score').textContent = `Ai ghicit ${ok} din ${ROWS.length} rânduri.`;
    render();
  };
  $('.next').onclick = () => { k = Math.min(steps.length - 1, k + 1); render(); };
  $('.back').onclick = () => { k = Math.max(0, k - 1); render(); };
  render();
}

// Multiple-choice quiz: buttons with data-ok and data-fb.
function quiz(root, onWrong) {
  const fb = root.querySelector('.fb');
  root.querySelectorAll('.qopt').forEach(b => b.addEventListener('click', () => {
    root.querySelectorAll('.qopt').forEach(x => x.classList.remove('right', 'wrong'));
    const ok = b.dataset.ok === '1';
    b.classList.add(ok ? 'right' : 'wrong');
    fb.innerHTML = `<span class="${ok ? 'good' : 'bad'}">${ok ? 'Corect.' : 'Nu chiar.'}</span> ${b.dataset.fb}`;
    if (!ok && onWrong) onWrong();
  }));
}
