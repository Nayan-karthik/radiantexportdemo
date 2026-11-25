const form = document.querySelector("#contactForm");
const note = document.querySelector("#formNote");
const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const navLinks = document.querySelectorAll(".site-nav a");
const catalogueLink = document.querySelector(".catalogue-link");
const productMarquee = document.querySelector("[data-carousel]");
const productTrack = productMarquee?.querySelector(".product-track");
const productGroup = productTrack?.querySelector(".product-group");

// Menu toggle functionality
menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

// Close menu when a nav link is clicked
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

catalogueLink?.addEventListener("click", (event) => {
  event.preventDefault();

  const pdfUrl = catalogueLink.href;
  window.open(pdfUrl, "_blank", "noopener");

  const downloadLink = document.createElement("a");
  downloadLink.href = pdfUrl;
  downloadLink.download = "radiant-catalogue.pdf";
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
});

// Immediately reveal hero on load to avoid layout flash
const hero = document.querySelector(".hero");
if (hero) {
  hero.classList.add("is-visible");
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Continuous glitch-free marquee for hero ticker (no CSS animationDuration resets)
const heroTicker = document.querySelector(".hero-ticker");
const tickerTrack = heroTicker?.querySelector(".ticker-track");
const tickerGroup = tickerTrack?.querySelector(".ticker-group");

if (heroTicker && tickerTrack && tickerGroup) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const baseSpeed = 68; // pixels per second
  let targetSpeed = baseSpeed;
  let currentSpeed = baseSpeed;
  let tickerOffset = 0;
  let tickerLoopWidth = 0;
  let lastTime = 0;
  let isHovered = false;
  let scrollBoostTimeout = null;

  const updateTickerWidth = () => {
    tickerLoopWidth = tickerGroup.getBoundingClientRect().width;
  };

  updateTickerWidth();
  window.addEventListener("load", updateTickerWidth);
  window.addEventListener("resize", updateTickerWidth);

  heroTicker.addEventListener("mouseenter", () => {
    isHovered = true;
  });
  heroTicker.addEventListener("mouseleave", () => {
    isHovered = false;
  });

  const animateTicker = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const delta = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    const desired = isHovered ? 0 : baseSpeed;
    currentSpeed += (desired - currentSpeed) * 0.12;

    if (!prefersReducedMotion.matches && tickerLoopWidth > 0) {
      tickerOffset += currentSpeed * delta;
      if (tickerOffset >= tickerLoopWidth) {
        tickerOffset -= tickerLoopWidth;
      }
      tickerTrack.style.transform = `translate3d(${-tickerOffset}px, 0, 0)`;
    }

    window.requestAnimationFrame(animateTicker);
  };

  window.requestAnimationFrame(animateTicker);
}

// Subtle interactive mouse parallax for hero background waves & rings
const heroSection = document.querySelector(".hero");
const heroWaves = heroSection?.querySelector(".hero-waves");
const heroRings = heroSection?.querySelectorAll(".hero-ring");

if (heroSection && (heroWaves || heroRings?.length)) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  heroSection.addEventListener(
    "mousemove",
    (e) => {
      if (prefersReducedMotion.matches) return;
      const rect = heroSection.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (heroWaves) {
        heroWaves.style.transform = `translate3d(${x * -18}px, ${y * -12}px, 0)`;
      }
      heroRings.forEach((ring, idx) => {
        const factor = idx === 0 ? 14 : -12;
        ring.style.marginLeft = `${x * factor}px`;
        ring.style.marginTop = `${y * factor}px`;
      });
    },
    { passive: true }
  );
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(form);

  try {
    note.textContent = "Sending your enquiry...";
    const response = await fetch(form.action, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      note.textContent = "Thank you! Your enquiry has been sent successfully.";
      form.reset();
      setTimeout(() => {
        note.textContent = "";
      }, 5000);
    } else {
      note.textContent = "Error sending enquiry. Please try again.";
    }
  } catch (error) {
    note.textContent = "Error sending enquiry. Please try again.";
    console.error("Form submission error:", error);
  }
});

if (productMarquee && productTrack && productGroup) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pixelsPerSecond = 52;
  let lastFrameTime = 0;
  let animationFrameId = 0;
  let loopWidth = 0;
  let offset = 0;
  let clonedGroup = null;

  const tick = (timestamp) => {
    if (!lastFrameTime) {
      lastFrameTime = timestamp;
    }

    const delta = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (!prefersReducedMotion.matches && loopWidth > 0) {
      offset += (pixelsPerSecond * delta) / 1000;

      if (offset >= loopWidth) {
        offset = 0;
      }

      productTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }

    animationFrameId = window.requestAnimationFrame(tick);
  };

  let lastWindowWidth = window.innerWidth;

  const rebuildProductLoop = (preserveOffset = false) => {
    if (clonedGroup) {
      clonedGroup.remove();
      clonedGroup = null;
    }

    clonedGroup = productGroup.cloneNode(true);
    clonedGroup.setAttribute("aria-hidden", "true");
    productTrack.appendChild(clonedGroup);

    const trackGap = parseFloat(window.getComputedStyle(productTrack).columnGap || window.getComputedStyle(productTrack).gap || "0");
    loopWidth = productGroup.getBoundingClientRect().width + trackGap;
    offset = preserveOffset && loopWidth > 0 ? offset % loopWidth : 0;
    productTrack.style.transform = `translate3d(${-offset}px, 0, 0)`;
    lastFrameTime = 0;
  };

  const startProductLoop = (preserveOffset = false) => {
    rebuildProductLoop(preserveOffset);

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = window.requestAnimationFrame(tick);
  };

  startProductLoop(false);
  window.addEventListener("load", () => startProductLoop(true));
  window.addEventListener("resize", () => {
    if (window.innerWidth !== lastWindowWidth) {
      lastWindowWidth = window.innerWidth;
      startProductLoop(true);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
  });
}
