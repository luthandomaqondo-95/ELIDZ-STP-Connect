"use client"

import { useState } from "react"
import { Upload, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface UploadButtonProps {
  onFileSelect?: (files: FileList | null) => void
  accept?: string
  multiple?: boolean
  className?: string
  disabled?: boolean
  isLoading?: boolean
  variant?: "blue" | "green"
  children?: React.ReactNode
}

export function UploadButton({
  onFileSelect,
  accept = "video/*",
  multiple = false,
  className = "",
  disabled = false,
  isLoading = false,
  variant = "blue",
  children
}: UploadButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (onFileSelect) {
      onFileSelect(files)
    }
  }

  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled || isLoading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        style={{ zIndex: 1 }}
      />
      <motion.button
        type="button"
        disabled={disabled || isLoading}
        className={`apple-button rounded-full px-6 h-12 text-sm font-semibold shadow-sm relative overflow-hidden cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${palette.textClass} ${className}`}
        style={{
          background: `linear-gradient(135deg, ${palette.colors[0]}, ${palette.colors[1]})`,
          boxShadow: isHovered ? palette.hoverShadow : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{
          scale: 1.05,
          boxShadow: palette.hoverShadow,
        }}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {children || "Upload Video"}
      </motion.button>
    </motion.div>
  )
}
