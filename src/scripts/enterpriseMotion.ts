import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

export function initEnterpriseMotion(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".secure-hero .enterprise-reveal",
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power4.out",
        clearProps: "transform,opacity,visibility",
      },
    );

    gsap.fromTo(
      ".pipeline-card",
      { autoAlpha: 0, y: 18 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.58,
        delay: 0.28,
        stagger: 0.08,
        ease: "power4.out",
      },
    );

    gsap.fromTo(
      ".audit-stream p",
      { autoAlpha: 0, x: -12 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.46,
        delay: 0.45,
        stagger: 0.09,
        ease: "power4.out",
      },
    );

    gsap.to(".secure-console__ring", {
      rotate: 360,
      duration: 18,
      ease: "none",
      repeat: -1,
    });

    gsap.utils
      .toArray<HTMLElement>(".secure-hero__ambient, .secure-contact__ambient")
      .forEach((el, index) => {
        gsap.to(el, {
          y: index % 2 === 0 ? -46 : 38,
          x: index % 2 === 0 ? 24 : -18,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") ?? document.body,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

    gsap.utils
      .toArray<HTMLElement>("[data-enterprise-section]")
      .forEach((section) => {
        const items = section.querySelectorAll<HTMLElement>(
          ".enterprise-reveal, .enterprise-card",
        );
        if (!items.length || section.id === "hero") return;

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.07,
            ease: "power4.out",
            scrollTrigger: {
              trigger: section,
              start: "top 78%",
              once: true,
            },
          },
        );
      });
  }, document.documentElement);

  const consoleEl = document.querySelector<HTMLElement>(".secure-console");
  const moveX = consoleEl
    ? gsap.quickTo(consoleEl, "x", { duration: 0.65, ease: "power3.out" })
    : null;
  const moveY = consoleEl
    ? gsap.quickTo(consoleEl, "y", { duration: 0.65, ease: "power3.out" })
    : null;

  const handlePointerMove = (event: PointerEvent): void => {
    if (!consoleEl || !moveX || !moveY) return;
    const rect = consoleEl.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    moveX(x * 12);
    moveY(y * 10);
  };

  if (consoleEl && window.matchMedia("(pointer: fine)").matches) {
    consoleEl.addEventListener("pointermove", handlePointerMove);
    consoleEl.addEventListener("pointerleave", () => {
      moveX?.(0);
      moveY?.(0);
    });
  }

  const cleanup = (): void => {
    consoleEl?.removeEventListener("pointermove", handlePointerMove);
    ctx.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    initialized = false;
  };

  window.addEventListener("pagehide", cleanup, { once: true });
}
