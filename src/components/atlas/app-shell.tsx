import Link from "next/link";
import {
  BookOpen,
  Boxes,
  Compass,
  GitBranch,
  Home,
  Library,
  Menu,
  Search,
  Settings,
  Target,
  Waypoints,
} from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/esplora", label: "Esplora", icon: Compass },
  { href: "/curricolo", label: "Curricolo", icon: BookOpen },
  { href: "/percorsi", label: "Percorsi", icon: GitBranch },
  { href: "/risorse", label: "Risorse", icon: Library },
  { href: "/lezioni", label: "Lezioni", icon: Boxes },
  { href: "/obiettivi", label: "Obiettivi", icon: Target },
  { href: "/raccordi", label: "Raccordi", icon: Waypoints },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="atlas-shell">
      <aside className="atlas-sidebar" aria-label="Navigazione Atlas">
        <Link href="/" className="atlas-brand" aria-label="Atlas, home">
          <span className="atlas-mark" aria-hidden="true">✦</span>
          Atlas
        </Link>
        <nav className="atlas-nav">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} data-active={href === "/" ? "true" : "false"}>
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="atlas-sidebar-footer atlas-nav">
          <Link href="/impostazioni">
            <Settings size={17} aria-hidden="true" />
            <span>Impostazioni</span>
          </Link>
        </div>
      </aside>

      <div className="atlas-main">
        <header className="atlas-topbar">
          <label className="atlas-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Cerca in Atlas</span>
            <input placeholder="Cerca nel curricolo, nelle risorse, negli obiettivi…" />
          </label>
          <div className="atlas-user">
            <div className="atlas-avatar" aria-hidden="true">TR</div>
            <div>
              <strong>Atlas</strong><br />
              <span>Prodotto TRAMA</span>
            </div>
          </div>
        </header>

        <main className="atlas-content">{children}</main>
      </div>

      <nav className="atlas-mobile-nav" aria-label="Navigazione mobile">
        {items.slice(0, 5).map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} data-active={href === "/" ? "true" : "false"}>
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
