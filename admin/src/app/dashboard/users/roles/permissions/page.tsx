import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/authz";
import { getAllPermissions, getAllRolePermissions } from "../actions";
import { PermissionsClient } from "./permissions-client";

export default async function ManagePermissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  let currentUser;
  try {
    currentUser = await requireSuperAdmin();
  } catch {
    redirect("/dashboard?error=unauthorized");
  }

  const params = await searchParams;
  const selectedRole = params?.role;

  const [allPermissions, rolePermissions] = await Promise.all([
    getAllPermissions(),
    getAllRolePermissions(),
  ]);

  return (
    <PermissionsClient
      selectedRole={selectedRole}
      currentUserRole={currentUser.role}
      allPermissions={allPermissions}
      initialRolePermissions={rolePermissions}
    />
  );
}
