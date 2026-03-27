"use client";

import { useState } from "react";
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save, X, ShieldAlert } from "lucide-react"

const ALL_PERMISSIONS = [
  "All Access",
  "Manage Users", 
  "Manage Content",
  "View Reports",
  "View Opportunities",
  "Post Requests",
  "Edit Profile"
]

const DEFAULT_ROLE_PERMISSIONS = {
  "Super Admin": ["All Access"],
  "Admin": ["Manage Users", "Manage Content", "View Reports"],
  "Tenant": ["View Opportunities", "Post Requests", "Edit Profile"],
  "Investor": ["View Opportunities", "View Reports"]
}

export function PermissionsClient({ 
  role, 
  currentUserRole 
}: { 
  role?: string; 
  currentUserRole: "Super Admin";
}) {
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    "Super Admin": DEFAULT_ROLE_PERMISSIONS["Super Admin"],
    "Admin": DEFAULT_ROLE_PERMISSIONS["Admin"], 
    "Tenant": DEFAULT_ROLE_PERMISSIONS["Tenant"],
    "Investor": DEFAULT_ROLE_PERMISSIONS["Investor"]
  })

  const handlePermissionToggle = (targetRole: string, permission: string) => {
    setRolePermissions(prev => {
      const updated = { ...prev }
      const currentPerms = updated[targetRole] || []
      
      if (permission === "All Access") {
        // Super Admin logic - if All Access is toggled, it's the only permission
        updated[targetRole] = currentPerms.includes("All Access") ? [] : ["All Access"]
      } else {
        // For other permissions
        if (currentPerms.includes("All Access")) {
          // Remove All Access if adding specific permissions
          updated[targetRole] = [permission]
        } else {
          // Toggle the specific permission
          updated[targetRole] = currentPerms.includes(permission)
            ? currentPerms.filter(p => p !== permission)
            : [...currentPerms, permission]
        }
      }
      
      return updated
    })
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Here you would save to your backend/database
      console.log('Saving permissions:', rolePermissions)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setHasChanges(false)
      // You could show a success toast here
    } catch (error) {
      console.error('Failed to save permissions:', error)
      // You could show an error toast here
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS)
    setHasChanges(false)
  }

  const filteredRoles = role 
    ? [role].filter(r => rolePermissions.hasOwnProperty(r))
    : Object.keys(rolePermissions)

  return (
    <div className="flex flex-1 flex-col gap-4 pt-0">
      <DashboardPageHeader
        title={role ? `Manage Permissions — ${role}` : "Manage Permissions"}
        backHref="/dashboard/users/roles"
        className="pb-2"
        action={
          hasChanges && (
            <div className="flex gap-2">
              <Button
                variant="outline" 
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )
        }
      />
      
      {/* Super Admin access indicator */}
      <div className="flex items-center gap-2 rounded-lg bg-orange-50 p-3 dark:bg-orange-950/30">
        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <p className="text-sm text-orange-800 dark:text-orange-200">
          Super Admin access confirmed. You can modify permissions for all roles.
        </p>
      </div>

      <p className="max-w-3xl text-sm italic text-muted-foreground">
        Configure which capabilities are granted to each role across the platform.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoles.map((roleName) => (
          <Card key={roleName} className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{roleName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALL_PERMISSIONS.map((permission) => {
                const hasPermission = rolePermissions[roleName]?.includes(permission) || false
                const isSuperAdminPermission = permission === "All Access" && roleName !== "Super Admin"
                
                return (
                  <div key={permission} className="flex items-center justify-between">
                    <Label 
                      htmlFor={`${roleName}-${permission}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {permission}
                    </Label>
                    <Switch
                      id={`${roleName}-${permission}`}
                      checked={hasPermission}
                      onCheckedChange={() => handlePermissionToggle(roleName, permission)}
                      disabled={isSuperAdminPermission || (roleName === "Super Admin" && permission !== "All Access")}
                    />
                  </div>
                )
              })}
              
              {/* Show current permissions as badges */}
              <div className="pt-2 border-t border-border/50">
                <div className="flex flex-wrap gap-1">
                  {rolePermissions[roleName]?.length > 0 ? (
                    rolePermissions[roleName].map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs font-normal">
                        {perm}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No permissions assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
