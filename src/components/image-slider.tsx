"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageSliderProps {
    images: string[];
    className?: string;
}

export function ImageSlider({ images, className }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    if (!images || images.length === 0) return null;

    return (
        <div className={cn("relative overflow-hidden rounded-xl", className)}>
            <div className="aspect-video relative">
                <Image
                    src={images[currentIndex]}
                    alt={`Slide ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                />
            </div>
            {/* Add navigation controls if needed */}
        </div>
    );
}
