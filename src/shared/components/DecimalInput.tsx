import { Input } from "@/components/ui/input";
import { ComponentProps } from "react";

interface DecimalInputProps extends Omit<
  ComponentProps<typeof Input>,
  "onChange" | "onBlur" | "value" | "type"
> {
  value: number | undefined;
  decimals?: number;
  onChange: (value: number | undefined) => void;
}

export function DecimalInput({
  value,
  decimals = 2,
  onChange,
  ...props
}: DecimalInputProps) {
  const regex = new RegExp(`^\\d+(\\.\\d{0,${decimals}})?$`);

  return (
    <Input
      {...props}
      type="number"
      min="0"
      step={Math.pow(10, -decimals).toFixed(decimals)}
      value={value ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        if (val === "") {
          onChange(undefined);
        } else if (regex.test(val)) {
          onChange(Number(val));
        }
      }}
      onBlur={(e) => {
        const val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          onChange(parseFloat(val.toFixed(decimals)));
        }
      }}
    />
  );
}
