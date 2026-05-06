import { expect, test } from "@playwright/test";

test("home loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Codariq/);
});

test("desktop nav stays on homepage anchors", async ({ page }) => {
  await page.goto("/");
  const nav = page.locator("#main-nav");

  await expect(nav.locator('a[href="/#pain-points"]')).toHaveText("Probleme");
  await expect(nav.locator('a[href="/#process"]')).toHaveText("Prozess");
  await expect(nav.locator('a[href="/#benefits"]')).toHaveText("Pakete");
  await expect(nav.locator('a[href="/#testimonials"]')).toHaveText(
    "Referenzen",
  );
  await expect(nav.locator('a[href="/#final-cta"]').first()).toHaveText(
    "Kontakt",
  );

  await expect(nav.locator('a[href="/ki-agenten-kmu"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/dsgvo-ki-agenten"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/openclaw-agenten"]')).toHaveCount(0);
  await expect(nav.locator('a[href="/faq"]')).toHaveCount(0);
});

test("pain list uses agent reframing", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Wo KI-Agenten im Alltag erleichtern können?",
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Vom Workflow zum kontrollierten Agenten"),
  ).toBeVisible();
});

test("agent connection line links the two framework badges", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.locator("[data-agent-connection-start]")).toHaveText(
    "Sichere Use Cases",
  );
  await expect(page.locator("[data-agent-connection-target]")).toHaveText(
    "Das Delivery Framework",
  );
  await expect(page.locator("[data-agent-connection-target]")).toHaveCSS(
    "background-color",
    "rgb(15, 118, 110)",
  );
  await expect(page.locator("[data-agent-connection-target]")).toHaveCSS(
    "color",
    "rgb(236, 254, 255)",
  );
  await expect(page.locator("#process h2")).toHaveText(
    "So läuft die Zusammenarbeit",
  );
  await expect(
    page.locator("#process h2[data-agent-connection-target]"),
  ).toHaveCount(0);

  const line = page.locator(".agent-connection-path");
  await expect(line).toHaveCount(1);
  await expect(page.locator(".agent-connection-confetti")).toHaveCount(3);
  await expect(page.locator(".trust-cloud__inner")).toHaveCSS("z-index", "2");

  const eyebrowStyles = await page
    .locator(".saas-heading > span, .saas-heading--center > span")
    .evaluateAll((eyebrows) =>
      eyebrows.map((eyebrow) => ({
        background: getComputedStyle(eyebrow).backgroundColor,
        color: getComputedStyle(eyebrow).color,
      })),
    );
  expect(
    eyebrowStyles.every(({ background }) => background === "rgb(15, 118, 110)"),
  ).toBe(true);
  expect(
    eyebrowStyles.every(({ color }) => color === "rgb(236, 254, 255)"),
  ).toBe(true);

  const gradientStops = await page
    .locator("#agent-connection-gradient stop")
    .evaluateAll((stops) =>
      stops.map((stop) => [
        stop.getAttribute("offset"),
        stop.getAttribute("stop-color"),
      ]),
    );
  expect(gradientStops).toEqual([
    ["0%", "#ccfbf1"],
    ["52%", "#2dd4bf"],
    ["100%", "#0f766e"],
  ]);

  const initialDashOffset = await line.evaluate((path) =>
    Number.parseFloat(getComputedStyle(path).strokeDashoffset),
  );
  await page.waitForTimeout(250);
  const pathAnchors = await page.evaluate(async () => {
    const start = document.querySelector("[data-agent-connection-start]");
    const target = document.querySelector("[data-agent-connection-target]");
    const path = document.querySelector(".agent-connection-path");
    if (
      !(start instanceof HTMLElement) ||
      !(target instanceof HTMLElement) ||
      !(path instanceof SVGPathElement)
    ) {
      return null;
    }

    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const svg = path.ownerSVGElement;
    if (!svg) {
      return null;
    }
    const toScreenPoint = (point: DOMPoint): DOMPoint | null => {
      const matrix = path.getScreenCTM();
      if (!matrix) return null;
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = point.x;
      svgPoint.y = point.y;
      return svgPoint.matrixTransform(matrix);
    };

    const startBeforeScroll = start.getBoundingClientRect();
    window.scrollTo(
      0,
      startBeforeScroll.top +
        window.scrollY +
        startBeforeScroll.height / 2 -
        window.innerHeight * 0.76,
    );
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await new Promise((resolve) => window.setTimeout(resolve, 760));

    const startRect = start.getBoundingClientRect();
    const first = toScreenPoint(path.getPointAtLength(0));
    if (!first) {
      return null;
    }

    const targetBeforeScroll = target.getBoundingClientRect();
    window.scrollTo(
      0,
      targetBeforeScroll.top +
        window.scrollY +
        targetBeforeScroll.height / 2 -
        window.innerHeight * 0.72,
    );
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    await new Promise((resolve) => window.setTimeout(resolve, 760));

    const targetRect = target.getBoundingClientRect();
    const last = toScreenPoint(path.getPointAtLength(path.getTotalLength()));
    if (!last) {
      return null;
    }
    const targetEntryY = targetRect.top + targetRect.height * 0.5;

    return {
      firstInsideStart:
        first.x >= startRect.left &&
        first.x <= startRect.right &&
        first.y >= startRect.top &&
        first.y <= startRect.bottom,
      lastInsideTarget:
        last.x >= targetRect.left &&
        last.x <= targetRect.right &&
        last.y >= targetRect.top &&
        last.y <= targetRect.bottom,
      lastInTargetCenterBand:
        last.y >= targetRect.top + targetRect.height * 0.42 &&
        last.y <= targetRect.top + targetRect.height * 0.58,
      targetDeltaX: Math.abs(last.x - (targetRect.left + targetRect.width / 2)),
      targetDeltaY: Math.abs(last.y - targetEntryY),
      lastAboveTargetBottomBy: targetRect.bottom - last.y,
    };
  });
  expect(pathAnchors).not.toBeNull();
  expect(pathAnchors?.firstInsideStart).toBe(true);
  expect(pathAnchors?.lastInsideTarget).toBe(true);
  expect(pathAnchors?.lastInTargetCenterBand).toBe(true);
  expect(pathAnchors?.targetDeltaX).toBeLessThan(1);
  expect(pathAnchors?.targetDeltaY).toBeLessThan(4);
  expect(pathAnchors?.lastAboveTargetBottomBy).toBeGreaterThan(8);

  const lineShape = await line.evaluate((path) => {
    const d = path.getAttribute("d") ?? "";
    const length = path.getTotalLength();
    const beforeEnd = path.getPointAtLength(length * 0.92);
    const end = path.getPointAtLength(length);
    const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    const points = [];

    for (let index = 0; index < numbers.length; index += 2) {
      points.push({ x: numbers[index], y: numbers[index + 1] });
    }

    const anchors = [points[0], points[3], points[6], points[9], points[12]];

    return {
      cubicCount: (d.match(/ C /g) ?? []).length,
      hasHardLine: /\sL\s/.test(d),
      hasSmoothShortcut: /\sS\s/.test(d),
      beforeEndY: beforeEnd.y,
      endY: end.y,
      anchors,
      viewportWidth: window.innerWidth,
    };
  });
  expect(lineShape.cubicCount).toBe(4);
  expect(lineShape.hasHardLine).toBe(false);
  expect(lineShape.hasSmoothShortcut).toBe(false);
  expect(lineShape.beforeEndY).toBeLessThan(lineShape.endY);
  expect(lineShape.anchors[1].x).toBeGreaterThan(lineShape.anchors[0].x);
  expect(lineShape.anchors[2].x).toBeLessThan(lineShape.anchors[1].x);
  expect(lineShape.anchors[2].x).toBeLessThan(lineShape.viewportWidth * 0.3);
  expect(lineShape.anchors[3].x).toBeGreaterThan(lineShape.anchors[2].x);
  expect(lineShape.anchors[3].x).toBeLessThan(lineShape.anchors[1].x);

  const confettiBasePosition = await page.evaluate(() => {
    const target = document.querySelector("[data-agent-connection-target]");
    const particles = Array.from(
      document.querySelectorAll<SVGPathElement>(".agent-connection-confetti"),
    );
    if (
      !(target instanceof HTMLElement) ||
      particles.some((particle) => !(particle instanceof SVGPathElement))
    ) {
      return null;
    }

    const targetRect = target.getBoundingClientRect();
    const particleShapes = particles.map((particle) => {
      const matrix = particle.getScreenCTM();
      const svg = particle.ownerSVGElement;
      if (!matrix || !svg) {
        return null;
      }
      const toScreenPoint = (point: DOMPoint): DOMPoint => {
        const svgPoint = svg.createSVGPoint();
        svgPoint.x = point.x;
        svgPoint.y = point.y;
        return svgPoint.matrixTransform(matrix);
      };
      const length = particle.getTotalLength();
      const startPoint = toScreenPoint(particle.getPointAtLength(0));
      const endPoint = toScreenPoint(particle.getPointAtLength(length));
      return {
        d: particle.getAttribute("d") ?? "",
        length,
        strokeDasharray: getComputedStyle(particle).strokeDasharray,
        strokeDashoffset: getComputedStyle(particle).strokeDashoffset,
        startPoint: { x: startPoint.x, y: startPoint.y },
        endPoint: { x: endPoint.x, y: endPoint.y },
      };
    });
    if (particleShapes.some((shape) => !shape)) {
      return null;
    }
    const safeParticleShapes = particleShapes.filter(
      (shape): shape is NonNullable<typeof shape> => Boolean(shape),
    );

    return {
      particleShapes: safeParticleShapes,
      targetEntryY: targetRect.top + targetRect.height * 0.5,
      targetRect: {
        left: targetRect.left,
        right: targetRect.right,
        top: targetRect.top,
        bottom: targetRect.bottom,
      },
      targetTop: targetRect.top,
    };
  });
  expect(confettiBasePosition).not.toBeNull();
  expect(
    confettiBasePosition?.particleShapes.every(({ d }) =>
      /^M .* Q .* T .*$/.test(d),
    ),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(({ d }) => !/\sC\s/.test(d)),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(
      ({ length }) => Math.abs(length - 48.071) < 0.4,
    ),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(
      ({ strokeDasharray }) =>
        strokeDasharray.startsWith("1px,") || strokeDasharray.startsWith("1,"),
    ),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(
      ({ strokeDashoffset }) => Number.parseFloat(strokeDashoffset) === 0,
    ),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(
      ({ startPoint }) =>
        startPoint.x >= (confettiBasePosition?.targetRect.left ?? 0) &&
        startPoint.x <= (confettiBasePosition?.targetRect.right ?? 0) &&
        startPoint.y >= (confettiBasePosition?.targetRect.top ?? 0) &&
        startPoint.y <= (confettiBasePosition?.targetRect.bottom ?? 0),
    ),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(
      ({ startPoint }) =>
        Math.abs(startPoint.y - (confettiBasePosition?.targetEntryY ?? 0)) < 8,
    ),
  ).toBe(true);
  expect(
    confettiBasePosition?.particleShapes.every(
      ({ endPoint }) => endPoint.y < (confettiBasePosition?.targetTop ?? 0) - 8,
    ),
  ).toBe(true);

  const tipPositions = await page.evaluate(async () => {
    const start = document.querySelector("[data-agent-connection-start]");
    const target = document.querySelector("[data-agent-connection-target]");
    const path = document.querySelector(".agent-connection-path");
    if (
      !(start instanceof HTMLElement) ||
      !(target instanceof HTMLElement) ||
      !(path instanceof SVGPathElement)
    ) {
      return null;
    }

    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const viewportHeight = window.innerHeight;
    const length = path.getTotalLength();
    const startRect = start.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const startScroll =
      startRect.top +
      window.scrollY +
      startRect.height / 2 -
      viewportHeight * 0.76;
    const endScroll =
      targetRect.top +
      window.scrollY +
      targetRect.height / 2 -
      viewportHeight * 0.72;
    const scrollRange = endScroll - startScroll;
    const samples: Array<{
      rawProgress: number;
      drawProgress: number;
      viewportY: number;
    }> = [];

    for (const rawProgress of [0.08, 0.42, 0.72, 0.88]) {
      window.scrollTo(0, startScroll + scrollRange * rawProgress);
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
      const dashOffset = Number.parseFloat(
        getComputedStyle(path).strokeDashoffset,
      );
      const drawProgress = 1 - dashOffset / length;
      const tip = path.getPointAtLength(length * drawProgress);
      samples.push({
        rawProgress,
        drawProgress,
        viewportY: tip.y - window.scrollY,
      });
    }

    return { samples, viewportHeight };
  });
  expect(tipPositions).not.toBeNull();
  expect(
    tipPositions?.samples.every(
      ({ viewportY }) =>
        viewportY > tipPositions.viewportHeight * 0.44 &&
        viewportY < tipPositions.viewportHeight,
    ),
  ).toBe(true);
  expect(tipPositions?.samples[0].drawProgress).toBeGreaterThan(0.16);
  expect(tipPositions?.samples[2].drawProgress).toBeLessThan(0.75);

  await page.evaluate(() => {
    const target = document.querySelector("[data-agent-connection-target]");
    if (!(target instanceof HTMLElement)) return;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.scrollBehavior = "auto";
    const targetTop = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(
      0,
      targetTop + target.offsetHeight / 2 - window.innerHeight * 0.72,
    );
  });
  await expect
    .poll(
      () =>
        page
          .locator(".agent-connection-confetti")
          .evaluateAll(
            (particles) =>
              particles.filter(
                (particle) =>
                  Number.parseFloat(getComputedStyle(particle).opacity) > 0.25,
              ).length,
          ),
      { timeout: 800 },
    )
    .toBe(3);
  await page.waitForTimeout(120);

  const visibleConfettiPosition = await page.evaluate(() => {
    const target = document.querySelector("[data-agent-connection-target]");
    if (!(target instanceof HTMLElement)) return null;

    const targetRect = target.getBoundingClientRect();
    const targetTop = targetRect.top;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const visibleParticles = Array.from(
      document.querySelectorAll<SVGPathElement>(".agent-connection-confetti"),
    )
      .map((particle) => ({
        opacity: Number.parseFloat(getComputedStyle(particle).opacity),
        strokeWidth: Number.parseFloat(getComputedStyle(particle).strokeWidth),
        dashOffset: Number.parseFloat(
          getComputedStyle(particle).strokeDashoffset,
        ),
        dashArray: getComputedStyle(particle).strokeDasharray,
        length: particle.getTotalLength(),
        rect: particle.getBoundingClientRect(),
      }))
      .filter(({ opacity, strokeWidth }) => opacity > 0.25 && strokeWidth > 1);
    const sideGap = 10;

    return {
      visibleCount: visibleParticles.length,
      allStrokeWidthNearLavandai: visibleParticles.every(
        ({ strokeWidth }) => strokeWidth > 2.8 && strokeWidth <= 3.2,
      ),
      allDrawingForward: visibleParticles.every(
        ({ dashArray, dashOffset }) =>
          Number.parseFloat(dashArray) > 5 && dashOffset < -3,
      ),
      allEmergingFromButton: visibleParticles.every(
        ({ rect }) => rect.bottom > targetTop,
      ),
      allReachAboveButton: visibleParticles.every(
        ({ rect }) => rect.top < targetTop - 8,
      ),
      noMainLineTouch: visibleParticles.every(
        ({ rect }) =>
          rect.right < targetCenterX - sideGap ||
          rect.left > targetCenterX + sideGap,
      ),
      leftCount: visibleParticles.filter(
        ({ rect }) => rect.right < targetCenterX - sideGap,
      ).length,
      rightCount: visibleParticles.filter(
        ({ rect }) => rect.left > targetCenterX + sideGap,
      ).length,
      minSideGap: visibleParticles.length
        ? Math.min(
            ...visibleParticles.map(({ rect }) =>
              rect.right < targetCenterX
                ? targetCenterX - rect.right
                : rect.left - targetCenterX,
            ),
          )
        : null,
    };
  });
  expect(visibleConfettiPosition).not.toBeNull();
  expect(visibleConfettiPosition?.visibleCount).toBe(3);
  expect(visibleConfettiPosition?.allStrokeWidthNearLavandai).toBe(true);
  expect(visibleConfettiPosition?.allDrawingForward).toBe(true);
  expect(visibleConfettiPosition?.allEmergingFromButton).toBe(true);
  expect(visibleConfettiPosition?.allReachAboveButton).toBe(true);
  expect(visibleConfettiPosition?.noMainLineTouch).toBe(true);
  expect(visibleConfettiPosition?.leftCount).toBe(1);
  expect(visibleConfettiPosition?.rightCount).toBe(2);
  expect(visibleConfettiPosition?.minSideGap).toBeGreaterThan(10);

  await page.waitForTimeout(720);

  const scrolledDashOffset = await line.evaluate((path) =>
    Number.parseFloat(getComputedStyle(path).strokeDashoffset),
  );
  expect(scrolledDashOffset).toBeLessThan(initialDashOffset * 0.02);

  const arrivalState = await page
    .locator("[data-agent-connection-target]")
    .evaluate((target) => {
      const rect = target.getBoundingClientRect();
      const confetti = Array.from(
        document.querySelectorAll<SVGPathElement>(".agent-connection-confetti"),
      );
      return {
        centerY: rect.top + rect.height / 2,
        viewportHeight: window.innerHeight,
        hiddenConfetti: confetti.every(
          (particle) =>
            Number.parseFloat(getComputedStyle(particle).opacity) < 0.08 &&
            Number.parseFloat(getComputedStyle(particle).strokeWidth) < 0.1,
        ),
      };
    });
  expect(arrivalState.centerY).toBeGreaterThan(
    arrivalState.viewportHeight * 0.5,
  );
  expect(arrivalState.hiddenConfetti).toBe(true);
});
