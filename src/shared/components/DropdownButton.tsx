"use client";

import { type ReactNode } from "react";
import { ChevronDown, Loader2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type ComponentPropsWithoutRef } from "react";

type ButtonVariant = ComponentPropsWithoutRef<typeof Button>["variant"];
type ButtonSize = ComponentPropsWithoutRef<typeof Button>["size"];

interface DropdownButtonProps {
  label: string;
  icon?: LucideIcon;
  isPending?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  menuLabel?: string;
  menuWidth?: string;
  align?: "start" | "center" | "end";
  children: ReactNode;
}

export default function DropdownButton({
  label,
  icon: Icon,
  isPending = false,
  disabled = false,
  variant = "outline",
  size = "sm",
  menuLabel,
  menuWidth = "w-52",
  align = "end",
  children,
}: DropdownButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} disabled={disabled || isPending}>
          {isPending ? (
            <Loader2 className="size-4 mr-2 animate-spin" />
          ) : (
            Icon && <Icon className="size-4 mr-2" />
          )}
          {label}
          <ChevronDown className="size-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={menuWidth} align={align}>
        {menuLabel && (
          <>
            <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
