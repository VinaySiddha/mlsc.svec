
'use client';

import { Megaphone } from "lucide-react";

interface NotificationTickerProps {
    notifications: string[];
}

export function NotificationTicker({ notifications }: NotificationTickerProps) {
    if (!notifications || notifications.length === 0) {
        return null;
    }

    return (
        <div className="bg-primary/10 border-y border-primary/20 text-primary-foreground overflow-hidden whitespace-nowrap">
            <div className="flex items-center gap-4 animate-marquee py-2">
                <div className="flex items-center gap-4 shrink-0">
                    <Megaphone className="h-5 w-5 text-primary ml-4" />
                    {notifications.map((notification, index) => (
                        <span key={index} className="text-sm font-medium text-foreground">
                            {notification}
                            <span className="text-primary mx-4">|</span>
                        </span>
                    ))}
                </div>
                 <div className="flex items-center gap-4 shrink-0" aria-hidden="true">
                    <Megaphone className="h-5 w-5 text-primary ml-4" />
                    {notifications.map((notification, index) => (
                        <span key={`dup-${index}`} className="text-sm font-medium text-foreground">
                            {notification}
                            <span className="text-primary mx-4">|</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
