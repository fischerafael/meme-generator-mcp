import { NavLink, Outlet, Link } from "react-router";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

const links = [
  { to: "/setup", label: "Setup" },
  { to: "/templates", label: "Templates" },
  { to: "/playground", label: "Playground" },
];

export function Layout() {
  const hasToken = useAuthStore((s) => !!s.token);
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <nav className="mx-auto flex h-14 max-w-5xl items-center gap-1 px-4">
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
                  "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
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
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Memes rendered by Imgflip. Your credentials live only inside your encrypted token.
      </footer>
    </div>
  );
}
