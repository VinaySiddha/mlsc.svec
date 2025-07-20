
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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(deadline));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(deadline));
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (!timeLeft) {
    return (
       <Card className="mt-4 bg-destructive/10 border-destructive/30">
        <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-destructive" />
                <p className="font-semibold text-destructive">The application deadline has passed.</p>
            </div>
        </CardContent>
       </Card>
    );
  }

  return (
    <Card className="mt-4">
        <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" />
                    <p className="font-semibold">Application Deadline:</p>
                </div>
                <div className="flex items-baseline gap-2 font-mono text-foreground">
                    <div>
                        <span className="text-2xl font-bold">{timeLeft.days}</span>
                        <span className="text-xs text-muted-foreground">d</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold">{timeLeft.hours}</span>
                        <span className="text-xs text-muted-foreground">h</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold">{timeLeft.minutes}</span>
                        <span className="text-xs text-muted-foreground">m</span>
                    </div>
                    <div>
                        <span className="text-2xl font-bold">{timeLeft.seconds}</span>
                        <span className="text-xs text-muted-foreground">s</span>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}
