"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Boxes,
  Compass,
  GitBranch,
  Home,
  Library,
  Search,
  Settings,
  Target,
  Waypoints,
  Ellipsis,
} from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/esplora", label: "Esplora", icon: Compass },
  { href: "/curricolo", label: "Curricolo", icon: BookOpen },
  { href: "/materiali", label: "Materiali", icon: Boxes },
  { href: "/percorsi", label: "Percorsi", icon: GitBranch },
  { href: "/risorse", label: "Risorse Atlas", icon: Library },
  { href: "/obiettivi", label: "Obiettivi", icon: Target },
  { href: "/raccordi", label: "Raccordi", icon: Waypoints },
];

const mobileItems = items.filter((item) =>
  ["/", "/esplora", "/curricolo", "/materiali", "/risorse"].includes(item.href)
);

const mobileMoreItems = [
  { href: "/percorsi", label: "Percorsi", icon: GitBranch },
  { href: "/obiettivi", label: "Obiettivi", icon: Target },
  { href: "/raccordi", label: "Raccordi", icon: Waypoints },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="atlas-shell">
      <aside className="atlas-sidebar" aria-label="Navigazione Atlas">
        <Link href="/" className="atlas-brand" aria-label="Atlas, home">
          <span className="atlas-mark" aria-hidden="true">✦</span>
          Atlas
        </Link>
        <nav className="atlas-nav">
          {items.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} data-active={isActive(href) ? "true" : "false"}>
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
          <Link href="/" className="atlas-mobile-brand" aria-label="Atlas, home">
            <span className="atlas-mark" aria-hidden="true">✦</span>
            <span>Atlas</span>
          </Link>
          <label className="atlas-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Cerca in Atlas</span>
            <input placeholder="Cerca in Atlas" aria-label="Cerca in Atlas" />
          </label>
          <div className="atlas-public-context" aria-label="Atlas è una vista pubblica senza account">
            <strong>Vista pubblica</strong>
            <span>TRAMA · nessun account</span>
          </div>
        </header>

        <main className="atlas-content">{children}</main>
      </div>

      <nav className="atlas-mobile-nav" aria-label="Navigazione mobile">
        {mobileItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} data-active={isActive(href) ? "true" : "false"}>
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
        <details className="atlas-mobile-more">
          <summary aria-label="Altre sezioni Atlas">
            <Ellipsis size={19} aria-hidden="true" />
            <span>Altro</span>
          </summary>
          <div className="atlas-mobile-more-menu">
            {mobileMoreItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} data-active={isActive(href) ? "true" : "false"}>
                <Icon size={17} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </details>
      </nav>
    </div>
  );
}
