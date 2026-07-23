import AgencyOwnersPanel from "@/components/agency/AgencyOwnersPanel";
import AgencyAssignPanel from "@/components/agency/AgencyAssignPanel";

export default function AgenceProprietairesPage() {
  return (
    <div className="space-y-10">
      <AgencyOwnersPanel />
      <AgencyAssignPanel />
    </div>
  );
}
