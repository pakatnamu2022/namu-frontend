import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  icon?: keyof typeof LucideReact;
  children?: React.ReactNode;
  isTruncate?: boolean;
}

export default function TitleComponent({
  title,
  subtitle,
  className = "",
  icon,
  children,
  isTruncate = true,
}: Props) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <div className="flex flex-row gap-4 items-center md:items-center w-full md:w-fit">
      <div className={`flex items-center gap-4 ${className}`}>
        {IconComponent && (
          <div className="text-white bg-primary rounded-md p-2">
            <IconComponent className="size-5 text-white" />
          </div>
        )}
        <div className="flex flex-col items-start">
          <h1
            className={cn(
              "text-sm md:text-xl font-bold text-primary dark:text-primary-foreground",
              { truncate: isTruncate }
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn("text-muted-foreground text-xs md:text-sm", {
                truncate: isTruncate,
              })}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
