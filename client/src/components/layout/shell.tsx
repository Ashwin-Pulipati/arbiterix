import { Sidebar } from "./sidebar";

export function Shell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="flex h-full w-full bg-background">
      <Sidebar />
      <main
        id="main"
        role="main"
        className="flex-1 overflow-y-auto bg-background/50 relative focus:outline-none"
      >
        <div className="h-full w-full p-8 space-y-8">{children}</div>
      </main>
    </div>
  );
}
