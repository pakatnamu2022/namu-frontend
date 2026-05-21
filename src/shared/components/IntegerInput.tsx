import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

interface IntegerInputProps extends Omit<
  ComponentProps<typeof Input>,
  "onChange" | "onBlur" | "value" | "type"
> {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}

export function IntegerInput({ value, onChange, ...props }: IntegerInputProps) {
  return (
    <Input
      {...props}
      type="number"
      step="1"
      value={value ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "") {
          onChange(undefined);
        } else if (/^\d+$/.test(val)) {
          onChange(parseInt(val, 10));
        }
      }}
      onBlur={(e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          onChange(val);
        }
      }}
    />
  );
}
