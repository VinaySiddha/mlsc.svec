'use client';

import React, { useRef, useState } from 'react';
import { MLSCLogo } from './icons';
import { Button } from './ui/button';
import { Download, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import Image from 'next/image';

interface DigitalIdCardProps {
  member?: {
    name: string;
    role: string;
    image?: string;
  };
  name?: string;
  referenceId?: string;
}

export function DigitalIdCard({ member, name, referenceId }: DigitalIdCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const displayName = member?.name || name || 'Member';
  const displayRole = member?.role || (referenceId ? `Ref: ${referenceId}` : 'Core Contributor');
  const displayImage = member?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=FFE600&color=000&size=200&bold=true`;

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
          cacheBust: true, 
          quality: 1.0,
          pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `MLSC_ID_Card_${displayName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {/* Printable ID Card Element */}
      <div ref={cardRef} className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_#000000] text-black overflow-hidden font-sans">
        
        {/* Header Ribbon */}
        <div className="bg-[#FFE600] border-b-4 border-black p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MLSCLogo className="h-8 w-8 text-black" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-black leading-none">MLSC SVEC</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-black/80 mt-0.5">Chapter 4.0</p>
            </div>
          </div>
          <span className="text-[9px] font-black uppercase border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_0px_#000000]">
            Verified
          </span>
        </div>

        {/* Member Photo & Details */}
        <div className="p-6 space-y-5 text-center">
          
          <div className="relative mx-auto w-28 h-28 border-4 border-black shadow-[4px_4px_0px_0px_#000000] bg-[#FFE600] overflow-hidden">
            <Image 
              src={displayImage} 
              alt={`Photo of ${displayName}`}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-black uppercase italic tracking-tight text-black break-words">
              {displayName}
            </h3>
            <div className="inline-block border-2 border-black bg-[#4285F4] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 shadow-[2px_2px_0px_0px_#000000]">
              {displayRole}
            </div>
          </div>

          {/* Verification Badge footer */}
          <div className="border-t-2 border-dashed border-black pt-4 space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-black">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#00A844]" />
              <span>Official Chapter Credential</span>
            </div>
            <p className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              SRI VASAVI ENGINEERING COLLEGE
            </p>
          </div>

        </div>

        {/* Bottom Color Bar */}
        <div className="h-2 bg-[#00FF66] border-t-2 border-black w-full" />
      </div>

      {/* Action Button */}
      <Button 
        onClick={handleDownload} 
        disabled={isDownloading}
        className="w-full bg-[#FFE600] text-black hover:bg-[#FFE600]/90 border-2 border-black shadow-[4px_4px_0px_0px_#000000] font-black uppercase tracking-wider text-xs h-12 active:translate-x-[2px] active:translate-y-[2px]"
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PNG...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" /> Download ID Card
          </>
        )}
      </Button>
    </div>
  );
}
