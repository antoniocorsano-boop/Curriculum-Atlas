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
  const [controlsReady, setControlsReady] = useState(false);
  const [status, setStatus] = useState("Caricamento della Sala Zero…");

  const destroyGame = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    }
  }, []);

  const chooseMapping = useCallback((next) => {
    if (next !== "A" && next !== "B") return;
    const accepted = sceneRef.current?.setMapping(next);
    if (!accepted) return;

    setMapping(next);
    setStatus(
      next === "B"
        ? "Hai spostato il collegamento sul sensore B del nuovo ingresso. La sala è pronta: rifai la stessa prova."
        : "Hai riportato il collegamento sul sensore A del vecchio ingresso. La sala è pronta per una nuova prova."
    );
  }, []);

  const rerun = useCallback(() => {
    sceneRef.current?.runTrial();
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
        this.controlsUnlocked = false;
        this.hasRun = false;
      }

      create() {
        const w = 390;

        this.cameras.main.setBackgroundColor("#071019");

        this.add.rectangle(w / 2, 36, w - 24, 50, 0x0c1724)
          .setStrokeStyle(1, 0x203247);
        this.add.text(24, 20, "MUSEO ZERO · SALA 0", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "15px",
          fontStyle: "bold",
          color: "#f8fafc",
        });
        this.roomStatus = this.add.text(24, 43, "COLLEGAMENTO REGIA · SENSORE A", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          color: "#fbbf24",
        });

        this.add.rectangle(195, 226, 354, 304, 0x101c2a)
          .setStrokeStyle(2, 0x2a4058);

        this.add.rectangle(49, 226, 42, 230, 0x0b1320)
          .setStrokeStyle(2, 0x2dd4bf);
        this.add.text(29, 103, "NUOVO\nINGRESSO", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          fontStyle: "bold",
          align: "center",
          color: "#99f6e4",
        });

        this.add.rectangle(195, 322, 308, 8, 0x31455a, 0.92);
        this.add.rectangle(195, 340, 308, 1, 0x5e7185, 0.35);

        this.projection = this.add.rectangle(245, 170, 178, 98, 0x0f766e, 0.10)
          .setStrokeStyle(2, 0x2dd4bf);
        this.projectionLabel = this.add.text(190, 157, "PROIEZIONE\nIN ATTESA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "bold",
          align: "center",
          color: "#64748b",
        });

        this.exitLight = this.add.rectangle(340, 287, 15, 52, 0x334155);
        this.add.text(318, 254, "USCITA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          color: "#94a3b8",
        });

        this.lia = this.add.container(30, 299);
        const body = this.add.rectangle(0, 13, 23, 36, 0x0f766e).setOrigin(0.5);
        const head = this.add.circle(0, -12, 11, 0xe4b18b);
        const hair = this.add.arc(0, -15, 11, 190, 350, false, 0x4b362c);
        this.lia.add([body, head, hair]);
        this.add.text(20, 348, "LIA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          fontStyle: "bold",
          color: "#cbd5e1",
        });

        this.controlLine = this.add.graphics();

        this.sensorBCard = this.add.rectangle(88, 323, 92, 58, 0x102f32, 0.96)
          .setStrokeStyle(1, 0x14b8a6)
          .setInteractive({ useHandCursor: true });
        this.sensorACard = this.add.rectangle(252, 323, 92, 58, 0x3a2b15, 0.96)
          .setStrokeStyle(3, 0xf59e0b)
          .setInteractive({ useHandCursor: true });

        this.add.circle(67, 315, 8, 0x14b8a6);
        this.add.text(82, 301, "B", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#ccfbf1",
        });
        this.add.text(61, 331, "nuovo", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          color: "#99f6e4",
        });

        this.add.circle(231, 315, 8, 0xf59e0b);
        this.add.text(246, 301, "A", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#fef3c7",
        });
        this.add.text(225, 331, "vecchio", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "9px",
          color: "#fde68a",
        });

        this.add.rectangle(195, 460, 354, 112, 0x0b1522)
          .setStrokeStyle(2, 0x334155);
        this.add.text(24, 418, "CABINA REGIA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "10px",
          fontStyle: "bold",
          color: "#94a3b8",
        });
        this.controlSocket = this.add.circle(195, 408, 9, 0x111827)
          .setStrokeStyle(3, 0xf59e0b);
        this.mappingReadout = this.add.text(24, 445, "TRIGGER ← A · VECCHIO INGRESSO", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "13px",
          fontStyle: "bold",
          color: "#fde68a",
        });
        this.hint = this.add.text(
          24,
          474,
          "Guarda la prima prova. Poi prova a cambiare solo il collegamento.",
          {
            fontFamily: "system-ui, sans-serif",
            fontSize: "11px",
            color: "#cbd5e1",
            wordWrap: { width: 336 },
          }
        );

        this.replayPad = this.add.rectangle(195, 574, 326, 58, 0x153246, 0.55)
          .setStrokeStyle(2, 0x42657c)
          .setInteractive({ useHandCursor: true });
        this.replayLabel = this.add.text(195, 574, "OSSERVA LA PRIMA PROVA", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#9fb6c8",
        }).setOrigin(0.5);

        this.worldMessage = this.add.text(24, 624, "Teo: «No. Ancora in ritardo.»", {
          fontFamily: "system-ui, sans-serif",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#f8fafc",
          wordWrap: { width: 342 },
        });

        sceneRef.current = this;

        this.sensorACard.on("pointerdown", () => {
          if (this.controlsUnlocked && !this.running) chooseMapping("A");
        });
        this.sensorBCard.on("pointerdown", () => {
          if (this.controlsUnlocked && !this.running) chooseMapping("B");
        });
        this.replayPad.on("pointerdown", () => {
          if (this.controlsUnlocked && !this.running) this.runTrial();
        });

        this.drawMapping();
        report("Sala pronta. Osserva la prima prova con la regia collegata al sensore A.");
        this.time.delayedCall(650, () => this.runTrial());
      }

      drawMapping() {
        const listensToB = mappingRef.current === "B";
        const color = listensToB ? 0x14b8a6 : 0xf59e0b;
        const startX = listensToB ? 88 : 252;

        this.controlLine.clear();
        this.controlLine.lineStyle(10, color, 0.14);
        this.controlLine.beginPath();
        this.controlLine.moveTo(startX, 354);
        this.controlLine.lineTo(startX, 382);
        this.controlLine.lineTo(195, 408);
        this.controlLine.strokePath();

        this.controlLine.lineStyle(3, color, 1);
        this.controlLine.beginPath();
        this.controlLine.moveTo(startX, 354);
        this.controlLine.lineTo(startX, 382);
        this.controlLine.lineTo(195, 408);
        this.controlLine.strokePath();

        this.sensorBCard.setStrokeStyle(listensToB ? 3 : 1, 0x14b8a6);
        this.sensorACard.setStrokeStyle(listensToB ? 1 : 3, 0xf59e0b);
        this.controlSocket.setStrokeStyle(3, color);
        this.mappingReadout
          .setText(listensToB ? "TRIGGER ← B · NUOVO INGRESSO" : "TRIGGER ← A · VECCHIO INGRESSO")
          .setColor(listensToB ? "#99f6e4" : "#fde68a");
      }

      setMapping(next) {
        if (!this.controlsUnlocked || this.running) return false;

        mappingRef.current = next;
        this.drawMapping();
        this.roomStatus
          .setText(`COLLEGAMENTO REGIA · SENSORE ${next}`)
          .setColor(next === "B" ? "#5eead4" : "#fbbf24");
        this.hint.setText(
          next === "B"
            ? "Hai spostato il cavo sulla nuova porta. La sala è identica: cambia solo ciò che ascolta la regia."
            : "Il cavo torna al vecchio sensore. La sala è identica: cambia solo ciò che ascolta la regia."
        );
        this.worldMessage.setText(
          next === "B"
            ? "Omar: «B è proprio sulla nuova porta. Rifacciamo la stessa prova.»"
            : "Teo: «Così la regia torna ad ascoltare il vecchio passaggio.»"
        );
        this.replayPad.setFillStyle(0x0f766e, 0.92).setStrokeStyle(2, 0x5eead4);
        this.replayLabel.setText("RIPETI LA STESSA PROVA").setColor("#f0fdfa");
        return true;
      }

      triggerRoom(sensor) {
        if (this.triggered) return;
        this.triggered = true;

        const activeCard = sensor === "B" ? this.sensorBCard : this.sensorACard;
        this.tweens.add({
          targets: activeCard,
          alpha: 0.45,
          duration: 110,
          yoyo: true,
          repeat: 1,
        });

        this.projection.setFillStyle(0x14b8a6, 0.88);
        this.projectionLabel.setText("PROIEZIONE\nATTIVA").setColor("#f0fdfa");
        this.exitLight.setFillStyle(0xfacc15);
        this.cameras.main.flash(100, 45, 212, 191, false);

        if (sensor === "A") {
          report("La sala parte troppo tardi: Lia ha già superato il nuovo ingresso quando il sensore A attiva la regia.");
        } else {
          report("La sala reagisce subito all’ingresso: proiezione e luce sono sincronizzati con Lia.");
        }
      }

      resetVisuals() {
        this.triggered = false;
        this.projection.setFillStyle(0x0f766e, 0.10);
        this.projectionLabel.setText("PROIEZIONE\nIN ATTESA").setColor("#64748b");
        this.exitLight.setFillStyle(0x334155);
        this.lia.x = 30;
      }

      runTrial() {
        if (this.running) return false;

        this.running = true;
        this.resetVisuals();
        const current = mappingRef.current;
        const triggerX = current === "B" ? 88 : 252;

        this.roomStatus
          .setText(`PROVA IN CORSO · REGIA SU ${current}`)
          .setColor(current === "B" ? "#5eead4" : "#fbbf24");
        this.worldMessage.setText(
          current === "B"
            ? "Lia entra di nuovo. Ora la regia ascolta il sensore sulla nuova porta."
            : "Lia entra dalla nuova porta. La regia ascolta ancora il vecchio sensore A."
        );
        report(
          current === "B"
            ? "Lia entra dal nuovo percorso. La regia ora ascolta il sensore B."
            : "Lia entra dal nuovo percorso. La regia sta ancora ascoltando il vecchio sensore A."
        );

        this.tweens.add({
          targets: this.lia,
          x: 342,
          duration: 3600,
          ease: "Linear",
          onUpdate: () => {
            if (!this.triggered && this.lia.x >= triggerX) {
              this.triggerRoom(current);
            }
          },
          onComplete: () => {
            this.running = false;
            this.hasRun = true;

            if (current === "B") {
              this.roomStatus.setText("SALA SINCRONIZZATA").setColor("#5eead4");
              this.worldMessage.setText("Teo: «Adesso sì: entra Lia e la sala parte con lei.»");
              this.hint.setText("Stessa stanza, stesso ingresso, stessa prova. È cambiato soltanto il collegamento.");
              report("La sala reagisce subito all’ingresso: proiezione e luce tornano sincronizzati.");
            } else {
              this.controlsUnlocked = true;
              setControlsReady(true);
              this.roomStatus.setText("SALA FUORI SINCRONO").setColor("#fbbf24");
              this.worldMessage.setText("Omar: «B è sulla nuova porta. E se la regia ascoltasse quello?»");
              this.hint.setText("Tocca il sensore B nel nuovo ingresso: sposterai soltanto il cavo della regia.");
              this.replayPad.setFillStyle(0x153246, 0.82).setStrokeStyle(2, 0x42657c);
              this.replayLabel.setText("PRIMA CAMBIA IL COLLEGAMENTO").setColor("#cbd5e1");
              report("La sala è fuori sincrono. Il sensore B è sulla nuova porta: prova a collegare lì la regia.");
            }
          },
        });

        return true;
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: hostRef.current,
      width: 390,
      height: 680,
      backgroundColor: "#071019",
      transparent: false,
      scene: MuseoScene,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 390,
        height: 680,
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
  }, [chooseMapping]);

  useEffect(() => destroyGame, [destroyGame]);

  return (
    <main className={styles.page}>
      <Script
        src={PHASER_CDN}
        strategy="afterInteractive"
        onLoad={buildGame}
        onReady={buildGame}
        onError={() =>
          setStatus(
            "Il motore Phaser non è stato caricato. Questo spike usa temporaneamente una CDN esterna fissata alla versione 4.2.1."
          )
        }
      />

      <div className={styles.shell}>
        <header className={styles.stageHeader}>
          <p className={styles.eyebrow}>Technology spike · non autorizzato agli studenti</p>
          <h1 className={styles.title}>Museo Zero · la sala che non torna</h1>
        </header>

        <p id="museo-zero-world-instructions" className={styles.srOnly}>
          Osserva la prima prova. Quando termina, puoi cambiare il collegamento della regia
          scegliendo il sensore A o B e ripetere la stessa prova. I controlli accessibili sono
          sovrapposti agli oggetti corrispondenti nella Sala Zero.
        </p>

        <section
          className={styles.frame}
          aria-label="Sala Zero interattiva"
          aria-describedby="museo-zero-world-instructions"
          data-world-first="true"
        >
          <div className={styles.worldSurface}>
            <div ref={hostRef} className={styles.canvasWrap} aria-hidden="true" />

            <button
              type="button"
              className={`${styles.worldControl} ${styles.sensorBControl}`}
              aria-label="Collega a B · nuovo ingresso"
              aria-pressed={mapping === "B"}
              disabled={!controlsReady}
              onClick={() => chooseMapping("B")}
            >
              Collega a B · nuovo ingresso
            </button>
            <button
              type="button"
              className={`${styles.worldControl} ${styles.sensorAControl}`}
              aria-label="Collega ad A · vecchio ingresso"
              aria-pressed={mapping === "A"}
              disabled={!controlsReady}
              onClick={() => chooseMapping("A")}
            >
              Collega ad A · vecchio ingresso
            </button>
            <button
              type="button"
              className={`${styles.worldControl} ${styles.replayControl}`}
              aria-label="Rifai la prova"
              disabled={!engineReady || !controlsReady}
              onClick={rerun}
            >
              Rifai la prova
            </button>
          </div>
        </section>

        <div className={styles.srOnly} role="status" aria-live="polite">
          {status}
        </div>

        <p className={styles.note}>
          Spike isolato · nessun salvataggio, profilo, telemetria, pubblicazione o Q9.
        </p>
      </div>
    </main>
  );
}
