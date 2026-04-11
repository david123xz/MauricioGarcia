// =============================
// SEC_OPERATOR SYSTEM JS CORE
// =============================

// FORM HANDLER
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value;

    status.textContent = `[SYSTEM] TRANSMISSION SENT... THANK YOU ${name}`;

    form.reset();

    setTimeout(() => {
      status.textContent = "";
    }, 4000);
  });
}

// =============================
// SMOOTH SCROLL (OS NAV STYLE)
// =============================

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const target = document.querySelector(link.getAttribute("href"));

    if (target) {
      target.scrollIntoView({
        behavior: "smooth"
      });
    }
  });
});

// =============================
// TYPING EFFECT (HERO TERMINAL)
// =============================

const terminal = document.querySelector(".terminal-text");

if (terminal) {
  const original = terminal.innerHTML;
  terminal.innerHTML = "";

  let i = 0;

  function typeEffect() {
    if (i < original.length) {
      terminal.innerHTML += original.charAt(i);
      i++;
      setTimeout(typeEffect, 15);
    }
  }

  typeEffect();
}

// =============================
// CARD HOVER LIGHT TRACKING
// =============================

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    card.style.setProperty("--x", x + "px");
    card.style.setProperty("--y", y + "px");
  });
});