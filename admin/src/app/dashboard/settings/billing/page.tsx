"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard-page-header"

export default function BillingSettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Billing & Model" backHref="/dashboard/settings" />
            
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader>
                    <div className="flex justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>You are currently on the Enterprise Plan.</CardDescription>
                        </div>
                        <Badge className="rounded-full bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-200">Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">R 15,000 / month</div>
                    <p className="text-muted-foreground text-sm">Next billing date: April 1, 2024</p>
                </CardContent>
                 <CardDescription className="px-6 pb-6">
                    <Button variant="outline" className="rounded-3xl border-orange-200/60 dark:border-orange-800/40">Manage Subscription</Button>
                 </CardDescription>
            </Card>

             <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-2xl border border-orange-200/50 bg-orange-50/30 p-4 dark:border-orange-800/35 dark:bg-slate-800/40">
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-12 items-center justify-center rounded-md bg-slate-200 text-xs font-bold dark:bg-slate-600">VISA</div>
                            <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-xs text-muted-foreground">Expires 12/25</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" className="rounded-3xl">Edit</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
