"use client";

import { Filter } from "lucide-react";
import { Children, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GeneralSheet from "./GeneralSheet";

interface FilterWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export default function FilterWrapper({
  children,
  title = "Filtros",
  description = "Selecciona los filtros para refinar tu búsqueda",
  className,
}: FilterWrapperProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const childrenArray = Children.toArray(children);
  const filterCount = childrenArray.length;

  // Si hay solo 1 filtro, mostrarlo directamente sin botón
  if (filterCount <= 1) {
    return (
      <div
        className={cn("flex items-center gap-2 flex-wrap w-full", className)}
      >
        {children}
      </div>
    );
  }

  // Si hay más de 3 filtros: Sheet en mobile
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop: mostrar filtros inline */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        {children}
      </div>

      {/* Mobile: abrir Sheet */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={() => setIsSheetOpen(true)}
        >
          <Filter className="h-3.5 w-3.5" />
        </Button>

        <GeneralSheet
          title={title}
          subtitle={description}
          icon="Filter"
          open={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
        >
          <div className="flex flex-col gap-2">{children}</div>
        </GeneralSheet>
      </div>
    </div>
  );
}
