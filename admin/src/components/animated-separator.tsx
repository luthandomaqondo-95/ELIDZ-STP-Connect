"use client"

import { motion } from "framer-motion"

interface AnimatedSeparatorProps {
	className?: string
	fullWidth?: boolean
	lineClassName?: string
	color?: string
	showCenterDot?: boolean
}

export function AnimatedSeparator({
	className = "",
	fullWidth = false,
	lineClassName = "",
	color = "#a855f7",
	showCenterDot = true,
}: AnimatedSeparatorProps) {
	const defaultLineWidth = "w-12 sm:w-16 md:w-20 lg:w-24"
	return (
		<motion.div
			className={`${fullWidth ? "flex w-full" : "inline-flex"} items-center justify-center ${showCenterDot ? "gap-3" : "gap-0"} mb-6 md:mb-8 ${className}`}
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			transition={{ duration: 0.6, delay: 0.2 }}
			viewport={{ once: true }}
		>
			<motion.div
				className={`${fullWidth ? "flex-1" : lineClassName || defaultLineWidth} h-px`}
				style={{ backgroundImage: `linear-gradient(to right, transparent, ${color}, ${color})` }}
				initial={{ scaleX: 0 }}
				whileInView={{ scaleX: 1 }}
				transition={{ duration: 0.8, delay: 0.3 }}
				viewport={{ once: true }}
			/>
			{showCenterDot && (
				<motion.div
					className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
					style={{ backgroundColor: color }}
					initial={{ scale: 0 }}
					whileInView={{ scale: 1 }}
					transition={{ duration: 0.4, delay: 0.5, type: "spring", stiffness: 200 }}
					viewport={{ once: true }}
				/>
			)}
			<motion.div
				className={`${fullWidth ? "flex-1" : lineClassName || defaultLineWidth} h-px`}
				style={{ backgroundImage: `linear-gradient(to left, transparent, ${color}, ${color})` }}
				initial={{ scaleX: 0 }}
				whileInView={{ scaleX: 1 }}
				transition={{ duration: 0.8, delay: 0.3 }}
				viewport={{ once: true }}
			/>
		</motion.div>
	)
}

