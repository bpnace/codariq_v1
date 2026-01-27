/**
 * Scroll effects for navigation, parallax, and scroll animations
 * Extracted from Base.astro for better maintainability and testability
 */

/**
 * Initialize IntersectionObserver for scroll animations
 * Observes elements with .animate-on-scroll class
 */
export function initScrollAnimations(): void {
  if ("IntersectionObserver" in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    // Observe all elements with animate-on-scroll class
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      el.classList.add("is-visible");
    });
  }
}

/**
 * Initialize navigation scroll effects
 * Changes nav background when scrolling past hero/article header
 */
export function initNavigationScrollEffects(): void {
  const header = document.querySelector<HTMLElement>("header");
  const heroSection = document.querySelector<HTMLElement>("#hero");
  const footer = document.querySelector<HTMLElement>("footer");
  const articleHeader = document.querySelector<HTMLElement>(".article-header");
  const parallaxImage = document.querySelector<HTMLElement>("[data-parallax]");

  const forceNavSolid = document.body.dataset.forceNavSolid === "true";

  // Force solid nav (e.g., blog pages without hero)
  if (forceNavSolid && header) {
    header.classList.add("nav-scrolled");
    return;
  }

  // Use whichever section exists (hero for homepage, article-header for blog)
  const targetSection = heroSection || articleHeader;

  if (header && targetSection) {
    const safeHeader = header;
    const safeTargetSection = targetSection;
    const safeFooter = footer;
    const safeHeroSection = heroSection;
    const safeParallaxImage = parallaxImage;
    let ticking = false;

    function updateNavColor() {
      const sectionBottom = safeTargetSection.getBoundingClientRect().bottom;

      // Check if we're in the footer area
      let inFooter = false;
      if (safeFooter) {
        const footerTop = safeFooter.getBoundingClientRect().top;
        const headerHeight = safeHeader.offsetHeight;
        // If footer is touching or overlapping with header
        inFooter = footerTop <= headerHeight;
      }

      // Toggle class based on whether we've scrolled past the section AND not in footer
      if (sectionBottom <= 0 && !inFooter) {
        safeHeader.classList.add("nav-scrolled");
      } else {
        safeHeader.classList.remove("nav-scrolled");
      }

      ticking = false;
    }

    function updateParallax() {
      if (safeParallaxImage && safeHeroSection) {
        const scrollY = window.scrollY;
        const heroBottom =
          safeHeroSection.getBoundingClientRect().bottom + scrollY;

        // Only apply parallax while hero section is visible
        if (scrollY < heroBottom) {
          const parallaxOffset = scrollY * 0.25; // 25% = subtle effect
          safeParallaxImage.style.transform = `translateY(${parallaxOffset}px)`;
        }
      }
    }

    // Combined update function
    function updateScrollEffects() {
      updateNavColor();
      updateParallax();
    }

    // Use requestAnimationFrame for smooth performance
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    }

    // Initial check
    updateScrollEffects();

    // Listen to scroll events
    window.addEventListener("scroll", onScroll, { passive: true });
    // Also listen to resize events to update on window size changes
    window.addEventListener("resize", updateScrollEffects);
  }
}

/**
 * Initialize all scroll effects
 * Call this function when the DOM is ready
 */
export function initAllScrollEffects(): void {
  initScrollAnimations();
  initNavigationScrollEffects();
}
