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

  const rebuildProductLoop = () => {
    if (clonedGroup) {
      clonedGroup.remove();
      clonedGroup = null;
    }

    clonedGroup = productGroup.cloneNode(true);
    clonedGroup.setAttribute("aria-hidden", "true");
    productTrack.appendChild(clonedGroup);

    const trackGap = parseFloat(window.getComputedStyle(productTrack).columnGap || window.getComputedStyle(productTrack).gap || "0");
    loopWidth = productGroup.getBoundingClientRect().width + trackGap;
    offset = 0;
    productTrack.style.transform = "translate3d(0, 0, 0)";
    lastFrameTime = 0;
  };

  const startProductLoop = () => {
    rebuildProductLoop();

    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = window.requestAnimationFrame(tick);
  };

  startProductLoop();
  window.addEventListener("load", startProductLoop);
  window.addEventListener("resize", startProductLoop);

  window.addEventListener("beforeunload", () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId);
    }
  });
}
