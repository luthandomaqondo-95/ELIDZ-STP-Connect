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
import { Switch } from "@/components/ui/switch"
import { DashboardPageHeader } from "@/components/dashboard-page-header"
import { Lock } from "lucide-react"
import { DASHBOARD_CARD_CLASS } from "@/lib/utils"

export default function SecuritySettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-3 sm:gap-4 pt-0">
            <DashboardPageHeader title="Security Settings" icon={<Lock className="h-5 w-5" />} />
            
            <Card className={DASHBOARD_CARD_CLASS}>
                <CardHeader>
                    <CardTitle>Authentication</CardTitle>
                    <CardDescription>
                        Manage password policies and two-factor authentication.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="2fa" className="flex flex-col space-y-1">
                            <span>Two-Factor Authentication</span>
                            <span className="font-normal text-xs text-muted-foreground">Require 2FA for all admin accounts</span>
                        </Label>
                        <Switch id="2fa" defaultChecked />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-expiry">Password Expiry (Days)</Label>
                        <Input id="password-expiry" type="number" defaultValue="90" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
