"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteOpportunity } from "../actions"

export function DeleteOpportunityButton({ opportunityId }: { opportunityId: string }) {
	const router = useRouter()
	const [pending, startTransition] = React.useTransition()

	async function handleDelete() {
		if (!confirm("Are you sure you want to delete this opportunity? This action cannot be undone.")) return

		startTransition(async () => {
			const result = await deleteOpportunity(opportunityId)
			if (!result.success) {
				toast.error(result.error)
				return
			}

			toast.success("Opportunity deleted.")
			router.push("/dashboard/opportunities")
			router.refresh()
		})
	}

	return (
		<Button
			variant="destructive"
			onClick={handleDelete}
			disabled={pending}
			className="w-full rounded-3xl bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
		>
			{pending ? "Deleting..." : "Delete"}
		</Button>
	)
}

