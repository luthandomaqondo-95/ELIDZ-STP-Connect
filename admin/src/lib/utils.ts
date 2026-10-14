import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DASHBOARD_CARD_CLASS =
  "rounded-3xl border-0 bg-white/90 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45),0_6px_14px_rgba(0,0,0,0.18)] backdrop-blur-sm dark:bg-slate-900/75 dark:shadow-[0_18px_40px_-10px_rgba(0,0,0,0.85),0_6px_14px_rgba(0,0,0,0.55)]"

export const FILTER_ROW_CLASS =
  "-mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0"

export const MODAL_FIELD_CLASS =
  "h-10 sm:h-11 rounded-3xl border-0 bg-slate-50 shadow-[inset_0_2px_6px_rgba(0,0,0,0.22),0_1px_2px_rgba(0,0,0,0.12)] focus-visible:ring-orange-400/60 focus:ring-orange-400/60 dark:bg-gray-800 dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.75),0_1px_2px_rgba(0,0,0,0.6)]"

export const MODAL_CANCEL_BUTTON_CLASS =
  "h-10 min-w-28 rounded-3xl border-0 bg-white px-5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:bg-slate-50 dark:bg-slate-800 dark:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.85)] dark:hover:bg-slate-700"
