import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

const PANEL_BASE_ROTATION_X = -2;
const PANEL_BASE_ROTATION_Y = -5;
const PANEL_MAX_ROTATION_X = 7;
const PANEL_MAX_ROTATION_Y = 10;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export function initEnterpriseMotion(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  const consoleEl = document.querySelector<HTMLElement>(".secure-console");
  const panelControls = consoleEl
    ? {
        x: gsap.quickTo(consoleEl, "x", {
          duration: 0.58,
          ease: "power3.out",
        }),
        y: gsap.quickTo(consoleEl, "y", {
          duration: 0.58,
          ease: "power3.out",
        }),
        z: gsap.quickTo(consoleEl, "z", {
          duration: 0.58,
          ease: "power3.out",
        }),
        rotationX: gsap.quickTo(consoleEl, "rotationX", {
          duration: 0.58,
          ease: "power3.out",
        }),
        rotationY: gsap.quickTo(consoleEl, "rotationY", {
          duration: 0.58,
          ease: "power3.out",
        }),
        scale: gsap.quickTo(consoleEl, "scale", {
          duration: 0.58,
          ease: "power3.out",
        }),
        lightX: gsap.quickTo(consoleEl, "--console-light-x", {
          duration: 0.44,
          ease: "power3.out",
        }),
        lightY: gsap.quickTo(consoleEl, "--console-light-y", {
          duration: 0.44,
          ease: "power3.out",
        }),
      }
    : null;

  const resetConsoleTilt = (): void => {
    if (!panelControls) return;
    panelControls.x(0);
    panelControls.y(0);
    panelControls.z(0);
    panelControls.rotationX(PANEL_BASE_ROTATION_X);
    panelControls.rotationY(PANEL_BASE_ROTATION_Y);
    panelControls.scale(1);
    panelControls.lightX(58);
    panelControls.lightY(28);
  };

  const handlePointerMove = (event: PointerEvent): void => {
    if (!consoleEl || !panelControls) return;
    const rect = consoleEl.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    const y = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

    panelControls.x(x * 14);
    panelControls.y(y * 10);
    panelControls.z(18);
    panelControls.rotationX(PANEL_BASE_ROTATION_X - y * PANEL_MAX_ROTATION_X);
    panelControls.rotationY(PANEL_BASE_ROTATION_Y + x * PANEL_MAX_ROTATION_Y);
    panelControls.scale(1.014);
    panelControls.lightX(58 + x * 42);
    panelControls.lightY(28 + y * 38);
  };

  const handlePointerLeave = (): void => {
    resetConsoleTilt();
  };

  const ctx = gsap.context(() => {
    if (consoleEl) {
      gsap.set(consoleEl, {
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 50%",
        rotationX: PANEL_BASE_ROTATION_X,
        rotationY: PANEL_BASE_ROTATION_Y,
        force3D: true,
      });
    }

    gsap.fromTo(
      ".secure-hero .enterprise-reveal",
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power4.out",
        clearProps: "opacity,visibility",
      },
    );

    if (consoleEl) {
      gsap.fromTo(
        consoleEl,
        { rotationX: -9, rotationY: -16, z: -30 },
        {
          rotationX: PANEL_BASE_ROTATION_X,
          rotationY: PANEL_BASE_ROTATION_Y,
          z: 0,
          duration: 1.15,
          delay: 0.16,
          ease: "expo.out",
          overwrite: "auto",
        },
      );
    }

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

  if (consoleEl && window.matchMedia("(pointer: fine)").matches) {
    consoleEl.addEventListener("pointermove", handlePointerMove);
    consoleEl.addEventListener("pointerleave", handlePointerLeave);
  }

  const cleanup = (): void => {
    consoleEl?.removeEventListener("pointermove", handlePointerMove);
    consoleEl?.removeEventListener("pointerleave", handlePointerLeave);
    if (consoleEl) gsap.killTweensOf(consoleEl);
    ctx.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    initialized = false;
  };

  window.addEventListener("pagehide", cleanup, { once: true });
}
