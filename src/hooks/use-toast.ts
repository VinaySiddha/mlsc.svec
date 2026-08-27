"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 800

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  indicator?: React.ReactNode
  isLoading?: boolean
  actionProps?: {
    children: React.ReactNode
    onPress?: () => void
    onClick?: () => void
    variant?: string
    className?: string
  }
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

interface ToastOptions extends Toast {
  duration?: number;
  timeout?: number;
}

function toast({ duration, timeout, ...props }: ToastOptions) {
  const id = genId()
  // Support both "duration" and "timeout" (often used in HeroUI / other libraries)
  const finalDuration = duration !== undefined ? duration : (timeout !== undefined ? timeout : 5000)

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      duration: finalDuration,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  // Auto-dismiss after finalDuration ms
  if (finalDuration !== Infinity && finalDuration !== 0) {
    setTimeout(dismiss, finalDuration)
  }

  return id;
}

toast.dismiss = (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId })
toast.close = (toastId: string) => dispatch({ type: "DISMISS_TOAST", toastId })
toast.clear = () => dispatch({ type: "DISMISS_TOAST" })

toast.success = (title: string, props?: Omit<ToastOptions, "title">) => {
  return toast({ title, variant: "success", ...props })
}
toast.warning = (title: string, props?: Omit<ToastOptions, "title">) => {
  return toast({ title, variant: "warning", ...props })
}
toast.danger = (title: string, props?: Omit<ToastOptions, "title">) => {
  return toast({ title, variant: "danger", ...props })
}
toast.error = (title: string, props?: Omit<ToastOptions, "title">) => {
  return toast({ title, variant: "danger", ...props })
}
toast.info = (title: string, props?: Omit<ToastOptions, "title">) => {
  return toast({ title, variant: "info", ...props })
}

toast.promise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: any) => string);
  }
) => {
  const id = genId();
  
  dispatch({
    type: "ADD_TOAST",
    toast: {
      id,
      open: true,
      title: messages.loading,
      variant: "info",
      isLoading: true,
      duration: Infinity,
    }
  });

  promise
    .then((data) => {
      const successMsg = typeof messages.success === "function"
        ? messages.success(data)
        : messages.success;
      dispatch({
        type: "UPDATE_TOAST",
        toast: {
          id,
          title: successMsg,
          variant: "success",
          isLoading: false,
          duration: 5000,
        }
      });
      setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST", toastId: id });
      }, 5000);
    })
    .catch((err) => {
      const errorMsg = typeof messages.error === "function"
        ? messages.error(err)
        : messages.error;
      dispatch({
        type: "UPDATE_TOAST",
        toast: {
          id,
          title: errorMsg,
          variant: "danger",
          isLoading: false,
          duration: 5000,
        }
      });
      setTimeout(() => {
        dispatch({ type: "DISMISS_TOAST", toastId: id });
      }, 5000);
    });

  return id;
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
