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
import { CreditCard } from "lucide-react"
import { DASHBOARD_CARD_CLASS } from "@/lib/utils"

export default function BillingSettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
            <DashboardPageHeader title="Billing & Model" icon={<CreditCard className="h-5 w-5" />} />
            
            <Card className={DASHBOARD_CARD_CLASS}>
                <CardHeader>
                    <div className="flex justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>You are currently on the Enterprise Plan.</CardDescription>
                        </div>
                        <Badge>Active</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">R 15,000 / month</div>
                    <p className="text-muted-foreground text-sm">Next billing date: April 1, 2024</p>
                </CardContent>
                 <CardDescription className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <Button variant="outline">Manage Subscription</Button>
                 </CardDescription>
            </Card>

             <Card className={DASHBOARD_CARD_CLASS}>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-3xl bg-white/80 p-3 sm:p-4 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] dark:bg-slate-900/60 dark:shadow-[0_10px_26px_-10px_rgba(0,0,0,0.85)]">
                        <div className="flex items-center gap-4">
                            <div className="flex h-8 w-12 items-center justify-center rounded-lg bg-slate-200 text-xs font-bold shadow-[0_4px_10px_-2px_rgba(0,0,0,0.4)] dark:bg-slate-700 dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.85)]">VISA</div>
                            <div>
                                <p className="font-medium">•••• •••• •••• 4242</p>
                                <p className="text-xs text-muted-foreground">Expires 12/25</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
