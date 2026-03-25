"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { AnimatedTable } from "@/components/animated-table"
import { TableCell } from "@/components/ui/table"

const systemLogs = [
    {
        event: "Database Backup",
        details: "Completed successfully",
        status: "Success",
        timestamp: "2024-03-12 02:00:00",
    },
    {
        event: "Security Scan",
        details: "No threats detected",
        status: "Success",
        timestamp: "2024-03-11 23:15:00",
    },
    {
        event: "API Gateway",
        details: "Latency normalized",
        status: "Success",
        timestamp: "2024-03-11 19:42:00",
    },
    {
        event: "Storage Sync",
        details: "Replication completed",
        status: "Success",
        timestamp: "2024-03-11 16:08:00",
    },
    {
        event: "Service Health Check",
        details: "All systems operational",
        status: "Success",
        timestamp: "2024-03-11 09:30:00",
    },
]

export default function SystemUsagePage() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <DashboardPageHeader title="System Usage" backHref="/dashboard/reports" />
            <p className="max-w-3xl text-sm italic text-muted-foreground">
                Monitor infrastructure health, resource consumption, and platform activity to maintain stable operations across ELIDZ systems.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Server Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">99.98%</div>
                        <p className="text-xs text-muted-foreground">Last 30 days</p>
                    </CardContent>
                </Card>
                 <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">1.2 TB</div>
                        <p className="text-xs text-muted-foreground">of 5 TB capacity</p>
                    </CardContent>
                </Card>
                 <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">API Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">1.5M</div>
                        <p className="text-xs text-muted-foreground">+12% from last month</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="rounded-3xl border-0 bg-white/90 shadow-[0_10px_30px_rgba(2,6,23,0.08)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_10px_30px_rgba(2,6,23,0.35)]">
                <CardHeader>
                    <CardTitle>System Logs</CardTitle>
                    <CardDescription>Recent system activities and events</CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatedTable
                        columns={[
                            { header: "Event" },
                            { header: "Details" },
                            { header: "Status" },
                            { header: "Timestamp", align: "right" },
                        ]}
                        data={systemLogs}
                        emptyMessage="No system logs available."
                        theme="orange"
                        renderRow={(log) => (
                            <>
                                <TableCell className="font-medium">{log.event}</TableCell>
                                <TableCell className="text-muted-foreground">{log.details}</TableCell>
                                <TableCell>
                                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">{log.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">{log.timestamp}</TableCell>
                            </>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
