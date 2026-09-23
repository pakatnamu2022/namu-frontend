"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { generateYear } from "@/core/core.function";

interface ProductivityYearComparePickerProps {
  selectedYears: number[];
  onChange: (years: number[]) => void;
  maxYears?: number;
}

export default function ProductivityYearComparePicker({
  selectedYears,
  onChange,
  maxYears = 5,
}: ProductivityYearComparePickerProps) {
  const years = generateYear(2026);

  const handleChange = (values: string[]) => {
    const parsed = values.map(Number).sort((a, b) => a - b);
    if (parsed.length > maxYears) return;
    onChange(parsed);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        Años a comparar (mín. 2, máx. {maxYears})
      </span>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        value={selectedYears.map(String)}
        onValueChange={handleChange}
        className="flex-wrap justify-start"
      >
        {years.map((year) => (
          <ToggleGroupItem key={year} value={year.toString()}>
            {year}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
