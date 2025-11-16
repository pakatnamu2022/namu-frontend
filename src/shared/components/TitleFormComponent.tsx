import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";

interface Props {
  title: string;
  mode?: "create" | "edit";
  className?: string;
  icon?: keyof typeof LucideReact;
  children?: React.ReactNode;
}

export default function TitleFormComponent({
  title,
  mode,
  className = "",
  icon,
  children,
}: Props) {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <div
      className={cn(
        "flex flex-row gap-4 items-center md:items-center justify-between w-full md:w-full",
        className
      )}
    >
      <div
        className={cn(
          "flex flex-row gap-4 items-center md:items-center w-full md:w-full",
          className
        )}
      >
        {IconComponent && (
          <div className="text-white bg-primary rounded-md p-2">
            <IconComponent className="size-5 text-white" />
          </div>
        )}
        <div className="flex flex-col items-start">
          <h1 className="md:text-xl font-bold text-primary">{title}</h1>

          <p className="text-muted-foreground text-xs md:text-sm">{`${
            mode === "create" ? "Agregar" : "Actualizar"
          } ${title}`}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
