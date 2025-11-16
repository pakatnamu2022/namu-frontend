// components/GeneralModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React, { ReactNode, useRef } from "react";

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

  const renderedChildren =
    typeof children === "function"
      ? (children as ChildrenRender)({ portalContainer: refToUse.current })
      : children;

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
