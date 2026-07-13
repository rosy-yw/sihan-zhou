(() => {
  // year
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // NAV ACTIVE HIGHLIGHT (auto) 
  const navLinks = Array.from(document.querySelectorAll(".nav .nav-top"));
  if (navLinks.length) {
    const normalize = (p) => (p || "").replace(/\/+$/, "");
    const currentPath = normalize(window.location.pathname);
    const currentHash = window.location.hash || "";

    const setActiveByHref = (href) => {
      navLinks.forEach(a => a.classList.remove("active"));
      const target = navLinks.find(a => a.getAttribute("href") === href);
      if (target) target.classList.add("active");
    };

    const setActiveByPathOrHash = () => {
      // Prefer hash match if present and link exists (Home section anchors)
      if (currentHash) {
        const hashHref = `index.html${currentHash}`;
        const pureHashHref = currentHash;
        const hashLink = navLinks.find(a => a.getAttribute("href") === hashHref || a.getAttribute("href") === pureHashHref);
        if (hashLink) {
          navLinks.forEach(a => a.classList.remove("active"));
          hashLink.classList.add("active");
          return;
        }
      }

      // Otherwise match by pathname (multi-page)
      const candidates = [currentPath, normalize(currentPath + "/")];

      const best = navLinks.find(a => {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")) return false;

        const linkPath = normalize(new URL(href, window.location.href).pathname);
        if (candidates.includes(linkPath)) return true;

        // Special case: homepage
        if ((href === "index.html" || href === "./" || href === "/") &&
            (currentPath.endsWith("/index.html") || currentPath === "" || currentPath === "/" || currentPath.endsWith("/sihan.github.io"))) {
          return true;
        }
        return false;
      });

      if (best) {
        navLinks.forEach(a => a.classList.remove("active"));
        best.classList.add("active");
      }
    };

    setActiveByPathOrHash();

    navLinks.forEach(a => {
      a.addEventListener("click", () => {
        const href = a.getAttribute("href") || "";
        if (href) setActiveByHref(href);
      });
    });

    window.addEventListener("hashchange", () => {
      setActiveByPathOrHash();
    });
  }

  const navGroups = Array.from(document.querySelectorAll(".nav-group"));
  navGroups.forEach(group => {
    const toggle = group.querySelector(".nav-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = group.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      navGroups.forEach(other => {
        if (other === group) return;
        other.classList.remove("open");
        other.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
      });
    });
  });

  document.addEventListener("click", () => {
    navGroups.forEach(group => {
      group.classList.remove("open");
      group.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
    });
  });

  // HOME: tone switching by panel 
  const panels = Array.from(document.querySelectorAll(".panel[data-tone]"));
  if (panels.length) {
    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.body.setAttribute("data-tone", visible.target.getAttribute("data-tone"));
    }, { threshold: [0.25, 0.5, 0.75] });

    panels.forEach(p => obs.observe(p));
  }

  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const shell = gallery.closest(".gallery-shell");
    const cards = Array.from(gallery.children);
    const controls = shell?.querySelectorAll("[data-gallery-direction], .gallery-arrow") || [];
    let activeIndex = 0;

    const moveTo = (index) => {
      if (!cards.length) return;
      activeIndex = (index + cards.length) % cards.length;
      const left = cards[activeIndex].offsetLeft - cards[0].offsetLeft;
      gallery.scrollTo({ left, behavior: "smooth" });
    };

    controls.forEach((control) => {
      const direction = Number(control.dataset.galleryDirection)
        || (control.classList.contains("gallery-arrow-left") ? -1 : 1);
      control.addEventListener("click", () => moveTo(activeIndex + direction));
    });

    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") moveTo(activeIndex - 1);
      if (event.key === "ArrowRight") moveTo(activeIndex + 1);
    });

    window.addEventListener("resize", () => moveTo(activeIndex));

    const autoplay = Number(gallery.dataset.autoplay);
    if (autoplay > 0) window.setInterval(() => moveTo(activeIndex + 1), autoplay);
  });
})();
