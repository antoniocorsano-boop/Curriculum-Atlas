"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, Check, Compass, Lightbulb, RotateCcw } from "lucide-react";
import { publishedLessons } from "@/features/materials/fixtures";
import styles from "./energy-discovery.module.css";

type Step = 0 | 1 | 2;

export function EnergyDiscovery({ onExploreConnections }: { onExploreConnections: () => void }) {
  const [step, setStep] = useState<Step>(0);
  const illustration = useMemo(() => {
    const lesson = publishedLessons.find(item => item.id === "3e-tec-02");
    const material = lesson?.materials.find(item => item.id === "3e-20260923-infografica");
    return material?.url?.startsWith("/materials/") && material.url.endsWith(".svg")
      ? { title: material.title, href: material.url, lesson: lesson?.title ?? "Trasformazioni dell'energia" }
      : null;
  }, []);

  return (
    <section className={styles.journey} aria-labelledby="atlas-domanda-energia" data-testid="atlas-esplora-prima-scoperta">
      <div className={styles.intro}>
        <span className={styles.eyebrow}><Compass size={16} aria-hidden="true" /> Una scoperta da cui cominciare</span>
        <h2 id="atlas-domanda-energia">Perché una lampada si scalda se deve fare luce?</h2>
        <p>Hai mai notato che un oggetto può produrre più effetti di quelli che cerchiamo? Segui questa piccola scoperta: non c&apos;è una risposta da indovinare.</p>
      </div>
      <nav className={styles.progress} aria-label="Tappe della scoperta">
        {(["La domanda", "Osserva", "Collega"] as const).map((title, index) => (
          <span key={title} className={styles.progressItem} data-current={step === index ? "true" : "false"} data-completed={step > index ? "true" : "false"}>
            <span className={styles.progressNumber} aria-hidden="true">{step > index ? <Check size={14} /> : index + 1}</span>
            {title}
          </span>
        ))}
      </nav>

      <div className={styles.scene} aria-live="polite">
        {step === 0 ? (
          <div className={styles.questionScene} data-testid="scoperta-tappa-domanda">
            <div className={styles.lampScene} aria-hidden="true">
              <div className={styles.lampHalo}/>
              <Lightbulb size={80} strokeWidth={1.3}/>
              <div className={styles.lampBase}/>
            </div>
            <div className={styles.sceneText}>
              <span className={styles.sceneLabel}>Guarda un oggetto comune</span>
              <h3>La luce è ciò che vogliamo. E il calore?</h3>
              <p>Perché una lampada accesa può scaldarsi? Quale trasformazione è avvenuta al suo interno?</p>
              <button type="button" className={styles.primaryAction} onClick={() => setStep(1)} data-testid="scoperta-osserva">
                Osserva la trasformazione <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className={styles.observationScene} data-testid="scoperta-tappa-osserva">
            <div>
              <span className={styles.sceneLabel}>La trasformazione</span>
              <h3>L&apos;energia non produce soltanto l&apos;effetto che cerchiamo.</h3>
              <p>La lampada riceve energia elettrica. La trasforma in <strong>luce</strong>, che ci serve per illuminare, e anche in <strong>calore</strong>. La parte dispersa come calore non contribuisce a illuminare.</p>
            </div>
            <div className={styles.flow} aria-label="Energia elettrica in entrata, trasformazione nella lampada, luce utile e calore disperso">
              <div className={styles.flowBox}><span>In entrata</span><strong>Energia elettrica</strong></div>
              <ArrowRight className={styles.flowArrow} aria-hidden="true" />
              <div className={styles.flowBox}><span>Nel dispositivo</span><strong>Trasformazione</strong></div>
              <ArrowRight className={styles.flowArrow} aria-hidden="true" />
              <div className={styles.flowResults}>
                <span className={styles.useful}>Luce · effetto utile</span>
                <span className={styles.heat}>Calore · dispersione</span>
              </div>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.primaryAction} onClick={() => setStep(2)} data-testid="scoperta-collega">
                Segui i collegamenti <ArrowRight size={17} aria-hidden="true" />
              </button>
              <button type="button" className={styles.backAction} onClick={() => setStep(0)}>
                Torna alla domanda
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className={styles.discoveryScene} data-testid="scoperta-tappa-collega">
            <div className={styles.discoveryCopy}>
              <span className={styles.sceneLabel}>Una domanda apre altre strade</span>
              <h3>E se fosse un asciugacapelli o un motore?</h3>
              <p>In altri oggetti l&apos;effetto utile cambia: aria calda, movimento o luce. Prova a riconoscere che cosa entra nel sistema, come si trasforma e quali effetti produce.</p>
              <p className={styles.insight}>Hai scoperto un modo per leggere i sistemi tecnologici: <strong>ingresso → trasformazione → effetti.</strong></p>
              <div className={styles.actions}>
                <a href="#atlas-mappa-conoscenze" onClick={onExploreConnections} className={styles.primaryAction} data-testid="scoperta-apri-relazioni">
                  Apri le relazioni in Tecnologia <ArrowDown size={17} aria-hidden="true" />
                </a>
                <button type="button" className={styles.backAction} onClick={() => setStep(0)} data-testid="scoperta-ricomincia">
                  <RotateCcw size={16} aria-hidden="true" /> Ricomincia
                </button>
              </div>
            </div>
            {illustration ? (
              <figure className={styles.resource} data-testid="scoperta-risorsa-esistente">
                <Image src={`${process.env.NEXT_PUBLIC_ATLAS_BASE_PATH ?? ""}${illustration.href}`} width={1600} height={900} unoptimized alt="Schema già presente in Atlas: energia in entrata, trasformazione, effetto utile e dispersioni; esempi di lampada, automobile e asciugacapelli." loading="lazy" />
                <figcaption>
                  <strong>{illustration.title}</strong>
                  <span>{illustration.lesson} · Materiale già collegato a una lezione pubblica.</span>
                  <Link href={illustration.href} target="_blank" rel="noopener noreferrer" data-testid="scoperta-apri-schema">
                    Apri lo schema completo <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </figcaption>
              </figure>
            ) : (
              <div className={styles.fallbackResource} role="note">
                Lo schema illustrato non è disponibile in questo momento. Puoi comunque consultare i materiali pubblicati.
                <Link href="/materiali">Vai ai materiali</Link>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <p className={styles.sourceNote}>Scoperta costruita sul materiale pubblico già presente in Atlas, senza dati personali né nuove risorse generate. I collegamenti al curricolo di Arena sono ancora in validazione e non sono presentati come vigenti.</p>
    </section>
  );
}
