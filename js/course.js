// לוגיקה משותפת: כותרת, ניווט בין שיעורים, מעקב התקדמות ושאלות תרגול.
(function () {
  var body = document.body;
  var root = body.getAttribute("data-root") || "";
  var lessonId = body.getAttribute("data-lesson");
  var STORE_KEY = "science-course-done";

  // ---------- התקדמות (נשמרת בדפדפן בלבד) ----------
  function loadDone() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveDone(done) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(done)); } catch (e) {}
  }

  // כל השיעורים ברצף אחד, לצורך "הקודם/הבא"
  var flat = [];
  (window.COURSE || []).forEach(function (u) {
    u.lessons.forEach(function (l) { flat.push({ unit: u, lesson: l }); });
  });

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---------- כותרת עליונה ----------
  var header = el("header", { "class": "site-header" });
  var crumbs = "";
  var current = null;
  if (lessonId) {
    flat.forEach(function (x, i) { if (x.lesson.id === lessonId) current = i; });
    if (current != null) {
      var u = flat[current].unit;
      crumbs = '<div class="crumbs"><a href="' + root + 'index.html">מפת הקורס</a> › יחידה ' +
        u.id + ': ' + u.title + '</div>';
    }
  }
  header.innerHTML = '<a href="' + root + 'index.html">🔬 מדע וטכנולוגיה – חזרה על כיתות ז׳–ח׳</a>' + crumbs;
  body.insertBefore(header, body.firstChild);

  // ---------- ניווט בתחתית שיעור ----------
  if (current != null) {
    var main = document.querySelector("main");
    var done = loadDone();
    var nav = el("div", { "class": "lesson-nav" });

    var prev = null, next = null;
    for (var i = current - 1; i >= 0; i--) if (flat[i].lesson.path) { prev = flat[i]; break; }
    for (var j = current + 1; j < flat.length; j++) if (flat[j].lesson.path) { next = flat[j]; break; }

    var prevHtml = prev ? '<a class="btn secondary" href="' + root + prev.lesson.path + '">→ ' + prev.lesson.title + '</a>' : '<span></span>';
    var nextHtml = next ? '<a class="btn secondary" href="' + root + next.lesson.path + '">' + next.lesson.title + ' ←</a>'
                        : '<a class="btn secondary" href="' + root + 'index.html">חזרה למפת הקורס</a>';

    var doneBtn = el("button", { "class": "btn" });
    function paintDone() {
      var d = loadDone()[lessonId];
      doneBtn.textContent = d ? "✓ סיימתי את השיעור" : "סמני שסיימת את השיעור";
      doneBtn.className = d ? "btn done" : "btn";
    }
    doneBtn.addEventListener("click", function () {
      var d = loadDone();
      if (d[lessonId]) delete d[lessonId]; else d[lessonId] = true;
      saveDone(d);
      paintDone();
    });
    paintDone();

    nav.innerHTML = prevHtml;
    nav.appendChild(doneBtn);
    nav.insertAdjacentHTML("beforeend", nextHtml);
    main.appendChild(nav);
  }

  // ---------- מפת הקורס בדף הבית ----------
  var map = document.getElementById("course-map");
  if (map) {
    var doneMap = loadDone();
    var total = 0, finished = 0;
    window.COURSE.forEach(function (u) {
      var card = el("div", { "class": "card unit" });
      var items = u.lessons.map(function (l) {
        var isDone = !!doneMap[l.id];
        if (l.path) { total++; if (isDone) finished++; }
        var title = l.path
          ? '<a href="' + l.path + '">' + l.title + '</a>' + (l.test ? ' <span class="tag">מבחן</span>' : '')
          : '<span class="soon">' + l.title + '</span> <span class="tag">בקרוב</span>';
        return '<li><span class="check">' + (isDone ? "✓" : "") + '</span>' + title + '</li>';
      }).join("");
      card.innerHTML = '<h3>יחידה ' + u.id + ': ' + u.title +
        ' <span class="grade">(כיתה ' + u.grade + '׳)</span></h3><ul class="lesson-list">' + items + '</ul>';
      map.appendChild(card);
    });
    var prog = document.getElementById("progress");
    if (prog && total) {
      prog.innerHTML = 'השלמת ' + finished + ' מתוך ' + total + ' שיעורים זמינים' +
        '<div class="progress-bar"><div style="width:' + Math.round(100 * finished / total) + '%"></div></div>';
    }
  }

  // ---------- שאלות תרגול ----------
  var qs = document.querySelectorAll(".q");
  var mcTotal = 0, mcAnswered = 0, mcRight = 0;
  var scoreEl = null;
  function paintScore() {
    if (!scoreEl) return;
    scoreEl.textContent = "✓ " + mcRight + " נכונות מתוך " + mcAnswered + " שענית עליהן (מתוך " + mcTotal + ")";
  }

  qs.forEach(function (q, idx) {
    var text = q.querySelector(".q-text");
    if (text) text.insertAdjacentHTML("afterbegin", '<span class="q-num">' + (idx + 1) + '.</span>');

    var opts = q.querySelectorAll(".options button");
    if (!opts.length) return;
    mcTotal++;
    var correct = parseInt(q.getAttribute("data-correct"), 10) - 1; // 1 = האפשרות הראשונה
    var fb = el("div", { "class": "feedback" });
    q.appendChild(fb);
    var explain = q.querySelector(".explain");

    opts.forEach(function (b, i) {
      b.addEventListener("click", function () {
        opts.forEach(function (o) { o.disabled = true; });
        opts[correct].classList.add("correct");
        mcAnswered++;
        if (i === correct) {
          mcRight++;
          fb.className = "feedback show good";
          fb.innerHTML = "✓ נכון! " + (explain ? explain.innerHTML : "");
        } else {
          b.classList.add("wrong");
          fb.className = "feedback show bad";
          fb.innerHTML = "✗ לא בדיוק. התשובה הנכונה מסומנת בירוק. " + (explain ? explain.innerHTML : "");
        }
        paintScore();
      });
    });
  });

  if (mcTotal) {
    var practice = document.querySelector(".practice");
    if (practice) {
      scoreEl = el("div", { "class": "score" });
      practice.appendChild(scoreEl);
      var reset = el("button", { "class": "btn secondary", "style": "display:block;margin:10px auto 0" }, "לנסות שוב מההתחלה");
      reset.addEventListener("click", function () { location.reload(); });
      practice.appendChild(reset);
      paintScore();
    }
  }
})();
