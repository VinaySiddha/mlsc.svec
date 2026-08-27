'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    target: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
}

export function AnimatedCounter({
    target,
    suffix = '',
    prefix = '',
    duration = 2,
    className,
    style,
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, target, duration]);

    return (
        <motion.span
            ref={ref}
            className={className}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
        >
            {prefix}{count}{suffix}
        </motion.span>
    );
}
