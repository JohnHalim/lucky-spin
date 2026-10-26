'use strict';

/* ---------- الجوائز (8 قطاعات متساوية، الترتيب مع عقارب الساعة من المؤشر) ---------- */
const PRIZES = [
  { name: '400 ميجا واتساب',   lines: ['400 ميجا', 'واتساب'],   icon: '📶', color: '#7c3aed', text: '#fff',    title: 'مبرووووك! 🎉',                  msg: 'كسبت 400 ميجا واتساب!' },
  { name: '200 ميجا إنترنت',   lines: ['200 ميجا', 'إنترنت'],   icon: '🌐', color: '#2563eb', text: '#fff',    title: 'جامد! 🌐',                      msg: 'كسبت 200 ميجا إنترنت!' },
  { name: '100 دقيقة',         lines: ['100', 'دقيقة'],         icon: '📱', color: '#0891b2', text: '#fff',    title: 'كلم براحتك! 📱',                msg: 'كسبت 100 دقيقة!' },
  { name: '200 جنيه',          lines: ['200', 'جنيه'],          icon: '💰', color: '#fbbf24', text: '#2a1a00', title: 'يا مليونير! 💰',                msg: 'كسبت 200 جنيه!' },
  { name: 'دقايق طول اليوم',   lines: ['دقايق', 'طول اليوم'],   icon: '☎️', color: '#c026d3', text: '#fff',    title: 'الشبكة هتشتكي منك النهارده! 😂', msg: 'كسبت دقايق طول اليوم!' },
  { name: '20 جنيه',           lines: ['20', 'جنيه'],           icon: '💵', color: '#4f46e5', text: '#fff',    title: 'يا بختك! 💵',                   msg: 'الجائزة طلعت 20 جنيه!' },
  { name: '30 ميجا',           lines: ['30', 'ميجا'],           icon: '🎁', color: '#e11d48', text: '#fff',    title: 'مفاجأة مخصوص ليك! 🎁',          msg: 'كسبت 30 ميجا!' },
  { name: 'حظ جامد — جرّب تاني!', lines: ['حظ جامد', 'جرّب تاني'], icon: '🍀', color: '#059669', text: '#fff',    title: 'حظك جامد! 🍀',                  msg: 'جرّب تاني!' },
];
const N = PRIZES.length;
const SEG = 360 / N;                       // 45 درجة لكل قطاع
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DURATION = REDUCED ? 1200 : 5500;    // مدة اللف بالمللي ثانية

const $ = (id) => document.getElementById(id);
const wheel = $('wheel'), wrap = $('wheelWrap'), spinBtn = $('spinBtn');
const modal = $('modal');

/* ---------- رسم العجلة بـ SVG ---------- */
const R = 196;
const pt = (r, deg) => {                   // الزاوية بتتقاس من فوق مع عقارب الساعة
  const a = deg * Math.PI / 180;
  return [(r * Math.sin(a)).toFixed(2), (-r * Math.cos(a)).toFixed(2)];
};
let svg = '<svg viewBox="-200 -200 400 400" xmlns="http://www.w3.org/2000/svg" direction="ltr">';
PRIZES.forEach((p, i) => {
  const c = i * SEG;
  const [x0, y0] = pt(R, c - SEG / 2), [x1, y1] = pt(R, c + SEG / 2);
  svg += `<path d="M0 0 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z" fill="${p.color}" stroke="rgba(255,255,255,.4)" stroke-width="2"/>`;
  svg += `<g transform="rotate(${c})" fill="${p.text}" font-family="Cairo, Tahoma, sans-serif" font-weight="800">`;
  svg += `<text y="-158" font-size="30" text-anchor="middle" dominant-baseline="central">${p.icon}</text>`;
  svg += `<g transform="translate(0,-130) rotate(-90)" font-size="16" text-anchor="end">`;
  svg += `<text y="-3">${p.lines[0]}</text><text y="15">${p.lines[1]}</text></g></g>`;
});
svg += '</svg>';
wheel.innerHTML = svg;

/* لمبات الإطار */
for (let i = 0; i < 20; i++) {
  const [x, y] = pt(48.4, i * 18);
  const b = document.createElement('i');
  b.className = 'bulb';
  b.style.left = (50 + +x) + '%';
  b.style.top = (50 + +y) + '%';
  wrap.appendChild(b);
}

/* ---------- منطق اللف ---------- */
let rotation = 0;      // الزاوية التراكمية للعجلة
let spinning = false;  // قفل: لفة واحدة في نفس الوقت

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;

  // 1) اختيار الفائز (احتمال متساوي 1/8)
  const idx = Math.floor(Math.random() * N);
  // 2) إزاحة عشوائية جوه القطاع (±15°) عشان المؤشر ميبقاش دايمًا في النص
  const offset = (Math.random() - 0.5) * 30;
  // 3) الزاوية المطلوبة عشان مركز القطاع idx يبقى تحت المؤشر (فوق)
  const target = (((360 - (idx * SEG + offset)) % 360) + 360) % 360;
  const current = ((rotation % 360) + 360) % 360;
  const delta = (target - current + 360) % 360;
  // 4) من 5 لـ 8 لفات كاملة + الزاوية المطلوبة
  rotation += 360 * (5 + Math.floor(Math.random() * 4)) + delta;

  wheel.style.transition = `transform ${DURATION}ms cubic-bezier(.12,.62,.08,1)`;
  wheel.style.transform = `rotate(${rotation}deg)`;

  setTimeout(() => finish(), DURATION + 100);
}

function finish() {
  // الفائز بيتحسب من الزاوية النهائية الفعلية → النتيجة مطابقة للمؤشر دايمًا
  const a = ((rotation % 360) + 360) % 360;
  const idx = Math.round(((360 - a) % 360) / SEG) % N;
  showResult(PRIZES[idx]);
}

/* ---------- نافذة النتيجة ---------- */
function showResult(p) {
  $('mIcon').textContent = p.icon;
  $('mTitle').textContent = p.title;
  $('mPrize').textContent = p.name;
  $('mMsg').textContent = p.msg;
  modal.hidden = false;
  $('formBtn').focus({ preventScroll: true });
  if (!REDUCED) confetti();
}

function closeAndReset() {
  modal.hidden = true;
  spinning = false;
  spinBtn.disabled = false;
}

spinBtn.addEventListener('click', spin);
$('againBtn').addEventListener('click', closeAndReset);
modal.addEventListener('click', (e) => { if (e.target === modal) closeAndReset(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeAndReset(); });

/* ---------- Confetti خفيف بدون مكتبات ---------- */
function confetti() {
  const cv = $('confetti'), ctx = cv.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#fbbf24', '#22d3ee', '#e879f9', '#7c3aed', '#fff', '#34d399'];
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2, y: innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4,
    s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
    c: colors[Math.floor(Math.random() * colors.length)],
  }));
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach((q) => {
      q.vy += 0.35; q.x += q.vx; q.y += q.vy; q.r += q.vr;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.r);
      ctx.fillStyle = q.c; ctx.fillRect(-q.s / 2, -q.s / 3, q.s, q.s * 0.6);
      ctx.restore();
    });
    if (t - t0 < 3200) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(t0);
}
