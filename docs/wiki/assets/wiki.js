/* OMP × Orca wiki — vanilla, offline, no dependencies */
(function () {
  "use strict";

  var PAGES = [
    { file: "index.html", title: "Обзор", num: "0" },
    { file: "setup.html", title: "Настройка", num: "1" },
    { file: "config.html", title: "Конфиги", num: "2" },
    { file: "orca.html", title: "Orca и OMP", num: "3" },
    { file: "orchestration.html", title: "Оркестрация", num: "4" },
    { file: "cache.html", title: "Кэш", num: "5" },
    { file: "sources.html", title: "Источники", num: "6" }
  ];

  /* Static cross-page index: [page, anchor, title, section] */
  var INDEX = [
    ["index.html", "facts", "Факты, которые меняют план", "Обзор"],
    ["index.html", "start", "С чего начать", "Обзор"],
    ["index.html", "map", "Карта вики", "Обзор"],
    ["setup.html", "phase-0", "Фаза 0 — база", "Настройка"],
    ["setup.html", "phase-1", "Фаза 1 — безопасность", "Настройка"],
    ["setup.html", "phase-2", "Фаза 2 — UX и терминал", "Настройка"],
    ["setup.html", "phase-3", "Фаза 3 — модели и роли", "Настройка"],
    ["setup.html", "phase-4", "Фаза 4 — MCP", "Настройка"],
    ["setup.html", "phase-5", "Фаза 5 — агенты", "Настройка"],
    ["setup.html", "phase-6", "Фаза 6 — скиллы и плагины", "Настройка"],
    ["setup.html", "phase-7", "Фаза 7 — LSP и шелл", "Настройка"],
    ["setup.html", "phase-8", "Фаза 8 — проверка", "Настройка"],
    ["config.html", "config-yml", "config.yml целиком", "Конфиги"],
    ["config.html", "mcp-json", "mcp.json", "Конфиги"],
    ["config.html", "keys", "Ключи, которые важны", "Конфиги"],
    ["config.html", "donts", "Чего не делать", "Конфиги"],
    ["orca.html", "ownership", "Кто владеет чем", "Orca и OMP"],
    ["orca.html", "launch", "Как Orca запускает OMP", "Orca и OMP"],
    ["orca.html", "placement", "Куда что ставить", "Orca и OMP"],
    ["orca.html", "worktree", "Следствия worktree", "Orca и OMP"],
    ["orca.html", "skills", "Скиллы Orca", "Orca и OMP"],
    ["orchestration.html", "levels", "Три уровня", "Оркестрация"],
    ["orchestration.html", "spawn", "Что происходит при спавне", "Оркестрация"],
    ["orchestration.html", "messages", "Обмен сообщениями", "Оркестрация"],
    ["orchestration.html", "observe", "Наблюдение", "Оркестрация"],
    ["orchestration.html", "choose", "Когда что использовать", "Оркестрация"],
    ["orchestration.html", "pitfalls", "Подводные камни", "Оркестрация"],
    ["cache.html", "prefix", "Что входит в префикс", "Кэш"],
    ["cache.html", "breaks", "Ломает гарантированно", "Кэш"],
    ["cache.html", "safe", "Что не ломает", "Кэш"],
    ["cache.html", "numbers", "Замеры на этой машине", "Кэш"],
    ["cache.html", "workflow", "Чек-лист воркфлоу", "Кэш"],
    ["cache.html", "config", "Конфиг под кэш", "Кэш"],
    ["cache.html", "providers", "Провайдеры", "Кэш"],
    ["cache.html", "evidence", "Внешние замеры", "Кэш"],
    ["cache.html", "measure", "Как мерить", "Кэш"],
    ["cache.html", "caveats", "Оговорки", "Кэш"],
    ["sources.html", "links", "Источники", "Источники"],
    ["sources.html", "status", "Что проверено", "Источники"]
  ];

  var LS_THEME = "ompwiki.theme";
  var LS_TASKS = "ompwiki.tasks";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      if (val === null) localStorage.removeItem(key);
      else localStorage.setItem(key, val);
    } catch (e) { /* file:// with storage disabled */ }
    return null;
  }

  /* ---------- theme ---------- */
  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") document.documentElement.setAttribute("data-theme", mode);
    else document.documentElement.removeAttribute("data-theme");
    var btn = $("#themeBtn");
    if (btn) btn.textContent = mode === "light" ? "Тема: светлая" : mode === "dark" ? "Тема: тёмная" : "Тема: авто";
  }
  function initTheme() {
    var saved = store(LS_THEME) || "auto";
    applyTheme(saved);
    var btn = $("#themeBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var cur = store(LS_THEME) || "auto";
      var next = cur === "auto" ? "dark" : cur === "dark" ? "light" : "auto";
      store(LS_THEME, next);
      applyTheme(next);
    });
  }

  /* ---------- mobile nav ---------- */
  function initNav() {
    var t = $("#navToggle");
    if (t) t.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains("nav-open")) return;
      if (e.target.closest(".sidebar") || e.target.closest("#navToggle")) return;
      document.body.classList.remove("nav-open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") document.body.classList.remove("nav-open");
    });
  }

  /* ---------- current page ---------- */
  function initCurrentPage() {
    var here = location.pathname.split("/").pop() || "index.html";
    $$(".nav-list a").forEach(function (a) {
      if (a.getAttribute("href") === here) {
        a.classList.add("current");
        a.setAttribute("aria-current", "page");
      }
    });
    var crumb = document.body.getAttribute("data-page-title");
    var el = $("#crumbTitle");
    if (el && crumb) el.textContent = crumb;
    document.title = (crumb ? crumb + " — " : "") + "OMP × Orca";
  }

  /* ---------- table of contents ---------- */
  function initToc() {
    var host = $("#toc");
    var main = $(".content");
    if (!host || !main) return;
    /* Sections with their own id are valid TOC targets: a phase heading may be
       an h3 without id, while <section id="phase-1"> carries the anchor. */
    var heads = $$("h2[id], h3[id], section.phase[id]", main);
    if (!heads.length) {
      var label = host.previousElementSibling;
      if (label && label.classList.contains("nav-group-title")) label.hidden = true;
      host.hidden = true;
      return;
    }
    var frag = document.createDocumentFragment();
    heads.forEach(function (h) {
      var isSection = h.tagName === "SECTION";
      var titleEl = isSection ? h.querySelector("h2, h3") : h;
      var label = (h.dataset.toc || (titleEl && titleEl.textContent) || h.id).replace(/\s+/g, " ").trim();
      var li = document.createElement("li");
      if (h.tagName === "H3") li.className = "lvl3";
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = label;
      li.appendChild(a);
      frag.appendChild(li);
    });
    host.appendChild(frag);

    if (!("IntersectionObserver" in window)) return;
    var links = $$("a", host);
    var map = {};
    links.forEach(function (a) { map[decodeURIComponent(a.hash.slice(1))] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var a = map[en.target.id];
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "-72px 0px -68% 0px", threshold: 0 });
    heads.forEach(function (h) { obs.observe(h); });
  }

  /* ---------- search ---------- */
  function initSearch() {
    var input = $("#searchInput");
    var box = $("#searchResults");
    if (!input || !box) return;

    function render(q) {
      var query = q.trim().toLowerCase();
      box.innerHTML = "";
      if (!query) { box.classList.remove("open"); return; }
      var hits = INDEX.filter(function (row) {
        return (row[2] + " " + row[3]).toLowerCase().indexOf(query) !== -1;
      }).slice(0, 12);
      if (!hits.length) {
        var d = document.createElement("div");
        d.className = "search-empty";
        d.textContent = "Ничего не найдено";
        box.appendChild(d);
      } else {
        hits.forEach(function (row) {
          var a = document.createElement("a");
          a.href = row[0] + "#" + row[1];
          var s = document.createElement("span");
          s.className = "sect";
          s.textContent = row[3];
          a.textContent = row[2] + " ";
          a.appendChild(s);
          box.appendChild(a);
        });
      }
      box.classList.add("open");
    }

    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; box.classList.remove("open"); input.blur(); }
      if (e.key === "Enter") {
        var first = box.querySelector("a");
        if (first) { location.href = first.getAttribute("href"); input.value = ""; box.classList.remove("open"); }
      }
    });
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".search")) box.classList.remove("open");
    });
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); input.focus(); input.select();
      }
    });
  }

  /* ---------- code copy ---------- */
  function initCopy() {
    $$("pre").forEach(function (pre) {
      var btn = document.createElement("button");
      btn.className = "copy";
      btn.type = "button";
      btn.textContent = "копировать";
      btn.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = code ? code.innerText : pre.innerText;
        var done = function () {
          btn.textContent = "скопировано";
          btn.classList.add("done");
          setTimeout(function () { btn.textContent = "копировать"; btn.classList.remove("done"); }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
        } else { fallback(text, done); }
      });
      pre.appendChild(btn);
    });
    function fallback(text, done) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  /* ---------- checklists ---------- */
  function initTasks() {
    var inputs = $$('input[type="checkbox"][data-task]');
    if (!inputs.length) return;
    var state = {};
    try { state = JSON.parse(store(LS_TASKS) || "{}"); } catch (e) { state = {}; }

    function save() { store(LS_TASKS, JSON.stringify(state)); }

    inputs.forEach(function (i) {
      var key = i.getAttribute("data-task");
      if (state[key]) i.checked = true;
      sync(i);
      i.addEventListener("change", function () {
        if (i.checked) state[key] = true; else delete state[key];
        sync(i); save(); updateAll();
      });
    });

    function sync(i) {
      var lab = i.closest(".task");
      if (lab) lab.classList.toggle("done", i.checked);
    }

    function updateAll() {
      var total = inputs.length, done = inputs.filter(function (i) { return i.checked; }).length;
      var fill = $("#progressFill"), num = $("#progressNum"), wrap = $("#progress");
      if (fill) fill.style.width = total ? (done / total * 100) + "%" : "0%";
      if (num) num.textContent = done + " / " + total;
      if (wrap) wrap.setAttribute("aria-valuenow", done);
      updatePhaseCounts();
      updateGlobalProgress();
    }

    function updatePhaseCounts() {
      $$(".phase").forEach(function (ph) {
        var list = $$('input[type="checkbox"][data-task]', ph);
        if (!list.length) return;
        var d = list.filter(function (i) { return i.checked; }).length;
        var el = $(".phase-count", ph);
        if (el) el.textContent = d + " / " + list.length;
      });
    }

    var reset = $("#resetTasks");
    if (reset) reset.addEventListener("click", function () {
      if (!confirm("Снять все отметки?")) return;
      state = {};
      inputs.forEach(function (i) { i.checked = false; sync(i); });
      save(); updateAll();
    });

    updateAll();
  }

  /* Progress on the index page, computed from the same storage. */
  function updateGlobalProgress() {
    var el = $("#globalProgress");
    if (!el) return;
    var state = {};
    try { state = JSON.parse(store(LS_TASKS) || "{}"); } catch (e) { return; }
    var done = Object.keys(state).length;
    el.textContent = done ? done + " отмечено" : "пока пусто";
  }

  function initGlobalProgress() { updateGlobalProgress(); }

  /* Keep several tabs in sync. */
  function initStorageSync() {
    window.addEventListener("storage", function (e) {
      if (e.key === LS_TASKS) location.reload();
    });
  }

  /* ------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initNav();
    initCurrentPage();
    initToc();
    initSearch();
    initCopy();
    initTasks();
    initGlobalProgress();
    initStorageSync();
  });
})();
