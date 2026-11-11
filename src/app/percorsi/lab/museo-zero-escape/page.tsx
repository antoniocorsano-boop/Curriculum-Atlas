import { MuseoZeroEscapeRoom } from "@/features/escape-room/MuseoZeroEscapeRoom";
export const metadata = {
  title: "Museo Zero · Escape room · Studio Atlas",
  description: "Anteprima riservata della sala investigativa Museo Zero.",
  robots: { index: false, follow: false },
};
export default function MuseoZeroEscapePage() { return <MuseoZeroEscapeRoom />; }
