import { requireAdmin } from "@/lib/authz";
import { getRoleSummaries } from "./actions";
import { RolesClient } from "./roles-client";

export default async function UserRolesPage() {
  const { role } = await requireAdmin();
  const summaries = await getRoleSummaries();

  return <RolesClient actorRole={role} summaries={summaries} />;
}
