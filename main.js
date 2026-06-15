// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Nav shadow on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu
const toggle = document.getElementById("navToggle");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
});
document.getElementById("navMobile").addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Scroll reveal
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

// Tag hero reveals + auto-reveal section content
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
document
  .querySelectorAll(".card, .case, .step, .value-list li, .section-head")
  .forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });

// Count-up animation for hero stats (preserves any prefix/suffix like "<", "+", "%")
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const countUp = (el) => {
  const text = el.dataset.target || el.textContent;
  el.dataset.target = text;
  const m = text.match(/^(\D*)(\d+)(.*)$/);
  if (!m) return;
  const [, pre, numStr, post] = m;
  const target = parseInt(numStr, 10);
  const duration = 1100;
  let startTime = null;
  const step = (now) => {
    if (startTime === null) startTime = now;
    const p = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = pre + Math.round(eased * target) + post;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if (!reduceMotion) {
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll(".hero-stats strong").forEach((el) => statIo.observe(el));
}

// Contact form: submit in the background and show inline feedback
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
if (form && status) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Sending…";
    status.className = "form-status";
    status.textContent = "";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        status.classList.add("ok");
        status.textContent = "Thanks — your brief is in. We'll reply within one business day.";
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          data && data.errors && data.errors.length
            ? data.errors.map((er) => er.message).join(", ")
            : "Something went wrong. Please email us directly.";
        status.classList.add("error");
        status.textContent = msg;
      }
    } catch {
      status.classList.add("error");
      status.textContent = "Network error. Please try again or email us directly.";
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });
}
