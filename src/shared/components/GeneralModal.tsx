// components/GeneralModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { ReactNode, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

type ChildrenRender = (args: {
  portalContainer: HTMLElement | null;
}) => ReactNode;

interface GeneralModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode | ChildrenRender; // <-- acepta ambos
  maxWidth?: string;
  contentRef?: React.RefObject<HTMLDivElement>; // opcional si quieres manejarlo afuera
}

export function GeneralModal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-(--breakpoint-lg)",
  contentRef,
}: GeneralModalProps) {
  const localRef = useRef<HTMLDivElement>(null);
  const refToUse = contentRef ?? localRef;
  const isMobile = useIsMobile();

  const renderedChildren =
    typeof children === "function"
      ? (children as ChildrenRender)({ portalContainer: refToUse.current })
      : children;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(v: any) => !v && onClose()}>
        <DrawerContent
          ref={refToUse}
          className={cn(
            "w-full max-h-[85vh] flex flex-col px-4 pb-4",
            maxWidth
          )}
        >
          <DrawerHeader className="shrink-0">
            {title && <DrawerTitle>{title}</DrawerTitle>}
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">{renderedChildren}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v: any) => !v && onClose()}>
      <DialogContent
        ref={refToUse}
        className={cn(
          "w-[95vw] rounded-xl max-h-[85vh] overflow-y-auto",
          maxWidth
        )}
      >
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
        </DialogHeader>
        <DialogDescription className="hidden" />
        <div>{renderedChildren}</div>
      </DialogContent>
    </Dialog>
  );
}
