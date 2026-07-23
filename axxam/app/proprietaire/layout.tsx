import RequireAuth from "@/components/auth/RequireAuth";
import SiteShell from "@/components/layout/SiteShell";

export default function ProprietaireLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["owner", "admin"]}>
      <SiteShell showFooter={false}>
        <main className="container mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </SiteShell>
    </RequireAuth>
  );
}
