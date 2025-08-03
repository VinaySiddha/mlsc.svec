
'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { MLSCLogo } from './icons';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Image } from './image';

interface DigitalIdCardProps {
  member: {
    name: string;
    role: string;
    image?: string;
  }
}

export function DigitalIdCard({ member }: DigitalIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const { name, role, image } = member;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
          cacheBust: true, 
          quality: 1.0,
          pixelRatio: 2, // Increase resolution
      });
      const link = document.createElement('a');
      link.download = `MLSC_ID_Card_${name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div ref={cardRef}>
            <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl border-blue-700/50 overflow-hidden">
                <div className="p-4 bg-white/5 backdrop-blur-sm">
                   <div className="flex items-center gap-3">
                    <MLSCLogo className="h-12 w-12" />
                    <div className="text-left">
                        <h2 className="text-lg font-bold tracking-wider">MLSC SVEC</h2>
                        <p className="text-xs text-blue-200/80">Microsoft Learn Student Club</p>
                    </div>
                    </div>
                </div>

                <CardContent className="p-6 pt-4">
                <div className="flex flex-col items-center text-center space-y-4">
                    
                    <div className="relative mt-[-40px] border-4 border-blue-500/50 rounded-full p-1 shadow-lg">
                        <Image 
                            src={image || 'https://placehold.co/128x128.png'} 
                            alt={`Photo of ${name}`}
                            width={128}
                            height={128}
                            className="rounded-full object-cover bg-gray-700"
                            data-ai-hint="person portrait"
                        />
                    </div>

                    <div className="space-y-1">
                        <p className="text-2xl font-bold tracking-wide">{name}</p>
                        <p className="font-mono text-sm text-blue-300 bg-white/10 px-3 py-1 rounded-full">
                            {role}
                        </p>
                    </div>
                    
                    <div className="w-full pt-2 text-center">
                        <p className="text-sm font-semibold text-blue-300">MLSC 3.0 TEAM MEMBER</p>
                    </div>
                </div>
                </CardContent>
            </Card>
        </div>
        <Button onClick={handleDownload} className="w-full" variant="secondary" disabled={isDownloading}>
            {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download ID Card
        </Button>
    </div>
  );
}
