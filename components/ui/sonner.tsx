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
          toast: 'backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl',
          title: 'text-white font-semibold',
          description: 'text-white/80',
          actionButton: 'bg-white/20 text-white hover:bg-white/30',
          cancelButton: 'bg-white/10 text-white/70 hover:bg-white/20',
          closeButton: 'bg-white/10 text-white/70 hover:bg-white/20 border-white/10',
          success: 'backdrop-blur-xl bg-emerald-500/20 border-emerald-400/30',
          error: 'backdrop-blur-xl bg-red-500/20 border-red-400/30',
          warning: 'backdrop-blur-xl bg-amber-500/20 border-amber-400/30',
          info: 'backdrop-blur-xl bg-blue-500/20 border-blue-400/30',
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin text-white" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
