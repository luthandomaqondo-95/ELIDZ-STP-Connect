"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { deleteTenant } from "../actions"

export function DeleteTenantButton({ tenantId }: { tenantId: string }) {
  const router = useRouter()
  const [pending, startTransition] = React.useTransition()

  async function handleDelete() {
    if (
      !confirm(
        "Are you sure you want to delete this tenant? Opportunities linked to it may be affected."
      )
    ) {
      return
    }

    startTransition(async () => {
      const result = await deleteTenant(tenantId)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Tenant deleted.")
      router.push("/dashboard/tenants")
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
      {pending ? "Deleting..." : "Delete Tenant"}
    </Button>
  )
}
