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
import { BellRing } from "lucide-react"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
    FloatingLabelInput,
    FloatingLabelTextarea,
    FloatingLabelSelect,
    SelectItem,
} from "@/components/floating-input"

export default function SendAlertsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Send Alerts" backHref="/dashboard/communication" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Broadcast important ELIDZ announcements, maintenance notices, and urgent operational updates to the right audience in real time.
            </p>
            <div>
                <Card className="w-full min-h-[calc(100vh-8rem)] rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader>
                        <CardTitle>Broadcast Alert</CardTitle>
                        <CardDescription>
                            Send a system-wide alert or notification to specific user groups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FloatingLabelSelect
                                label="Target Audience"
                                placeholder="Select audience"
                                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                            >
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="tenants">Tenants Only</SelectItem>
                                <SelectItem value="investors">Investors Only</SelectItem>
                                <SelectItem value="staff">Staff Only</SelectItem>
                            </FloatingLabelSelect>
                            <FloatingLabelSelect
                                label="Alert Type"
                                placeholder="Select type"
                                className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                            >
                                <SelectItem value="info">Information</SelectItem>
                                <SelectItem value="warning">Warning</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </FloatingLabelSelect>
                        </div>

                        <FloatingLabelInput
                            id="title"
                            label="Title"
                            placeholder="Alert title"
                            className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                        />

                        <FloatingLabelTextarea
                            id="message"
                            label="Message"
                            placeholder="Type your message here..."
                            className="min-h-[140px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                        />

                        <div className="pt-4">
                            <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Delivery Tips
                            </div>
                            <div className="text-sm space-y-2 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 p-4 text-orange-900 ring-1 ring-orange-200/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:from-orange-900/30 dark:via-amber-900/25 dark:to-rose-900/25 dark:text-orange-100 dark:ring-orange-800/40">
                                <p>• Keep alerts short and action-oriented for faster response.</p>
                                <p>• Use Critical only for urgent incidents to avoid alert fatigue.</p>
                                <p>• Include clear time windows and contact details when relevant.</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center gap-2">
                         <div className="text-xs text-muted-foreground flex items-center gap-2 mr-2">
                            <BellRing className="h-4 w-4" />
                            Will push to mobile devices
                        </div>
                        <Button
                            variant="outline"
                            className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        >
                            Cancel
                        </Button>
                        <AnimatedDashboardButton label="Send Alert" className="h-10 rounded-3xl px-5" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
