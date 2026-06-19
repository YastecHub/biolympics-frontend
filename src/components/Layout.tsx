import { type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { UrgentBanner } from "./UrgentBanner";
import { Logo } from "./Logo";

const SIMPLE_NAV = [
  ["/", "Home"],
  ["/schedule", "Schedule"],
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isShowcase = pathname === "/" || pathname === "/schedule";

  return (
    <div className="festival-shell flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-brand-primary focus:px-3 focus:py-1 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-secondary/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2" aria-label="BIOLYMPICS LIVE home">
            <Logo variant="mark" size={34} />
          </Link>

          <nav aria-label="Primary" className="ml-auto flex items-center gap-7 text-sm font-semibold">
            {SIMPLE_NAV.map(([to, label]) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={active ? "text-brand-lime" : "text-white/80 transition hover:text-white"}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <UrgentBanner />

      <main
        id="main"
        className={isShowcase ? "w-full flex-1" : "festival-app-main w-full flex-1 px-4 py-5"}
      >
        <div className={isShowcase ? "" : "mx-auto max-w-6xl"}>{children}</div>
      </main>

      {!isShowcase && (
        <footer className="border-t border-white/10 bg-[#02120e]/80 px-4 py-8 text-sm text-white/62">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            <p className="font-display text-lg font-bold text-white">BIOLYMPICS LIVE</p>
            <p>Faculty of Life Sciences Biolympics 2026</p>
            <p>June 19th to June 27th</p>
            <p>University of Lagos, Lagos, Nigeria.</p>
            <p className="text-xs">
              All times shown in West Africa Time (WAT). Live scores update automatically.
            </p>
            <Link to="/admin/login" className="text-xs underline hover:text-white">
              Officials &amp; admin sign-in
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}
