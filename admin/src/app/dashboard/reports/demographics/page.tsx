"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Jan", users: 400 },
  { name: "Feb", users: 300 },
  { name: "Mar", users: 550 },
  { name: "Apr", users: 480 },
  { name: "May", users: 600 },
  { name: "Jun", users: 700 },
]

export default function UserDemographicsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">User Demographics</h1>
            
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>New user registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="users" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>User Roles</CardTitle>
                        <CardDescription>Distribution of user roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Tenants</span>
                                    <span className="font-medium">65%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-full w-[65%] rounded-full bg-primary" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Investors</span>
                                    <span className="font-medium">20%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-full w-[20%] rounded-full bg-primary" />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Staff</span>
                                    <span className="font-medium">15%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-secondary">
                                    <div className="h-full w-[15%] rounded-full bg-primary" />
                                </div>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
