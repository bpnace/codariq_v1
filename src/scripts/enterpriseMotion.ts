import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

const PANEL_BASE_ROTATION_X = -2;
const PANEL_BASE_ROTATION_Y = -5;
const PANEL_MAX_ROTATION_X = 4.5;
const PANEL_MAX_ROTATION_Y = 6.5;
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const CONFETTI_EFFECT_SIZE = 112;
const CONFETTI_STROKE_WIDTH = 3.2;
const CONFETTI_DURATION = 0.6;
const CLICK_WAVY_EFFECT_SIZE = 100;
const CLICK_WAVY_STROKE_WIDTH = 3;
const CLICK_WAVY_DURATION = 0.6;
const CLICK_WAVY_COLOR = "#0f766e";
const HERO_INITIAL_UPDATE_HOLD = 4.75;
const HERO_REPEATING_UPDATE_HOLD = 2.25;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getRandomRevealOrder = <T>(items: T[]): T[] => {
  const shuffled = gsap.utils.shuffle(items.slice());
  const isDomOrder = shuffled.every((item, index) => item === items[index]);

  if (shuffled.length > 1 && isDomOrder) {
    const first = shuffled.shift();
    if (first !== undefined) shuffled.push(first);
  }

  return shuffled;
};

type ConnectionPoint = {
  x: number;
  y: number;
};

type ConnectionParticle = {
  path: SVGPathElement;
  angle: number;
  offsetX: number;
  offsetY: number;
  length: number;
};

type ClickWavyEffect = {
  svg: SVGSVGElement;
  timeline: gsap.core.Timeline;
};

type HeroPipelineItem = {
  value: string;
  state: string;
};

type HeroAlertState = {
  label: string;
  title: string;
  copy: string;
};

type HeroConsoleState = {
  clock: string;
  savedTime: string;
  pipeline: HeroPipelineItem[];
  liveSource: string;
  liveCopy: string;
  alert?: HeroAlertState;
};

const HERO_CONSOLE_STATES: HeroConsoleState[] = [
  {
    clock: "08:15 Uhr",
    savedTime: "4,6 Std.",
    pipeline: [
      { value: "23 E-Mails sortiert", state: "ohne Rückfrage" },
      { value: "5 Antworten als Entwurf", state: "prüfbereit" },
      { value: "2 Entscheidungen offen", state: "Chef-Fokus" },
    ],
    liveSource: "Posteingang",
    liveCopy: "Anfragen erkannt und priorisiert",
  },
  {
    clock: "08:16 Uhr",
    savedTime: "5,1 Std.",
    pipeline: [
      { value: "31 E-Mails sortiert", state: "gebündelt" },
      { value: "7 Antworten als Entwurf", state: "Ton geprüft" },
      { value: "3 Entscheidungen offen", state: "Freigabe nötig" },
    ],
    liveSource: "CRM",
    liveCopy: "Lead-Kontext ergänzt",
    alert: {
      label: "Freigabe nötig",
      title: "Rabatt-Anfrage prüfen",
      copy: "Agent stoppt vor dem Versand und wartet auf deine Entscheidung.",
    },
  },
  {
    clock: "08:17 Uhr",
    savedTime: "5,4 Std.",
    pipeline: [
      { value: "42 E-Mails sortiert", state: "priorisiert" },
      { value: "9 Antworten als Entwurf", state: "prüfbereit" },
      { value: "1 Entscheidung offen", state: "Chef-Fokus" },
    ],
    liveSource: "Support",
    liveCopy: "Antwort mit Verlauf vorbereitet",
  },
];

const formatPoint = ({ x, y }: ConnectionPoint): string =>
  `${x.toFixed(1)} ${y.toFixed(1)}`;

const getMainTop = (main: HTMLElement): number =>
  main.getBoundingClientRect().top + window.scrollY;

const getTransformOffset = (element: HTMLElement): ConnectionPoint => {
  const offset: ConnectionPoint = { x: 0, y: 0 };
  let current: HTMLElement | null = element;

  while (current) {
    const transform = getComputedStyle(current).transform;

    if (transform && transform !== "none") {
      const matrix = new DOMMatrixReadOnly(transform);
      offset.x += matrix.m41;
      offset.y += matrix.m42;
    }

    if (current.id === "main-content") {
      break;
    }

    current = current.parentElement;
  }

  return offset;
};

const getPoint = (
  element: HTMLElement,
  mainTop: number,
  xRatio = 0.5,
  yRatio = 0.5,
): ConnectionPoint => {
  const rect = element.getBoundingClientRect();
  const transform = getTransformOffset(element);

  return {
    x: rect.left + window.scrollX - transform.x + rect.width * xRatio,
    y: rect.top + window.scrollY - mainTop - transform.y + rect.height * yRatio,
  };
};

const createSvgPath = (className: string): SVGPathElement => {
  const path = document.createElementNS(SVG_NAMESPACE, "path");
  path.setAttribute("class", className);
  return path;
};

const getWavyClickPathData = (angle: number): string => {
  const center = CLICK_WAVY_EFFECT_SIZE * 0.5;
  const startRadius = CLICK_WAVY_EFFECT_SIZE * 0.1;
  const midRadius = CLICK_WAVY_EFFECT_SIZE * 0.3;
  const endRadius = CLICK_WAVY_EFFECT_SIZE * 0.5;
  const curveOffset = CLICK_WAVY_EFFECT_SIZE * 0.05;
  const radians = (angle * Math.PI) / 180;
  const pointAtRadius = (radius: number): ConnectionPoint => ({
    x: center + radius * Math.cos(radians),
    y: center - radius * Math.sin(radians),
  });
  const start = pointAtRadius(startRadius);
  const mid = pointAtRadius(midRadius);
  const end = pointAtRadius(endRadius);
  const control = {
    x: mid.x + curveOffset * Math.cos(radians + Math.PI / 2),
    y: mid.y - curveOffset * Math.sin(radians + Math.PI / 2),
  };

  return `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${mid.x} ${mid.y} T ${end.x} ${end.y}`;
};

const shapeConnectionProgress = (progress: number): number => {
  const safeProgress = clamp(progress, 0, 1);

  if (safeProgress < 0.28) {
    const local = safeProgress / 0.28;
    return (1 - Math.pow(1 - local, 3)) * 0.4;
  }

  if (safeProgress < 0.66) {
    const local = (safeProgress - 0.28) / 0.38;
    return 0.4 + ((1 - Math.cos(Math.PI * local)) / 2) * 0.26;
  }

  const local = (safeProgress - 0.66) / 0.34;
  return 0.66 + Math.pow(local, 0.82) * 0.34;
};

function initAgentConnectionMotion(): (() => void) | null {
  const main = document.querySelector<HTMLElement>("#main-content");
  const startEl = document.querySelector<HTMLElement>(
    "[data-agent-connection-start]",
  );
  const targetEl = document.querySelector<HTMLElement>(
    "[data-agent-connection-target]",
  );

  if (!main || !startEl || !targetEl) {
    return null;
  }

  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  const defs = document.createElementNS(SVG_NAMESPACE, "defs");
  const gradient = document.createElementNS(SVG_NAMESPACE, "linearGradient");
  const drawPath = createSvgPath("agent-connection-path");
  const particleSeeds = [
    {
      angle: 135,
      offsetX: -20,
      offsetY: 2,
    },
    {
      angle: 45,
      offsetX: 20,
      offsetY: 2,
    },
    {
      angle: 90,
      offsetX: 40,
      offsetY: 3,
    },
  ];
  const particles: ConnectionParticle[] = particleSeeds.map((seed) => ({
    ...seed,
    path: createSvgPath("agent-connection-confetti"),
    length: 1,
  }));
  let pathLength = 1;
  let activeProgress = 0;
  let confettiPlayed = false;
  let particleTweens: gsap.core.Animation[] = [];

  svg.setAttribute("class", "agent-connection-layer");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  gradient.setAttribute("id", "agent-connection-gradient");
  gradient.setAttribute("gradientUnits", "userSpaceOnUse");
  [
    { offset: "0%", color: "#ccfbf1" },
    { offset: "52%", color: "#2dd4bf" },
    { offset: "100%", color: "#0f766e" },
  ].forEach(({ offset, color }) => {
    const stop = document.createElementNS(SVG_NAMESPACE, "stop");
    stop.setAttribute("offset", offset);
    stop.setAttribute("stop-color", color);
    gradient.append(stop);
  });
  defs.append(gradient);
  drawPath.setAttribute("stroke", "url(#agent-connection-gradient)");
  svg.append(defs, drawPath, ...particles.map(({ path }) => path));
  main.prepend(svg);

  const resetParticle = (particle: ConnectionParticle): void => {
    gsap.set(particle.path, {
      opacity: 0,
      strokeDasharray: `1, ${particle.length}`,
      strokeDashoffset: 0,
      strokeWidth: 0,
    });
  };

  const hideParticles = (): void => {
    particleTweens.forEach((tween) => tween.kill());
    particleTweens = [];
    particles.forEach(resetParticle);
  };

  const playConfetti = (): void => {
    hideParticles();
    particleTweens = particles.map((particle) => {
      gsap.set(particle.path, {
        opacity: 1,
        strokeDasharray: `1, ${particle.length}`,
        strokeDashoffset: 0,
        strokeWidth: CONFETTI_STROKE_WIDTH,
      });

      return gsap
        .timeline()
        .to(particle.path, {
          strokeDasharray: `${particle.length}, ${particle.length}`,
          strokeDashoffset: -particle.length,
          duration: CONFETTI_DURATION,
          ease: "power1.out",
        })
        .to(
          particle.path,
          {
            strokeWidth: 0,
            duration: CONFETTI_DURATION * 0.4,
            ease: "linear",
          },
          CONFETTI_DURATION * 0.6,
        )
        .set(particle.path, {
          opacity: 0,
          strokeDasharray: `1, ${particle.length}`,
          strokeDashoffset: 0,
          strokeWidth: 0,
        });
    });
  };

  const updatePath = (): void => {
    const width = Math.ceil(
      Math.max(main.clientWidth, document.documentElement.clientWidth),
    );
    const mainTop = getMainTop(main);
    const start = getPoint(startEl, mainTop, 0.5, 0.55);
    const target = getPoint(targetEl, mainTop, 0.5, 0.5);
    const targetTop = getPoint(targetEl, mainTop, 0.5, 0);
    const confettiOrigin = target;
    const height = Math.ceil(
      Math.max(main.scrollHeight, targetTop.y + 220, window.innerHeight),
    );
    const pathDrop = Math.max(target.y - start.y, 680);
    const horizontalReach = clamp(width * 0.2, 150, 310);
    const firstSwerve = {
      x: clamp(target.x + horizontalReach, width * 0.2, width * 0.84),
      y: start.y + pathDrop * 0.23,
    };
    const secondSwerve = {
      x: clamp(target.x - horizontalReach * 1.45, width * 0.1, width * 0.52),
      y: start.y + pathDrop * 0.48,
    };
    const thirdSwerve = {
      x: clamp(target.x + horizontalReach * 0.26, width * 0.24, width * 0.74),
      y: start.y + pathDrop * 0.69,
    };
    const finalDrop = Math.min(180, pathDrop * 0.22);

    const pathData =
      `M ${formatPoint(start)} ` +
      `C ${formatPoint({ x: start.x + (firstSwerve.x - start.x) * 0.58, y: start.y + pathDrop * 0.07 })} ` +
      `${formatPoint({ x: firstSwerve.x + horizontalReach * 0.08, y: firstSwerve.y - pathDrop * 0.15 })} ` +
      `${formatPoint(firstSwerve)} ` +
      `C ${formatPoint({ x: firstSwerve.x - horizontalReach * 0.08, y: firstSwerve.y + pathDrop * 0.15 })} ` +
      `${formatPoint({ x: secondSwerve.x + horizontalReach * 0.12, y: secondSwerve.y - pathDrop * 0.15 })} ` +
      `${formatPoint(secondSwerve)} ` +
      `C ${formatPoint({ x: secondSwerve.x - horizontalReach * 0.05, y: secondSwerve.y + pathDrop * 0.16 })} ` +
      `${formatPoint({ x: thirdSwerve.x - horizontalReach * 0.12, y: thirdSwerve.y - pathDrop * 0.14 })} ` +
      `${formatPoint(thirdSwerve)} ` +
      `C ${formatPoint({ x: thirdSwerve.x + horizontalReach * 0.08, y: thirdSwerve.y + pathDrop * 0.13 })} ` +
      `${formatPoint({ x: target.x - horizontalReach * 0.08, y: target.y - finalDrop })} ` +
      `${formatPoint(target)}`;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.style.setProperty("--agent-connection-height", `${height}px`);
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y1", String(start.y));
    gradient.setAttribute("y2", String(target.y));
    drawPath.setAttribute("d", pathData);
    pathLength = Math.max(drawPath.getTotalLength(), 1);
    drawPath.style.strokeDasharray = `${pathLength}`;

    particles.forEach((particle) => {
      const radians = (particle.angle * Math.PI) / 180;
      const startRadius = CONFETTI_EFFECT_SIZE * 0.1;
      const endRadius = CONFETTI_EFFECT_SIZE * 0.5;
      const curveOffset = CONFETTI_EFFECT_SIZE * 0.05;
      const startPoint: ConnectionPoint = {
        x: confettiOrigin.x + particle.offsetX,
        y: confettiOrigin.y + particle.offsetY,
      };
      const endPoint: ConnectionPoint = {
        x: startPoint.x + (endRadius - startRadius) * Math.cos(radians),
        y: startPoint.y - (endRadius - startRadius) * Math.sin(radians),
      };
      const midPoint: ConnectionPoint = {
        x: (startPoint.x + endPoint.x) / 2,
        y: (startPoint.y + endPoint.y) / 2,
      };
      const controlPoint: ConnectionPoint = {
        x: midPoint.x + curveOffset * Math.cos(radians + Math.PI / 2),
        y: midPoint.y - curveOffset * Math.sin(radians + Math.PI / 2),
      };

      particle.path.setAttribute(
        "d",
        `M ${formatPoint(startPoint)} ` +
          `Q ${formatPoint(controlPoint)} ` +
          `${formatPoint(midPoint)} ` +
          `T ${formatPoint(endPoint)}`,
      );
      particle.length = Math.max(particle.path.getTotalLength(), 1);
      particle.path.style.strokeDasharray = `1, ${particle.length}`;
      particle.path.style.strokeDashoffset = "0";
    });

    confettiPlayed = false;
    hideParticles();
    renderProgress(activeProgress);
  };

  function renderProgress(progress: number): void {
    activeProgress = clamp(progress, 0, 1);
    const drawProgress = shapeConnectionProgress(activeProgress);
    drawPath.style.strokeDashoffset = `${pathLength * (1 - drawProgress)}`;

    if (drawProgress >= 0.995 && !confettiPlayed) {
      confettiPlayed = true;
      playConfetti();
    } else if (drawProgress < 0.97 && confettiPlayed) {
      confettiPlayed = false;
      hideParticles();
    }
  }

  updatePath();

  const trigger = ScrollTrigger.create({
    trigger: startEl,
    start: "center 76%",
    endTrigger: targetEl,
    end: "center 76%",
    invalidateOnRefresh: true,
    onUpdate: (self) => renderProgress(self.progress),
    onRefresh: (self) => {
      updatePath();
      renderProgress(self.progress);
    },
  });

  const handleResize = (): void => {
    ScrollTrigger.refresh();
  };

  const refreshAfterLayout = (): void => {
    ScrollTrigger.refresh();
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("load", refreshAfterLayout, { once: true });
  requestAnimationFrame(() => {
    requestAnimationFrame(refreshAfterLayout);
  });
  document.fonts?.ready.then(refreshAfterLayout).catch(() => {
    // Font loading status is non-critical; resize/load refreshes still cover layout.
  });

  return () => {
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("load", refreshAfterLayout);
    hideParticles();
    trigger.kill();
    svg.remove();
  };
}

function initClickWavyEffect(): () => void {
  const effects: ClickWavyEffect[] = [];
  const angles = [45, 90, 135, 180];

  const removeEffect = (effect: ClickWavyEffect): void => {
    effect.timeline.kill();
    effect.svg.remove();
    const index = effects.indexOf(effect);
    if (index !== -1) {
      effects.splice(index, 1);
    }
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const svg = document.createElementNS(SVG_NAMESPACE, "svg");
    const x = event.clientX + window.scrollX - CLICK_WAVY_EFFECT_SIZE / 2;
    const y = event.clientY + window.scrollY - CLICK_WAVY_EFFECT_SIZE / 2;

    svg.setAttribute("class", "codariq-click-wavy-effect");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.left = `${x}px`;
    svg.style.top = `${y}px`;

    const paths = angles.map((angle) => {
      const path = createSvgPath("codariq-click-wavy-stroke");
      path.setAttribute("d", getWavyClickPathData(angle));
      path.setAttribute("stroke", CLICK_WAVY_COLOR);
      path.setAttribute("stroke-width", String(CLICK_WAVY_STROKE_WIDTH));
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("fill", "none");
      svg.append(path);
      return path;
    });

    document.body.append(svg);

    let effect: ClickWavyEffect | null = null;
    const timeline = gsap.timeline({
      onComplete: () => {
        if (effect) {
          removeEffect(effect);
        }
      },
    });
    effect = { svg, timeline };
    effects.push(effect);

    paths.forEach((path) => {
      const length = Math.max(path.getTotalLength(), 1);

      gsap.set(path, {
        opacity: 1,
        strokeDasharray: `1, ${length}`,
        strokeDashoffset: 0,
        strokeWidth: CLICK_WAVY_STROKE_WIDTH,
      });

      timeline
        .to(
          path,
          {
            strokeDasharray: `${length}, ${length}`,
            strokeDashoffset: -length,
            duration: CLICK_WAVY_DURATION,
            ease: "power1.out",
          },
          0,
        )
        .to(
          path,
          {
            strokeWidth: 0,
            duration: CLICK_WAVY_DURATION * 0.4,
            ease: "linear",
          },
          CLICK_WAVY_DURATION * 0.6,
        );
    });
  };

  document.addEventListener("pointerdown", handlePointerDown, {
    capture: true,
  });

  return () => {
    document.removeEventListener("pointerdown", handlePointerDown, {
      capture: true,
    });
    effects.splice(0).forEach(removeEffect);
  };
}

function initDeliveryFrameworkReveal(): void {
  const shell = document.querySelector<HTMLElement>(
    "[data-delivery-framework]",
  );
  if (!shell) return;

  const cards = Array.from(
    shell.querySelectorAll<HTMLElement>("[data-delivery-card]"),
  );
  if (!cards.length) return;

  gsap.set(cards, {
    autoAlpha: 0,
    filter: "blur(18px)",
    y: 56,
    force3D: true,
  });

  gsap.to(cards, {
    autoAlpha: 1,
    filter: "blur(0px)",
    y: 0,
    duration: 0.84,
    stagger: 0.24,
    ease: "power4.out",
    scrollTrigger: {
      trigger: shell,
      start: "top 76%",
      once: true,
    },
  });
}

function initTestimonialReveal(): void {
  const grid = document.querySelector<HTMLElement>("[data-testimonial-reveal]");
  if (!grid) return;

  const cards = Array.from(
    grid.querySelectorAll<HTMLElement>("[data-testimonial-card]"),
  );
  if (!cards.length) return;

  const revealCards = getRandomRevealOrder(cards);
  revealCards.forEach((card, revealOrder) => {
    card.dataset.testimonialRevealOrder = String(revealOrder);
  });

  gsap.set(cards, {
    autoAlpha: 0,
    filter: "blur(18px)",
    y: 48,
    scale: 0.985,
    force3D: true,
  });

  gsap.to(revealCards, {
    autoAlpha: 1,
    filter: "blur(0px)",
    y: 0,
    scale: 1,
    duration: 0.78,
    stagger: 0.09,
    ease: "power4.out",
    overwrite: "auto",
    scrollTrigger: {
      trigger: grid,
      start: "top 76%",
      once: true,
    },
  });
}

function initHeroConsoleLiveMotion(): gsap.core.Timeline | null {
  const consoleEl = document.querySelector<HTMLElement>(
    "[data-hero-agent-console]",
  );
  if (!consoleEl) return null;

  const clockEl = consoleEl.querySelector<HTMLElement>("[data-hero-clock]");
  const savedTimeEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-saved-time]",
  );
  const statusEl = consoleEl.querySelector<HTMLElement>(
    ".secure-console__status",
  );
  const alertEl = consoleEl.querySelector<HTMLElement>("[data-hero-alert]");
  const alertLabelEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-alert-label]",
  );
  const alertTitleEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-alert-title]",
  );
  const alertCopyEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-alert-copy]",
  );
  const liveRowEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-live-row]",
  );
  const liveSourceEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-live-source]",
  );
  const liveCopyEl = consoleEl.querySelector<HTMLElement>(
    "[data-hero-live-copy]",
  );
  const pipelineCards = Array.from(
    consoleEl.querySelectorAll<HTMLElement>("[data-hero-pipeline-card]"),
  );
  const pipelineValueEls = Array.from(
    consoleEl.querySelectorAll<HTMLElement>("[data-hero-pipeline-value]"),
  );
  const pipelineStateEls = Array.from(
    consoleEl.querySelectorAll<HTMLElement>("[data-hero-pipeline-state]"),
  );

  if (
    !clockEl ||
    !savedTimeEl ||
    !statusEl ||
    !alertEl ||
    !alertLabelEl ||
    !alertTitleEl ||
    !alertCopyEl ||
    !liveRowEl ||
    !liveSourceEl ||
    !liveCopyEl ||
    pipelineCards.length !== HERO_CONSOLE_STATES[0].pipeline.length ||
    pipelineValueEls.length !== HERO_CONSOLE_STATES[0].pipeline.length ||
    pipelineStateEls.length !== HERO_CONSOLE_STATES[0].pipeline.length
  ) {
    return null;
  }

  const statusNumberTargets = [clockEl, savedTimeEl];
  const liveTargets = [liveSourceEl, liveCopyEl];
  const pipelineTargetGroups = pipelineValueEls.map((valueEl, index) => ({
    valueEl,
    stateEl: pipelineStateEls[index]!,
  }));
  const initialTextTargets = [
    ...statusNumberTargets,
    ...pipelineValueEls,
    ...pipelineStateEls,
    ...liveTargets,
  ];

  const setAlertVisibility = (visible: boolean): void => {
    alertEl.setAttribute("aria-hidden", visible ? "false" : "true");
  };

  const applyStatusState = (state: HeroConsoleState): void => {
    clockEl.textContent = state.clock;
    savedTimeEl.textContent = state.savedTime;
  };

  const applyLiveState = (state: HeroConsoleState): void => {
    liveSourceEl.textContent = state.liveSource;
    liveCopyEl.textContent = state.liveCopy;
  };

  const applyPipelineItem = (state: HeroConsoleState, index: number): void => {
    const item = state.pipeline[index];
    const valueEl = pipelineValueEls[index];
    const stateEl = pipelineStateEls[index];

    if (!item) return;
    valueEl.textContent = item.value;
    stateEl.textContent = item.state;
  };

  const applyState = (state: HeroConsoleState): void => {
    applyStatusState(state);
    applyLiveState(state);
    state.pipeline.forEach((_, index) => {
      applyPipelineItem(state, index);
    });
  };

  const applyAlert = (alert: HeroAlertState): void => {
    alertLabelEl.textContent = alert.label;
    alertTitleEl.textContent = alert.title;
    alertCopyEl.textContent = alert.copy;
    setAlertVisibility(true);
  };

  const hideAlert = (): void => {
    setAlertVisibility(false);
  };

  applyState(HERO_CONSOLE_STATES[0]);
  hideAlert();

  gsap.set(initialTextTargets, {
    autoAlpha: 1,
    rotationX: 0,
    y: 0,
  });

  gsap.set(alertEl, {
    autoAlpha: 0,
    y: 12,
    scale: 0.96,
    transformOrigin: "88% 0%",
  });

  const timeline = gsap.timeline({
    repeat: -1,
    repeatDelay: 0.8,
    defaults: { ease: "power3.out" },
  });
  const queueTextUpdate = (
    targets: HTMLElement[],
    applyText: () => void,
    position: string,
  ): void => {
    timeline
      .to(
        targets,
        {
          autoAlpha: 0,
          y: -5,
          duration: 0.16,
          stagger: 0.035,
          ease: "power2.in",
        },
        position,
      )
      .call(applyText, undefined, `${position}+=0.14`)
      .fromTo(
        targets,
        { autoAlpha: 0, y: 7 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.04,
          ease: "power4.out",
          immediateRender: false,
        },
        `${position}+=0.17`,
      );
  };

  const queueNumberFlipUpdate = (
    targets: HTMLElement[],
    applyText: () => void,
    position: string,
  ): void => {
    timeline
      .to(
        targets,
        {
          autoAlpha: 0,
          rotationX: -78,
          y: 5,
          duration: 0.22,
          stagger: 0.075,
          ease: "power2.in",
          transformOrigin: "50% 100%",
          transformPerspective: 700,
        },
        position,
      )
      .call(applyText, undefined, `${position}+=0.29`)
      .fromTo(
        targets,
        {
          autoAlpha: 0,
          rotationX: 76,
          y: -5,
          transformOrigin: "50% 0%",
          transformPerspective: 700,
        },
        {
          autoAlpha: 1,
          rotationX: 0,
          y: 0,
          duration: 0.34,
          stagger: 0.075,
          ease: "back.out(1.15)",
          immediateRender: false,
        },
        `${position}+=0.31`,
      );
  };

  const queuePipelineItemUpdate = (
    valueEl: HTMLElement,
    stateEl: HTMLElement,
    applyText: () => void,
    position: string,
  ): void => {
    timeline
      .to(
        valueEl,
        {
          autoAlpha: 0,
          rotationX: -78,
          y: 5,
          duration: 0.22,
          ease: "power2.in",
          transformOrigin: "50% 100%",
          transformPerspective: 700,
        },
        position,
      )
      .to(
        stateEl,
        {
          autoAlpha: 0,
          y: -4,
          duration: 0.16,
          ease: "power2.in",
        },
        `${position}+=0.04`,
      )
      .call(applyText, undefined, `${position}+=0.26`)
      .fromTo(
        valueEl,
        {
          autoAlpha: 0,
          rotationX: 76,
          y: -5,
          transformOrigin: "50% 0%",
          transformPerspective: 700,
        },
        {
          autoAlpha: 1,
          rotationX: 0,
          y: 0,
          duration: 0.34,
          ease: "back.out(1.15)",
          immediateRender: false,
        },
        `${position}+=0.28`,
      )
      .fromTo(
        stateEl,
        { autoAlpha: 0, y: 7 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          ease: "power4.out",
          immediateRender: false,
        },
        `${position}+=0.34`,
      );
  };
  const cycleStates = [...HERO_CONSOLE_STATES.slice(1), HERO_CONSOLE_STATES[0]];

  cycleStates.forEach((state, stateIndex) => {
    const updateLabel = `hero-console-update-${stateIndex}`;
    timeline.addLabel(
      updateLabel,
      `+=${stateIndex === 0 ? HERO_INITIAL_UPDATE_HOLD : HERO_REPEATING_UPDATE_HOLD}`,
    );

    queueNumberFlipUpdate(
      statusNumberTargets,
      () => {
        applyStatusState(state);
      },
      updateLabel,
    );
    timeline.fromTo(
      statusEl,
      { scale: 0.988 },
      { scale: 1, duration: 0.36, ease: "back.out(1.35)" },
      `${updateLabel}+=0.14`,
    );

    pipelineTargetGroups.forEach(({ valueEl, stateEl }, index) => {
      const cardLabel = `${updateLabel}+=${(0.14 + index * 0.1).toFixed(2)}`;
      queuePipelineItemUpdate(
        valueEl,
        stateEl,
        () => {
          applyPipelineItem(state, index);
        },
        cardLabel,
      );
      timeline.fromTo(
        pipelineCards[index],
        { scale: 0.988 },
        { scale: 1, duration: 0.32, ease: "back.out(1.35)" },
        `${cardLabel}+=0.14`,
      );
    });

    queueTextUpdate(
      liveTargets,
      () => {
        applyLiveState(state);
      },
      `${updateLabel}+=0.5`,
    );
    timeline.fromTo(
      liveRowEl,
      { scale: 0.99 },
      { scale: 1, duration: 0.32, ease: "back.out(1.25)" },
      `${updateLabel}+=0.64`,
    );

    if (state.alert) {
      timeline
        .call(
          () => {
            if (state.alert) applyAlert(state.alert);
          },
          undefined,
          `${updateLabel}+=0.72`,
        )
        .fromTo(
          alertEl,
          { autoAlpha: 0, y: 12, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.34,
            ease: "back.out(1.55)",
          },
          `${updateLabel}+=0.72`,
        )
        .to(
          alertEl,
          {
            autoAlpha: 0,
            y: -8,
            scale: 0.985,
            duration: 0.3,
            ease: "power2.in",
            onComplete: hideAlert,
          },
          `${updateLabel}+=2.62`,
        );
    } else {
      timeline.call(hideAlert, undefined, `${updateLabel}+=0.72`);
    }
  });

  return timeline;
}

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

    panelControls.x(x * 10);
    panelControls.y(y * 7);
    panelControls.z(12);
    panelControls.rotationX(PANEL_BASE_ROTATION_X - y * PANEL_MAX_ROTATION_X);
    panelControls.rotationY(PANEL_BASE_ROTATION_Y + x * PANEL_MAX_ROTATION_Y);
    panelControls.scale(1.008);
    panelControls.lightX(58 + x * 42);
    panelControls.lightY(28 + y * 38);
  };

  const handlePointerLeave = (): void => {
    resetConsoleTilt();
  };

  let heroConsoleLiveTimeline: gsap.core.Timeline | null = null;

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
      ".handover-stream p",
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

    heroConsoleLiveTimeline = initHeroConsoleLiveMotion();

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
          ".enterprise-reveal, .enterprise-card:not([data-testimonial-card])",
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

    initDeliveryFrameworkReveal();
    initTestimonialReveal();
  }, document.documentElement);

  const agentConnectionCleanup = initAgentConnectionMotion();
  const clickWavyCleanup = initClickWavyEffect();

  if (consoleEl && window.matchMedia("(pointer: fine)").matches) {
    consoleEl.addEventListener("pointermove", handlePointerMove);
    consoleEl.addEventListener("pointerleave", handlePointerLeave);
  }

  const cleanup = (): void => {
    consoleEl?.removeEventListener("pointermove", handlePointerMove);
    consoleEl?.removeEventListener("pointerleave", handlePointerLeave);
    heroConsoleLiveTimeline?.kill();
    if (consoleEl) gsap.killTweensOf(consoleEl);
    agentConnectionCleanup?.();
    clickWavyCleanup();
    ctx.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    initialized = false;
  };

  window.addEventListener("pagehide", cleanup, { once: true });
}
