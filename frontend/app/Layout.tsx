import { NavLink, Outlet, Link } from "react-router";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { site } from "@/lib/site";

const links = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/setup", label: "Setup" },
  { to: "/templates", label: "Templates" },
  { to: "/playground", label: "Playground" },
];

export function Layout() {
  const hasToken = useAuthStore((s) => !!s.token);
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-5xl items-center gap-0.5 overflow-x-auto px-4 sm:gap-1">
          <Link to="/" className="mr-auto flex items-center gap-2 font-semibold tracking-tight">
            <span aria-hidden>😂</span>
            <span className="hidden sm:inline">Meme Generator MCP</span>
          </Link>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "shrink-0 rounded-md px-2 py-1.5 text-sm sm:px-2.5 text-muted-foreground transition-colors hover:text-foreground",
                  isActive && "bg-accent text-foreground",
                )
              }
            >
              {l.label}
              {l.to === "/setup" && hasToken && (
                <span className="ml-1.5 inline-block size-1.5 rounded-full bg-emerald-500 align-middle" aria-label="token saved" />
              )}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Open source under the{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href={`${site.repoUrl}/blob/HEAD/LICENSE`} target="_blank" rel="noreferrer">
              {site.license} license
            </a>{" "}
            ·{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href={site.repoUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
          <p>
            Made by{" "}
            <a className="underline underline-offset-4 hover:text-foreground" href={site.authorUrl} target="_blank" rel="noreferrer">
              {site.authorName}
            </a>{" "}
            · Memes rendered by Imgflip
          </p>
        </div>
      </footer>
    </div>
  );
}
