/* Água Mineral Preciosa: menu, tempo de empresa, produtos, fichas e destaque de texto */
(function () {
  "use strict";
  var raiz = document.documentElement;
  raiz.classList.add("js");
  var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Ano atual no rodapé */
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Anos de empresa, calculados a partir da data de fundação */
  document.querySelectorAll("[data-idade]").forEach(function (el) {
    var p = el.getAttribute("data-idade").split("-");
    var fundacao = new Date(+p[0], +p[1] - 1, +p[2]);
    var hoje = new Date();
    var anos = hoje.getFullYear() - fundacao.getFullYear();
    if (hoje.getMonth() < fundacao.getMonth() ||
        (hoje.getMonth() === fundacao.getMonth() && hoje.getDate() < fundacao.getDate())) anos--;
    if (anos > 0) el.textContent = anos;
  });

  /* Linha sob o cabeçalho depois de rolar */
  var cab = document.querySelector(".cabecalho");
  function marcarRolagem() { if (cab) cab.classList.toggle("rolou", window.scrollY > 8); }
  marcarRolagem();
  window.addEventListener("scroll", marcarRolagem, { passive: true });

  /* Menu em tela cheia no celular */
  var botaoMenu = document.querySelector(".menu-botao");
  var nav = document.getElementById("navegacao");
  function fecharMenu() {
    nav.classList.remove("aberta");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  }
  if (botaoMenu && nav) {
    botaoMenu.addEventListener("click", function () {
      var abrir = !nav.classList.contains("aberta");
      if (!abrir) { fecharMenu(); return; }
      nav.classList.add("aberta");
      botaoMenu.setAttribute("aria-expanded", "true");
      botaoMenu.setAttribute("aria-label", "Fechar menu");
      document.body.style.overflow = "hidden";
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) fecharMenu(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("aberta")) { fecharMenu(); botaoMenu.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080 && nav.classList.contains("aberta")) fecharMenu();
    });
  }

  /* Fichas técnicas */
  document.querySelectorAll("[data-ficha]").forEach(function (b) {
    b.addEventListener("click", function () {
      var d = document.getElementById(b.getAttribute("data-ficha"));
      if (d && d.showModal) d.showModal();
    });
  });
  document.querySelectorAll("dialog.ficha").forEach(function (d) {
    d.addEventListener("click", function (e) {
      if (e.target === d || e.target.closest("[data-fechar]")) d.close();
    });
  });

  /* Produtos: troca manual e automática */
  var prod = document.querySelector("[data-produtos]");
  if (prod) {
    var abas = Array.prototype.slice.call(prod.querySelectorAll('[role="tab"]'));
    var paineis = Array.prototype.slice.call(prod.querySelectorAll('[role="tabpanel"]'));
    var fotos = Array.prototype.slice.call(prod.querySelectorAll(".prod-fotos img"));
    var pausa = prod.querySelector("[data-pausa]");
    var TEMPO = 7000;
    var atual = 0, timer = null, pausado = calmo, dentro = false;
    prod.style.setProperty("--tempo", TEMPO + "ms");

    function mostrar(i, focar) {
      atual = (i + abas.length) % abas.length;
      abas.forEach(function (a, n) {
        a.setAttribute("aria-selected", n === atual ? "true" : "false");
        a.tabIndex = n === atual ? 0 : -1;
      });
      paineis.forEach(function (p, n) { p.hidden = n !== atual; });
      fotos.forEach(function (f, n) { f.classList.toggle("ativa", n === atual); });
      var lista = abas[atual].parentNode;
      if (lista.scrollWidth > lista.clientWidth) {
        lista.scrollTo({ left: abas[atual].offsetLeft - 16, behavior: calmo ? "auto" : "smooth" });
      }
      if (focar) abas[atual].focus();
    }
    function parar() { clearTimeout(timer); timer = null; prod.classList.remove("girando"); }
    function agendar() {
      parar();
      if (pausado || dentro || document.hidden || document.querySelector("dialog[open]")) return;
      /* reinicia a animação da barra */
      void prod.offsetWidth;
      prod.classList.add("girando");
      timer = setTimeout(function () { mostrar(atual + 1); agendar(); }, TEMPO);
    }

    abas.forEach(function (a, i) {
      a.addEventListener("click", function () { mostrar(i); agendar(); });
      a.addEventListener("keydown", function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); mostrar(atual + d, true); }
      });
    });
    prod.addEventListener("mouseenter", function () { dentro = true; parar(); });
    prod.addEventListener("mouseleave", function () { dentro = false; agendar(); });
    document.addEventListener("visibilitychange", agendar);
    document.querySelectorAll("dialog.ficha").forEach(function (d) {
      d.addEventListener("close", agendar);
    });
    if (pausa) {
      var rotulo = pausa.querySelector("span");
      var atualizar = function () {
        pausa.setAttribute("aria-pressed", pausado ? "true" : "false");
        rotulo.textContent = pausado ? "Retomar troca automática" : "Pausar troca automática";
      };
      pausa.addEventListener("click", function () { pausado = !pausado; atualizar(); agendar(); });
      atualizar();
    }

    /* Deslizar a foto com o dedo */
    var area = prod.querySelector(".prod-fotos"), x0 = null;
    area.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    area.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) { mostrar(atual + (dx < 0 ? 1 : -1)); agendar(); }
    });
    area.addEventListener("pointercancel", function () { x0 = null; });

    mostrar(0);
    /* só começa a girar quando a seção aparece na tela */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        dentro = false;
        if (es[0].isIntersecting) agendar(); else parar();
      }, { threshold: 0.35 }).observe(prod);
    } else { agendar(); }
  }

  /* Origem: as palavras do título acendem conforme a seção passa pela tela */
  var frase = document.querySelector("[data-acende]");
  if (frase && !calmo) {
    var texto = frase.textContent.trim().replace(/\s+/g, " ");
    frase.setAttribute("aria-label", texto);
    frase.textContent = "";
    var palavras = texto.split(" ").map(function (t, i, todas) {
      var s = document.createElement("span");
      s.className = "p";
      s.setAttribute("aria-hidden", "true");
      s.textContent = t + (i < todas.length - 1 ? " " : "");
      frase.appendChild(s);
      return s;
    });
    var marcado = false;
    var acender = function () {
      marcado = false;
      var r = frase.getBoundingClientRect(), vh = window.innerHeight;
      var avanco = (vh * 0.88 - r.top) / (vh * 0.5 + r.height * 0.4);
      avanco = Math.max(0, Math.min(1, avanco));
      var n = palavras.length;
      palavras.forEach(function (s, i) {
        var o = Math.max(0, Math.min(1, avanco * (n + 3) - i));
        s.style.setProperty("--o", (0.28 + 0.72 * o).toFixed(3));
      });
    };
    var pedir = function () { if (!marcado) { marcado = true; requestAnimationFrame(acender); } };
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    acender();
  }
})();
