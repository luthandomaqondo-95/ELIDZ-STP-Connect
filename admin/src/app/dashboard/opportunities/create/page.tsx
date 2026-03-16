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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateOpportunityPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
             <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Post New Opportunity</h1>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Opportunity Details</CardTitle>
                            <CardDescription>
                                Fill in the details for the new opportunity.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" placeholder="e.g. Innovation Challenge 2024" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="tender">Tender</SelectItem>
                                            <SelectItem value="challenge">Challenge</SelectItem>
                                            <SelectItem value="funding">Funding</SelectItem>
                                            <SelectItem value="program">Program</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="deadline">Deadline</Label>
                                    <Input id="deadline" type="date" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Describe the opportunity..." className="min-h-[150px]" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" placeholder="e.g. East London IDZ" />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="ghost">Cancel</Button>
                            <Button>Post Opportunity</Button>
                        </CardFooter>
                    </Card>
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>
                                • Be specific about the requirements and eligibility criteria.
                            </p>
                            <p>
                                • Provide clear instructions on how to apply.
                            </p>
                            <p>
                                • Set a realistic deadline to allow applicants enough time.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
