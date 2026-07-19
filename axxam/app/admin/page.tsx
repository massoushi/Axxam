import AdminAgenciesPanel from "@/components/admin/AdminAgenciesPanel";
import AdminModerationDashboard from "@/components/admin/AdminModerationDashboard";

export default function AdminPage() {
  return (
    <>
      <AdminModerationDashboard />
      <AdminAgenciesPanel />
    </>
  );
}
