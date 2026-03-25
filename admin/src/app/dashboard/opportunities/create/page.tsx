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
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
    FloatingLabelInput,
    FloatingLabelTextarea,
    FloatingLabelSelect,
    SelectItem,
} from "@/components/floating-input"

export default function CreateOpportunityPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="Post New Opportunity" backHref="/dashboard/opportunities" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Create and publish a new ELIDZ opportunity for tenants, partners, and stakeholders with clear requirements, timelines, and application details.
            </p>
            <div>
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)] w-full min-h-[calc(100vh-8rem)]">
                        <CardHeader>
                            <CardTitle className="text-xl">Opportunity Details</CardTitle>
                            <CardDescription className="text-sm">
                                Fill in the details for the new opportunity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingLabelInput
                                    id="title"
                                    label="Title"
                                    placeholder="e.g. Innovation Challenge 2024"
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                />
                                <FloatingLabelSelect
                                    label="Type"
                                    placeholder="Select type"
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                >
                                    <SelectItem value="tender">Tender</SelectItem>
                                    <SelectItem value="challenge">Challenge</SelectItem>
                                    <SelectItem value="funding">Funding</SelectItem>
                                    <SelectItem value="program">Program</SelectItem>
                                </FloatingLabelSelect>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FloatingLabelInput
                                    id="location"
                                    label="Location"
                                    placeholder="e.g. East London IDZ"
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                />
                                <FloatingLabelInput
                                    id="deadline"
                                    label="Deadline"
                                    type="date"
                                    className="h-11 rounded-3xl border-transparent bg-orange-100/80 px-4 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <FloatingLabelTextarea
                                    id="description"
                                    label="Description"
                                    placeholder="Describe the opportunity..."
                                    className="min-h-[150px] rounded-3xl border-transparent bg-orange-100/80 px-4 py-3 text-zinc-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-100"
                                />
                            </div>

                            {/* Tips section inside the main card, at the bottom */}
                            <div className="pt-4">
                                <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Tips
                                </div>
                                <div className="text-sm space-y-2 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 p-4 text-orange-900 ring-1 ring-orange-200/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:from-orange-900/30 dark:via-amber-900/25 dark:to-rose-900/25 dark:text-orange-100 dark:ring-orange-800/40">
                                    <p>• Be specific about the requirements and eligibility criteria.</p>
                                    <p>• Provide clear instructions on how to apply.</p>
                                    <p>• Set a realistic deadline to allow applicants enough time.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center gap-2">
                            <Button
                                variant="outline"
                                className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-sm hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                            >
                                Cancel
                            </Button>
                            <AnimatedDashboardButton label="Post Opportunity" className="h-10 rounded-3xl px-5" />
                        </CardFooter>
                    </Card>
            </div>
        </div>
    );
}
