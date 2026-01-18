// This layout is now redundant as the root layout contains the Shell.
export default function MainLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <>{children}</>;
}