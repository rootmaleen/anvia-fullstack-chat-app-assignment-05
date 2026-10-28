import { createRootRoute, Outlet } from "@tanstack/react-router";
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

  return (
    <div className="flex h-screen bg-[#212121] text-gray-100">
      <Sidebar sessions={sessions} />
      <main className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
