"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import styles from "./museo-zero-phaser-spike.module.css";

const PHASER_CDN = "https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.min.js";

export default function MuseoZeroPhaserSpike() {
  const hostRef = useRef(null);
  const gameRef = useRef(null);
  const sceneRef = useRef(null);
  const mappingRef = useRef("A");
  const [mapping, setMapping] = useState("A");
  const [engineReady, setEngineReady] = useState(false);
  const [status, setStatus] = useState("Caricamento del motore di prova…");

  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    }
  }, []);

  const buildGame = useCallback(() => {
    if (!hostRef.current || gameRef.current || !window.Phaser) return;

    const Phaser = window.Phaser;
    const report = (message) => setStatus(message);

    class MuseoScene extends Phaser.Scene {
      constructor() {
        super("museo-zero-spike");
        this.triggered = false;
        this.running = false;
      }

      create() {
        const w = 390;
        const h = 620;

        this.cameras.main.setBackgroundColor("#0b1020");

        this.add.rectangle(w / 2, 54, w - 28, 78, 0x111827).setStrokeStyle(1, 0x334155);
        this.add.text(28, 30, "MUSEO ZERO · SALA 0", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#f8fafc",
        });
        this.roomStatus = this.add.text(28, 56, "ULTIMA PROVA · 18:47", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "11px",
          color: "#94a3b8",
        });

        this.add.rectangle(w / 2, 242, 350, 270, 0x172033).setStrokeStyle(2, 0x334155);
        this.add.text(32, 116, "NUOVO INGRESSO", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          fontStyle: "bold",
          color: "#99f6e4",
        });

        this.projection = this.add.rectangle(245, 186, 180, 92, 0x0f766e, 0.12)
          .setStrokeStyle(2, 0x2dd4bf);
        this.projectionLabel = this.add.text(188, 178, "PROIEZIONE\nIN ATTESA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "bold",
          align: "center",
          color: "#64748b",
        });

        this.add.rectangle(195, 335, 318, 7, 0x475569, 0.9);

        this.sensorB = this.add.circle(92, 335, 13, 0x14b8a6);
        this.sensorA = this.add.circle(248, 335, 13, 0xf59e0b);
        this.add.text(72, 356, "B · nuovo", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          color: "#99f6e4",
        });
        this.add.text(228, 356, "A · vecchio", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          color: "#fde68a",
        });

        this.exitLight = this.add.rectangle(338, 292, 16, 48, 0x334155);
        this.add.text(313, 266, "USCITA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          color: "#94a3b8",
        });

        this.lia = this.add.container(48, 314);
        const body = this.add.rectangle(0, 13, 24, 36, 0x0f766e).setOrigin(0.5);
        const head = this.add.circle(0, -12, 11, 0xe4b18b);
        const hair = this.add.arc(0, -15, 11, 190, 350, false, 0x4b362c);
        this.lia.add([body, head, hair]);

        this.add.text(28, 405, "REGIA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          fontStyle: "bold",
          color: "#94a3b8",
        });

        this.controlLine = this.add.graphics();
        this.drawMapping();

        this.teo = this.add.text(28, 455, "Teo: «No. Ancora in ritardo.»", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#f8fafc",
          wordWrap: { width: 330 },
        });
        this.omar = this.add.text(28, 492, "Omar: «Il sensore si accende. Allora che cosa non torna?»", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          color: "#cbd5e1",
          wordWrap: { width: 330 },
        });

        this.hint = this.add.text(28, 552, "Prova attuale: la regia ascolta il sensore A.", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          color: "#fbbf24",
          wordWrap: { width: 330 },
        });

        sceneRef.current = this;
        report("Motore pronto. Osserva la prova: la sala reagirà troppo tardi.");
        this.time.delayedCall(700, () => this.runTrial());
      }

      drawMapping() {
        const listensToB = mappingRef.current === "B";
        this.controlLine.clear();
        this.controlLine.lineStyle(4, listensToB ? 0x14b8a6 : 0xf59e0b, 1);
        this.controlLine.beginPath();
        this.controlLine.moveTo(listensToB ? 92 : 248, 382);
        this.controlLine.lineTo(195, 430);
        this.controlLine.strokePath();
      }

      setMapping(next) {
        mappingRef.current = next;
        this.drawMapping();
        this.hint.setText(
          next === "B"
            ? "Nuova ipotesi: la regia ascolta il sensore B."
            : "Prova attuale: la regia ascolta il sensore A."
        );
      }

      triggerRoom(sensor) {
        if (this.triggered) return;
        this.triggered = true;

        this.projection.setFillStyle(0x14b8a6, 0.85);
        this.projectionLabel.setText("PROIEZIONE\nATTIVA").setColor("#f0fdfa");
        this.exitLight.setFillStyle(0xfacc15);
        this.cameras.main.flash(120, 45, 212, 191, false);

        if (sensor === "A") {
          report("La sala parte, ma tardi: Lia è già oltre il nuovo ingresso quando il vecchio sensore A attiva i cue.");
        } else {
          report("La sala reagisce subito all’ingresso: proiezione, suono e luce tornano sincronizzati.");
        }
      }

      resetVisuals() {
        this.triggered = false;
        this.projection.setFillStyle(0x0f766e, 0.12);
        this.projectionLabel.setText("PROIEZIONE\nIN ATTESA").setColor("#64748b");
        this.exitLight.setFillStyle(0x334155);
        this.lia.x = 48;
      }

      runTrial() {
        if (this.running) return;
        this.running = true;
        this.resetVisuals();
        const current = mappingRef.current;
        const triggerX = current === "B" ? 92 : 248;
        this.roomStatus.setText("PROVA IN CORSO");
        report(
          current === "B"
            ? "Lia entra dal nuovo percorso. La regia ora ascolta il sensore B…"
            : "Lia entra dal nuovo percorso. La regia sta ancora ascoltando il vecchio sensore A…"
        );

        this.tweens.add({
          targets: this.lia,
          x: 342,
          duration: 4300,
          ease: "Linear",
          onUpdate: () => {
            if (!this.triggered && this.lia.x >= triggerX) {
              this.triggerRoom(current);
            }
          },
          onComplete: () => {
            this.running = false;
            this.roomStatus.setText(
              current === "B" ? "SALA SINCRONIZZATA" : "SALA FUORI SINCRONO"
            );
            if (current === "B") {
              this.teo.setText("Teo: «Adesso parte quando entra il visitatore.»");
              this.omar.setText("Omar: «Quindi il sensore era a posto. Era il collegamento.»");
            } else {
              this.teo.setText("Teo: «No. Ancora in ritardo.»");
              this.omar.setText("Omar: «Il sensore si accende. Allora che cosa non torna?»");
            }
          },
        });
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 390,
      height: 620,
      backgroundColor: "#0b1020",
      transparent: false,
      scene: MuseoScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 390,
        height: 620,
      },
      render: {
        antialias: true,
        pixelArt: false,
      },
      audio: {
        noAudio: true,
      },
    });

    setEngineReady(true);
  }, []);

  useEffect(() => destroyGame, [destroyGame]);

  const chooseMapping = (next) => {
    mappingRef.current = next;
    setMapping(next);
    sceneRef.current?.setMapping(next);
    setStatus(
      next === "B"
        ? "Hai collegato la regia al sensore B, quello del nuovo ingresso. Ora rifai la prova."
        : "Hai collegato la regia al sensore A, quello del vecchio ingresso."
    );
  };

  const rerun = () => {
    sceneRef.current?.runTrial();
  };

  return (
    <main className={styles.page}>
      <Script
        src={PHASER_CDN}
        strategy="afterInteractive"
        onLoad={buildGame}
        onReady={buildGame}
        onError={() => setStatus("Il motore Phaser non è stato caricato. Questo spike usa temporaneamente una CDN esterna fissata alla versione 4.2.1.")}
      />

      <div className={styles.shell}>
        <p className={styles.eyebrow}>Technology spike · non è un Percorso autorizzato</p>
        <h1 className={styles.title}>Museo Zero · la sala che non torna</h1>
        <p className={styles.lede}>
          Una sola prova: capire se un piccolo mondo 2D può far percepire causa e conseguenza
          meglio di una pagina di card.
        </p>

        <div className={styles.story} aria-label="Contesto narrativo">
          <p className={styles.bubble}><strong>Teo:</strong> «No. Ancora in ritardo.»</p>
          <p className={styles.bubble}><strong>Omar:</strong> «Il sensore si accende. Allora che cosa non torna?»</p>
        </div>

        <section className={styles.frame} aria-label="Simulazione Sala Zero">
          <div
            ref={hostRef}
            className={styles.canvasWrap}
            aria-hidden="true"
          />

          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Cabina regia · collegamento del trigger</h2>
            <p className={styles.panelText}>
              Il sensore B è fisicamente nel nuovo ingresso. La regia, però, sta ascoltando A.
              Cambia solo il collegamento e osserva la stessa scena.
            </p>

            <div className={styles.mapping}>
              <span className={styles.mappingLabel}>Trigger attivo</span>
              <span className={styles.mappingValue}>Sensore {mapping}</span>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.button}
                data-active={mapping === "A"}
                onClick={() => chooseMapping("A")}
              >
                Collega ad A · vecchio ingresso
              </button>
              <button
                type="button"
                className={styles.button}
                data-active={mapping === "B"}
                onClick={() => chooseMapping("B")}
              >
                Collega a B · nuovo ingresso
              </button>
              <button
                type="button"
                className={styles.buttonPrimary}
                onClick={rerun}
                disabled={!engineReady}
              >
                Rifai la prova
              </button>
            </div>

            <div className={styles.status} role="status" aria-live="polite">
              {status}
            </div>
          </div>
        </section>

        <p className={styles.note}>
          Spike isolato: nessun salvataggio, nessun profilo studente, nessun analytics, nessuna
          pubblicazione/Q9. Phaser è caricato solo per questa prova tecnica.
        </p>
      </div>
    </main>
  );
}
