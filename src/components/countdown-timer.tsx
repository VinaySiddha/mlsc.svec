
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (deadline: string): TimeLeft | null => {
  if (!deadline) return null;
  const difference = +new Date(deadline) - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return null;
};

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    setTimeLeft(calculateTimeLeft(deadline));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (!isClient) {
    return null;
  }
  
  if (!timeLeft) {
    return null; // Don't show anything if deadline has passed
  }

  return (
    <Card className="mb-4 bg-background/50">
        <CardContent className="p-3">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
                <div className="flex items-center gap-2 text-primary text-sm">
                    <Clock className="h-4 w-4" />
                    <p className="font-semibold">Registration closes in:</p>
                </div>
                <div className="flex items-baseline gap-2 font-mono text-foreground">
                    <div>
                        <span className="text-xl font-bold">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="text-xs text-muted-foreground">d</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
                        <span className="text-xs text-muted-foreground">h</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
                        <span className="text-xs text-muted-foreground">m</span>
                    </div>
                    <div>
                        <span className="text-xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        <span className="text-xs text-muted-foreground">s</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

    