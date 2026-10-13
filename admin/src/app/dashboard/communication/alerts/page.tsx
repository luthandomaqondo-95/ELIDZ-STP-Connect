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
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
            <DashboardPageHeader title="Send Alerts" icon={<BellRing className="h-5 w-5" />} />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Broadcast important ELIDZ announcements, maintenance notices, and urgent operational updates to the right audience in real time.
            </p>
            <div>
                <Card className="w-full min-h-[calc(100vh-8rem)] rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]">
                    <CardHeader>
                        <CardTitle>Broadcast Alert</CardTitle>
                        <CardDescription>
                            Send a system-wide alert or notification to specific user groups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <FloatingLabelSelect
                                label="Target Audience"
                                placeholder="Select audience"
                                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                            >
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="tenants">Tenants Only</SelectItem>
                                <SelectItem value="investors">Investors Only</SelectItem>
                                <SelectItem value="staff">Staff Only</SelectItem>
                            </FloatingLabelSelect>
                            <FloatingLabelSelect
                                label="Alert Type"
                                placeholder="Select type"
                                className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
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
                            className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                        />

                        <FloatingLabelTextarea
                            id="message"
                            label="Message"
                            placeholder="Type your message here..."
                            className="min-h-[140px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                        />

                        <div className="pt-4">
                            <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                Delivery Tips
                            </div>
                            <div className="text-sm space-y-2 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 p-3 sm:p-4 text-orange-900 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] dark:from-orange-900/30 dark:via-amber-900/25 dark:to-rose-900/25 dark:text-orange-100 dark:shadow-[0_10px_26px_-10px_rgba(0,0,0,0.85)]">
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
                            className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:bg-red-700 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)] dark:bg-red-700 dark:hover:bg-red-800"
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
