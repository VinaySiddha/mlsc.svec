
'use client';

import Image from "next/image";
import { useEffect, useRef } from "react";

const images = [
    { src: "/team1.jpg", alt: "MLSC Team", hint: "group photo" },
    { src: "/azure.jpg", alt: "Azure Workshop", hint: "tech workshop" },
    { src: "/web.jpg", alt: "Web Development Bootcamp", hint: "coding bootcamp" },
    { src: "/blueday.png", alt: "MLSC Blue Day", hint: "club event" },
    { src: "/flask.png", alt: "The Flask Edition", hint: "event poster" },
];

export function ImageSlider() {
      const sliderRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const imageSlider = sliderRef.current;
        if (!imageSlider) return;
        
        let imageIndex = 0;
        const totalImages = images.length;

        if (totalImages <= 1) return;

        const intervalId = setInterval(() => {
            imageIndex = (imageIndex + 1) % totalImages;
            const translateValue = imageIndex * 100;
            if (imageSlider) {
              imageSlider.style.transition = 'transform 0.7s ease-in-out';
              imageSlider.style.transform = `translateX(-${translateValue}%)`;
            }
        }, 4000); // Changed interval to 4 seconds for a better viewing experience

        return () => clearInterval(intervalId);
      }, []);

    return (
        <div className="image-container overflow-hidden rounded-lg shadow-lg aspect-video">
            <div className="image-slider flex h-full" ref={sliderRef}>
                {images.map((image, index) => (
                     <Image 
                        key={index}
                        src={image.src} 
                        alt={image.alt} 
                        width={600} 
                        height={400} 
                        className="w-full shrink-0 object-cover h-full" 
                        data-ai-hint={image.hint}
                     />
                ))}
            </div>
        </div>
    )
}
