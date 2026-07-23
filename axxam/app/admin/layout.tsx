import RequireAuth from "@/components/auth/RequireAuth";
import AdminAppShell from "@/components/admin/shell/AdminAppShell";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RequireAuth roles={["admin"]}>
      <AdminAppShell>{children}</AdminAppShell>
    </RequireAuth>
  );
}
