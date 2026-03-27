import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/authz"
import { PermissionsClient } from "./permissions-client"

export default async function ManagePermissionsPage({
  searchParams,
}: {
  searchParams?: { role?: string };
}) {
  // Server-side access control
  let currentUser;
  try {
    currentUser = await requireSuperAdmin();
  } catch (error) {
    // Redirect to unauthorized page or dashboard if not Super Admin
    redirect('/dashboard?error=unauthorized');
  }

  const role = searchParams?.role

  return (
    <PermissionsClient 
      role={role} 
      currentUserRole={currentUser.role}
    />
  )
}
