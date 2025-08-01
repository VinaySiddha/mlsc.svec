
'use client';

import React, { useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { MLSCLogo } from './icons';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';

interface DigitalIdCardProps {
  name: string;
  referenceId: string;
}

export function DigitalIdCard({ name, referenceId }: DigitalIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1.0 });
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
            <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-blue-900 to-slate-900 text-white shadow-2xl border-blue-700/50">
                <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex items-center gap-3">
                    <MLSCLogo className="h-14 w-14" />
                    <div className="text-left">
                        <h2 className="text-xl font-bold tracking-wider">MLSC SVEC</h2>
                        <p className="text-xs text-blue-200/80">Microsoft Learn Student Club</p>
                    </div>
                    </div>

                    <div className="w-full border-t border-blue-400/20 my-4"></div>

                    <div className="space-y-1">
                        <p className="text-2xl font-bold tracking-wide">{name}</p>
                        <p className="font-mono text-sm text-blue-200/80 bg-white/10 px-2 py-1 rounded-md">
                            {referenceId}
                        </p>
                    </div>
                    
                    <div className="w-full pt-2 text-center">
                        <p className="text-lg font-semibold text-blue-300">MLSC 3.0 APPLICANT</p>
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
