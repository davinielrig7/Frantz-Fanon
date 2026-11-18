(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Menu ---------- */
  var toggle = document.getElementById("menuToggle");
  var navMenu = document.getElementById("navMenu");
  var nav = navMenu.parentElement;

  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("open"));
  });
  navMenu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("open") && !e.target.closest(".topbar")) setMenu(false);
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth > 820) setMenu(false);
  });

  /* ---------- Seção atual, barra de progresso e botão de topo ---------- */
  var links = Array.prototype.slice.call(navMenu.querySelectorAll("a"));
  var sections = links.map(function (a) {
    return document.querySelector(a.getAttribute("href"));
  });
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  var ticking = false;

  function update() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    toTop.classList.toggle("show", y > 600);

    var line = y + window.innerHeight * 0.35;
    var current = 0;
    sections.forEach(function (s, i) {
      if (s && s.offsetTop <= line) current = i;
    });
    if (max > 0 && y >= max - 4) current = sections.length - 1;
    links.forEach(function (a, i) {
      var on = i === current;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();

  /* ---------- Entrada suave ---------- */
  var revealEls = document.querySelectorAll(".section h2, .timeline li, .idea, .book, .now, .flip, .quiz-box, .facts li");
  revealEls.forEach(function (el) { el.classList.add("reveal"); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Cartões de ideias ---------- */
  document.querySelectorAll(".idea").forEach(function (card) {
    card.addEventListener("click", function () {
      var open = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", String(!open));
    });
  });

  /* ---------- Cartões de curiosidades ---------- */
  document.querySelectorAll(".flip").forEach(function (card) {
    card.addEventListener("click", function () {
      var on = card.getAttribute("aria-pressed") === "true";
      card.setAttribute("aria-pressed", String(!on));
    });
  });

  /* ---------- Quiz (5 perguntas) ---------- */
  var questions = [
    {
      q: "Em que ano e onde nasceu Frantz Fanon?",
      options: ["1925, na Martinica", "1930, na Argélia", "1920, na França", "1925, no Senegal"],
      correct: 0,
      feedback: "Fanon nasceu em 20 de julho de 1925, em Fort-de-France, Martinica."
    },
    {
      q: "Qual foi a primeira grande obra de Fanon?",
      options: ["Os Condenados da Terra", "Pele Negra, Máscaras Brancas", "Sociologia de uma Revolução", "Nenhuma das anteriores"],
      correct: 1,
      feedback: "Pele Negra, Máscaras Brancas foi publicada em 1952."
    },
    {
      q: "Em qual país Fanon chefiou um hospital psiquiátrico?",
      options: ["França", "Martinica", "Argélia", "Estados Unidos"],
      correct: 2,
      feedback: "Ele dirigiu a psiquiatria do hospital de Blida-Joinville, na Argélia, a partir de 1953."
    },
    {
      q: "Qual obra trata principalmente de colonialismo, violência e descolonização?",
      options: ["Pele Negra, Máscaras Brancas", "Os Condenados da Terra", "Nenhuma delas", "Todas tratam do mesmo tema"],
      correct: 1,
      feedback: "Os Condenados da Terra (1961) é a obra que discute esses temas de forma mais direta."
    },
    {
      q: "Qual movimento Fanon apoiou na Argélia?",
      options: ["O governo colonial", "A Frente de Libertação Nacional (FLN)", "Um partido monarquista", "Nenhum movimento"],
      correct: 1,
      feedback: "Em 1956 ele renunciou ao hospital e uniu-se à FLN, pela independência argelina."
    }
  ];

  var box = document.getElementById("quizBox");
  var current = 0, score = 0, answered = false;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render() {
    var pct = (current / questions.length) * 100;
    if (current >= questions.length) {
      var msg = score === questions.length ? "Perfeito! Você conhece bem Fanon."
        : score >= 3 ? "Muito bem! Você aprendeu bastante."
        : "Boa tentativa! Revise as seções e tente de novo.";
      box.innerHTML =
        '<div class="quiz-bar"><div style="width:100%"></div></div>' +
        '<div class="score"><p>Sua pontuação</p><strong>' + score + ' / ' + questions.length + '</strong>' +
        '<p>' + msg + '</p>' +
        '<button class="btn btn-primary" type="button" data-action="restart">Refazer o quiz</button></div>';
      return;
    }
    var q = questions[current];
    var opts = q.options.map(function (o, i) {
      return '<button class="opt" type="button" data-answer="' + i + '">' + esc(o) + '</button>';
    }).join("");
    box.innerHTML =
      '<div class="quiz-bar"><div style="width:' + pct + '%"></div></div>' +
      '<p class="quiz-count">Pergunta ' + (current + 1) + ' de ' + questions.length + '</p>' +
      '<h3 class="quiz-q">' + esc(q.q) + '</h3>' +
      '<div class="opts">' + opts + '</div>' +
      '<div id="quizFeedback"></div>' +
      '<div class="quiz-actions" id="quizActions"></div>';
    answered = false;
  }

  box.addEventListener("click", function (e) {
    var ans = e.target.closest("[data-answer]");
    var act = e.target.closest("[data-action]");

    if (ans && !answered) {
      answered = true;
      var picked = Number(ans.getAttribute("data-answer"));
      var q = questions[current];
      var ok = picked === q.correct;
      if (ok) score++;
      box.querySelectorAll(".opt").forEach(function (b, i) {
        b.disabled = true;
        if (i === q.correct) b.classList.add("right");
        else if (i === picked) b.classList.add("wrong");
      });
      document.getElementById("quizFeedback").innerHTML =
        '<p class="feedback"><strong>' + (ok ? "Correto! " : "Quase! ") + '</strong>' + esc(q.feedback) + '</p>';
      document.getElementById("quizActions").innerHTML =
        '<button class="btn btn-primary" type="button" data-action="next">' +
        (current === questions.length - 1 ? "Ver pontuação" : "Próxima pergunta") + '</button>';
      return;
    }
    if (act) {
      var a = act.getAttribute("data-action");
      if (a === "next") { current++; render(); }
      if (a === "restart") { current = 0; score = 0; render(); }
    }
  });

  render();
})();
