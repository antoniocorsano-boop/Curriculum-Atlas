"use client";

import { useId, useRef } from "react";
import "./museo-zero-educational-info.css";

// Explicit allowlist derived from approved MZ-DID-0.1, pp. 1–3, 9–11.
// Do not import the professional fascicle or the scene solution into this projection.
import { museoZeroEducationalProfile as educationalProfile } from "./museo-zero-educational-profile";


type EducationalInfoBinding = {
  pathwayId: string;
  snapshotId: string;
  packageDigest: string;
  version: string;
};

export function MuseoZeroEducationalInfo({ snapshot }: { snapshot: EducationalInfoBinding }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  // Fail closed: the projection must not silently accompany a changed authored package.
  if (snapshot.pathwayId !== educationalProfile.pathwayId ||
      snapshot.snapshotId !== educationalProfile.snapshotId ||
      snapshot.packageDigest !== educationalProfile.packageDigest ||
      snapshot.version !== educationalProfile.experienceVersion) {
    return <p role="status">Scheda didattica da riallineare alla revisione dell’esperienza.</p>;
  }
  return (
    <div className="mz-educational-info">
      <button ref={triggerRef} type="button" className="mz-educational-info__trigger"
        aria-haspopup="dialog" onClick={() => { const dialog = dialogRef.current; if (dialog && !dialog.open) { dialog.showModal(); dialog.querySelector<HTMLButtonElement>("button")?.focus(); } }}>
        Il progetto educativo
      </button>
      <dialog ref={dialogRef} className="mz-educational-info__dialog" aria-labelledby={headingId}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
        data-testid="museo-educational-info" data-document-version={educationalProfile.documentVersion}
        data-document-digest={educationalProfile.documentDigest}
        data-experience-version={educationalProfile.experienceVersion}
        data-student-authorized="false">
        <div className="mz-educational-info__header">
          <div>
            <p className="mz-educational-info__eyebrow">Atlas · Documentazione didattica</p>
            <h2 id={headingId}>Il progetto educativo</h2>
            <p>Museo Zero · La sala che non torna</p>
          </div>
          <button type="button" onClick={() => dialogRef.current?.close()}>Chiudi</button>
        </div>
        <p className="mz-educational-info__notice">Anteprima della scheda pubblica · Solo revisione professionale. L’esperienza non è ancora validata né autorizzata per gli studenti.</p>
        <dl>
          {educationalProfile.sections.map(section => (
            <div key={section.title}><dt>{section.title}</dt><dd>{section.text}</dd></div>
          ))}
        </dl>
        <p className="mz-educational-info__edition">Edizione documentale {educationalProfile.documentVersion} · Esperienza {educationalProfile.experienceVersion}</p>
      </dialog>
    </div>
  );
}
