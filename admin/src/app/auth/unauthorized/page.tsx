import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access this area.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            This dashboard is restricted to administrators only. If you believe this is an error, please contact your system administrator.
          </p>
          <div className="flex gap-4 justify-center mt-4">
            <Button asChild variant="outline">
              <Link href="/auth/login">Return to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

