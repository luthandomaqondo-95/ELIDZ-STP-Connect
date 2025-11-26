import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Activity, Briefcase, Users, Zap } from "lucide-react"

export default function Page() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Overview</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">1,234</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Active Opportunities</h3>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">23</div>
                                <p className="text-xs text-muted-foreground">+4 new this week</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">Product Line Visits</h3>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">573</div>
                                <p className="text-xs text-muted-foreground">+19% since last hour</p>
                            </div>
                        </div>
                        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                                <h3 className="tracking-tight text-sm font-medium">System Health</h3>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 pt-0">
                                <div className="text-2xl font-bold">99.9%</div>
                                <p className="text-xs text-muted-foreground">All systems operational</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-col space-y-1.5">
                                <h3 className="font-semibold leading-none tracking-tight">User Registrations</h3>
                                <p className="text-sm text-muted-foreground">Overview of user growth and demographics.</p>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="h-[300px] w-full bg-muted/10 rounded-md flex items-center justify-center border border-dashed">
                                    <div className="text-center">
                                        <p className="text-muted-foreground text-sm">Chart Area: User Growth by Region</p>
                                        <p className="text-xs text-muted-foreground mt-1">(East London, Port Elizabeth, etc.)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm">
                            <div className="p-6 flex flex-col space-y-1.5">
                                <h3 className="font-semibold leading-none tracking-tight">Popular Services</h3>
                                <p className="text-sm text-muted-foreground">Most visited product lines this month.</p>
                            </div>
                            <div className="p-6 pt-0">
                                <div className="space-y-6">
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">FW</div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Food & Water Lab</p>
                                            <p className="text-sm text-muted-foreground">450 visits</p>
                                        </div>
                                        <div className="ml-auto font-medium">35%</div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">RE</div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Renewable Energy</p>
                                            <p className="text-sm text-muted-foreground">320 visits</p>
                                        </div>
                                        <div className="ml-auto font-medium">28%</div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">DC</div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Design Centre</p>
                                            <p className="text-sm text-muted-foreground">210 visits</p>
                                        </div>
                                        <div className="ml-auto font-medium">15%</div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">AM</div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">Automotive Incubator</p>
                                            <p className="text-sm text-muted-foreground">150 visits</p>
                                        </div>
                                        <div className="ml-auto font-medium">12%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
