import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StopwatchDisplayProps {
  time: string;
  label: string;
  variant?: "start" | "end";
  isRunning?: boolean;
  className?: string;
}

export function StopwatchDisplay({
  time,
  label,
  variant = "start",
  isRunning = false,
  className,
}: StopwatchDisplayProps) {
  const variantStyles = {
    start: {
      container: "bg-green-50 border-green-200",
      iconContainer: "bg-green-100",
      icon: "text-green-600",
      text: "text-green-700",
      pulse: "bg-green-500",
    },
    end: {
      container: "bg-blue-50 border-blue-200",
      iconContainer: "bg-blue-100",
      icon: "text-blue-600",
      text: "text-blue-700",
      pulse: "bg-blue-500",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl border",
        styles.container,
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          styles.iconContainer
        )}
      >
        <Timer
          className={cn("h-5 w-5", styles.icon, isRunning && "animate-pulse")}
        />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p
          className={cn(
            "text-2xl font-mono font-bold tracking-wider",
            styles.text
          )}
        >
          {time}
        </p>
      </div>
      {isRunning && (
        <span className="relative flex h-3 w-3">
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              styles.pulse
            )}
          />
          <span
            className={cn(
              "relative inline-flex rounded-full h-3 w-3",
              styles.pulse
            )}
          />
        </span>
      )}
    </div>
  );
}
