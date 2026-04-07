import { redirect } from "next/navigation"

// This report has been superseded by Platform Engagement.
export default function SystemUsagePage() {
    redirect("/dashboard/reports/engagement")
}
