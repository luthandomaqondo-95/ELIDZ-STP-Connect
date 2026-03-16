"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
    Bar, 
    BarChart, 
    CartesianGrid, 
    XAxis, 
    YAxis,
    Tooltip, 
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface DemographicsChartsProps {
    roleData: { name: string; count: number }[]
    locationData: { name: string; count: number }[]
    growthData: { name: string; users: number }[]
    totalUsers: number
}

export function UserDemographicsCharts({ roleData, locationData, growthData, totalUsers }: DemographicsChartsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* User Growth Chart */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>New user registrations over time (Total: {totalUsers})</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={growthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}
                                itemStyle={{ color: 'var(--foreground)' }}
                            />
                            <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            
            {/* User Roles Distribution */}
            <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                    <CardTitle>User Roles</CardTitle>
                    <CardDescription>Distribution of user roles</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="count"
                            >
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Top user locations (Provinces/Cities)</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationData} layout="vertical" margin={{ left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20}>
                                {locationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

