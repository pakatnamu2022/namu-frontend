"use client";

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  children?: React.ReactNode;
  maxVisible?: number;
}

export default function ActionsWrapper({ children, maxVisible }: Props) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const childArray = React.Children.toArray(children).filter(Boolean);

  const showOverflow =
    maxVisible !== undefined && isMobile && childArray.length > maxVisible;

  if (!showOverflow) {
    return (
      <div className="flex flex-wrap justify-end gap-2 w-full">
        {children}
      </div>
    );
  }

  const visibleChildren = childArray.slice(0, maxVisible);
  const overflowChildren = childArray.slice(maxVisible);

  return (
    <div className="flex flex-wrap justify-end gap-2 w-full">
      {visibleChildren}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon-sm"
            variant="outline"
            tooltip="Más acciones"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="p-2 w-auto">
          <div className="flex flex-col gap-2">
            {overflowChildren.map((child, index) => (
              <div key={index} onClick={() => setIsOpen(false)}>
                {child}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
