(function () {
  var SITE = window.SITE || {};
  var KITTENS = window.KITTENS || {};
  var waLink = function (text) { return 'https://wa.me/' + SITE.phone + '?text=' + encodeURIComponent(text); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // Gatitos retirados: se ocultan aunque el servidor o la caché sirvan una página antigua.
  var REMOVED = ['lion-homepage-male', 'jarvis-homepage-male', 'ori-homepage-female', 'yola-homepage-female', 'bella-homepage-female',
    'dana-homepage-female', 'sisi-homepage-female', 'boyle-1', 'anthony-1', 'funtik-m'];
  var isRemoved = function (src) {
    var file = String(src || '').split('?')[0].split('/').pop().replace(/\.(jpe?g|png|webp)$/i, '');
    return REMOVED.indexOf(file) !== -1;
  };
  var hideRemoved = function (root) {
    (root || document).querySelectorAll('img').forEach(function (img) {
      if (!isRemoved(img.getAttribute('src'))) return;
      var box = img.closest('.kcard, .hero-breeds a, .collage figure, figure') || img;
      box.style.display = 'none';
      box.setAttribute('aria-hidden', 'true');
    });
    var hero = document.querySelector('.hero');
    if (hero && REMOVED.some(function (r) { return (hero.getAttribute('style') || '').indexOf(r) !== -1; })) {
      hero.style.setProperty('--hero', "url('/img/gatitos/hardox-m-1-p.jpg')");
    }
    Object.keys(KITTENS).forEach(function (id) {
      if (KITTENS[id].imgs.some(isRemoved)) delete KITTENS[id];
    });
  };
  hideRemoved();

  // Menú móvil
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
  }

  // Ficha de gatito (modal)
  var modal = document.getElementById('kitten-modal');
  var modalBody = modal && modal.querySelector('.modal-body');
  var lastFocus = null;

  function openKitten(id) {
    var k = KITTENS[id];
    if (!k || !modal) return;
    var hembra = k.sex === 'H';
    var msg = '¡Hola! Me interesa ' + (hembra ? 'la gatita ' : 'el gatito ') + k.name + ' (' + k.breed + ', ID ' + k.id + '). ¿Sigue disponible?';
    var thumbs = k.imgs.length > 1 ? '<div class="km-thumbs">' + k.imgs.map(function (src, i) {
      return '<button type="button" data-src="' + src + '" aria-pressed="' + (i === 0) + '" aria-label="Foto ' + (i + 1) + '"><img src="' + src + '" alt=""></button>';
    }).join('') + '</div>' : '';
    var reserved = k.status === 'reservado';
    modalBody.innerHTML =
      '<div class="km-gallery"><img class="main" src="' + k.imgs[0] + '" alt="' + esc(k.name) + ', ' + esc(k.breed) + '">' + thumbs + '</div>' +
      '<div class="km-info">' +
        '<div class="km-top"><h2 id="km-title">' + esc(k.name) + '</h2><span class="km-status' + (reserved ? ' res' : '') + '">' + (reserved ? 'Reservado' : 'Disponible') + '</span></div>' +
        '<div class="km-id">ID: ' + k.id + ' · ' + esc(k.breed) + '</div>' +
        '<p class="km-price">' + k.price.toLocaleString('es-ES') + ' €<small>Incluye documentación y kit de bienvenida</small></p>' +
        '<div class="km-facts"><div><span>Sexo</span><strong>' + (hembra ? 'Hembra' : 'Macho') + '</strong></div><div><span>Edad</span><strong>' + (k.age ? esc(k.age) : 'Consultar') + '</strong></div><div><span>Raza</span><strong>' + esc(k.breed) + '</strong></div><div><span>Registro</span><strong>Con pedigrí</strong></div></div>' +
        '<p>' + esc(k.name) + ' es ' + (hembra ? 'una gatita' : 'un gatito') + ' ' + esc(k.breed) + ' criad' + (hembra ? 'a' : 'o') + ' en casa, con contacto diario y mucho cariño. Se entrega con revisión veterinaria, vacunas al día y orientación para que la adaptación a su nuevo hogar sea tranquila.</p>' +
        '<ul class="checklist"><li>Garantía de salud de 2 años</li><li>Vacunas al día y desparasitación completa</li><li>Microchip, pasaporte y documentación</li><li>Kit de bienvenida</li></ul>' +
        '<div class="km-actions">' +
          '<a class="btn btn-wa" href="' + waLink(msg) + '" target="_blank" rel="noopener">Consultar por WhatsApp</a>' +
          '<a class="btn btn-primary" href="mailto:' + SITE.email + '?subject=' + encodeURIComponent('Consulta sobre ' + k.name + ' (' + k.id + ')') + '&body=' + encodeURIComponent(msg) + '">Escribir un correo</a>' +
          '<a class="btn btn-secondary" href="/contacto/?gatito=' + encodeURIComponent(k.id + ' – ' + k.name + ' (' + k.breed + ')') + '">Reservar</a>' +
        '</div>' +
      '</div>';
    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.querySelector('.modal-card').scrollTop = 0;
    document.body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest('[data-kitten]');
    if (card) { openKitten(card.getAttribute('data-kitten')); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    var thumb = e.target.closest('.km-thumbs button');
    if (thumb) {
      modal.querySelector('.km-gallery .main').src = thumb.getAttribute('data-src');
      modal.querySelectorAll('.km-thumbs button').forEach(function (b) { b.setAttribute('aria-pressed', b === thumb); });
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // Filtros del catálogo
  var catalog = document.getElementById('catalog');
  if (catalog) {
    var state = { breed: '', sex: '' };
    var countEl = document.querySelector('.result-count');
    var params = new URLSearchParams(location.search);
    if (params.get('raza')) state.breed = params.get('raza');
    var apply = function () {
      var n = 0;
      catalog.querySelectorAll('.kcard').forEach(function (c) {
        var show = (!state.breed || c.dataset.breed === state.breed) && (!state.sex || c.dataset.sex === state.sex);
        c.hidden = !show;
        if (show) n++;
      });
      document.querySelectorAll('[data-filter-breed]').forEach(function (b) { b.classList.toggle('active', b.dataset.filterBreed === state.breed); });
      document.querySelectorAll('[data-filter-sex]').forEach(function (b) { b.classList.toggle('active', b.dataset.filterSex === state.sex); });
      if (countEl) countEl.textContent = n + (n === 1 ? ' gatito' : ' gatitos');
    };
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter-breed]');
      var s = e.target.closest('[data-filter-sex]');
      if (b) state.breed = b.dataset.filterBreed;
      if (s) state.sex = s.dataset.filterSex;
      if (b || s) apply();
    });
    apply();
  }

  // Formulario de opiniones → WhatsApp o correo
  var review = document.getElementById('review-form');
  if (review) {
    var rvia = 'wa';
    review.querySelectorAll('button[type=submit]').forEach(function (b) { b.addEventListener('click', function () { rvia = b.value; }); });
    review.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['nombre', 'gatito', 'opinion'].forEach(function (n) {
        var bad = !review[n].value.trim();
        review[n].classList.toggle('invalid', bad);
        if (bad) ok = false;
      });
      var permiso = review.permiso;
      permiso.closest('label').classList.toggle('invalid', !permiso.checked);
      if (!permiso.checked) ok = false;
      review.querySelector('.form-error').hidden = ok;
      if (!ok) return;
      var v = function (n) { return review[n].value.trim(); };
      var stars = +review.querySelector('input[name=valoracion]:checked').value;
      var text = [
        '¡Hola! Quiero compartir mi opinión sobre ' + SITE.name + '.',
        '',
        'Nombre: ' + v('nombre'),
        v('ciudad') ? 'Ciudad: ' + v('ciudad') : null,
        'Gatito: ' + v('gatito') + (v('raza') ? ' (' + v('raza') + ')' : ''),
        'Valoración: ' + '★'.repeat(stars) + '☆'.repeat(5 - stars) + ' (' + stars + '/5)',
        '',
        v('opinion'),
        '',
        'Autorizo la publicación de mi opinión en la web.',
      ].filter(function (l) { return l !== null; }).join('\n');
      if (rvia === 'wa') {
        var waAnchor = document.createElement('a');
        waAnchor.href = waLink(text);
        waAnchor.target = '_blank';
        waAnchor.rel = 'noopener';
        document.body.appendChild(waAnchor);
        waAnchor.click();
        document.body.removeChild(waAnchor);
      } else {
        location.href = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent('Mi opinión sobre ' + SITE.name + ' – ' + v('gatito')) + '&body=' + encodeURIComponent(text);
      }
    });
  }

  // Formulario de contacto → correo o WhatsApp
  var form = document.getElementById('contact-form');
  if (form) {
    var pre = new URLSearchParams(location.search).get('gatito');
    if (pre) {
      form.gatito.value = pre;
      var k = Object.values(KITTENS).find(function (x) { return pre.indexOf(x.id) === 0; });
      if (k) form.raza.value = k.breed;
    }
    var via = 'email';
    form.querySelectorAll('button[type=submit]').forEach(function (b) { b.addEventListener('click', function () { via = b.value; }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      ['nombre', 'apellidos', 'email', 'telefono'].forEach(function (n) {
        var f = form[n];
        var valid = f.value.trim() && f.checkValidity();
        f.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      form.querySelector('.form-error').hidden = ok;
      if (!ok) return;
      var v = function (n) { return form[n].value.trim(); };
      var lines = [
        'Nombre: ' + v('nombre') + ' ' + v('apellidos'),
        'Correo: ' + v('email'),
        'Teléfono: ' + v('telefono'),
        v('ciudad') && 'Ciudad: ' + v('ciudad'),
        v('raza') && 'Raza de interés: ' + v('raza'),
        v('gatito') && 'Gatito: ' + v('gatito'),
        v('mensaje') && '\n' + v('mensaje'),
      ].filter(Boolean).join('\n');
      if (via === 'wa') {
        var waAnchor = document.createElement('a');
        waAnchor.href = waLink('¡Hola! Quiero información sobre un gatito.\n\n' + lines);
        waAnchor.target = '_blank';
        waAnchor.rel = 'noopener';
        document.body.appendChild(waAnchor);
        waAnchor.click();
        document.body.removeChild(waAnchor);
      } else {
        location.href = 'mailto:' + SITE.email + '?subject=' + encodeURIComponent('Consulta de gatito – ' + v('nombre') + ' ' + v('apellidos')) + '&body=' + encodeURIComponent(lines);
      }
    });
  }
})();
