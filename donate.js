<script src="donate.js"></script>
</body>
/* ---------------------------------------------------------------
   HODNOCENÍ V CHATU  —  přilep na konec donate.js
   Občas pošle do existujícího chatu zprávu typu "7/10".
   Vypnutí: Ratings.stop()   |  Ruční: Ratings.show()
------------------------------------------------------------------ */
(function () {
  "use strict";

  // ---- nastavení -------------------------------------------------
  const MIN_DELAY = 5000;    // nejkratší pauza mezi hodnoceními (ms)
  const MAX_DELAY = 12000;   // nejdelší pauza (ms)
  const MIN_SCORE = 3;       // od 3/10
  const MAX_SCORE = 10;      // do 10/10
  const LIFETIME  = 4500;    // stejné jako u tvých komentářů
  const SUFFIX_CHANCE = 0.25; // šance, že se za hodnocení přidá slovo

  const SUFFIXES = ["", "", "", "easy", "bez debat", "minimálně", "solid", "🔥", "no cap"];

  const NAMES = (window.Donate && window.Donate.NAMES) || [
    "kubaa_99", "TerkaM", "lucie.k", "PetrHRK", "matej_cz", "nikca__",
    "DavidP", "honza1234", "sarka.b", "ella_x", "filip.dvorak", "michal_"
  ];

  const rnd  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const esc  = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function makeText() {
    const score = rnd(MIN_SCORE, MAX_SCORE) + "/10";
    if (Math.random() < SUFFIX_CHANCE) {
      const s = pick(SUFFIXES);
      if (s) return score + " " + s;
    }
    return score;
  }

  // ---- najdeme chat tak, že si všimneme, kam padají tvoje komentáře ----
  let feed = null, template = null;

  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.dataset && n.dataset.rating) continue;   // vlastní zprávy ignoruj
        if (n.querySelector && n.querySelector("span b")) {
          feed = m.target;
          template = n;
        }
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  // ---- vložení jedné zprávy --------------------------------------
  function show() {
    if (!feed || !template || !template.isConnected && !template.cloneNode) return;

    const name = pick(NAMES);
    const el = template.cloneNode(true);
    el.dataset.rating = "1";

    const span = el.querySelector("span");
    if (span) span.innerHTML = "<b>" + esc(name) + "</b> " + esc(makeText());

    // avatar (kolečko s písmenem) přebarvit na nové jméno
    const av = el.firstElementChild;
    if (av && av !== span && av.textContent.trim().length <= 2) {
      av.textContent = name[0].toUpperCase();
    }

    feed.appendChild(el);
    setTimeout(() => el.remove(), LIFETIME);
  }

  // ---- smyčka -----------------------------------------------------
  let timer = null, running = false;

  function loop() {
    timer = setTimeout(() => {
      if (!document.hidden) show();
      loop();
    }, rnd(MIN_DELAY, MAX_DELAY));
  }

  function start() {
    if (running) return;
    running = true;
    loop();
  }

  function stop() {
    running = false;
    clearTimeout(timer);
    obs.disconnect();
  }

  window.Ratings = { start, stop, show };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
