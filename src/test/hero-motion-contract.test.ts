import { describe, expect, it } from "vitest";

import {
  HERO_CONSOLE_ALERT_STATE_ID,
  HERO_CONSOLE_DISPLAY_CLOCK,
  HERO_CONSOLE_INITIAL_ALERT,
  HERO_CONSOLE_MOTION_VERSION,
  HERO_CONSOLE_SELECTORS,
  HERO_CONSOLE_STATES,
  HERO_CONSOLE_TIMING,
} from "../lib/heroMotionContract";

describe("hero motion contract", () => {
  it("defines stable unique snapshots and explicit pipeline slots", () => {
    expect(HERO_CONSOLE_MOTION_VERSION).toBe("hero-console-motion:v1");
    expect(HERO_CONSOLE_STATES).toHaveLength(3);

    const ids = HERO_CONSOLE_STATES.map((state) => state.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const state of HERO_CONSOLE_STATES) {
      expect(state.savedTime).toMatch(/Std\./);
      expect(state.pipeline.map((item) => item.slot)).toEqual([
        "inbox",
        "drafts",
        "decisions",
      ]);
      expect(
        state.pipeline.every(
          (item) =>
            item.label.length > 0 &&
            item.value.length > 0 &&
            item.state.length > 0,
        ),
      ).toBe(true);
      expect(state.liveSource).not.toBe("");
      expect(state.liveCopy).not.toBe("");
    }
  });

  it("keeps the hero console clock static", () => {
    expect(HERO_CONSOLE_DISPLAY_CLOCK).toBe("08:35 Uhr");
  });

  it("keeps the initial reading hold longer than the repeated loop", () => {
    expect(HERO_CONSOLE_TIMING.initialUpdateHold).toBeGreaterThan(4);
    expect(HERO_CONSOLE_TIMING.repeatingUpdateHold).toBeLessThan(
      HERO_CONSOLE_TIMING.initialUpdateHold,
    );
  });

  it("pins the preloaded alert copy to the review snapshot", () => {
    const alertState = HERO_CONSOLE_STATES.find(
      (state) => state.id === HERO_CONSOLE_ALERT_STATE_ID,
    );

    expect(alertState).toMatchObject({ alert: HERO_CONSOLE_INITIAL_ALERT });
    expect(HERO_CONSOLE_INITIAL_ALERT.label).not.toBe("");
    expect(HERO_CONSOLE_INITIAL_ALERT.title).not.toBe("");
    expect(HERO_CONSOLE_INITIAL_ALERT.copy).not.toBe("");
  });

  it("exposes a data-attribute selector contract", () => {
    expect(
      Object.values(HERO_CONSOLE_SELECTORS).every((selector) =>
        selector.startsWith("[data-hero-"),
      ),
    ).toBe(true);
  });
});
