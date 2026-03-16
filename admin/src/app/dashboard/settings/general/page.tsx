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

export default function GeneralSettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Platform Information</CardTitle>
                    <CardDescription>
                        Manage general details about the STP Connect platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input id="platform-name" defaultValue="ELIDZ STP Connect" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input id="support-email" defaultValue="support@elidz.co.za" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Changes</Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                            <span>Dark Mode</span>
                            <span className="font-normal text-xs text-muted-foreground">Enable dark theme for the dashboard</span>
                        </Label>
                        <Switch id="dark-mode" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
