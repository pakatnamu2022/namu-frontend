"use client";

import { Button } from "@/components/ui/button";
import { Option } from "@/core/core.interface";
import { motion } from "framer-motion";

interface Props {
  active: string;
  options: Option[];
  onChange?: (value: string) => void;
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
}

export default function RadioButton({
  options,
  active,
  onChange,
  size,
}: Props) {
  return (
    <div className="relative bg-muted rounded-lg border flex items-center gap-2 p-0.5">
      {options.map((option) => {
        const isActive = active === option.value;

        return (
          <div key={option.value} className="relative flex-1 h-full">
            {isActive && (
              <motion.div
                layoutId="radio-background"
                className="absolute inset-0 rounded-md bg-background h-full"
                transition={{ type: "spring", stiffness: 300, damping: 40 }}
              />
            )}
            <Button
              variant={isActive ? "neutral" : "ghost"}
              size={size ? size : "sm"}
              className="h-full w-full relative z-10"
              onClick={() => onChange?.(option.value)}
            >
              {typeof option.label === "function"
                ? option.label()
                : option.label}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
