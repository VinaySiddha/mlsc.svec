"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastAction,
} from "@/components/ui/toast"
import { CheckCircle2, XCircle, AlertTriangle, Megaphone, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const DURATION = 5000

// Icon + color per variant
const variantConfig: Record<string, { icon: React.ReactNode; color: string; progressColor: string }> = {
  default: {
    icon: <Megaphone className="h-4.5 w-4.5 text-white/70" />,
    color: "text-white/70",
    progressColor: "bg-white/20",
  },
  info: {
    icon: <Megaphone className="h-4.5 w-4.5 text-[#4285F4]" />,
    color: "text-[#4285F4]",
    progressColor: "bg-[#4285F4]",
  },
  success: {
    icon: <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />,
    color: "text-emerald-500",
    progressColor: "bg-emerald-500",
  },
  warning: {
    icon: <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />,
    color: "text-amber-500",
    progressColor: "bg-amber-500",
  },
  danger: {
    icon: <XCircle className="h-4.5 w-4.5 text-red-500" />,
    color: "text-red-500",
    progressColor: "bg-red-500",
  },
  destructive: {
    icon: <XCircle className="h-4.5 w-4.5 text-red-500" />,
    color: "text-red-500",
    progressColor: "bg-red-500",
  },
}

function ToastItem({ id, title, description, action, variant, indicator, actionProps, isLoading, ...props }: any) {
  const config = variantConfig[variant ?? "default"] ?? variantConfig.default
  const [progress, setProgress] = useState(100)
  const startRef = useRef(Date.now())
  const rafRef = useRef<number>()

  useEffect(() => {
    if (isLoading || props.duration === Infinity || props.duration === 0) {
      return
    }
    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const duration = props.duration || DURATION
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isLoading, props.duration])

  const renderAction = () => {
    if (action) return action
    if (actionProps) {
      return (
        <div className="mt-1">
          <ToastAction
            altText={actionProps.children || "Action"}
            onClick={actionProps.onClick || actionProps.onPress}
            className={cn(
              "bg-white/10 text-white border-white/10 hover:bg-white/20 h-7 text-[10px] font-bold uppercase tracking-wider",
              variant === "success" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/30",
              variant === "warning" && "bg-amber-500/20 text-amber-300 border-amber-500/20 hover:bg-amber-500/30",
              (variant === "danger" || variant === "destructive") && "bg-red-500/20 text-red-300 border-red-500/20 hover:bg-red-500/30",
              actionProps.className
            )}
          >
            {actionProps.children}
          </ToastAction>
        </div>
      )
    }
    return null
  }

  return (
    <Toast key={id} variant={variant} {...props}>
      {/* Icon / Indicator */}
      <div className="shrink-0 mt-0.5">
        {isLoading ? (
          <Loader2 className="h-4.5 w-4.5 animate-spin text-white/50" />
        ) : (
          indicator ?? config.icon
        )}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex flex-col gap-0.5">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
        {renderAction()}
      </div>

      <ToastClose />

      {/* Progress bar — drains from right to left */}
      {!isLoading && props.duration !== Infinity && props.duration !== 0 && (
        <div
          className="absolute bottom-0 left-[3px] right-0 h-[2px] bg-white/5 overflow-hidden"
        >
          <div
            className={`h-full transition-none ${config.progressColor} opacity-60`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
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
