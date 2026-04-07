"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

import { AnimatedTable } from "@/components/animated-table";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import type { AdminRole } from "@/lib/authz";

type RoleRow = {
  role: string;
  users: number;
  permissions: string[];
  icon: React.ComponentType<{ className?: string }>;
};


const ROLE_FILTER_COLORS: Record<string, string> = {
  All: "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-700/80",
  "Super Admin":
    "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/35 dark:text-orange-200 dark:hover:bg-orange-900/50",
  Admin:
    "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/35 dark:text-indigo-200 dark:hover:bg-indigo-900/50",
  Tenant:
    "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/35 dark:text-purple-200 dark:hover:bg-purple-900/50",
  Investor:
    "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/35 dark:text-rose-200 dark:hover:bg-rose-900/50",
};

function iconForRole(role: string) {
  if (role === "Super Admin") return ShieldAlert;
  if (role === "Admin") return ShieldCheck;
  return Shield;
}

function canEditRole(actorRole: AdminRole) {
  return actorRole === "Super Admin";
}

export function RolesClient({
  actorRole,
  summaries,
}: {
  actorRole: AdminRole;
  summaries: Array<{ role: string; users: number; permissions: string[] }>;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filter, setFilter] = React.useState("All");

  const rows: RoleRow[] = React.useMemo(() => {
    return summaries.map((s) => ({
      role: s.role,
      users: s.users,
      permissions: s.permissions.length > 0 ? s.permissions : ["No permissions assigned"],
      icon: iconForRole(s.role),
    }));
  }, [summaries]);

  const filteredRoles = rows.filter((r) => {
    const search = searchQuery.toLowerCase();
    const matchesSearch =
      r.role.toLowerCase().includes(search) ||
      r.permissions.some((p) => p.toLowerCase().includes(search));
    const matchesFilter = filter === "All" || r.role === filter;
    return matchesSearch && matchesFilter;
  });

  const availableFilters = React.useMemo(() => {
    const base = ["All"];
    const uniqueRoles = Array.from(new Set(rows.map((r) => r.role))).sort((a, b) =>
      a.localeCompare(b)
    );
    return base.concat(uniqueRoles);
  }, [rows]);

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title="User Roles"
        icon={<ShieldCheck className="h-5 w-5" />}
        action={
          <Link href="/dashboard/users/roles/permissions">
            <AnimatedDashboardButton label="Manage Permissions" />
          </Link>
        }
      />

      <div className="space-y-3">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 rounded-3xl border-orange-200/60 bg-white/80 pl-10 shadow-sm dark:bg-slate-900/60 dark:border-orange-800/40"
          />
        </div>

        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-orange-200/70 dark:border-orange-800/40" />
          </div>
          <div className="relative flex justify-start">
            <span className="rounded-full bg-background px-3 text-xs font-medium uppercase tracking-wide text-orange-600 dark:text-orange-300">
              Filters
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableFilters.map((roleName) => (
            <Button
              key={roleName}
              variant="ghost"
              size="sm"
              onClick={() => setFilter(roleName)}
              className={`h-9 rounded-3xl px-4 border-0 shadow-none transition-all ${
                filter === roleName
                  ? "bg-orange-500 text-white hover:bg-orange-500/90"
                  : ROLE_FILTER_COLORS[roleName] ??
                    ROLE_FILTER_COLORS.All
              }`}
            >
              <span
                className={`mr-2 inline-block h-2 w-2 rounded-full ${
                  filter === roleName ? "bg-emerald-400" : "bg-zinc-400"
                }`}
              />
              {roleName}
            </Button>
          ))}
        </div>
      </div>

      <AnimatedTable
        columns={[
          { header: "", className: "w-[50px]" },
          { header: "Role Name" },
          { header: "Active Users" },
          { header: "Permissions" },
          { header: "Actions", align: "right", className: "w-[100px]" },
        ]}
        data={filteredRoles}
        emptyMessage="No roles found."
        theme="orange"
        renderRow={(role: RoleRow) => {
          const editable = canEditRole(actorRole);
          return (
            <>
              <TableCell>
                <role.icon className="h-4 w-4 text-muted-foreground" />
              </TableCell>
              <TableCell className="font-medium">{role.role}</TableCell>
              <TableCell>{role.users}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((perm) => (
                    <Badge key={perm} variant="secondary" className="text-xs font-normal">
                      {perm}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!editable}
                  title={!editable ? "Only Super Admin can edit permissions" : undefined}
                  onClick={() => router.push(`/dashboard/users/roles/permissions?role=${encodeURIComponent(role.role)}`)}
                >
                  Edit
                </Button>
              </TableCell>
            </>
          );
        }}
      />
    </div>
  );
}

