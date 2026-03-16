"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function SystemUsagePage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">System Usage</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">99.98%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2 TB</div>
                        <p className="text-xs text-muted-foreground">of 5 TB capacity</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.5M</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>System Logs</CardTitle>
                    <CardDescription>Recent system activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium">Database Backup</p>
                                    <p className="text-muted-foreground text-xs">Completed successfully</p>
                                </div>
                                <span className="text-xs text-muted-foreground">2024-03-12 02:00:00</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
