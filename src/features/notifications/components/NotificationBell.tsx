"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  useUnreadCount,
  useNotifications,
  useReadAllNotifications,
  useReadNotification,
  useDeleteNotification,
} from "../lib/notifications.hook";
import type { NotificationResource } from "../lib/notifications.interface";
import { cn } from "@/lib/utils";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const { data: notificationsData, isLoading } = useNotifications(
    { per_page: 15 },
    open,
  );
  const notifications = notificationsData?.data ?? [];

  const readAll = useReadAllNotifications();
  const readOne = useReadNotification();
  const deleteOne = useDeleteNotification();

  const handleNotificationClick = async (
    notification: NotificationResource,
  ) => {
    if (!notification.is_read) {
      await readOne.mutateAsync(notification.id);
    }

    if (notification.route) {
      setOpen(false);
      navigate(notification.route);
    }
  };

  const handleReadAll = () => {
    readAll.mutate();
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    deleteOne.mutate(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative p-2 rounded-md hover:bg-muted transition-colors text-primary dark:text-primary-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[15px] h-[15px] rounded-full bg-destructive/80 text-destructive-foreground text-[9px] font-semibold px-0.5 leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
        <div className="flex items-center justify-between px-3 py-2.5">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Notificaciones{unreadCount > 0 ? ` · ${unreadCount} nuevas` : ""}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground px-2"
              onClick={handleReadAll}
              disabled={readAll.isPending}
            >
              <CheckCheck className="w-3 h-3" />
              Leer todo
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="h-[360px]">
          {isLoading ? (
            <div className="px-3 py-2 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5 py-1">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="h-2 w-1/4" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50 gap-1.5">
              <Bell className="w-6 h-6" />
              <p className="text-xs">Sin notificaciones</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    className={cn(
                      "w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors group relative",
                      !notification.is_read && "bg-muted/30",
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-2 pr-6">
                      {!notification.is_read && (
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                      )}
                      <div
                        className={cn(
                          "flex-1 min-w-0",
                          notification.is_read && "pl-3.5",
                        )}
                      >
                        <p className="text-xs font-medium leading-snug line-clamp-1 text-foreground/90">
                          {notification.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                              locale: es,
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      className="absolute right-2 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-destructive text-muted-foreground/40"
                      onClick={(e) => handleDelete(e, notification.id)}
                      aria-label="Eliminar notificación"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </button>
                  {index < notifications.length - 1 && (
                    <Separator className="opacity-30" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
