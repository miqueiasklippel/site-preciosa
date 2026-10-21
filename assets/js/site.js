/* Água Mineral Preciosa: menu, imagens substitutas e carrossel de produtos */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* Ano atual no rodapé */
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Menu no celular */
  var botaoMenu = document.querySelector(".menu-botao");
  var nav = document.getElementById("navegacao");
  if (botaoMenu && nav) {
    botaoMenu.addEventListener("click", function () {
      var aberto = nav.classList.toggle("aberta");
      botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("aberta");
        botaoMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Se a logo ou a foto ainda não existir, mostra o visual substituto */
  document.querySelectorAll("[data-imagem] > img").forEach(function (img) {
    var marcar = function () { img.parentNode.classList.add("sem-imagem"); };
    if (img.complete && img.naturalWidth === 0) marcar();
    img.addEventListener("error", marcar);
  });

  /* Carrossel */
  var carrossel = document.querySelector("[data-carrossel]");
  if (!carrossel) return;

  var trilha = carrossel.querySelector(".carrossel-trilha");
  var slides = Array.prototype.slice.call(trilha.children);
  var pontos = carrossel.querySelector(".carrossel-pontos");
  var anterior = carrossel.querySelector("[data-anterior]");
  var proximo = carrossel.querySelector("[data-proximo]");
  var anuncio = carrossel.querySelector("[data-anuncio]");
  var atual = 0;
  var timer = null;
  var reduzido = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  slides.forEach(function (slide, i) {
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", (i + 1) + " de " + slides.length);
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", "Ver produto " + (i + 1));
    b.addEventListener("click", function () { ir(i); reiniciar(); });
    pontos.appendChild(b);
  });

  function ir(i) {
    atual = (i + slides.length) % slides.length;
    trilha.style.transform = "translateX(" + (-atual * 100) + "%)";
    slides.forEach(function (s, n) { s.setAttribute("aria-hidden", n === atual ? "false" : "true"); });
    Array.prototype.forEach.call(pontos.children, function (p, n) {
      p.setAttribute("aria-current", n === atual ? "true" : "false");
    });
    var titulo = slides[atual].querySelector("h3");
    if (anuncio && titulo) anuncio.textContent = titulo.textContent;
  }

  function iniciar() {
    if (reduzido || timer) return;
    timer = setInterval(function () { ir(atual + 1); }, 6000);
  }
  function parar() { clearInterval(timer); timer = null; }
  function reiniciar() { parar(); iniciar(); }

  anterior.addEventListener("click", function () { ir(atual - 1); reiniciar(); });
  proximo.addEventListener("click", function () { ir(atual + 1); reiniciar(); });

  carrossel.addEventListener("mouseenter", parar);
  carrossel.addEventListener("mouseleave", iniciar);
  carrossel.addEventListener("focusin", parar);
  carrossel.addEventListener("focusout", iniciar);
  carrossel.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") { ir(atual - 1); }
    if (e.key === "ArrowRight") { ir(atual + 1); }
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) parar(); else iniciar();
  });

  /* Deslizar com o dedo */
  var janela = carrossel.querySelector(".carrossel-janela");
  var inicioX = null;
  janela.addEventListener("pointerdown", function (e) { inicioX = e.clientX; });
  janela.addEventListener("pointerup", function (e) {
    if (inicioX === null) return;
    var dx = e.clientX - inicioX;
    if (Math.abs(dx) > 40) { ir(atual + (dx < 0 ? 1 : -1)); reiniciar(); }
    inicioX = null;
  });
  janela.addEventListener("pointercancel", function () { inicioX = null; });

  ir(0);
  iniciar();
})();
