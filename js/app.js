/* =========================================================
   Señales y Sistemas — BEINEL021
   Scripts del sitio: navegación, índice activo y
   laboratorios interactivos dibujados sobre <canvas>.
   Sin dependencias externas.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 0. Composición de ecuaciones ----------
     Las fórmulas están escritas en LaTeX y las compone MathJax (js/tex-svg.js).
     Hasta que termina, .ec permanece oculto para no mostrar el código en crudo;
     el plazo de seguridad garantiza que nunca queden invisibles. */
  var mostrarEcuaciones = function () {
    document.documentElement.className =
      document.documentElement.className.replace(/\s*math-pendiente/, '');

    /* Al componer las fórmulas cambia la altura de la página: si se llegó
       con un enlace a una sección, hay que volver a situarla. */
    if (window.location.hash.length > 1) {
      var destino = document.getElementById(window.location.hash.slice(1));
      if (destino) { destino.scrollIntoView(); }
    }
  };

  if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
    window.MathJax.startup.promise.then(mostrarEcuaciones, mostrarEcuaciones);
  }
  setTimeout(mostrarEcuaciones, 3000);

  /* ---------- 1. Menú de navegación ---------- */
  var boton = document.querySelector('.menu-boton');
  var nav = document.getElementById('nav-principal');

  if (boton && nav) {
    boton.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('abierto');
        boton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 1b. Buscador del sitio ----------
     El índice de secciones se genera al construir el sitio (js/indice.js). */
  var campo = document.getElementById('q');
  var panel = document.getElementById('resultados');

  if (campo && panel && window.INDICE) {
    var actuales = [];
    var seleccion = -1;

    var normalizar = function (t) {
      t = t.toLowerCase();
      return t.normalize ? t.normalize('NFD').replace(/[̀-ͯ]/g, '') : t;
    };

    var buscar = function (consulta) {
      var terminos = normalizar(consulta).split(/\s+/);
      var salida = [];
      window.INDICE.forEach(function (entrada) {
        var texto = normalizar(entrada.p + ' ' + entrada.s + ' ' + entrada.k);
        var titulo = normalizar(entrada.s);
        var puntos = 0;
        for (var i = 0; i < terminos.length; i++) {
          if (!terminos[i]) { continue; }
          if (texto.indexOf(terminos[i]) === -1) { return; }
          puntos += titulo.indexOf(terminos[i]) !== -1 ? 3 : 1;
        }
        salida.push({ entrada: entrada, puntos: puntos });
      });
      salida.sort(function (a, b) { return b.puntos - a.puntos; });
      return salida.slice(0, 8).map(function (r) { return r.entrada; });
    };

    var cerrar = function () {
      panel.hidden = true;
      panel.innerHTML = '';
      seleccion = -1;
      actuales = [];
    };

    var marcar = function () {
      var enlaces = panel.getElementsByTagName('a');
      for (var i = 0; i < enlaces.length; i++) {
        enlaces[i].className = i === seleccion ? 'seleccionado' : '';
      }
    };

    var pintar = function () {
      var consulta = campo.value.trim();
      if (consulta.length < 2) { cerrar(); return; }

      actuales = buscar(consulta);
      seleccion = -1;

      if (!actuales.length) {
        panel.innerHTML = '<p class="vacio">Sin resultados para «' +
          consulta.replace(/[&<>]/g, '') + '».</p>';
        panel.hidden = false;
        return;
      }

      var html = '';
      actuales.forEach(function (e) {
        html += '<a href="' + e.u + '"><strong>' + e.s + '</strong><em>' + e.p + '</em></a>';
      });
      panel.innerHTML = html;
      panel.hidden = false;
    };

    campo.addEventListener('input', pintar);
    campo.addEventListener('focus', pintar);

    campo.addEventListener('keydown', function (e) {
      if (panel.hidden || !actuales.length) {
        if (e.key === 'Escape') { campo.blur(); }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        seleccion = (seleccion + 1) % actuales.length;
        marcar();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        seleccion = (seleccion - 1 + actuales.length) % actuales.length;
        marcar();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        window.location.href = actuales[seleccion === -1 ? 0 : seleccion].u;
      } else if (e.key === 'Escape') {
        cerrar();
        campo.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (e.target !== campo && !panel.contains(e.target)) { cerrar(); }
    });
  }

  /* ---------- 2. Índice lateral: marca la sección visible ---------- */
  var enlacesRail = Array.prototype.slice.call(document.querySelectorAll('.rail a'));

  if (enlacesRail.length && 'IntersectionObserver' in window) {
    var secciones = enlacesRail
      .map(function (a) { return document.querySelector(a.getAttribute('href')); })
      .filter(Boolean);

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) { return; }
        enlacesRail.forEach(function (a) {
          a.classList.toggle('activo', a.getAttribute('href') === '#' + entrada.target.id);
        });
      });
    }, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });

    secciones.forEach(function (s) { observador.observe(s); });
  }

  /* ---------- 3. Copiar los ejemplos de MATLAB ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.bloque-codigo'), function (bloque) {
    var boton = bloque.querySelector('.copiar');
    var codigo = bloque.querySelector('pre');
    if (!boton || !codigo) { return; }
    boton.addEventListener('click', function () {
      var texto = codigo.innerText;
      var avisar = function (ok) {
        boton.textContent = ok ? 'Copiado ✓' : 'Selecciona y copia';
        boton.classList.toggle('listo', ok);
        setTimeout(function () {
          boton.textContent = 'Copiar';
          boton.classList.remove('listo');
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(function () { avisar(true); }, function () { avisar(false); });
      } else {
        try {
          var area = document.createElement('textarea');
          area.value = texto;
          document.body.appendChild(area);
          area.select();
          document.execCommand('copy');
          document.body.removeChild(area);
          avisar(true);
        } catch (e) { avisar(false); }
      }
    });
  });

  /* ---------- 4. Utilidades de dibujo ---------- */
  var repintados = [];

  function tema() {
    var e = getComputedStyle(document.body);
    return {
      cont: e.getPropertyValue('--signal-c').trim(),
      disc: e.getPropertyValue('--signal-d').trim(),
      tinta: e.getPropertyValue('--ink').trim(),
      suave: e.getPropertyValue('--ink-soft').trim(),
      apagado: e.getPropertyValue('--muted').trim(),
      rejilla: e.getPropertyValue('--grid').trim(),
      linea: e.getPropertyValue('--line').trim(),
      ocre: e.getPropertyValue('--ocre-oscuro').trim(),
      fondo: e.getPropertyValue('--surface').trim()
    };
  }

  /** Sistema de ejes cartesianos sobre un canvas. */
  function Grafica(canvas, opciones) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.op = opciones || {};
    this.pad = this.op.pad || { l: 36, r: 14, t: 14, b: 28 };
  }

  Grafica.prototype.iniciar = function (xmin, xmax, ymin, ymax) {
    var dpr = window.devicePixelRatio || 1;
    var w = this.cv.clientWidth || 320;
    var h = this.cv.clientHeight || 200;
    this.cv.width = Math.round(w * dpr);
    this.cv.height = Math.round(h * dpr);
    var c = this.ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    this.w = w; this.h = h;
    this.xmin = xmin; this.xmax = xmax; this.ymin = ymin; this.ymax = ymax;
    this.t = tema();
    return this;
  };

  Grafica.prototype.X = function (x) {
    var p = this.pad;
    return p.l + (x - this.xmin) / (this.xmax - this.xmin) * (this.w - p.l - p.r);
  };

  Grafica.prototype.Y = function (y) {
    var p = this.pad;
    return p.t + (this.ymax - y) / (this.ymax - this.ymin) * (this.h - p.t - p.b);
  };

  Grafica.prototype.ejes = function (pasoX, pasoY, rotuloX, rotuloY) {
    var c = this.ctx, t = this.t, i;
    c.save();
    c.lineWidth = 1;
    c.strokeStyle = t.rejilla;
    c.beginPath();
    for (i = Math.ceil(this.xmin / pasoX) * pasoX; i <= this.xmax + 1e-9; i += pasoX) {
      c.moveTo(Math.round(this.X(i)) + .5, this.Y(this.ymax));
      c.lineTo(Math.round(this.X(i)) + .5, this.Y(this.ymin));
    }
    for (i = Math.ceil(this.ymin / pasoY) * pasoY; i <= this.ymax + 1e-9; i += pasoY) {
      c.moveTo(this.X(this.xmin), Math.round(this.Y(i)) + .5);
      c.lineTo(this.X(this.xmax), Math.round(this.Y(i)) + .5);
    }
    c.stroke();

    c.strokeStyle = t.apagado;
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(this.X(this.xmin), Math.round(this.Y(0)) + .5);
    c.lineTo(this.X(this.xmax), Math.round(this.Y(0)) + .5);
    c.moveTo(Math.round(this.X(0)) + .5, this.Y(this.ymax));
    c.lineTo(Math.round(this.X(0)) + .5, this.Y(this.ymin));
    c.stroke();

    c.fillStyle = t.apagado;
    c.font = '11px "IBM Plex Mono", monospace';
    c.textAlign = 'center';
    c.textBaseline = 'top';
    /* Se rotula cada k pasos para que las etiquetas nunca se solapen. */
    var anchoUtil = this.w - this.pad.l - this.pad.r;
    var altoUtil = this.h - this.pad.t - this.pad.b;
    var pasoRotX = pasoX * Math.max(1, Math.ceil(46 / (anchoUtil * pasoX / (this.xmax - this.xmin))));
    var pasoRotY = pasoY * Math.max(1, Math.ceil(26 / (altoUtil * pasoY / (this.ymax - this.ymin))));
    for (i = Math.ceil(this.xmin / pasoRotX) * pasoRotX; i <= this.xmax + 1e-9; i += pasoRotX) {
      if (Math.abs(i) < 1e-9) { continue; }
      c.fillText(String(+i.toFixed(2)), this.X(i), this.Y(this.ymin) + 5);
    }
    c.textAlign = 'right';
    c.textBaseline = 'middle';
    for (i = Math.ceil(this.ymin / pasoRotY) * pasoRotY; i <= this.ymax + 1e-9; i += pasoRotY) {
      if (Math.abs(i) < 1e-9) { continue; }
      c.fillText(String(+i.toFixed(2)), this.pad.l - 6, this.Y(i));
    }
    if (rotuloX) {
      c.textAlign = 'right';
      c.textBaseline = 'bottom';
      c.fillStyle = t.suave;
      c.fillText(rotuloX, this.w - this.pad.r, this.Y(0) - 6);
    }
    if (rotuloY) {
      c.textAlign = 'left';
      c.textBaseline = 'top';
      c.fillStyle = t.suave;
      c.fillText(rotuloY, this.X(0) + 6, this.pad.t - 2);
    }
    c.restore();
    return this;
  };

  Grafica.prototype.curva = function (f, color, ancho, discontinuaEn) {
    var c = this.ctx, n = 600, i, x, y, previo = false;
    c.save();
    c.strokeStyle = color;
    c.lineWidth = ancho || 2;
    c.lineJoin = 'round';
    c.beginPath();
    for (i = 0; i <= n; i++) {
      x = this.xmin + (this.xmax - this.xmin) * i / n;
      y = f(x);
      if (!isFinite(y)) { previo = false; continue; }
      y = Math.max(this.ymin, Math.min(this.ymax, y));
      if (!previo || (discontinuaEn && discontinuaEn(x))) {
        c.moveTo(this.X(x), this.Y(y));
      } else {
        c.lineTo(this.X(x), this.Y(y));
      }
      previo = true;
    }
    c.stroke();
    c.restore();
    return this;
  };

  Grafica.prototype.tallos = function (puntos, color, radio) {
    var c = this.ctx, y0 = this.Y(0), r = radio || 3.2;
    c.save();
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = 1.6;
    puntos.forEach(function (p) {
      if (!isFinite(p[1])) { return; }
      var x = this.X(p[0]), y = this.Y(Math.max(this.ymin, Math.min(this.ymax, p[1])));
      c.beginPath();
      c.moveTo(x, y0);
      c.lineTo(x, y);
      c.stroke();
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    }, this);
    c.restore();
    return this;
  };

  Grafica.prototype.punto = function (x, y, color, forma) {
    var c = this.ctx, px = this.X(x), py = this.Y(y), r = 5;
    c.save();
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = 2;
    if (forma === 'o') {
      c.beginPath();
      c.arc(px, py, r, 0, Math.PI * 2);
      c.stroke();
    } else {
      c.beginPath();
      c.moveTo(px - r, py - r); c.lineTo(px + r, py + r);
      c.moveTo(px + r, py - r); c.lineTo(px - r, py + r);
      c.stroke();
    }
    c.restore();
    return this;
  };

  Grafica.prototype.texto = function (x, y, txt, color, alineacion) {
    var c = this.ctx;
    c.save();
    c.fillStyle = color;
    c.font = '11px "IBM Plex Mono", monospace';
    c.textAlign = alineacion || 'left';
    c.textBaseline = 'middle';
    c.fillText(txt, this.X(x), this.Y(y));
    c.restore();
    return this;
  };

  /** Paso de rejilla "redondo" (1, 2, 2.5 o 5 por década) para un rango dado. */
  function pasoAgradable(rango, divisiones) {
    var bruto = rango / (divisiones || 5);
    var exp = Math.pow(10, Math.floor(Math.log(bruto) / Math.LN10));
    var m = bruto / exp;
    var f = m >= 5 ? 5 : m >= 2.5 ? 2.5 : m >= 2 ? 2 : 1;
    return f * exp;
  }

  function registrar(fn) {
    repintados.push(fn);
    fn();
  }

  var temporizador;
  window.addEventListener('resize', function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(function () {
      repintados.forEach(function (f) { f(); });
    }, 120);
  });

  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var alCambiar = function () { repintados.forEach(function (f) { f(); }); };
    if (mq.addEventListener) { mq.addEventListener('change', alCambiar); }
    else if (mq.addListener) { mq.addListener(alCambiar); }
  }

  new MutationObserver(function () {
    repintados.forEach(function (f) { f(); });
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- 4. Portada: continua vs. discreta ---------- */
  var cvPortada = document.getElementById('g-portada');
  if (cvPortada) {
    var gp = new Grafica(cvPortada, {});
    registrar(function () {
      var f = function (t) { return 2.2 * Math.exp(-0.22 * t) * Math.sin(1.15 * t); };
      gp.iniciar(-0.6, 14, -2.6, 2.6).ejes(1, 1, 't', 'x(t)');
      gp.curva(f, gp.t.cont, 2.2);
      var m = [], n;
      for (n = 0; n <= 14; n++) { m.push([n, f(n)]); }
      gp.tallos(m, gp.t.disc, 3);
    });
  }

  /* ---------- 5. Unidad 1: señales básicas y operaciones ---------- */
  var cvSenal = document.getElementById('g-senal');
  if (cvSenal) {
    var gs = new Grafica(cvSenal, {});
    var selTipo = document.getElementById('sel-tipo');
    var selDom = document.getElementById('sel-dominio');
    var rngT0 = document.getElementById('rng-t0');
    var rngA = document.getElementById('rng-a');
    var outT0 = document.getElementById('out-t0');
    var outA = document.getElementById('out-a');
    var expr = document.getElementById('expr-senal');

    var basicas = {
      escalon: { f: function (t) { return t >= 0 ? 1 : 0; }, n: 'u' },
      rampa: { f: function (t) { return t >= 0 ? Math.min(t, 3) : 0; }, n: 'r' },
      exponencial: { f: function (t) { return t >= 0 ? 2 * Math.exp(-0.6 * t) : 0; }, n: 'x' },
      senoidal: { f: function (t) { return 2 * Math.sin(Math.PI * t / 3); }, n: 'x' },
      pulso: { f: function (t) { return Math.abs(t) <= 1 ? 2 : 0; }, n: 'p' },
      triangulo: { f: function (t) { return Math.abs(t) <= 2 ? 2 - Math.abs(t) : 0; }, n: 'Λ' }
    };

    var pintarSenal = function () {
      var base = basicas[selTipo.value];
      var t0 = parseFloat(rngT0.value);
      var a = parseFloat(rngA.value);
      if (Math.abs(a) < 0.25) { a = a < 0 ? -0.25 : 0.25; }
      var discreto = selDom.value === 'discreto';
      var g = function (t) { return base.f(a * t - t0); };

      outT0.value = t0.toFixed(1);
      outA.value = a.toFixed(2);
      var signo = t0 < 0 ? '+ ' + Math.abs(t0).toFixed(1) : '− ' + t0.toFixed(1);
      var vi = discreto ? 'n' : 't';
      expr.textContent = base.n + (discreto ? '[' : '(') + a.toFixed(2) + vi + ' ' + signo +
        (discreto ? ']' : ')');

      gs.iniciar(-8, 8, -2.6, 3.2).ejes(1, 1, vi, base.n);
      if (discreto) {
        var orig = [], tr = [], n;
        for (n = -8; n <= 8; n++) {
          orig.push([n, base.f(n)]);
          tr.push([n, g(n)]);
        }
        gs.tallos(orig, gs.t.linea, 2.4);
        gs.tallos(tr, gs.t.disc, 3.4);
      } else {
        gs.curva(base.f, gs.t.linea, 1.8);
        gs.curva(g, gs.t.cont, 2.4);
      }
    };

    [selTipo, selDom, rngT0, rngA].forEach(function (el) {
      el.addEventListener('input', pintarSenal);
    });
    registrar(pintarSenal);
  }

  /* ---------- 6. Unidad 2: convolución discreta gráfica ---------- */
  var cvConvA = document.getElementById('g-conv-a');
  if (cvConvA) {
    var gca = new Grafica(cvConvA, {});
    var gcb = new Grafica(document.getElementById('g-conv-b'), {});
    var rngN = document.getElementById('rng-n');
    var outN = document.getElementById('out-n');
    var detalle = document.getElementById('conv-detalle');
    var camposX = Array.prototype.slice.call(document.querySelectorAll('.campo-x'));
    var camposH = Array.prototype.slice.call(document.querySelectorAll('.campo-h'));

    var leer = function (campos) {
      return campos.map(function (c) {
        var v = parseFloat(c.value);
        return isFinite(v) ? v : 0;
      });
    };

    var pintarConv = function () {
      var x = leer(camposX);       // x[k], k = 0 … x.length-1
      var h = leer(camposH);       // h[k], k = 0 … h.length-1
      var n = parseInt(rngN.value, 10);
      var y = [], i, k, s;
      for (i = 0; i <= x.length + h.length - 2; i++) {
        s = 0;
        for (k = 0; k < x.length; k++) {
          if (i - k >= 0 && i - k < h.length) { s += x[k] * h[i - k]; }
        }
        y.push(s);
      }
      outN.value = n;

      var kmin = -6, kmax = 9;
      var todos = x.concat(h, y).map(Math.abs);
      var tope = Math.max(3, Math.ceil(Math.max.apply(null, todos)));

      /* Panel superior: x[k] frente a h[n-k] */
      gca.iniciar(kmin, kmax, -tope - .4, tope + .8).ejes(1, 1, 'k', '');
      gca.tallos(x.map(function (v, k) { return [k, v]; }), gca.t.cont, 3.4);
      var reflejada = [], prod = 0;
      for (k = kmin; k <= kmax; k++) {
        if (n - k >= 0 && n - k < h.length) {
          reflejada.push([k + .16, h[n - k]]);
          if (k >= 0 && k < x.length) { prod += x[k] * h[n - k]; }
        }
      }
      gca.tallos(reflejada, gca.t.disc, 3.4);
      gca.texto(kmin + .3, tope + .45, 'x[k] · h[' + n + '−k]', gca.t.suave, 'left');

      /* Panel inferior: y[n] acumulada */
      gcb.iniciar(kmin, kmax, -tope - .4, tope + .8).ejes(1, 1, 'n', '');
      gcb.tallos(y.map(function (v, i2) { return [i2, v]; }), gcb.t.suave, 3);
      if (n >= 0 && n < y.length) {
        gcb.tallos([[n, y[n]]], gcb.t.cont, 5);
      }
      gcb.texto(kmin + .3, tope + .45, 'y[n] = x[n] ∗ h[n]', gcb.t.suave, 'left');

      var terminos = [];
      for (k = 0; k < x.length; k++) {
        if (n - k >= 0 && n - k < h.length) {
          terminos.push('(' + x[k] + ')(' + h[n - k] + ')');
        }
      }
      detalle.textContent = 'y[' + n + '] = ' +
        (terminos.length ? terminos.join(' + ') + ' = ' + (+prod.toFixed(3)) : '0  (no hay solapamiento)');
    };

    camposX.concat(camposH).forEach(function (c) { c.addEventListener('input', pintarConv); });
    rngN.addEventListener('input', pintarConv);
    registrar(pintarConv);
  }

  /* ---------- 7. Unidad 3: plano s y respuesta al escalón ---------- */
  var cvPlanoS = document.getElementById('g-plano-s');
  if (cvPlanoS) {
    var gps = new Grafica(cvPlanoS, { pad: { l: 36, r: 16, t: 16, b: 28 } });
    var ges = new Grafica(document.getElementById('g-escalon'), {});
    var rngZ = document.getElementById('rng-zeta');
    var rngW = document.getElementById('rng-wn');
    var outZ = document.getElementById('out-zeta');
    var outW = document.getElementById('out-wn');
    var vered = document.getElementById('vered-s');
    var ftxt = document.getElementById('ft-s');

    var pintarLaplace = function () {
      var z = parseFloat(rngZ.value);
      var wn = parseFloat(rngW.value);
      outZ.value = z.toFixed(2);
      outW.value = wn.toFixed(1);

      ftxt.textContent = 'H(s) = ' + (wn * wn).toFixed(1) + ' / (s² + ' +
        (2 * z * wn).toFixed(2) + 's + ' + (wn * wn).toFixed(1) + ')';

      /* Polos */
      var re, im1, im2, disc = z * z - 1, polos;
      if (disc < 0) {
        re = -z * wn;
        im1 = wn * Math.sqrt(-disc);
        polos = [[re, im1], [re, -im1]];
      } else {
        im1 = -z * wn + wn * Math.sqrt(disc);
        im2 = -z * wn - wn * Math.sqrt(disc);
        polos = [[im1, 0], [im2, 0]];
      }

      var lim = Math.max(2, wn * 1.35);
      var pasoS = pasoAgradable(2 * lim, 6);
      gps.iniciar(-lim, lim, -lim, lim).ejes(pasoS, pasoS, 'σ', 'jω');
      /* Semiplano izquierdo = región estable */
      var c = gps.ctx;
      c.save();
      c.fillStyle = gps.t.rejilla;
      c.globalAlpha = .55;
      c.fillRect(gps.X(-lim), gps.Y(lim), gps.X(0) - gps.X(-lim), gps.Y(-lim) - gps.Y(lim));
      c.restore();
      gps.texto(-lim * .94, lim * .86, 'Re{s} < 0 : estable', gps.t.apagado, 'left');
      polos.forEach(function (p) { gps.punto(p[0], p[1], gps.t.cont, 'x'); });

      /* Respuesta al escalón por integración numérica (RK4) */
      var T = Math.max(6, 9 / Math.max(0.12, z * wn));
      var pasos = 900, dt = T / pasos, y1 = 0, y2 = 0, serie = [[0, 0]], i;
      var d = function (a, b) { return [b, wn * wn * (1 - a) - 2 * z * wn * b]; };
      for (i = 1; i <= pasos; i++) {
        var k1 = d(y1, y2);
        var k2 = d(y1 + dt / 2 * k1[0], y2 + dt / 2 * k1[1]);
        var k3 = d(y1 + dt / 2 * k2[0], y2 + dt / 2 * k2[1]);
        var k4 = d(y1 + dt * k3[0], y2 + dt * k3[1]);
        y1 += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
        y2 += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
        serie.push([i * dt, y1]);
      }
      var pico = Math.max.apply(null, serie.map(function (p) { return p[1]; }));
      var ytope = Math.max(1.6, Math.ceil(pico * 10) / 10 + .3);

      ges.iniciar(0, T, -0.2, ytope).ejes(pasoAgradable(T, 6), .5, 't [s]', 'y(t)');
      var idx = 0;
      ges.curva(function (t) {
        idx = Math.min(pasos, Math.round(t / dt));
        return serie[idx][1];
      }, ges.t.cont, 2.2);
      var cc = ges.ctx;
      cc.save();
      cc.strokeStyle = ges.t.apagado;
      cc.setLineDash([4, 4]);
      cc.beginPath();
      cc.moveTo(ges.X(0), ges.Y(1));
      cc.lineTo(ges.X(T), ges.Y(1));
      cc.stroke();
      cc.restore();

      var sp = (pico - 1) * 100;
      var texto;
      if (z < 1) {
        texto = 'Subamortiguado · ζ = ' + z.toFixed(2) + ' · Mp ≈ ' + Math.max(0, sp).toFixed(1) +
          ' % · ωd = ' + (wn * Math.sqrt(1 - z * z)).toFixed(2) + ' rad/s';
      } else if (Math.abs(z - 1) < .02) {
        texto = 'Críticamente amortiguado · polo doble en s = −' + wn.toFixed(2);
      } else {
        texto = 'Sobreamortiguado · polos reales en s = ' + im1.toFixed(2) + ' y s = ' + im2.toFixed(2);
      }
      vered.textContent = texto + ' · Ambos polos en el semiplano izquierdo: sistema estable (BIBO).';
      vered.className = 'veredicto estable';
    };

    [rngZ, rngW].forEach(function (el) { el.addEventListener('input', pintarLaplace); });
    registrar(pintarLaplace);
  }

  /* ---------- 8. Unidad 4: plano z y respuesta al impulso ---------- */
  var cvPlanoZ = document.getElementById('g-plano-z');
  if (cvPlanoZ) {
    var gpz = new Grafica(cvPlanoZ, { pad: { l: 36, r: 16, t: 16, b: 28 } });
    var giz = new Grafica(document.getElementById('g-impulso-z'), {});
    var rngPolo = document.getElementById('rng-polo');
    var outPolo = document.getElementById('out-polo');
    var veredZ = document.getElementById('vered-z');
    var ftz = document.getElementById('ft-z');

    var pintarZ = function () {
      var a = parseFloat(rngPolo.value);
      outPolo.value = a.toFixed(2);
      ftz.textContent = 'H(z) = z / (z − ' + a.toFixed(2) + ')   ⇔   h[n] = (' + a.toFixed(2) + ')ⁿ u[n]';

      gpz.iniciar(-1.6, 1.6, -1.6, 1.6).ejes(.5, .5, 'Re{z}', 'Im{z}');
      var c = gpz.ctx, i, ang;
      c.save();
      c.strokeStyle = gpz.t.suave;
      c.lineWidth = 1.6;
      c.beginPath();
      for (i = 0; i <= 120; i++) {
        ang = i / 120 * Math.PI * 2;
        var px = gpz.X(Math.cos(ang)), py = gpz.Y(Math.sin(ang));
        if (i === 0) { c.moveTo(px, py); } else { c.lineTo(px, py); }
      }
      c.stroke();
      c.restore();
      gpz.texto(-1.52, 1.42, '|z| = 1', gpz.t.apagado, 'left');
      gpz.punto(a, 0, Math.abs(a) < 1 ? gpz.t.cont : gpz.t.disc, 'x');
      gpz.punto(0, 0, gpz.t.suave, 'o');

      var muestras = [], n, v, maxv = 1;
      for (n = 0; n <= 24; n++) {
        v = Math.pow(a, n);
        if (Math.abs(v) > maxv) { maxv = Math.abs(v); }
        muestras.push([n, v]);
      }
      var tope = Math.min(6, Math.max(1.2, maxv * 1.15));
      giz.iniciar(-2, 25, -tope, tope).ejes(2, pasoAgradable(2 * tope, 6), 'n', 'h[n]');
      giz.tallos(muestras, Math.abs(a) < 1 ? giz.t.cont : giz.t.disc, 3);

      if (Math.abs(a) < 0.999) {
        veredZ.textContent = '|a| = ' + Math.abs(a).toFixed(2) +
          ' < 1 · el polo cae dentro del círculo unitario · Σ|h[n]| = ' +
          (1 / (1 - Math.abs(a))).toFixed(2) + ' < ∞ · sistema causal y estable.';
        veredZ.className = 'veredicto estable';
      } else {
        veredZ.textContent = '|a| = ' + Math.abs(a).toFixed(2) +
          ' ≥ 1 · el polo está sobre o fuera del círculo unitario · h[n] no decae: sistema inestable.';
        veredZ.className = 'veredicto inestable';
      }
    };

    rngPolo.addEventListener('input', pintarZ);
    registrar(pintarZ);
  }
}());
