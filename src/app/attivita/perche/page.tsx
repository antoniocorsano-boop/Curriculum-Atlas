import { AppShell } from "@/components/atlas/app-shell";
import { ActivityPrototype } from "@/components/atlas/activity-prototype";

export default function WhyActivityPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Perché? · laboratorio cognitivo</span>
          <h1>Osserva. Chiedi. Verifica. Spiega.</h1>
          <p>Prototipo pubblico senza credenziali: l'attività può essere avviata online e salvata sul dispositivo per continuare anche senza rete.</p>
        </div>
      </header>
      <ActivityPrototype />
    </AppShell>
  );
}
