// מבנה הקורס.
// כל שלב נפתח רק אחרי ציון 80 ומעלה במבחן של השלב הקודם.
// שיעור עם "path" כתוב; שיעור בלי path מופיע כ"בהכנה".
window.COURSE = {
  passMark: 80,
  levels: [
    {
      id: "g7-1", grade: "ז", num: 1, week: "שבוע 1",
      title: "גופים, חומרים ותכונותיהם",
      lessons: [
        { id: "g7-1-1", title: "איך חוקרים במדע: שאלת חקר וניסוי מבוקר", path: "g7/level1/lesson1.html" },
        { id: "g7-1-2", title: "גוף וחומר; מסה ומדידתה", path: "g7/level1/lesson2.html" },
        { id: "g7-1-3", title: "נפח ומדידתו", path: "g7/level1/lesson3.html" },
        { id: "g7-1-4", title: "צפיפות: ציפה ושקיעה", path: "g7/level1/lesson4.html" },
        { id: "g7-1-5", title: "תכונות החומרים ומצבי הצבירה", path: "g7/level1/lesson5.html" },
        { id: "g7-1-6", title: "האוויר: תערובת של גזים", path: "g7/level1/lesson6.html" },
        { id: "g7-1-7", title: "המחיר הסביבתי של חומרים ושינוי האקלים", path: "g7/level1/lesson7.html" }
      ]
    },
    {
      id: "g7-2", grade: "ז", num: 2, week: "שבועות 2–3",
      title: "שינויים בחומר ומודל החלקיקים",
      lessons: [
        { id: "g7-2-1", title: "חימום וקירור: טמפרטורה, נפח ולחץ", path: "g7/level2/lesson1.html" },
        { id: "g7-2-2", title: "מעברים בין מצבי צבירה", path: "g7/level2/lesson2.html" },
        { id: "g7-2-3", title: "מודל החלקיקים: ארבע ההנחות", path: "g7/level2/lesson3.html" },
        { id: "g7-2-4", title: "מוצק, נוזל וגז לפי המודל: פעפוע, דחיסה ולחץ", path: "g7/level2/lesson4.html" },
        { id: "g7-2-5", title: "הסבר מעברי מצב צבירה בעזרת המודל", path: "g7/level2/lesson5.html" },
        { id: "g7-2-6", title: "חוק שימור המסה", path: "g7/level2/lesson6.html" }
      ]
    },
    {
      id: "g7-3", grade: "ז", num: 3, week: "שבועות 3–4",
      title: "אנרגיה",
      lessons: [
        { id: "g7-3-1", title: "סוגי אנרגיה" },
        { id: "g7-3-2", title: "המרות ומעברי אנרגיה" },
        { id: "g7-3-3", title: "חום, טמפרטורה ואנרגיה תרמית" },
        { id: "g7-3-4", title: "מעבר חום: הולכה, הסעה וקרינה" },
        { id: "g7-3-5", title: "חוק שימור האנרגיה" }
      ]
    },
    {
      id: "g7-4", grade: "ז", num: 4, week: "שבועות 4–5",
      title: "התא – יחידת החיים",
      lessons: [
        { id: "g7-4-1", title: "מאפייני החיים" },
        { id: "g7-4-2", title: "רמות ארגון והמיקרוסקופ" },
        { id: "g7-4-3", title: "מבנה התא: תא בעל חיים ותא צמח" },
        { id: "g7-4-4", title: "התאמה בין מבנה לתפקוד" },
        { id: "g7-4-5", title: "תהליכי חיים בתא" },
        { id: "g7-4-6", title: "מגוון היצורים ומיונם" }
      ]
    },
    {
      id: "g7-5", grade: "ז", num: 5, week: "שבועות 5–6",
      title: "מערכת ההובלה",
      lessons: [
        { id: "g7-5-1", title: "למה צריך מערכת הובלה" },
        { id: "g7-5-2", title: "הלב" },
        { id: "g7-5-3", title: "כלי הדם ומחזורי הדם" },
        { id: "g7-5-4", title: "הדם ומרכיביו" },
        { id: "g7-5-5", title: "בריאות הלב וכלי הדם" },
        { id: "g7-5-6", title: "הובלה בצמח: עצה ושיפה" }
      ]
    },
    {
      id: "g7-6", grade: "ז", num: 6, week: "שבועות 6–7",
      title: "מאזן מים, מאזן חום והגוף כמערכת אחת",
      lessons: [
        { id: "g7-6-1", title: "מאזן המים באדם" },
        { id: "g7-6-2", title: "מאזן המים בצמח" },
        { id: "g7-6-3", title: "מאזן החום בגוף" },
        { id: "g7-6-4", title: "התייבשות ומכת חום" },
        { id: "g7-6-5", title: "הגוף כמערכת־על" }
      ]
    },
    {
      id: "g7-7", grade: "ז", num: 7, week: "שבוע 7",
      title: "טכנולוגיה",
      lessons: [
        { id: "g7-7-1", title: "מהי טכנולוגיה" },
        { id: "g7-7-2", title: "תהליך התכן ההנדסי" },
        { id: "g7-7-3", title: "השפעת הטכנולוגיה על החברה והסביבה" }
      ]
    },
    {
      id: "g7-final", grade: "ז", num: "★", week: "שבוע 8",
      title: "חזרה ומבחן סיום כיתה ז׳",
      final: true,
      lessons: []
    }
  ],

  // כיתה ח׳ – נפתחת אחרי מבחן הסיום של כיתה ז׳
  grade8: [
    {
      title: "חומרים ותגובות כימיות",
      lessons: [
        { id: "g8-c-1", title: "תערובות, תמיסות והפרדה", path: "g8/chem/mixtures.html" },
        { id: "g8-c-2", title: "שינוי פיזיקלי ושינוי כימי", path: "g8/chem/changes.html" },
        { id: "g8-c-3", title: "אטומים, יסודות והטבלה המחזורית" },
        { id: "g8-c-4", title: "תגובות כימיות, חומצות ובסיסים" }
      ]
    },
    { title: "כוחות ותנועה", lessons: [] },
    { title: "חשמל ומגנטיות", lessons: [] },
    { title: "גוף האדם: בקרה, ויסות ורבייה", lessons: [] },
    { title: "אקולוגיה", lessons: [] }
  ]
};
