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
import { FilePlus2 } from "lucide-react"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
    FloatingLabelInput,
    FloatingLabelTextarea,
    FloatingLabelSelect,
    SelectItem,
} from "@/components/floating-input"

export default function CreateOpportunityPage() {
    return (
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
            <DashboardPageHeader title="Post New Opportunity" icon={<FilePlus2 className="h-5 w-5" />} />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Create and publish a new ELIDZ opportunity for tenants, partners, and stakeholders with clear requirements, timelines, and application details.
            </p>
            <div>
                <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)] w-full min-h-[calc(100vh-8rem)]">
                        <CardHeader>
                            <CardTitle className="text-xl">Opportunity Details</CardTitle>
                            <CardDescription className="text-sm">
                                Fill in the details for the new opportunity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <FloatingLabelInput
                                    id="title"
                                    label="Title"
                                    placeholder="e.g. Innovation Challenge 2024"
                                    className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                                />
                                <FloatingLabelSelect
                                    label="Type"
                                    placeholder="Select type"
                                    className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                                >
                                    <SelectItem value="tender">Tender</SelectItem>
                                    <SelectItem value="challenge">Challenge</SelectItem>
                                    <SelectItem value="funding">Funding</SelectItem>
                                    <SelectItem value="program">Program</SelectItem>
                                </FloatingLabelSelect>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                <FloatingLabelInput
                                    id="location"
                                    label="Location"
                                    placeholder="e.g. East London IDZ"
                                    className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                                />
                                <FloatingLabelInput
                                    id="deadline"
                                    label="Deadline"
                                    type="date"
                                    className="h-10 rounded-3xl border-transparent bg-orange-100/80 px-3 sm:h-11 sm:px-4 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                                />
                            </div>
                            <div>
                                <FloatingLabelTextarea
                                    id="description"
                                    label="Description"
                                    placeholder="Describe the opportunity..."
                                    className="min-h-[150px] rounded-3xl border-transparent bg-orange-100/80 px-3 py-2.5 sm:px-4 sm:py-3 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] dark:bg-slate-800/80 dark:text-slate-100 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"
                                />
                            </div>

                            {/* Tips section inside the main card, at the bottom */}
                            <div className="pt-4">
                                <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    Tips
                                </div>
                                <div className="text-sm space-y-2 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 p-3 sm:p-4 text-orange-900 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] dark:from-orange-900/30 dark:via-amber-900/25 dark:to-rose-900/25 dark:text-orange-100 dark:shadow-[0_10px_26px_-10px_rgba(0,0,0,0.85)]">
                                    <p>• Be specific about the requirements and eligibility criteria.</p>
                                    <p>• Provide clear instructions on how to apply.</p>
                                    <p>• Set a realistic deadline to allow applicants enough time.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center gap-2">
                            <Button
                                variant="outline"
                                className="h-10 rounded-3xl border-0 bg-red-600 px-5 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:bg-red-700 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)] dark:bg-red-700 dark:hover:bg-red-800"
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
