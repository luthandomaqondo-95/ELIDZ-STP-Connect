"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DashboardPageHeader } from "@/components/dashboard-page-header"

export default function SecuritySettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Security Settings" backHref="/dashboard/settings" />
            
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                        Manage password policies and two-factor authentication.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="2fa" className="flex flex-col space-y-1">
                            <span>Two-Factor Authentication</span>
                            <span className="font-normal text-xs text-muted-foreground">Require 2FA for all admin accounts</span>
                        </Label>
                        <Switch id="2fa" defaultChecked />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-expiry">Password Expiry (Days)</Label>
                        <Input id="password-expiry" type="number" defaultValue="90" className="h-11 max-w-xs rounded-2xl border-orange-200/60 bg-white/80 dark:border-orange-800/40 dark:bg-slate-900/60" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="rounded-3xl">Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
