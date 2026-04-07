"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { saveRolePermissions, type PermissionDef } from "../actions";

const ROLE_ORDER = ["Super Admin", "Admin", "Entrepreneur", "Tenant", "Investor"];

export function PermissionsClient({
  selectedRole,
  currentUserRole,
  allPermissions,
  initialRolePermissions,
}: {
  selectedRole?: string;
  currentUserRole: "Super Admin";
  allPermissions: PermissionDef[];
  initialRolePermissions: Record<string, string[]>;
}) {
  const router = useRouter();
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>(
    initialRolePermissions
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedRole, setSavedRole] = useState<string | null>(null);

  const permissionsByCategory = useMemo(() => {
    const map = new Map<string, PermissionDef[]>();
    for (const perm of allPermissions) {
      const arr = map.get(perm.category) ?? [];
      arr.push(perm);
      map.set(perm.category, arr);
    }
    return map;
  }, [allPermissions]);

  const allRoles = useMemo(() => {
    const fromDB = Object.keys(rolePermissions);
    const ordered = ROLE_ORDER.filter((r) => fromDB.includes(r));
    const rest = fromDB.filter((r) => !ROLE_ORDER.includes(r)).sort();
    return [...ordered, ...rest];
  }, [rolePermissions]);

  const displayedRoles = selectedRole
    ? allRoles.filter((r) => r === selectedRole)
    : allRoles;

  const handleToggle = (targetRole: string, key: string) => {
    if (targetRole === "Super Admin") return;
    setRolePermissions((prev) => {
      const current = new Set(prev[targetRole] ?? []);
      current.has(key) ? current.delete(key) : current.add(key);
      return { ...prev, [targetRole]: Array.from(current) };
    });
    setHasChanges(true);
    setSaveError(null);
    setSavedRole(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const rolesToSave = displayedRoles.filter((r) => r !== "Super Admin");
    for (const role of rolesToSave) {
      const result = await saveRolePermissions(role, rolePermissions[role] ?? []);
      if (!result.success) {
        setSaveError(result.error ?? "Unknown error");
        setIsSaving(false);
        return;
      }
    }

    setHasChanges(false);
    setIsSaving(false);
    setSavedRole(selectedRole ?? "all");
    router.refresh();
  };

  const handleReset = () => {
    setRolePermissions(initialRolePermissions);
    setHasChanges(false);
    setSaveError(null);
    setSavedRole(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title={selectedRole ? `Manage Permissions — ${selectedRole}` : "Manage Permissions"}
        backHref="/dashboard/users/roles"
        className="pb-2"
        action={
          hasChanges ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/30">
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <p className="text-sm text-orange-800 dark:text-orange-200">
          Super Admin access confirmed. You can modify permissions for all roles.
        </p>
      </div>

      {saveError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          Failed to save: {saveError}
        </div>
      )}

      {savedRole && !hasChanges && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            Permissions saved successfully.
          </p>
        </div>
      )}

      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Configure which capabilities are granted to each role. Super Admin always retains full
        access and cannot be modified.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedRoles.map((roleName) => {
          const isSuperAdmin = roleName === "Super Admin";
          const assigned = new Set(rolePermissions[roleName] ?? []);

          return (
            <Card
              key={roleName}
              className="flex flex-col rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{roleName}</CardTitle>
                  {isSuperAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Full Access
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {assigned.size} of {allPermissions.length} permissions
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {Array.from(permissionsByCategory.entries()).map(([category, perms]) => (
                  <div key={category}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {category}
                    </p>
                    <div className="space-y-2">
                      {perms.map((perm) => {
                        const isAssigned = isSuperAdmin || assigned.has(perm.permission_key);
                        return (
                          <div key={perm.permission_key} className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Label
                                htmlFor={`${roleName}-${perm.permission_key}`}
                                className="cursor-pointer text-sm font-normal leading-tight"
                              >
                                {perm.name}
                              </Label>
                              <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                {perm.description}
                              </p>
                            </div>
                            <Switch
                              id={`${roleName}-${perm.permission_key}`}
                              checked={isAssigned}
                              onCheckedChange={() => handleToggle(roleName, perm.permission_key)}
                              disabled={isSuperAdmin}
                              className="shrink-0 mt-0.5"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
