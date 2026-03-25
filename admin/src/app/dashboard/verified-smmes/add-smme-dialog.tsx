"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AnimatedDashboardButton } from "@/components/animated-dashboard-button"
import {
    Dialog,
    DialogContent, 
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { FloatingLabelInput, FloatingLabelSelect, SelectItem } from "@/components/floating-input"
import { createVerifiedSmme } from "./actions"

export function AddSmmeDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [role, setRole] = useState("SME")

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(event.currentTarget)
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            organization: formData.get("organization") as string,
            role: formData.get("role") as string,
        }

        try {
            await createVerifiedSmme(data)
            setOpen(false)
            setRole("SME")
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <AnimatedDashboardButton label="+ Add Verified SMME" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] rounded-3xl border-0 bg-white/90 p-4 md:p-6 shadow-[0_10px_30px_rgba(2,6,23,0.12)] backdrop-blur-sm dark:bg-slate-900/80 dark:shadow-[0_10px_30px_rgba(2,6,23,0.4)]">
                <form onSubmit={onSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Verified SMME</DialogTitle>
                        <DialogDescription>
                            Add a new SMME user. They will receive an email invite and be automatically verified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2 md:gap-4 md:py-4">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-500 dark:border-red-900/40 dark:bg-red-950/20">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FloatingLabelInput
                                id="name"
                                name="name"
                                label="Name"
                                placeholder="Acme Innovations"
                                className="rounded-3xl bg-gray-800"
                                required
                            />
                            <FloatingLabelInput
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="contact@company.com"
                                className="rounded-3xl bg-gray-800"
                                required
                            />
                            <FloatingLabelInput
                                id="organization"
                                name="organization"
                                label="Organization"
                                placeholder="Acme Group"
                                className="rounded-3xl bg-gray-800"
                                required
                            />
                            <FloatingLabelSelect
                                label="Role"
                                value={role}
                                onValueChange={setRole}
                                className="rounded-3xl bg-gray-800"
                            >
                                <SelectItem value="SME">SME</SelectItem>
                                <SelectItem value="Entrepreneur">Entrepreneur</SelectItem>
                                <SelectItem value="Tenant">Tenant</SelectItem>
                            </FloatingLabelSelect>
                            <input type="hidden" name="role" value={role} />
                        </div>
                    </div>
                    <DialogFooter className="justify-center sm:justify-center">
                        <Button type="button" variant="outline" className="rounded-2xl mt-1" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <AnimatedDashboardButton
                            type="submit"
                            variant="green"
                            disabled={loading}
                            className="rounded-3xl h-10 px-5"
                            label={loading ? "Adding..." : "Add SMME"}
                        />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

