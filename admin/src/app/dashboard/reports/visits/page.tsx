"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Mon", visits: 120 },
  { name: "Tue", visits: 150 },
  { name: "Wed", visits: 180 },
  { name: "Thu", visits: 140 },
  { name: "Fri", visits: 200 },
  { name: "Sat", visits: 90 },
  { name: "Sun", visits: 60 },
]

export default function ProductLineVisitsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">Product Line Visits</h1>
            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Traffic</CardTitle>
                        <CardDescription>Number of visits per day for the current week</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="visits" stroke="var(--primary)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
