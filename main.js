(function () {
  // Menu mobile
  var t = document.querySelector('.menu-toggle'), nav = document.querySelector('nav.main');
  if (t && nav) t.addEventListener('click', function () {
    var o = nav.classList.toggle('open'); t.setAttribute('aria-expanded', o);
  });

  // Taille du texte (A+ / A-)
  var size = 100;
  try { size = parseInt(localStorage.getItem('msp-fs') || '100', 10); } catch (e) {}
  function applySize() { document.documentElement.style.setProperty('--fs', size + '%'); }
  applySize();
  document.querySelectorAll('[data-fs]').forEach(function (b) {
    b.addEventListener('click', function () {
      size = Math.min(130, Math.max(90, size + parseInt(b.dataset.fs, 10)));
      applySize(); try { localStorage.setItem('msp-fs', size); } catch (e) {}
    });
  });

  // Apparition au défilement
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('visible'); }); }

  // Compteurs animés
  var counters = document.querySelectorAll('[data-count]');
  function run(el) {
    var end = parseInt(el.dataset.count, 10), start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(function (c) { c.textContent = c.dataset.count; });

  // Barre de progression + retour en haut
  var bar = document.querySelector('.progress'), top = document.querySelector('.totop');
  window.addEventListener('scroll', function () {
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    if (bar) bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (top) top.classList.toggle('show', h.scrollTop > 500);
  }, { passive: true });
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Ouvert / fermé maintenant
  var st = document.getElementById('open-status');
  if (st) {
    var d = new Date(), day = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), open = false;
    if (day === 3) open = m >= 480 && m < 1050;
    else if (day >= 1 && day <= 5) open = m >= 480 && m < 1080;
    else if (day === 6) open = m >= 540 && m < 720;
    st.textContent = open ? 'Ouvert en ce moment' : 'Fermé actuellement — urgence : 15';
    st.classList.toggle('badge-live', open);
  }

  // Annuaire de l'équipe : filtre + recherche
  var chips = document.querySelectorAll('.chip'), cards = document.querySelectorAll('.pro'),
      q = document.getElementById('q'), empty = document.querySelector('.empty'), cur = 'all';
  function filter() {
    var term = (q && q.value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), n = 0;
    cards.forEach(function (c) {
      var name = c.dataset.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      var ok = (cur === 'all' || c.dataset.prof === cur) && name.indexOf(term) > -1;
      c.style.display = ok ? '' : 'none'; if (ok) n++;
    });
    if (empty) empty.style.display = n ? 'none' : 'block';
  }
  chips.forEach(function (ch) {
    ch.addEventListener('click', function () {
      chips.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      ch.setAttribute('aria-pressed', 'true'); cur = ch.dataset.filter; filter();
    });
  });
  if (q) q.addEventListener('input', filter);

  // Événements : tri à venir / passés selon la date du jour
  var up = document.getElementById('ev-upcoming'), past = document.getElementById('ev-past');
  if (up && past) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var evs = Array.prototype.slice.call(up.querySelectorAll('.event'));
    evs.sort(function (a, b) { return a.dataset.date < b.dataset.date ? -1 : 1; });
    var pastList = [];
    evs.forEach(function (ev) {
      var p = ev.dataset.date.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
      if (d < today) pastList.push(ev); else up.appendChild(ev);
    });
    pastList.reverse().forEach(function (ev) { past.appendChild(ev); });
    var none = document.querySelector('.none-up');
    if (none) none.hidden = up.children.length > 0;
    document.querySelectorAll('.evf').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.evf').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        document.querySelectorAll('.event').forEach(function (ev) {
          ev.style.display = (b.dataset.ev === 'all' || ev.dataset.type === b.dataset.ev) ? '' : 'none';
        });
      });
    });
    var lb = document.querySelector('.lightbox'), lbi = lb && lb.querySelector('img');
    document.querySelectorAll('.poster').forEach(function (p) {
      p.addEventListener('click', function () { lbi.src = p.dataset.full; lbi.alt = p.querySelector('img').alt; lb.hidden = false; });
    });
    if (lb) {
      lb.addEventListener('click', function (e) { if (e.target !== lbi) lb.hidden = true; });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lb.hidden = true; });
    }
  }

  // Année du pied de page
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
