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
          toast: 'backdrop-blur-2xl bg-white/[0.15] border border-white/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] rounded-3xl',
          title: 'text-white font-semibold',
          description: 'text-white/90',
          actionButton: 'bg-white/25 text-white hover:bg-white/35 rounded-2xl backdrop-blur-xl border border-white/20',
          cancelButton: 'bg-white/15 text-white/80 hover:bg-white/25 rounded-2xl backdrop-blur-xl border border-white/20',
          closeButton: 'bg-white/15 text-white/80 hover:bg-white/25 border-white/20 rounded-xl backdrop-blur-xl',
          success: 'backdrop-blur-2xl bg-emerald-500/25 border-emerald-300/40 shadow-[0_8px_32px_0_rgba(16,185,129,0.25)]',
          error: 'backdrop-blur-2xl bg-red-500/25 border-red-300/40 shadow-[0_8px_32px_0_rgba(239,68,68,0.25)]',
          warning: 'backdrop-blur-2xl bg-amber-500/25 border-amber-300/40 shadow-[0_8px_32px_0_rgba(245,158,11,0.25)]',
          info: 'backdrop-blur-2xl bg-blue-500/25 border-blue-300/40 shadow-[0_8px_32px_0_rgba(59,130,246,0.25)]',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-300" />,
        info: <InfoIcon className="size-5 text-blue-300" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-300" />,
        error: <OctagonXIcon className="size-5 text-red-300" />,
        loading: <Loader2Icon className="size-5 animate-spin text-white" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
