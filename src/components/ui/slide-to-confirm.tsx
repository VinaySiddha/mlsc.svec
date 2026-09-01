"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlideToConfirmButtonProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "children"
> {
  label?: string;
  confirmedLabel?: string;
  onConfirm?: () => void;
  autoResetDelay?: number;
  isConfirmed?: boolean;
  disabled?: boolean;
}

const SlideToConfirmButton = React.forwardRef<
  HTMLDivElement,
  SlideToConfirmButtonProps
>(
  (
    {
      label = "Slide to confirm",
      confirmedLabel = "Confirmed",
      onConfirm,
      autoResetDelay = 3000,
      isConfirmed: isConfirmedProp,
      disabled = false,
      className,
      ...props
    },
    ref,
  ) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => trackRef.current!);

    const [isConfirmedLocal, setIsConfirmedLocal] = React.useState(false);
    const [maxDrag, setMaxDrag] = React.useState(200);

    const isConfirmed = isConfirmedProp !== undefined ? isConfirmedProp : isConfirmedLocal;

    const x = useMotionValue(0);

    // Calculate max drag distance (track width - handle size - padding)
    React.useEffect(() => {
      if (!trackRef.current) return;
      const updateMaxDrag = () => {
        if (trackRef.current) {
          setMaxDrag(trackRef.current.clientWidth - 56);
        }
      };
      updateMaxDrag();
      const observer = new ResizeObserver(updateMaxDrag);
      observer.observe(trackRef.current);
      return () => observer.disconnect();
    }, []);

    // Dynamic fill width & text opacity
    const fillWidth = useTransform(x, [0, maxDrag], [48, maxDrag + 48]);
    const textOpacity = useTransform(x, [0, maxDrag * 0.6], [1, 0]);

    const handleDragEnd = () => {
      if (disabled || isConfirmed) return;
      const currentX = x.get();
      if (currentX >= maxDrag * 0.85) {
        x.set(maxDrag);
        if (isConfirmedProp === undefined) {
          setIsConfirmedLocal(true);
        }
        if (onConfirm) onConfirm();

        if (autoResetDelay > 0 && isConfirmedProp === undefined) {
          setTimeout(() => {
            setIsConfirmedLocal(false);
            x.set(0);
          }, autoResetDelay);
        }
      } else {
        x.set(0);
      }
    };

    // Reset position if isConfirmed becomes false from prop
    React.useEffect(() => {
      if (!isConfirmed) {
        x.set(0);
      }
    }, [isConfirmed, x]);

    return (
      <div
        ref={trackRef}
        className={cn(
          "relative inline-flex items-center h-14 w-full rounded-none border-2 border-black bg-white p-1 overflow-hidden select-none shadow-[3px_3px_0px_0px_#000000]",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
        {...props}
      >
        <AnimatePresence mode="wait">
          {isConfirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 flex items-center justify-center gap-2 w-full h-full px-5 bg-[#00FF66] border-2 border-black text-black font-black uppercase tracking-wider text-xs"
            >
              <ShieldCheck className="size-5 stroke-[2.5]" />
              <span>{confirmedLabel}</span>
            </motion.div>
          ) : (
            <React.Fragment key="track">
              {/* Dynamic Fill Bar */}
              <motion.div
                style={{ width: fillWidth }}
                className="absolute left-1 top-1 bottom-1 z-0 bg-[#FFE600] pointer-events-none"
              />

              {/* Track Label */}
              <motion.span
                style={{ opacity: textOpacity }}
                className="absolute inset-0 z-0 flex items-center justify-center font-black uppercase text-xs text-black tracking-wider pointer-events-none pl-6"
              >
                {label}
              </motion.span>

              {/* Draggable Handle */}
              <motion.button
                style={{ x }}
                drag={disabled ? false : "x"}
                dragConstraints={{ left: 0, right: maxDrag }}
                dragElastic={0.05}
                dragMomentum={false}
                onDragEnd={handleDragEnd}
                whileHover={disabled ? {} : { scale: 1.02 }}
                whileTap={disabled ? {} : { scale: 0.98 }}
                type="button"
                className="relative z-10 flex items-center justify-center size-11 bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] cursor-grab active:cursor-grabbing"
              >
                <ArrowRight className="size-5 stroke-[3]" />
              </motion.button>
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

SlideToConfirmButton.displayName = "SlideToConfirmButton";

export { SlideToConfirmButton, type SlideToConfirmButtonProps };
