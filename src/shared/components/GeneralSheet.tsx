import * as React from "react";
import { cn } from "@/lib/utils";
import * as LucideReact from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsTablet } from "@/hooks/use-tablet";

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
  type?: "default" | "tablet" | "mobile";
}

type Size =
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";
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
  "5xl": "max-w-5xl!",
  "6xl": "max-w-6xl!",
  "7xl": "max-w-7xl!",
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
  type,
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  if (!type) {
    if (isMobile) {
      type = "mobile";
    } else if (isTablet) {
      type = "tablet";
    } else {
      type = "default";
    }
  }

  const IconComponent = icon
    ? (LucideReact[icon] as React.ComponentType<any>)
    : null;

  {
    return type === "default" ? (
      <Drawer
        open={open}
        onOpenChange={(v) => !v && onClose()}
        modal={modal}
        direction={side}
      >
        <DrawerContent className={cn(sizes[size], className)}>
          <DrawerHeader>
            <div className="flex items-center gap-2">
              {icon && IconComponent && (
                <div className="mr-2 bg-primary text-primary-foreground rounded-md p-2">
                  <IconComponent className="size-5" />
                </div>
              )}
              <div>
                <DrawerTitle className={cn(!title ? "hidden" : "")}>
                  {title}
                </DrawerTitle>
                <DrawerDescription
                  className={cn(
                    "text-sm text-muted-foreground",
                    !subtitle ? "hidden" : "",
                  )}
                >
                  {subtitle}
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose onClick={onClose} />
          </DrawerHeader>
          <div className="no-scrollbar overflow-y-auto py-2 px-4">
            {children}
          </div>
          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    ) : (
      <Drawer open={open} onOpenChange={(v) => !v && onClose()} modal={modal}>
        <DrawerContent
          className={cn(sizes[size], className, "px-0 pb-4 overflow-hidden")}
        >
          <DrawerHeader className="py-2">
            <div className="flex items-center gap-2">
              {icon && IconComponent && (
                <div className="mr-2 bg-primary text-primary-foreground rounded-md p-2">
                  <IconComponent className="size-5" />
                </div>
              )}
              <div className="flex flex-col items-start justify-start">
                <DrawerTitle
                  className={cn(!title ? "hidden" : "", "text-start")}
                >
                  {title}
                </DrawerTitle>
                <DrawerDescription
                  className={cn(
                    "text-xs text-muted-foreground text-start",
                    !subtitle ? "hidden" : "",
                  )}
                >
                  {subtitle}
                </DrawerDescription>
              </div>
            </div>
            <DrawerClose onClick={onClose} />
          </DrawerHeader>
          <div className="no-scrollbar overflow-y-auto py-2 px-4">
            {children}
          </div>
          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
};

export default GeneralSheet;
