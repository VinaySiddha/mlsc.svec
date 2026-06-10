"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, AlertTriangle, Megaphone } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const DURATION = 5000

// Icon + color per variant
const variantConfig: Record<string, { icon: React.ReactNode; color: string; progressColor: string }> = {
  default: {
    icon: <Megaphone className="h-4 w-4 text-[#4285F4]" />,
    color: "text-[#4285F4]",
    progressColor: "bg-[#4285F4]",
  },
  destructive: {
    icon: <XCircle className="h-4 w-4 text-[#EA4335]" />,
    color: "text-[#EA4335]",
    progressColor: "bg-[#EA4335]",
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-[#34A853]" />,
    color: "text-[#34A853]",
    progressColor: "bg-[#34A853]",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-[#FBBC05]" />,
    color: "text-[#FBBC05]",
    progressColor: "bg-[#FBBC05]",
  },
}

function ToastItem({ id, title, description, action, variant, ...props }: any) {
  const config = variantConfig[variant ?? "default"] ?? variantConfig.default
  const [progress, setProgress] = useState(100)
  const startRef = useRef(Date.now())
  const rafRef = useRef<number>()

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(remaining)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <Toast key={id} variant={variant} {...props}>
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {config.icon}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
        {action}
      </div>

      <ToastClose />

      {/* Progress bar — drains from right to left over DURATION */}
      <div
        className="absolute bottom-0 left-[3px] right-0 h-[2px] bg-white/5 overflow-hidden"
      >
        <div
          className={`h-full transition-none ${config.progressColor} opacity-60`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </Toast>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
