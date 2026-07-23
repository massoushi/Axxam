import RequireAuth from "@/components/auth/RequireAuth";
import AgencyShell from "@/components/agency/shell/AgencyShell";

export default function AgenceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["agency", "admin"]}>
      <AgencyShell>{children}</AgencyShell>
    </RequireAuth>
  );
}
