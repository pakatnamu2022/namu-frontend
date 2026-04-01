"use client";

import { Button } from "@/components/ui/button";

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
    <div className="flex rounded-md border overflow-hidden">
      {options.map((option, index) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={[
            "rounded-none h-9 px-4 gap-2",
            index < options.length - 1 ? "border-r" : "",
          ].join(" ")}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
