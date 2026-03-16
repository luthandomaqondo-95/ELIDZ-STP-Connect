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
import { BellRing } from "lucide-react"

export default function SendAlertsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">Send Alerts</h1>
            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Broadcast Alert</CardTitle>
                        <CardDescription>
                            Send a system-wide alert or notification to specific user groups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="target">Target Audience</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select audience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="tenants">Tenants Only</SelectItem>
                                    <SelectItem value="investors">Investors Only</SelectItem>
                                    <SelectItem value="staff">Staff Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Alert Type</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Information</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" placeholder="Alert title" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" placeholder="Type your message here..." className="min-h-[100px]" />
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                         <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <BellRing className="h-4 w-4" />
                            Will push to mobile devices
                        </div>
                        <Button>Send Alert</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Alerts</CardTitle>
                        <CardDescription>
                            History of recently sent alerts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                             {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium">System Maintenance</span>
                                        <span className="text-xs text-muted-foreground">2 hours ago</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Scheduled maintenance will occur on Sunday at 2:00 AM.
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Maintenance</span>
                                        <span className="text-[10px] bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded">All Users</span>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
