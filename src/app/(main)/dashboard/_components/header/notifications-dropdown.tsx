"use client";

import { useState } from "react";
import { Bell, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { markNotificationReadAction } from "@/server/notification-actions";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function NotificationsDropdown({ initialNotifications = [] }: { initialNotifications?: NotificationItem[] }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationReadAction(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-primary" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="size-4 text-primary" /> System Notifications
          </div>
          {unreadCount > 0 && (
            <span className="text-[11px] font-medium text-primary px-1.5 py-0.5 rounded-full bg-primary/10">
              {unreadCount} new
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No recent notifications</div>
        ) : (
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`p-3 flex flex-col items-start gap-1 cursor-pointer transition-colors ${
                  !n.read ? "bg-primary/5 font-medium" : "opacity-80"
                }`}
                onClick={() => handleMarkRead(n.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-foreground">{n.title}</span>
                  {!n.read && <Check className="size-3 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                <span className="text-[10px] text-muted-foreground/70 mt-1">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
