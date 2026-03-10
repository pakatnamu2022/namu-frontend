import type { Control, FieldValues, Path } from "react-hook-form";
import { FormControl, FormDescription, FormField } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled,
}: FormCheckboxProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-center gap-3 rounded-md border p-3 shadow-xs bg-background hover:bg-muted cursor-pointer transition-colors">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium text-sm">{label}</span>
            {description && (
              <FormDescription className="text-xs font-normal">
                {description}
              </FormDescription>
            )}
          </div>
        </label>
      )}
    />
  );
}
