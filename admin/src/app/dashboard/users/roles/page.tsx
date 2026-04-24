import { requireSuperAdmin, type AdminRole } from "@/lib/authz";
import { getRoleSummaries } from "./actions";
import { RolesClient } from "./roles-client";
import { redirect } from "next/navigation";

export default async function UserRolesPage() {
  let role: AdminRole = "Super Admin";
  try {
    const currentUser = await requireSuperAdmin();
    role = currentUser.role;
  } catch {
    redirect("/dashboard?error=unauthorized");
  }
  const summaries = await getRoleSummaries();

  return <RolesClient actorRole={role} summaries={summaries} />;
}
