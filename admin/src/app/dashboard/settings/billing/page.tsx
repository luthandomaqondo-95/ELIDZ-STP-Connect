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

export default function BillingSettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">Billing & Model</h1>
            
            <Card>
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
                 <CardDescription className="px-6 pb-6">
                    <Button variant="outline">Manage Subscription</Button>
                 </CardDescription>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between border p-4 rounded-md">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center text-xs font-bold">VISA</div>
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
