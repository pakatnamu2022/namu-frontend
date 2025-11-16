import { Filter } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ResponsiveFiltersProps {
  children: ReactNode;
  title?: string;
  description?: string;
  breakpoint?: "sm" | "md" | "lg" | "xl";
}

export default function ResponsiveFilters({
  children,
  title = "Filtros",
  description = "Selecciona los filtros para refinar tu búsqueda",
  breakpoint = "lg",
}: ResponsiveFiltersProps) {
  const [open, setOpen] = useState(false);

  // Mapeo de breakpoints a clases de Tailwind
  const breakpointClasses = {
    sm: "sm:flex",
    md: "md:flex",
    lg: "lg:flex",
    xl: "xl:flex",
  };

  const breakpointHidden = {
    sm: "sm:hidden",
    md: "md:hidden",
    lg: "lg:hidden",
    xl: "xl:hidden",
  };

  return (
    <>
      {/* Botón de filtros - visible solo en pantallas pequeñas */}
      <div className={breakpointHidden[breakpoint]}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {title}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">{children}</div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Filtros en línea - visible solo en pantallas grandes */}
      <div className={`hidden ${breakpointClasses[breakpoint]} items-center gap-2 flex-wrap`}>
        {children}
      </div>
    </>
  );
}
