
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const passwordOverlay = $("#passwordOverlay");
const passwordModal = $("#passwordModal");
const passwordInput = $("#passwordInput");
const passwordSubmit = $("#passwordSubmit");
const catImage = $("#catImage");
const catText = $("#catText");

document.body.style.overflow = "hidden";

const CORRECT_PASSWORD = "141103";
const IMG_SAD_CAT = "kucingmurung.jpg";  
const IMG_SMILE_CAT = "kucingsenyum.jpg"; 

function checkPassword() {
  if (passwordSubmit.disabled) return;
  const val = passwordInput.value.trim();
  $("#catFeedback").classList.add("has-reaction");
  catImage.style.animation = 'none';
  catText.style.animation = 'none';
  void catImage.offsetWidth; // Memicu reflow
  catImage.style.animation = '';
  catText.style.animation = '';

  if (val === CORRECT_PASSWORD) {
    catImage.src = IMG_SMILE_CAT;
    catImage.style.display = "block";
    catText.textContent = "yeay berhasil masuk, selamat yaa naii";
    catText.style.color = "var(--gem-blue)";
    
    passwordInput.disabled = true;
    passwordSubmit.disabled = true;
    setTimeout(() => {
      passwordOverlay.classList.add("hidden");
      document.body.style.overflow = ""; // Kembalikan scroll halaman
      $("main").inert = false;
      $("#musicDock").inert = false;
      $("#openLetterButton").focus({ preventScroll: true });
      
      setTimeout(() => passwordOverlay.remove(), 800);
    }, 1500);

  } else {
    catImage.src = IMG_SAD_CAT;
    catImage.style.display = "block";
    catText.textContent = "coba lagi, naii";
    catText.style.color = "var(--gem-magenta)";
    passwordModal.classList.remove("shake");
    void passwordModal.offsetWidth; 
    passwordModal.classList.add("shake");
    passwordInput.value = "";
    passwordInput.focus();
  }
}
passwordSubmit.addEventListener("click", checkPassword);
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkPassword();
});
const DEFAULTS = {
  recipient: "Najmi Naila Putri Permata, S.T",
  sender: "Your Friend",
  introGreeting:
    "Selamat buat semua hal yang udah Naila perjuangkan sampai sejauh ini. Hari ini semua perjuangan Naila pantas dirayakan, semua usaha Naila selama ini udah bawa Naila sejauh ini, jadi you should proud to yourself",
  finalGreeting:
    "Selamat atas pencapaiannya Naii. Terima kasih udah jadi orang yang berhati hangat dan selalu layak dibanggakan."
};

function applyTextState() {
  $("#recipientName").textContent = DEFAULTS.recipient;
  $("#footerRecipient").textContent = DEFAULTS.recipient || "someone special";
  $("#senderName").textContent = DEFAULTS.sender;
  $("#introGreeting").textContent = DEFAULTS.introGreeting;
  $("#finalGreeting").textContent = DEFAULTS.finalGreeting;
}

applyTextState();

const body = document.body;
const openEnvelope = $("#openEnvelope");
const openLetterButton = $("#openLetterButton");
const bgMusic = $("#bgMusic");
const musicDock = $("#musicDock");
const siteContent = $("#siteContent");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
let isOpening = false;

function openSurprise() {
  if (isOpening || $("main").inert) return;
  if (body.classList.contains("opened")) {
    $("#intro").scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
    return;
  }
  isOpening = true;
  body.classList.add("envelope-opening");
  openEnvelope.disabled = true;
  openLetterButton.disabled = true;
  openLetterButton.setAttribute("aria-busy", "true");
  bgMusic.play().then(() => musicDock.classList.add("playing")).catch(() => {});
  setTimeout(() => {
    body.classList.add("opened");
    body.classList.remove("envelope-opening");
    siteContent.hidden = false;
    siteContent.inert = false;
    openEnvelope.disabled = false;
    openLetterButton.disabled = false;
    openEnvelope.setAttribute("aria-expanded", "true");
    openLetterButton.setAttribute("aria-expanded", "true");
    openLetterButton.removeAttribute("aria-busy");
    isOpening = false;
    if (!reducedMotion.matches) burstConfetti(innerWidth / 2, innerHeight * .48, 30);
    requestAnimationFrame(() => $("#intro").scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" }));
  }, reducedMotion.matches ? 30 : 1700);
}

openEnvelope.addEventListener("click", openSurprise);
openLetterButton.addEventListener("click", openSurprise);
$("#readLetterLink").addEventListener("click", () => $("#letter").scrollIntoView({ behavior: "smooth" }));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .13, rootMargin: "0px 0px -45px 0px" });
$$(".reveal").forEach((el) => revealObserver.observe(el));

const musicToggle = $("#musicToggle");
const musicExpand = $("#musicExpand");
const musicMenu = $("#musicMenu");
const progress = $("#musicProgress");

musicToggle.addEventListener("click", async () => {
  if (bgMusic.paused) {
    try { await bgMusic.play(); musicDock.classList.add("playing"); } catch (_) {}
  } else {
    bgMusic.pause();
    musicDock.classList.remove("playing");
  }
});

musicExpand.addEventListener("click", (event) => {
  event.stopPropagation();
  musicMenu.classList.toggle("open");
});
document.addEventListener("click", (event) => {
  if (!musicDock.contains(event.target)) musicMenu.classList.remove("open");
});

bgMusic.addEventListener("play", () => musicDock.classList.add("playing"));
bgMusic.addEventListener("pause", () => musicDock.classList.remove("playing"));
bgMusic.addEventListener("timeupdate", () => {
  if (!Number.isFinite(bgMusic.duration) || !bgMusic.duration) return;
  progress.style.width = `${(bgMusic.currentTime / bgMusic.duration) * 100}%`;
});

$("#restartMusic").addEventListener("click", async () => {
  bgMusic.currentTime = 0;
  try { await bgMusic.play(); } catch (_) {}
  musicMenu.classList.remove("open");
});

const confettiCanvas = $("#confettiCanvas");
const cctx = confettiCanvas.getContext("2d");
let particles = [];
let raf = null;
const petalColors = ["#d3005b", "#0080ff", "#9c639c", "#d1bead", "#ffffff"];

function resizeConfetti() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  confettiCanvas.width = innerWidth * dpr;
  confettiCanvas.height = innerHeight * dpr;
  confettiCanvas.style.width = `${innerWidth}px`;
  confettiCanvas.style.height = `${innerHeight}px`;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeConfetti();
addEventListener("resize", resizeConfetti);

function burstConfetti(x, y, count = 90) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.6 + Math.random() * 4.4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2.6,
      g: .045 + Math.random() * .04,
      size: 8 + Math.random() * 10,
      petals: 4 + ((Math.random() * 3) | 0),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - .5) * .1,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: .04 + Math.random() * .05,
      swayAmp: .3 + Math.random() * .7,
      life: 110 + Math.random() * 70,
      color: petalColors[(Math.random() * petalColors.length) | 0]
    });
  }
  if (!raf) animateConfetti();
}

function drawFlower(ctx, size, petalCount, color) {
  for (let i = 0; i < petalCount; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 / petalCount) * i);
    ctx.beginPath();
    ctx.ellipse(0, -size * .52, size * .34, size * .52, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * .24, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
}

function animateConfetti() {
  cctx.clearRect(0, 0, innerWidth, innerHeight);
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    p.vx *= .985;
    p.vy += p.g;
    p.sway += p.swaySpeed;
    p.x += p.vx + Math.sin(p.sway) * p.swayAmp * .12;
    p.y += p.vy;
    p.rot += p.vr;
    p.life--;
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.rot);
    cctx.globalAlpha = Math.min(1, p.life / 35);
    drawFlower(cctx, p.size, p.petals, p.color);
    cctx.restore();
  });
  if (particles.length) raf = requestAnimationFrame(animateConfetti);
  else { cancelAnimationFrame(raf); raf = null; }
}

$("#celebrateButton").addEventListener("click", (event) => {
  const r = event.currentTarget.getBoundingClientRect();
  burstConfetti(r.left + r.width / 2, r.top, 34);
});
$("#finalCelebrate").addEventListener("click", (event) => {
  const r = event.currentTarget.getBoundingClientRect();
  burstConfetti(r.left + r.width / 2, r.top + r.height / 2, 65);
});

$("#featureYear").textContent = String(new Date().getFullYear());

(() => {
  const starsCanvas = $("#gateStars");
  const rocketCanvas = $("#rocketCanvas");
  const starsContext = starsCanvas.getContext("2d");
  const rocketContext = rocketCanvas.getContext("2d");
  const coarsePointer = matchMedia("(pointer: coarse)");
  let width = innerWidth;
  let height = innerHeight;
  let stars = [];
  let trail = [];
  let frame = 0;
  let lastTime = 0;
  let lastPointerTime = 0;
  let touchActive = false;
  let hasPointer = false;
  let rocket = { x: width - 52, y: 92, angle: -Math.PI / 4 };
  let target = { x: rocket.x, y: rocket.y };
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const gateActive = () => passwordOverlay.isConnected && !passwordOverlay.classList.contains("hidden");

  function resizeSky() {
    if (!gateActive()) return;
    width = document.documentElement.clientWidth;
    height = window.visualViewport?.height || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    for (const canvas of [starsCanvas, rocketCanvas]) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (passwordOverlay.isConnected) passwordOverlay.style.height = `${height}px`;
    stars = Array.from({ length: Math.min(160, Math.max(70, Math.round(width * height / 6000))) }, () => ({
      x: Math.random(), y: Math.random(), size: .5 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2, speed: .45 + Math.random() * .65,
      cross: Math.random() > .82,
      color: ["#f4f6ff", "#b8ceff", "#d9b8e9", "#8edaff"][Math.floor(Math.random() * 4)]
    }));
    rocket.x = clamp(rocket.x, 36, width - 36);
    rocket.y = clamp(rocket.y, 36, height - 36);
    target.x = clamp(target.x, 36, width - 36);
    target.y = clamp(target.y, 36, height - 36);
    paintStars(performance.now());
    startSky();
  }

  function paintStars(time) {
    if (!gateActive()) return;
    starsContext.clearRect(0, 0, width, height);
    for (const star of stars) {
      const glow = .5 + .5 * Math.sin(time * .001 * star.speed + star.phase);
      const x = Math.round(star.x * width);
      const y = Math.round(star.y * height);
      starsContext.fillStyle = star.color;
      starsContext.globalAlpha = .22 + glow * .78;
      starsContext.beginPath();
      starsContext.arc(x, y, star.size, 0, Math.PI * 2);
      starsContext.fill();
      if (star.cross) {
        starsContext.globalAlpha *= .55;
        const reach = 2 + glow * 4;
        starsContext.fillRect(x - reach, y - .5, reach * 2, 1);
        starsContext.fillRect(x - .5, y - reach, 1, reach * 2);
      }
    }
    starsContext.globalAlpha = 1;
  }

  function paintRocket(time) {
    const ctx = rocketContext;
    ctx.save();
    ctx.translate(rocket.x, rocket.y);
    ctx.rotate(rocket.angle + Math.PI / 2);
    const scale = coarsePointer.matches ? 1.5 : 2;
    ctx.scale(scale, scale);
    ctx.translate(-8, -11);
    const rect = (color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
    const flame = Math.floor(time / 110) % 2;
    rect("#ff8957", 6, 17, 4, 4 + flame * 2);
    rect("#ffe5a2", 7, 17, 2, 6 + flame);
    rect("#cf317a", 7, 0, 2, 2);
    rect("#ff71b1", 6, 2, 4, 2);
    rect("#ff9dc8", 5, 4, 6, 2);
    rect("#93a9d9", 4, 6, 8, 9);
    rect("#f5f1ff", 5, 6, 6, 10);
    rect("#cad6fa", 10, 6, 1, 10);
    rect("#3760b1", 6, 7, 4, 4);
    rect("#71dfff", 7, 8, 2, 2);
    rect("#eafcff", 7, 8, 1, 1);
    rect("#ff71b1", 3, 12, 2, 6);
    rect("#ce3d82", 2, 15, 1, 4);
    rect("#ff71b1", 11, 12, 2, 6);
    rect("#ce3d82", 13, 15, 1, 4);
    rect("#4c608d", 5, 16, 6, 2);
    ctx.restore();
  }

  function animateSky(time) {
    frame = 0;
    if (!gateActive() || document.hidden || reducedMotion.matches) return;
    const elapsed = Math.min(50, Math.max(1, time - (lastTime || time - 16)));
    lastTime = time;
    paintStars(time);
    rocketContext.clearRect(0, 0, width, height);
    if (!hasPointer || (coarsePointer.matches && !touchActive && time - lastPointerTime > 2200)) {
      target.x = width - 48 + Math.sin(time * .0005) * 8;
      target.y = Math.min(100, height * .2) + Math.cos(time * .0008) * 12;
    }
    target.x = clamp(target.x, 36, width - 36);
    target.y = clamp(target.y, 36, height - 36);
    const dx = target.x - rocket.x;
    const dy = target.y - rocket.y;
    const distance = Math.hypot(dx, dy);
    const follow = 1 - Math.exp(-elapsed / 110);
    rocket.x += dx * follow;
    rocket.y += dy * follow;
    if (distance > 1.5) {
      const desired = Math.atan2(dy, dx);
      const difference = Math.atan2(Math.sin(desired - rocket.angle), Math.cos(desired - rocket.angle));
      rocket.angle += difference * (1 - Math.exp(-elapsed / 95));
    }
    if (distance > 2 && trail.length < 55) {
      trail.push({
        x: rocket.x - Math.cos(rocket.angle) * 19,
        y: rocket.y - Math.sin(rocket.angle) * 19,
        vx: (Math.random() - .5) * .7, vy: (Math.random() - .5) * .7,
        life: 1, size: Math.random() > .7 ? 3 : 2,
        color: Math.random() > .5 ? "#a6ddff" : "#ffd4ef"
      });
    }
    trail = trail.filter(p => p.life > 0);
    for (const p of trail) {
      p.life -= elapsed / 550;
      p.x += p.vx * elapsed / 16;
      p.y += p.vy * elapsed / 16;
      rocketContext.globalAlpha = Math.max(0, p.life) * .65;
      rocketContext.fillStyle = p.color;
      rocketContext.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    rocketContext.globalAlpha = 1;
    paintRocket(time);
    frame = requestAnimationFrame(animateSky);
  }

  function startSky() {
    if (gateActive() && !frame && !document.hidden && !reducedMotion.matches) {
      lastTime = 0;
      frame = requestAnimationFrame(animateSky);
    }
  }

  function followPointer(event) {
    if (!gateActive()) return;
    hasPointer = true;
    lastPointerTime = performance.now();
    target.x = event.clientX - 30;
    target.y = event.clientY + 32;
    startSky();
  }

  passwordOverlay.addEventListener("pointermove", followPointer, { passive: true });
  passwordOverlay.addEventListener("pointerdown", event => {
    touchActive = event.pointerType === "touch";
    followPointer(event);
  }, { passive: true });
  for (const type of ["pointerup", "pointercancel"]) passwordOverlay.addEventListener(type, () => { touchActive = false; }, { passive: true });
  passwordOverlay.addEventListener("pointerleave", () => { hasPointer = false; });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else startSky();
  });
  reducedMotion.addEventListener("change", () => {
    cancelAnimationFrame(frame);
    frame = 0;
    rocketContext.clearRect(0, 0, width, height);
    paintStars(performance.now());
    startSky();
  });
  addEventListener("resize", resizeSky);
  window.visualViewport?.addEventListener("resize", resizeSky);
  resizeSky();
})();
