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

export default function GeneralSettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="General Settings" backHref="/dashboard/settings" />
            
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader>
                    <CardTitle>Platform Information</CardTitle>
                    <CardDescription>
                        Manage general details about the STP Connect platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input id="platform-name" defaultValue="ELIDZ STP Connect" className="h-11 rounded-2xl border-orange-200/60 bg-white/80 dark:border-orange-800/40 dark:bg-slate-900/60" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input id="support-email" defaultValue="support@elidz.co.za" className="h-11 rounded-2xl border-orange-200/60 bg-white/80 dark:border-orange-800/40 dark:bg-slate-900/60" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="rounded-3xl">Save Changes</Button>
                </CardFooter>
            </Card>

            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                            <span>Dark Mode</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable dark theme for the dashboard</span>
                        </Label>
                        <Switch id="dark-mode" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
