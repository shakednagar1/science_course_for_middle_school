// לוגיקה משותפת לקורס: התקדמות, נעילת שלבים, שקופיות, וידאו, שאלות בדיקה וקוד התקדמות.
(function () {
  var C = window.COURSE;
  var body = document.body;
  var root = body.getAttribute("data-root") || "";
  var lessonId = body.getAttribute("data-lesson");
  var KEY = "science-course-v2";

  // ================= מצב (נשמר בדפדפן) =================
  // { done: {lessonId: 1}, tests: {levelId: {best, passed, attempts, last: [ids]}} }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY)) || {};
      s.done = s.done || {}; s.tests = s.tests || {};
      return s;
    } catch (e) { return { done: {}, tests: {} }; }
  }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }

  function levelIndex(id) {
    for (var i = 0; i < C.levels.length; i++) if (C.levels[i].id === id) return i;
    return -1;
  }
  function levelUnlocked(s, i) {
    return i === 0 || !!(s.tests[C.levels[i - 1].id] && s.tests[C.levels[i - 1].id].passed);
  }
  function writtenLessons(lv) { return lv.lessons.filter(function (l) { return l.path; }); }
  // שיעור נפתח אם השלב פתוח והשיעור הקודם באותו שלב הושלם
  function lessonUnlocked(s, lv, li) {
    if (!levelUnlocked(s, levelIndex(lv.id))) return false;
    return li === 0 || !!s.done[lv.lessons[li - 1].id];
  }
  function testUnlocked(s, i) {
    var lv = C.levels[i];
    if (!levelUnlocked(s, i)) return false;
    if (!lv.lessons.length) return true;
    return lv.lessons.every(function (l) { return !l.path || s.done[l.id]; }) && writtenLessons(lv).length === lv.lessons.length;
  }
  function findLesson(id) {
    for (var i = 0; i < C.levels.length; i++) {
      var ls = C.levels[i].lessons;
      for (var j = 0; j < ls.length; j++) if (ls[j].id === id) return { lv: C.levels[i], li: j, l: ls[j] };
    }
    return null;
  }
  window.CourseState = { load: load, save: save, levelIndex: levelIndex, levelUnlocked: levelUnlocked, testUnlocked: testUnlocked };

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ================= כותרת עליונה =================
  var found = lessonId ? findLesson(lessonId) : null;
  var header = el("header", { "class": "site-header" });
  var crumbs = "";
  if (found) {
    crumbs = '<div class="crumbs"><a href="' + root + 'index.html">מפת הקורס</a> › שלב ' + found.lv.num + ': ' + found.lv.title + '</div>';
  } else if (body.getAttribute("data-crumb")) {
    crumbs = '<div class="crumbs"><a href="' + root + 'index.html">מפת הקורס</a> › ' + body.getAttribute("data-crumb") + '</div>';
  }
  header.innerHTML = '<a href="' + root + 'index.html">🔬 מדע וטכנולוגיה – השלמת פערים</a>' + crumbs;
  body.insertBefore(header, body.firstChild);

  var state = load();
  var main = document.querySelector("main");

  // ================= נעילת שיעור =================
  if (found && !lessonUnlocked(state, found.lv, found.li)) {
    var why = levelUnlocked(state, levelIndex(found.lv.id))
      ? "קודם צריך לסיים את השיעור הקודם בשלב הזה."
      : "השלב הזה ייפתח אחרי שתעברי את מבחן השלב הקודם בציון " + C.passMark + " ומעלה.";
    main.innerHTML = '<div class="card locked-msg"><div class="big">🔒</div><h1>השיעור עדיין נעול</h1><p>' + why +
      '</p><a class="btn" href="' + root + 'index.html">חזרה למפת הקורס</a></div>';
    return;
  }

  // ================= וידאו =================
  document.querySelectorAll(".video[data-yt]").forEach(function (v) {
    var id = v.getAttribute("data-yt");
    var lang = v.getAttribute("data-lang") || "עברית";
    var title = v.getAttribute("data-title") || "";
    var isDemo = v.classList.contains("demo");
    var note = "";
    v.innerHTML = '<div class="frame"><iframe loading="lazy" allowfullscreen ' +
      'allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" ' +
      'src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0&hl=he&enablejsapi=1&origin=' + encodeURIComponent(location.origin) + '" title="' + title + '"></iframe></div>' +
      '<div class="vcap"><span class="vlang">' + (isDemo ? "ניסוי · " : "סרטון · ") + lang + '</span>' + title + note + '</div>';
  });

  // עצירת סרטון: דרך YouTube IFrame API; אם ה־API לא נטען – טוענים את הסרטון מחדש (וזה עוצר אותו)
  var ytPlayers = [];
  function stopVideo(f) {
    var pl = f._yt;
    if (pl && typeof pl.pauseVideo === "function" && pl._ready) { try { pl.pauseVideo(); return; } catch (e) {} }
    if (f._started) { var src = f.src; f.src = "about:blank"; f.src = src; f._started = false; }
  }
  var vFrames = document.querySelectorAll(".video iframe");
  if (vFrames.length) {
    vFrames.forEach(function (f) {
      // סימון שהסרטון הופעל (לחיצה בתוך iframe מורידה את הפוקוס מהעמוד)
      window.addEventListener("blur", function () { setTimeout(function () { if (document.activeElement === f) f._started = true; }, 0); });
    });
    var prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (prevReady) try { prevReady(); } catch (e) {}
      vFrames.forEach(function (f) {
        try {
          var pl = new YT.Player(f, { events: { onReady: function () { pl._ready = true; },
            onStateChange: function (ev) { if (ev.data === 1) f._started = true; } } });
          f._yt = pl;
        } catch (e) {}
      });
    };
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }

  // ================= שאלות פתוחות + שאלות בדיקה בשיעור =================
  // שאלות פתוחות: כותבים תשובה במילים שלך, ואז אפשר לראות תשובה לדוגמה.
  // שאלות בדיקה: בוחרים תשובות, לוחצים "בדיקה", ורואים כמה נכון. השיעור נפתח רק ב־100%.
  var practice = document.querySelector(".practice");
  var openQs = Array.prototype.slice.call(document.querySelectorAll(".open-q"));
  var MIN_CHARS = 15;
  function openDone() {
    return openQs.every(function (o) { return o._ta && o._ta.value.trim().length >= MIN_CHARS; });
  }
  openQs.forEach(function (o, idx) {
    var model = o.getAttribute("data-model") || "";
    var qhtml = o.innerHTML;
    o.innerHTML = '<div class="q-text"><span class="q-num">✍️</span>' + qhtml + '</div>';
    var ta = el("textarea", { "class": "open-ans", rows: "3", placeholder: "כתבי כאן את התשובה שלך, במילים שלך..." });
    var btn = el("button", { "class": "btn secondary", type: "button", disabled: "disabled" }, "הצגת תשובה לדוגמה");
    var mod = el("div", { "class": "model" });
    mod.innerHTML = "<b>תשובה לדוגמה:</b> " + model + '<div class="small">השווי לתשובה שלך: האם כתבת את הרעיון המרכזי? אם לא – תקני את התשובה שלך.</div>';
    o.appendChild(ta); o.appendChild(btn); o.appendChild(mod);
    o._ta = ta;
    var st = load();
    if (lessonId && st.open && st.open[lessonId] && st.open[lessonId][idx]) ta.value = st.open[lessonId][idx];
    function upd() {
      var ok = ta.value.trim().length >= MIN_CHARS;
      if (ok) btn.removeAttribute("disabled"); else btn.setAttribute("disabled", "disabled");
      if (lessonId) {
        var s2 = load(); s2.open = s2.open || {}; s2.open[lessonId] = s2.open[lessonId] || [];
        s2.open[lessonId][idx] = ta.value; save(s2);
      }
      paintGate();
    }
    ta.addEventListener("input", upd);
    btn.addEventListener("click", function () { mod.classList.add("show"); });
    if (ta.value.trim().length >= MIN_CHARS) btn.removeAttribute("disabled");
  });

  var mcQs = [];
  document.querySelectorAll(".q").forEach(function (q) {
    if (q.closest && q.closest(".open-q")) return;
    var opts = q.querySelectorAll(".options button");
    if (!opts.length) return;
    mcQs.push(q);
  });
  mcQs.forEach(function (q, idx) {
    var text = q.querySelector(".q-text");
    if (text) text.insertAdjacentHTML("afterbegin", '<span class="q-num">' + (idx + 1) + '.</span>');
    var opts = Array.prototype.slice.call(q.querySelectorAll(".options button"));
    q._correct = opts[parseInt(q.getAttribute("data-correct"), 10) - 1];
    q._pick = null;
    var fb = el("div", { "class": "feedback" });
    q.appendChild(fb); q._fb = fb;
    opts.forEach(function (b) {
      b.type = "button";
      b.addEventListener("click", function () {
        if (q._locked) return;
        opts.forEach(function (o) { o.classList.remove("picked"); });
        b.classList.add("picked"); q._pick = b;
        paintGate();
      });
    });
  });

  var checkBtn = null, gateMsg = null, triesEl = null, resultEl = null;
  function triesList() {
    var s = load();
    return (s.tries && lessonId && s.tries[lessonId]) || [];
  }
  function paintTries() {
    if (!triesEl) return;
    var t = triesList(), n = mcQs.length;
    triesEl.innerHTML = t.length ? "הניסיונות שלך: " + t.map(function (k) {
      return '<span class="try' + (k === n ? " full" : "") + '">' + k + "/" + n + "</span>";
    }).join(" ") : "";
  }
  function paintGate() {
    if (!checkBtn) return;
    var left = mcQs.filter(function (q) { return !q._locked && !q._pick; }).length;
    var msg = "";
    if (!openDone()) msg = "קודם כתבי תשובה לשאלה הפתוחה (לפחות משפט אחד).";
    else if (left) msg = "נשארו " + left + " שאלות בלי תשובה.";
    gateMsg.textContent = msg;
    checkBtn.disabled = !!msg;
  }
  function check() {
    var right = 0, n = mcQs.length;
    mcQs.forEach(function (q) {
      var ex = q.querySelector(".explain");
      if (q._locked || q._pick === q._correct) {
        right++;
        q._locked = true;
        q.classList.remove("is-wrong"); q.classList.add("is-right");
        q.querySelectorAll(".options button").forEach(function (o) { o.disabled = true; });
        q._correct.classList.add("correct");
        q._fb.className = "feedback show good";
        q._fb.innerHTML = "✓ נכון! " + (ex ? ex.innerHTML : "");
      } else {
        q.classList.add("is-wrong");
        q._pick.classList.remove("picked"); q._pick.classList.add("wrong");
        q._fb.className = "feedback show bad";
        q._fb.innerHTML = "✗ לא נכון. חזרי לשקופיות, חשבי שוב ונסי תשובה אחרת.";
      }
    });
    if (lessonId) {
      var s = load(); s.tries = s.tries || {}; s.tries[lessonId] = s.tries[lessonId] || [];
      s.tries[lessonId].push(right);
      if (right === n) s.done[lessonId] = 1;
      save(s);
    }
    paintTries();
    if (right === n) {
      resultEl.className = "check-result good";
      resultEl.innerHTML = "🎉 " + right + "/" + n + " – כל התשובות נכונות! השיעור הבא נפתח.";
      checkBtn.style.display = "none"; gateMsg.textContent = "";
      paintNext();
    } else {
      resultEl.className = "check-result bad";
      resultEl.innerHTML = right + "/" + n + " נכונות. כדי להמשיך צריך את כל התשובות נכונות. תקני את השאלות שסומנו באדום ובדקי שוב.";
      checkBtn.textContent = "בדיקה חוזרת";
      // מאפסים רק את השאלות השגויות, ומערבבים את סדר התשובות שלהן
      mcQs.forEach(function (q) {
        if (q._locked) return;
        var box = q.querySelector(".options");
        var opts = Array.prototype.slice.call(box.children);
        opts.forEach(function (o) { o.classList.remove("wrong", "picked"); });
        for (var i = opts.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = opts[i]; opts[i] = opts[j]; opts[j] = t; }
        opts.forEach(function (o) { box.appendChild(o); });
        q._pick = null;
      });
      paintGate();
    }
  }
  if (mcQs.length && practice) {
    var bar2 = el("div", { "class": "check-bar" });
    checkBtn = el("button", { "class": "btn", type: "button" }, "בדיקת התשובות");
    gateMsg = el("span", { "class": "small" });
    resultEl = el("div", { "class": "check-result" });
    triesEl = el("div", { "class": "tries small" });
    bar2.appendChild(checkBtn); bar2.appendChild(gateMsg);
    practice.appendChild(bar2); practice.appendChild(resultEl); practice.appendChild(triesEl);
    checkBtn.addEventListener("click", check);
    if (lessonId && load().done[lessonId]) {
      resultEl.className = "check-result good";
      resultEl.textContent = "✓ כבר סיימת את השיעור הזה. אפשר לענות שוב לתרגול.";
    }
    paintTries(); paintGate();
  } else if (lessonId && practice && openQs.length) {
    // שיעור עם שאלות פתוחות בלבד
    var s0 = load(); if (!s0.done[lessonId]) { s0.done[lessonId] = 1; save(s0); }
  }

  // ================= שקופיות =================
  var deck = document.querySelector(".slides");
  var nextBox = el("div", { "class": "lesson-nav" });
  function paintNext() {
    if (!found) return;
    var s = load();
    var lv = found.lv, li = found.li;
    var nextL = lv.lessons[li + 1];
    var html = "";
    if (!s.done[lessonId]) {
      html = '<span class="small">כדי לפתוח את השיעור הבא: כתבי תשובה לשאלה הפתוחה, ואז עני נכון על כל שאלות הבדיקה (100%).</span>';
    } else if (nextL && nextL.path) {
      html = '<span class="small">✓ סיימת את השיעור!</span><a class="btn" href="' + root + nextL.path + '">לשיעור הבא: ' + nextL.title + ' ←</a>';
    } else if (!nextL) {
      html = '<span class="small">✓ סיימת את כל השיעורים בשלב!</span><a class="btn" href="' + root + 'test.html?level=' + lv.id + '">למבחן שלב ' + lv.num + ' ←</a>';
    } else {
      html = '<span class="small">✓ סיימת את השיעור! השיעור הבא עדיין בהכנה.</span><a class="btn secondary" href="' + root + 'index.html">למפת הקורס</a>';
    }
    nextBox.innerHTML = html;
  }
  if (found && main) { main.appendChild(nextBox); paintNext(); }

  if (deck) {
    var slides = Array.prototype.slice.call(deck.querySelectorAll(".slide"));
    var cur = 0, seen = {};
    var bar = el("div", { "class": "slide-bar" });
    var dots = el("div", { "class": "dots" });
    var count = el("span", { "class": "count" });
    var toggle = el("button", { "class": "toggle-all", type: "button" }, "הצגת כל השיעור בעמוד אחד");
    slides.forEach(function (sl, i) {
      var d = el("button", { "class": "dot", type: "button", "aria-label": "שקופית " + (i + 1) });
      d.addEventListener("click", function () { go(i); });
      dots.appendChild(d);
    });
    bar.appendChild(dots); bar.appendChild(count); bar.appendChild(toggle);
    deck.parentNode.insertBefore(bar, deck);

    var nav = el("div", { "class": "slide-nav" });
    var prevB = el("button", { "class": "btn secondary", type: "button" }, "→ הקודם");
    var nextB = el("button", { "class": "btn", type: "button" }, "הבא ←");
    nav.appendChild(prevB); nav.appendChild(nextB);
    deck.parentNode.insertBefore(nav, deck.nextSibling);
    prevB.addEventListener("click", function () { go(cur - 1); });
    nextB.addEventListener("click", function () { go(cur + 1); });
    toggle.addEventListener("click", function () {
      var all = deck.classList.toggle("all");
      toggle.textContent = all ? "חזרה לתצוגת שקופיות" : "הצגת כל השיעור בעמוד אחד";
      nav.style.display = all ? "none" : "";
      dots.style.visibility = all ? "hidden" : "";
      count.style.visibility = all ? "hidden" : "";
    });
    document.addEventListener("keydown", function (e) {
      if (deck.classList.contains("all")) return;
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") go(cur + 1);
      if (e.key === "ArrowRight") go(cur - 1);
    });

    function go(i) {
      if (i < 0 || i >= slides.length) return;
      // עוצרים סרטון שמתנגן בשקופית שעוזבים
      slides.forEach(function (sl, k) {
        if (k === i) return;
        sl.querySelectorAll("iframe").forEach(stopVideo);
      });
      cur = i; seen[i] = 1;
      slides.forEach(function (sl, k) { sl.classList.toggle("active", k === i); });
      Array.prototype.forEach.call(dots.children, function (d, k) {
        d.className = "dot" + (k === i ? " on" : seen[k] ? " seen" : "");
      });
      count.textContent = "שקופית " + (i + 1) + " מתוך " + slides.length;
      prevB.style.visibility = i === 0 ? "hidden" : "";
      nextB.style.visibility = i === slides.length - 1 ? "hidden" : "";
      nextBox.style.display = i === slides.length - 1 ? "" : "none";
      if (i) bar.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    go(0);
  }

  // ================= מפת הקורס =================
  var map = document.getElementById("course-map");
  if (map) {
    var s = state;
    var firstOpen = null;
    C.levels.forEach(function (lv, i) {
      var open = levelUnlocked(s, i);
      var t = s.tests[lv.id];
      var passed = t && t.passed;
      var card = el("div", { "class": "card level" + (passed ? " passed" : "") + (open ? "" : " locked") });
      var items = lv.lessons.map(function (l, li) {
        var isDone = !!s.done[l.id];
        var canOpen = l.path && lessonUnlocked(s, lv, li);
        var isNext = canOpen && !isDone && firstOpen === null;
        if (isNext) firstOpen = l.id;
        var title = !l.path ? '<span class="soon">' + l.title + '</span> <span class="tag">בהכנה</span>'
          : canOpen ? '<a href="' + l.path + '">' + l.title + '</a>'
          : '<span class="lock">' + l.title + '</span>';
        return '<li' + (isNext ? ' class="next"' : '') + '><span class="check">' + (isDone ? "✓" : canOpen ? "" : "🔒") + '</span>' + title + '</li>';
      });
      var tOpen = testUnlocked(s, i);
      var testLabel = lv.final ? "מבחן סיום כיתה ז׳" : "מבחן שלב " + lv.num;
      var pill = t ? '<span class="result-pill ' + (passed ? "pass" : "fail") + '">ציון הכי גבוה: ' + t.best + '</span>' : "";
      var isNextTest = tOpen && !passed && firstOpen === null;
      if (isNextTest) firstOpen = lv.id;
      items.push('<li' + (isNextTest ? ' class="next"' : '') + '><span class="check">' + (passed ? "✓" : tOpen ? "📝" : "🔒") + '</span>' +
        (tOpen ? '<a href="test.html?level=' + lv.id + '"><b>' + testLabel + '</b></a>' : '<span class="lock"><b>' + testLabel + '</b></span>') + pill + '</li>');
      card.innerHTML = '<div class="level-head"><div class="level-badge">' + (passed ? "✓" : open ? lv.num : "🔒") + '</div><div><h3>שלב ' + lv.num + ': ' + lv.title +
        '</h3><div class="level-meta">כיתה ' + lv.grade + '׳ · ' + lv.week + (open ? "" : " · נפתח אחרי ציון " + C.passMark + " במבחן הקודם") + '</div></div></div>' +
        '<ul class="lesson-list">' + items.join("") + '</ul>';
      map.appendChild(card);
    });

    // כיתה ח׳
    var g8 = document.getElementById("grade8-map");
    if (g8) {
      var finalPassed = s.tests["g7-final"] && s.tests["g7-final"].passed;
      C.grade8.forEach(function (u) {
        var card = el("div", { "class": "card level" + (finalPassed ? "" : " locked") });
        var items = u.lessons.map(function (l) {
          var t = l.path && finalPassed ? '<a href="' + l.path + '">' + l.title + '</a>' : '<span class="lock">' + l.title + '</span>';
          return '<li><span class="check">' + (s.done[l.id] ? "✓" : "") + '</span>' + t + '</li>';
        }).join("");
        card.innerHTML = '<h3>' + u.title + '</h3>' + (items ? '<ul class="lesson-list">' + items + '</ul>' : '<div class="small">בהכנה</div>');
        g8.appendChild(card);
      });
    }

    // סרגל התקדמות כללי
    var prog = document.getElementById("progress");
    if (prog) {
      var total = 0, fin = 0;
      C.levels.forEach(function (lv) { total++; if (s.tests[lv.id] && s.tests[lv.id].passed) fin++; });
      var lessonsDone = Object.keys(s.done).length;
      prog.innerHTML = '<b>ההתקדמות שלך:</b> עברת ' + fin + ' מתוך ' + total + ' שלבים · סיימת ' + lessonsDone + ' שיעורים' +
        '<div class="progress-bar"><div style="width:' + Math.round(100 * fin / total) + '%"></div></div>' +
        (firstOpen ? '<div class="small">הצעד הבא מסומן בכחול במפה.</div>' : "");
    }

    // קוד התקדמות להעברה בין מכשירים
    var sync = document.getElementById("sync");
    if (sync) {
      sync.innerHTML = '<p class="small">ההתקדמות נשמרת בדפדפן של המכשיר הזה. כדי להמשיך במכשיר אחר (למשל בטלפון): מעתיקים את הקוד כאן, ובמכשיר השני מדביקים אותו בתיבה ולוחצים "טעינה".</p>' +
        '<textarea class="code" id="code-out" readonly></textarea>' +
        '<div class="sync-row"><button class="btn secondary" id="copy-code" type="button">העתקת הקוד</button></div>' +
        '<p class="small" style="margin-top:14px">קיבלת קוד ממכשיר אחר? הדביקי אותו כאן:</p>' +
        '<textarea class="code" id="code-in" placeholder="SC1-..."></textarea>' +
        '<div class="sync-row"><button class="btn" id="load-code" type="button">טעינה</button><span id="sync-msg" class="small"></span></div>';
      var out = document.getElementById("code-out");
      out.value = "SC1-" + btoa(unescape(encodeURIComponent(JSON.stringify({ d: s.done, t: s.tests, r: s.tries || {} }))));
      document.getElementById("copy-code").addEventListener("click", function () {
        out.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) {}
        if (navigator.clipboard) navigator.clipboard.writeText(out.value).catch(function () {});
        document.getElementById("copy-code").textContent = "הועתק ✓";
      });
      document.getElementById("load-code").addEventListener("click", function () {
        var msg = document.getElementById("sync-msg");
        var v = document.getElementById("code-in").value.trim();
        try {
          if (v.indexOf("SC1-") !== 0) throw 0;
          var o = JSON.parse(decodeURIComponent(escape(atob(v.slice(4)))));
          if (!o || typeof o.d !== "object" || typeof o.t !== "object") throw 0;
          // מיזוג: שומרים את הטוב מבין שני המכשירים
          var cur = load();
          for (var k in o.d) cur.done[k] = 1;
          cur.tries = cur.tries || {};
          for (var k3 in (o.r || {})) if (!cur.tries[k3] || o.r[k3].length > cur.tries[k3].length) cur.tries[k3] = o.r[k3];
          for (var k2 in o.t) {
            var a = cur.tests[k2], b = o.t[k2];
            if (!a || (b.best || 0) > (a.best || 0)) cur.tests[k2] = b;
            if (a && a.passed) cur.tests[k2].passed = true;
          }
          save(cur);
          msg.textContent = "נטען בהצלחה! מרעננים...";
          setTimeout(function () { location.reload(); }, 600);
        } catch (e) { msg.textContent = "הקוד לא תקין. ודאי שהעתקת את כולו."; }
      });
    }
  }
})();
