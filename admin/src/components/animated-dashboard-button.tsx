"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Loader2 } from "lucide-react"

interface AnimatedDashboardButtonProps {
    label?: string
    isLoading?: boolean
    className?: string
    type?: "button" | "submit" | "reset"
    disabled?: boolean
    onClick?: () => void
    variant?: "blue" | "green"
}

export function AnimatedDashboardButton({
    label = "Dashboard",
    isLoading = false,
    className = "",
    type = "button",
    disabled = false,
    onClick,
    variant = "blue",
}: AnimatedDashboardButtonProps) {
    const palette = variant === "green"
        ? {
            textClass: "text-emerald-50",
            hoverShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.45)",
            colors: ["rgb(5, 150, 105)", "rgb(4, 120, 87)", "rgb(5, 150, 105)"],
            pulse: ["0 0 0 0 rgba(5, 150, 105, 0.4)", "0 0 0 10px rgba(5, 150, 105, 0)"],
        }
        : {
            textClass: "text-orange-100",
            hoverShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.45)",
            colors: ["rgb(30, 58, 138)", "rgb(30, 64, 175)", "rgb(30, 58, 138)"],
            pulse: ["0 0 0 0 rgba(30, 58, 138, 0.4)", "0 0 0 10px rgba(30, 58, 138, 0)"],
        }

    return (
        <motion.button
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            aria-busy={isLoading}
            className={`apple-button rounded-full px-6 h-12 text-sm font-semibold shadow-sm relative overflow-hidden cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${palette.textClass} ${className}`}
            whileHover={{
                scale: 1.05,
                boxShadow: palette.hoverShadow,
            }}
            whileTap={{ scale: 0.95 }}
            initial={{
                backgroundColor: palette.colors[0],
            }}
            animate={{
                backgroundColor: palette.colors,
                boxShadow: palette.pulse,
            }}
            transition={{
                backgroundColor: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                },
                boxShadow: {
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut"
                }
            }}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{label}</span>
        </motion.button>
    )
} 