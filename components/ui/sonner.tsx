"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'backdrop-blur-xl bg-white/98 border-2 border-slate-300 shadow-xl rounded-2xl',
          title: '!text-slate-900 font-semibold',
          description: '!text-slate-700',
          actionButton: 'bg-slate-200 !text-slate-900 hover:bg-slate-300 rounded-xl border-2 border-slate-300',
          cancelButton: 'bg-slate-100 !text-slate-700 hover:bg-slate-200 rounded-xl border-2 border-slate-200',
          closeButton: 'bg-slate-100 !text-slate-700 hover:bg-slate-200 border-2 border-slate-200 rounded-lg',
          success: '!bg-emerald-50 !border-emerald-400 shadow-emerald-200/50',
          error: '!bg-red-50 !border-red-400 shadow-red-200/50',
          warning: '!bg-amber-50 !border-amber-400 shadow-amber-200/50',
          info: '!bg-blue-50 !border-blue-400 shadow-blue-200/50',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-600" />,
        info: <InfoIcon className="size-5 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600" />,
        error: <OctagonXIcon className="size-5 text-red-600" />,
        loading: <Loader2Icon className="size-5 animate-spin text-slate-900" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
