"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";

// Only a rendering adapter. React owns the rehearsal step, accessible
// controls, timing, reduced motion preference and narrative progression.
export function RehearsalEffects({ step }: { step: number }) {
  const mount = useRef<HTMLDivElement>(null);
  const latest = useRef(step);
  const render = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    latest.current = step;
    render.current?.(step);
  }, [step]);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    host.dataset.renderer = "fallback";
    // The existing accessible DOM representation is also the low-motion path.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let game: Phaser.Game | undefined;
    let timer: number | undefined;
    const surface = document.createElement("div");
    host.appendChild(surface);

    function fallback() {
      host!.dataset.renderer = "fallback";
      render.current = null;
      if (timer !== undefined) window.clearTimeout(timer);
      game?.destroy(true);
      game = undefined;
      surface.remove();
    }

    void import("phaser").then(({ default: engine }) => {
      if (disposed) return;
      timer = window.setTimeout(fallback, 8000);
      game = new engine.Game({
        type: engine.CANVAS, parent: surface, width: 836, height: 470,
        transparent: true, audio: { noAudio: true },
        input: { keyboard: false, mouse: false, touch: false, gamepad: false },
        banner: false, fps: { target: 30 },
        scene: {
          create(this: Phaser.Scene) {
            if (disposed || !surface.isConnected) return;
            const graphics = this.add.graphics();
            const draw = (value: number) => {
              graphics.clear();
              if (value === 1 || value === 2) {
                graphics.fillStyle(0x24f0bd, 0.13).fillCircle(280, 215, 22);
                graphics.fillStyle(0x38f7ce, 0.40).fillCircle(280, 215, 12);
                graphics.fillStyle(0xb9ffe9, 1).fillCircle(280, 215, 4);
              }
              if (value === 3) {
                graphics.fillStyle(0x12395e, 0.94);
                graphics.beginPath().moveTo(437, 118).lineTo(795, 100)
                  .lineTo(795, 292).lineTo(437, 290).closePath().fillPath();
                graphics.fillStyle(0x275b86, 1).fillCircle(616, 196, 50);
                graphics.lineStyle(2, 0xa2e8ff, 0.95).strokeCircle(616, 196, 50);
                graphics.strokeEllipse(616, 196, 158, 40);
                graphics.strokeEllipse(616, 196, 54, 100);
                graphics.beginPath().moveTo(566, 196).lineTo(666, 196)
                  .moveTo(616, 146).lineTo(616, 246).strokePath();
                graphics.fillStyle(0x3fa4e3, 0.12).fillEllipse(616, 302, 280, 38);
              }
              host.dataset.renderedStep = String(value);
            };
            render.current = draw;
            draw(latest.current);
            host.dataset.renderer = "phaser";
            if (timer !== undefined) window.clearTimeout(timer);
          },
        },
      });
    }).catch(() => { if (!disposed) fallback(); });

    return () => {
      disposed = true;
      fallback();
      delete host.dataset.renderedStep;
    };
  }, []);

  return <div className="mz-opening__effects" ref={mount} aria-hidden="true"
    data-testid="mz-rehearsal-effects" data-renderer="fallback" />;
}
