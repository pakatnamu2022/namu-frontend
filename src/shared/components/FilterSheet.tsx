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

interface FilterSheetProps {
  children: ReactNode;
  title?: string;
  description?: string;
  buttonText?: string;
  side?: "left" | "right" | "top" | "bottom";
}

export default function FilterSheet({
  children,
  title = "Filtros",
  description = "Selecciona los filtros para refinar tu búsqueda",
  buttonText,
  side = "right",
}: FilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          {buttonText || title}
        </Button>
      </SheetTrigger>
      <SheetContent side={side} className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
