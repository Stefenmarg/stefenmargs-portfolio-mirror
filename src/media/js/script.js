// DOM Element Cache
const DOM = {
  header: {
    navbar: document.getElementById("navbar"),
    toggle: document.getElementById("menu-toggle"),
    menu: document.getElementById("navbar-solid"),
    dropdowns: document.querySelectorAll("[data-dropdown-toggle]"),
    sections: document.querySelectorAll("section[id]"),
    navLinks: document.querySelectorAll("nav a"),
  },
  footer: {
    year: document.getElementById("year"),
  },
  buttons: {
    toTop: document.getElementById("to-top-button"),
  },
  credibility: {
    counters: document.querySelectorAll("[data-count]"),
  },
};

// Handle the height of the header
document.documentElement.style.setProperty(
  "--navbar-height",
  `${DOM.header.navbar.offsetHeight}px`,
);

// Handle the hamburger menu toggle
DOM.header.toggle.addEventListener("click", () => {
  const isOpen = !DOM.header.menu.classList.contains("hidden");

  DOM.header.menu.classList.toggle("hidden");
  DOM.header.toggle.setAttribute("aria-expanded", String(!isOpen));
});

// Handle the head to top button
DOM.buttons.toTop.addEventListener("click", () => {
  document.documentElement.scrollIntoView({ behavior: "smooth" });
});

// Handle the scroll to top button
window.onscroll = () => {
  if (
    document.body.scrollTop > 500 ||
    document.documentElement.scrollTop > 500
  ) {
    DOM.buttons.toTop.classList.remove("opacity-0", "pointer-events-none");
    DOM.buttons.toTop.classList.add("opacity-100");
  } else {
    DOM.buttons.toTop.classList.add("opacity-0", "pointer-events-none");
    DOM.buttons.toTop.classList.remove("opacity-100");
  }
};

// Handle the year shown in the footer
DOM.footer.year.textContent = new Date().getFullYear().toString();

// Handle the countup animation on the Credibility Section
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 2500;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }

  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 },
);

DOM.credibility.counters.forEach((el) => countObserver.observe(el));

// Scroll Observer
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        DOM.header.navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          const match =
            href === `/#${entry.target.id}` || href === `#${entry.target.id}`;
          if (match) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      }
    });
  },
  {
    threshold: 0.1,
    rootMargin: "-30% 0px -60% 0px",
  },
);

DOM.header.sections.forEach((s) => observer.observe(s));

//Dropdown handler
DOM.header.dropdowns.forEach((button) => {
  button.addEventListener("click", () => {
    const dropdown = button.nextElementSibling;
    const isOpen = !dropdown.classList.contains("hidden");

    // Close all other dropdowns first
    DOM.header.dropdowns.forEach((btn) => {
      btn.nextElementSibling.classList.add("hidden");
    });

    // Toggle this one
    dropdown.classList.toggle("hidden", isOpen);
  });
});

// Close dropdowns when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-dropdown-toggle]")) {
    DOM.header.dropdowns.forEach((btn) => {
      btn.nextElementSibling.classList.add("hidden");
    });
  }
});

const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
const btn = document.getElementById("submit-btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  btn.disabled = true;
  btn.textContent = "Sending...";
  status.classList.add("hidden");

  try {
    const res = await fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
      }),
    });

    if (res.ok) {
      status.textContent = "Message sent! I'll get back to you soon.";
      status.classList.remove("hidden", "text-red-500");
      status.classList.add("text-gray-500");
      form.reset();
    } else if (res.status === 429) {
      status.textContent = "Too many messages. Pl ease try again later.";
      status.classList.remove("hidden", "text-gray-500");
      status.classList.add("text-red-500");
    } else {
      throw new Error("Server error");
    }
  } catch {
    status.textContent = "Something went wrong, please try again.";
    status.classList.remove("hidden", "text-gray-500");
    status.classList.add("text-red-500");
  } finally {
    btn.disabled = false;
    btn.textContent = "Send message";
  }
});
