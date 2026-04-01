"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup as ButtonGroupPrimitive } from "@/components/ui/button-group";

export interface ButtonGroupOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface ButtonGroupProps<T extends string = string> {
  options: ButtonGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function ButtonGroup<T extends string = string>({
  options,
  value,
  onChange,
  disabled,
}: ButtonGroupProps<T>) {
  return (
    <ButtonGroupPrimitive>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </ButtonGroupPrimitive>
  );
}
