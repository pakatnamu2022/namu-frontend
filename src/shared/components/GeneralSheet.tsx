import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";

export interface GeneralSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  modal?: boolean;
  icon?: keyof typeof LucideReact;
  size?: Size;
}

type Size = "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
interface SizeClasses {
  [key: string]: string;
}

const sizes: SizeClasses = {
  md: "max-w-md!",
  lg: "max-w-lg!",
  xl: "max-w-xl!",
  "2xl": "max-w-2xl!",
  "3xl": "max-w-3xl!",
  "4xl": "max-w-4xl!",
  full: "w-full!",
};

const GeneralSheet: React.FC<GeneralSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  side = "right",
  className,
  modal,
  icon,
  size = "large",
}) => {
  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()} modal={modal}>
      <SheetContent side={side} className={cn(sizes[size], className)}>
        <SheetHeader>
          <div className="flex items-center gap-2">
            {icon && IconComponent && (
              <div className="mr-2">
                <IconComponent />
              </div>
            )}
            <div>
              {title && <SheetTitle>{title}</SheetTitle>}
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>
          <SheetClose onClick={onClose} />
        </SheetHeader>
        <div className="mt-4 h-full">{children}</div>
      </SheetContent>
    </Sheet>
  );
};

export default GeneralSheet;
