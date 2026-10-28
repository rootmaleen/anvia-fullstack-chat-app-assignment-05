import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "../components/header";
import { Sidebar, type SessionSummary } from "../components/sidebar";

export const Route = createRootRoute({
  loader: async () => {
    const response = await fetch("/api/sessions");
    const sessions: SessionSummary[] = await response.json();
    return sessions;
  },
  component: Root,
});

function Root() {
  const sessions = Route.useLoaderData();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-white text-ink">
      <Sidebar sessions={sessions} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMenu={() => setMenuOpen(true)} />
        <Outlet />
      </main>
    </div>
  );
}
