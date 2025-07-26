
'use client';

import Image from "next/image";
import { useEffect } from "react";

export function ImageSlider() {
      useEffect(() => {
        const imageSlider = document.querySelector('.image-slider') as HTMLElement | null;
        if (!imageSlider) return;
        
        const images = imageSlider.querySelectorAll('img');
        let imageIndex = 0;
        const totalImages = images.length;

        if (totalImages <= 1) return;

        const intervalId = setInterval(() => {
            imageIndex = (imageIndex + 1) % totalImages;
            const translateValue = imageIndex * 100;
            if (imageSlider) {
              imageSlider.style.transition = 'transform 0.5s ease-in-out';
              imageSlider.style.transform = `translateX(-${translateValue}%)`;
            }
        }, 5000);

        return () => clearInterval(intervalId);
      }, []);

    return (
        <div className="image-container overflow-hidden rounded-lg shadow-lg mb-8 md:mb-0">
            <div className="image-slider flex">
                <Image src="/team1.jpg" alt="MLSC Team" width={600} height={400} className="w-full shrink-0" data-ai-hint="group photo"/>
            </div>
        </div>
    )
}
