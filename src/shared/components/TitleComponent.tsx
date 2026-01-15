import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";
import BackButton from "./BackButton";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
  icon?: keyof typeof LucideReact;
  children?: React.ReactNode;
  isTruncate?: boolean;
  backRoute?: string;
}

export default function TitleComponent({
  title,
  subtitle,
  className = "",
  icon,
  children,
  isTruncate = true,
  backRoute,
}: Props) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between w-full">
      <div className={`flex items-center gap-4 ${className}`}>
        {backRoute && <BackButton route={backRoute} name={""} size="icon" />}
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
      <div className="flex gap-2 items-center">{children}</div>
    </div>
  );
}
