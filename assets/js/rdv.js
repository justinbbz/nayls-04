/* Nayls 04 Esthétique — « Votre message, déjà écrit » : choix des prestations (facultatif) → message prêt à envoyer.
   100 % statique : aucun serveur, aucune donnée enregistrée, aucun coût mensuel. Le message part de l'appareil de la cliente
   (Instagram @nayls04, SMS ou appel) ; Naya répond pour fixer le jour et l'heure.
   Prix : data/catalogue.json → assets/js/data.js (window.NY). */
(() => {
  'use strict';
  const CFG = window.NYCFG || {};
  const NY = window.NY || { groups: [] };
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const eur = n => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const root = $('#reserver');
  if (!root) return;
  const UI = () => window.NYUI || {};

  /* ---------- données ---------- */
  const ITEMS = {};
  NY.groups.forEach(g => g.items.forEach(i => { ITEMS[i.id] = Object.assign({ group: g.id }, i); }));
  const priced = id => !ITEMS[id].quote && !ITEMS[id].unit;                  // « sur devis » et « par ongle » ne comptent pas dans le total
  const priceText = i => (i.quote ? 'sur devis' : i.unit ? eur(i.price) + ' ' + i.unit : eur(i.price));
  /* Nom précis dans le message et le récapitulatif : « Dépose » existe pour les mains et pour les pieds. */
  const fullName = id => { const i = ITEMS[id]; return i.group === 'mains' ? i.name + ' (mains)' : i.group === 'pieds' ? i.name + ' (pieds)' : i.name; };
  const msgName = id => (ITEMS[id].quote ? fullName(id).replace(/\)$/, ', sur devis)') : fullName(id));
  const S = { group: NY.groups[0] ? NY.groups[0].id : '', cart: [], days: [], moments: [] };
  const total = () => S.cart.reduce((a, id) => a + (priced(id) ? ITEMS[id].price : 0), 0);
  /* Une option (nail art, rallongement, teinture) s'ajoute à une prestation de base de la liste « requires ». */
  const unmet = () => S.cart.filter(id => ITEMS[id].requires && !ITEMS[id].requires.some(r => S.cart.includes(r)));
  const baseNames = id => ITEMS[id].requires.map(r => ITEMS[r].name).join(', ');
  const note = msg => { const n = $('#rdvOk'); if (n) n.textContent = msg || ''; };

  /* ---------- carte des prestations ---------- */
  const tabs = $('#tabs'), list = $('#menuList');
  function buildMenu() {
    tabs.innerHTML = NY.groups.map(g => '<button type="button" class="tab' + (g.id === S.group ? ' is-on' : '') + '" data-g="' + g.id + '" aria-pressed="' + (g.id === S.group) + '">' + esc(g.title) + '<sup data-n="' + g.id + '" aria-hidden="true"></sup></button>').join('');
    list.innerHTML = NY.groups.map(g =>
      '<section class="mgroup' + (g.id === S.group ? ' is-on' : '') + '" data-g="' + g.id + '" aria-label="' + esc(g.title) + '">' +
      '<div class="mgroup__head"><span class="mgroup__k">' + esc(g.kicker) + '</span><p>' + esc(g.intro) + '</p></div>' +
      g.items.map(row).join('') + '</section>').join('');
  }
  function row(i) {
    return '<article class="mrow" data-id="' + i.id + '">' +
      '<div><h4 class="mrow__name">' + esc(i.name) + (i.addon ? '<span class="mrow__addon">Option</span>' : '') + '</h4>' +
      (i.desc ? '<p class="mrow__desc">' + esc(i.desc) + '</p>' : '') + '</div>' +
      '<div class="mrow__right"><span class="mrow__price">' + esc(priceText(i)) + '</span>' +
      '<button type="button" class="mrow__add" aria-pressed="false" aria-label="Ajouter au message : ' + esc(i.name) + '"><svg aria-hidden="true"><use href="#i-plus"/></svg></button></div></article>';
  }
  tabs.addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) setGroup(b.dataset.g); });
  function setGroup(id) {
    S.group = id;
    $$('.tab', tabs).forEach(t => { const on = t.dataset.g === id; t.classList.toggle('is-on', on); t.setAttribute('aria-pressed', String(on)); });
    $$('.mgroup', list).forEach(g => g.classList.toggle('is-on', g.dataset.g === id));
  }
  list.addEventListener('click', e => { const add = e.target.closest('.mrow__add'); if (add) toggle(add.closest('.mrow').dataset.id); });

  /* Ajoute ou retire une prestation ; renvoie { selected, msg }. */
  function toggle(id) {
    let msg = '';
    const i = S.cart.indexOf(id);
    if (i >= 0) {
      S.cart.splice(i, 1); msg = 'Retiré : ' + fullName(id) + '.';
      const orphans = S.cart.filter(x => ITEMS[x].requires && !ITEMS[x].requires.some(r => S.cart.includes(r)));
      orphans.forEach(o => { S.cart.splice(S.cart.indexOf(o), 1); msg += ' ' + fullName(o) + ' est retiré aussi : il s’ajoute à une prestation de base.'; });
    } else {
      // deux prestations qui partagent un tag (par exemple deux poses des mains) : la nouvelle remplace l'ancienne
      const tags = ITEMS[id].tags || [];
      const clash = S.cart.filter(x => (ITEMS[x].tags || []).some(t => tags.includes(t)));
      clash.forEach(c => S.cart.splice(S.cart.indexOf(c), 1));
      S.cart.push(id);
      msg = 'Ajouté : ' + fullName(id) + (clash.length ? ' (remplace ' + clash.map(fullName).join(', ') + ')' : '') + '.';
      if (ITEMS[id].requires && !ITEMS[id].requires.some(r => S.cart.includes(r))) msg += ' À ajouter à : ' + baseNames(id) + '.';
    }
    note(msg);
    refresh();
    return { selected: S.cart.includes(id), msg };
  }

  /* ---------- message ---------- */
  function cleanName(v) {
    const n = (v || '').replace(/[^\p{L}\p{M}'’\- ]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return n ? n.charAt(0).toUpperCase() + n.slice(1) : '';
  }
  const joinOu = a => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' ou ' + a[a.length - 1]);
  function buildMessage() {
    const name = cleanName($('#rdvPrenom').value);
    const note = ($('#rdvNote').value || '').replace(/\s+/g, ' ').trim();
    let m = 'Bonjour Naya' + (name ? ', c’est ' + name : '') + '. ';
    m += S.cart.length ? 'Je voudrais prendre rendez-vous pour : ' + S.cart.map(msgName).join(', ') + '. ' : 'Je voudrais prendre rendez-vous. ';
    if (S.days.length || S.moments.length) {
      const j = S.days.length ? joinOu(S.days) : '', mo = S.moments.length ? joinOu(S.moments) : '';
      m += 'Je suis plutôt disponible ' + (j ? 'le ' + j.replace(/, /g, ', le ').replace(/ ou /g, ' ou le ') : '') + (j && mo ? ', ' : '') + mo + '. ';
    }
    if (note) m += note + (/[.!?…]$/.test(note) ? ' ' : '. ');
    return m + 'Pourriez-vous me proposer un créneau ? Merci !';
  }

  /* ---------- récapitulatif ---------- */
  function refresh() {
    $$('.mrow', list).forEach(r => {
      const on = S.cart.includes(r.dataset.id);
      r.classList.toggle('is-sel', on);
      const b = $('.mrow__add', r); b.setAttribute('aria-pressed', String(on));
      b.innerHTML = '<svg aria-hidden="true"><use href="#' + (on ? 'i-check' : 'i-plus') + '"/></svg>';
    });
    $$('.row[data-id]').forEach(r => r.classList.toggle('is-sel', S.cart.includes(r.dataset.id)));   // carte des tarifs de la page
    NY.groups.forEach(g => { const n = S.cart.filter(id => ITEMS[id].group === g.id).length; const s = $('[data-n="' + g.id + '"]', tabs); if (s) s.textContent = n ? n : ''; });
    $('#sumList').innerHTML = S.cart.length
      ? S.cart.map(id => '<li><span>' + esc(fullName(id)) + '</span><span><b>' + esc(priceText(ITEMS[id])) + '</b><button type="button" data-rm="' + id + '" aria-label="Retirer : ' + esc(fullName(id)) + '"><svg aria-hidden="true"><use href="#i-x"/></svg></button></span></li>').join('') +
        unmet().map(id => '<li class="sum__empty sum__warn">« ' + esc(ITEMS[id].name) + ' » s’ajoute à : ' + esc(baseNames(id)) + '.</li>').join('')
      : '<li class="sum__empty">Aucune prestation choisie : vous pouvez aussi écrire simplement à Naya.</li>';
    $('#sumTotal').textContent = eur(total()) + (S.cart.some(id => !priced(id)) ? ' + options' : '');
    const m = buildMessage();
    $('#rdvPreview').textContent = m;
    $('#rdvSms').href = 'sms:' + (CFG.PHONE_TEL || '+33787048670') + '?&body=' + encodeURIComponent(m);
  }
  $('#sumList').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) toggle(b.dataset.rm); });
  $('#rdvPrenom').addEventListener('input', refresh);
  $('#rdvNote').addEventListener('input', refresh);
  [['#rdvDays', 'days'], ['#rdvMoments', 'moments']].forEach(([sel, key]) => {
    const box = $(sel); const order = $$('.tg', box).map(b => b.dataset.v);
    box.addEventListener('click', e => {
      const b = e.target.closest('.tg'); if (!b) return;
      const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on));
      S[key] = order.filter(v => $('.tg[data-v="' + v.replace(/"/g, '') + '"]', box).getAttribute('aria-pressed') === 'true');
      refresh();
    });
  });

  /* ---------- envoi : Instagram (copie puis ouvre la conversation), SMS, copie ---------- */
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (e2) { /* ignoré */ } ta.remove(); return ok;
    }
  }
  $('#rdvCopy').addEventListener('click', async () => { note((await copy(buildMessage())) ? 'Message copié : collez-le dans une conversation avec Naya.' : 'Copie impossible ici : sélectionnez le texte du message et copiez-le.'); });
  $('#rdvIg').addEventListener('click', async () => { const ok = await copy(buildMessage()); note(ok ? 'Message copié. La conversation avec Naya s’ouvre : collez-le puis envoyez.' : 'La conversation avec Naya s’ouvre : copiez le message ci-dessus puis collez-le.'); });
  $('#rdvSms').addEventListener('click', () => note('Votre messagerie s’ouvre avec le message prêt : il ne reste qu’à envoyer.'));

  /* ---------- API publique + démarrage ---------- */
  function openGroup(id) { setGroup(id); }
  function addItem(id) { if (!ITEMS[id]) return null; setGroup(ITEMS[id].group); return toggle(id); }
  window.NYRdv = { openGroup, addItem };
  buildMenu(); refresh();
})();
