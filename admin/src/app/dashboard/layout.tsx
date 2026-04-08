import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumb } from "@/components/ui/dynamic-breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function Page({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userData = {
        name: "Guest",
        email: "",
        avatar: "",
        role: ""
    }

    if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        userData = {
            name: profile?.name || user.email || "User",
            email: user.email || "",
            avatar: profile?.avatar || "",
            role: profile?.role || ""
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar user={userData} />
            <SidebarInset>
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-1 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-2 md:px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
                        <DynamicBreadcrumb />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 px-2 md:px-4 py-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
