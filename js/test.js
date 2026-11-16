// מבחן שלב: מגריל שאלות מהמאגר, בודק, ושומר ציון. 80 ומעלה פותח את השלב הבא.
(function () {
  var C = window.COURSE, S = window.CourseState, BANK = window.BANK || {};
  var main = document.getElementById("test-main");
  var levelId = new URLSearchParams(location.search).get("level");
  var li = S.levelIndex(levelId);
  if (li < 0) { main.innerHTML = '<p>המבחן לא נמצא. <a href="index.html">חזרה למפה</a></p>'; return; }
  var lv = C.levels[li];
  var state = S.load();
  var label = lv.final ? "מבחן סיום כיתה ז׳" : "מבחן שלב " + lv.num + ": " + lv.title;
  document.title = label;

  if (!S.testUnlocked(state, li)) {
    main.innerHTML = '<div class="card locked-msg"><div class="big">🔒</div><h1>המבחן עדיין נעול</h1>' +
      '<p>קודם צריך לסיים את כל השיעורים בשלב' + (li ? ", ולעבור את מבחן השלב הקודם" : "") + '.</p>' +
      '<a class="btn" href="index.html">חזרה למפת הקורס</a></div>';
    return;
  }

  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var last = (state.tests[levelId] && state.tests[levelId].last) || [];
  // מעדיפים שאלות שלא הופיעו בניסיון הקודם
  function pick(pool, n) {
    var fresh = shuffle(pool.filter(function (q) { return last.indexOf(q.id) < 0; }));
    var old = shuffle(pool.filter(function (q) { return last.indexOf(q.id) >= 0; }));
    return fresh.concat(old).slice(0, n);
  }
  function bankOf(id) {
    return (BANK[id] || []).map(function (q, k) { q.id = q.id || id + "#" + k; q.level = id; return q; });
  }

  var qs = [];
  if (lv.final) {
    for (var i = 0; i < li; i++) qs = qs.concat(pick(bankOf(C.levels[i].id), 4));
    qs = shuffle(qs);
  } else {
    var mainN = li === 0 ? 12 : 10;
    qs = pick(bankOf(lv.id), mainN);
    if (li > 0) {
      var review = [];
      for (var j = 0; j < li; j++) review = review.concat(bankOf(C.levels[j].id));
      pick(review, 4).forEach(function (q) { q.review = true; qs.push(q); });
    }
  }
  if (!qs.length) { main.innerHTML = '<p>שאלות המבחן הזה עדיין בהכנה. <a href="index.html">חזרה למפה</a></p>'; return; }

  var prev = state.tests[levelId];
  var html = '<h1>' + label + '</h1>' +
    '<div class="box goals"><span class="box-title">📝 הוראות</span><ul>' +
    '<li>במבחן ' + qs.length + ' שאלות. ' + (li > 0 && !lv.final ? 'חלק מהן (מסומנות "חזרה") הן על שלבים קודמים.' : '') + '</li>' +
    '<li>עני על כל השאלות ואז לחצי "בדיקה". אפשר להשתמש בדף טיוטה ובמחשבון.</li>' +
    '<li>ציון ' + C.passMark + ' ומעלה פותח את השלב הבא. אפשר לנסות שוב כמה פעמים שצריך – בכל ניסיון מגיעות שאלות אחרות.</li></ul>' +
    (prev ? '<p>ניסיונות קודמים: ' + prev.attempts + ' · ציון הכי גבוה: ' + prev.best + '</p>' : '') + '</div>' +
    '<section class="practice" id="qs"></section><div class="test-actions"><button class="btn" id="submit" type="button">בדיקה</button>' +
    '<div class="small" id="missing"></div></div><div id="result"></div>';
  main.innerHTML = html;
  var box = document.getElementById("qs");
  var answers = [];

  qs.forEach(function (q, n) {
    var d = document.createElement("div");
    d.className = "q" + (q.review ? " review-q" : "");
    var inner = '<div class="q-text"><span class="q-num">' + (n + 1) + '.</span>' + q.q + '</div>' + (q.fig || "");
    if (q.o) {
      // ערבוב סדר התשובות (אלא אם נקבע אחרת)
      var order = q.keep ? q.o.map(function (_, k) { return k; }) : shuffle(q.o.map(function (_, k) { return k; }));
      q._order = order;
      inner += '<div class="options">' + order.map(function (k) { return '<button type="button" data-k="' + k + '">' + q.o[k] + '</button>'; }).join("") + '</div>';
    } else {
      inner += '<div><input class="num" type="text" inputmode="decimal" aria-label="תשובה"><span class="unit-label">' + (q.unit || "") + '</span></div>';
    }
    d.innerHTML = inner;
    box.appendChild(d);
    if (q.o) {
      var bs = d.querySelectorAll(".options button");
      bs.forEach(function (b) {
        b.addEventListener("click", function () {
          if (d.dataset.graded) return;
          bs.forEach(function (x) { x.classList.remove("picked"); });
          b.classList.add("picked");
          answers[n] = parseInt(b.getAttribute("data-k"), 10);
        });
      });
    } else {
      d.querySelector("input").addEventListener("input", function (e) { answers[n] = e.target.value; });
    }
  });

  document.getElementById("submit").addEventListener("click", function () {
    var missing = [];
    qs.forEach(function (q, n) { if (answers[n] === undefined || answers[n] === "") missing.push(n + 1); });
    if (missing.length) {
      document.getElementById("missing").textContent = "עוד לא ענית על שאלות: " + missing.join(", ");
      return;
    }
    var right = 0;
    var nodes = box.querySelectorAll(".q");
    qs.forEach(function (q, n) {
      var d = nodes[n], ok;
      d.dataset.graded = 1;
      if (q.o) {
        ok = answers[n] === q.a;
        d.querySelectorAll(".options button").forEach(function (b) {
          b.disabled = true;
          var k = parseInt(b.getAttribute("data-k"), 10);
          if (k === q.a) b.classList.add("correct");
          else if (k === answers[n]) b.classList.add("wrong");
        });
      } else {
        var v = parseFloat(String(answers[n]).replace(",", ".").replace(/[^\d.\-]/g, ""));
        ok = !isNaN(v) && Math.abs(v - q.a) <= (q.tol || 0.01) * Math.max(1, Math.abs(q.a));
        d.querySelector("input").disabled = true;
      }
      if (ok) right++;
      d.classList.add(ok ? "graded-right" : "graded-wrong");
      var lessonLink = q.lesson ? findLessonPath(q.lesson) : "";
      d.insertAdjacentHTML("beforeend", '<div class="graded-fb ' + (ok ? "good" : "bad") + '" style="color:var(--' + (ok ? "good" : "bad") + ')">' +
        (ok ? "✓ נכון. " : "✗ לא נכון. " + (q.o ? "" : "התשובה: " + q.a + " " + (q.unit || "") + ". ")) + (q.e || "") +
        (!ok && lessonLink ? ' <a href="' + lessonLink + '">לחזרה על השיעור</a>' : "") + '</div>');
    });
    var score = Math.round(100 * right / qs.length);
    var passed = score >= C.passMark;
    var s = S.load();
    var t = s.tests[levelId] || { best: 0, passed: false, attempts: 0 };
    t.attempts++; t.best = Math.max(t.best, score); t.passed = t.passed || passed;
    t.last = qs.map(function (q) { return q.id; });
    s.tests[levelId] = t; S.save(s);

    document.getElementById("submit").style.display = "none";
    document.getElementById("missing").textContent = "";
    var nextLv = C.levels[li + 1];
    var res = '<div class="result-box ' + (passed ? "pass" : "fail") + '"><div class="score-num">' + score + '</div>' +
      '<div>ענית נכון על ' + right + ' מתוך ' + qs.length + ' שאלות.</div>';
    if (passed) {
      res += '<p><b>כל הכבוד! עברת את ' + (lv.final ? "מבחן הסיום של כיתה ז׳" : "שלב " + lv.num) + '.</b></p>' +
        (lv.final ? '<p>כיתה ח׳ נפתחה במפת הקורס.</p>' : nextLv ? '<p>שלב ' + nextLv.num + ' נפתח.</p>' : '') +
        '<a class="btn" href="index.html">למפת הקורס</a>';
    } else {
      res += '<p>צריך ' + C.passMark + ' כדי לעבור. עברי על ההסברים שליד השאלות שטעית בהן, חזרי על השיעורים המתאימים, ונסי שוב – יגיעו שאלות אחרות.</p>' +
        '<button class="btn" type="button" onclick="location.reload()">ניסיון חוזר</button> <a class="btn secondary" href="index.html">למפת הקורס</a>';
    }
    res += '</div>';
    document.getElementById("result").innerHTML = res;
    document.getElementById("result").scrollIntoView({ behavior: "smooth" });
  });

  function findLessonPath(id) {
    for (var i = 0; i < C.levels.length; i++)
      for (var j = 0; j < C.levels[i].lessons.length; j++)
        if (C.levels[i].lessons[j].id === id) return C.levels[i].lessons[j].path || "";
    return "";
  }
})();
