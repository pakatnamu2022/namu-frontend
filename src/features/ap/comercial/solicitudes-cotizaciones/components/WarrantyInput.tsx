import {
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import RequiredField from "@/shared/components/RequiredField";
import { Control } from "react-hook-form";
import { useFormContext } from "react-hook-form";

interface WarrantyInputProps {
  control: Control<any>;
  required?: boolean;
}

export function WarrantyInput({ control, required }: WarrantyInputProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const yearsError = errors.warranty_years?.message as string | undefined;
  const kmError = errors.warranty_km?.message as string | undefined;
  const hasError = !!(yearsError || kmError);

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-xs md:text-sm font-medium text-muted-foreground dark:text-muted-foreground leading-none h-fit mb-1">
        Garantía
        {required && <RequiredField />}
      </label>

      <div
        className={cn(
          "flex items-center rounded-md border bg-background transition-colors",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
          hasError &&
            "border-destructive focus-within:ring-destructive/50",
        )}
      >
        {/* Campo años */}
        <FormField
          control={control}
          name="warranty_years"
          render={({ field }) => (
            <FormItem className="flex-1 m-0 space-y-0">
              <div className="flex items-center px-3 gap-2">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    placeholder="5"
                    inputMode="numeric"
                    className={cn(
                      "border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                      "h-8 md:h-9 text-xs md:text-sm w-12 p-0 text-center",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      yearsError && "text-destructive placeholder:text-destructive/50",
                    )}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : parseInt(val, 10));
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap select-none font-medium">
                  {field.value === 1 ? "año" : "años"}
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Separador */}
        <div className="h-5 w-px bg-border shrink-0" />

        {/* Campo km */}
        <FormField
          control={control}
          name="warranty_km"
          render={({ field }) => (
            <FormItem className="flex-1 m-0 space-y-0">
              <div className="flex items-center px-3 gap-2">
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    placeholder="100000"
                    inputMode="numeric"
                    className={cn(
                      "border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
                      "h-8 md:h-9 text-xs md:text-sm w-20 p-0 text-center",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      kmError && "text-destructive placeholder:text-destructive/50",
                    )}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : parseInt(val, 10));
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap select-none font-medium">
                  km
                </span>
              </div>
            </FormItem>
          )}
        />
      </div>

      {yearsError && (
        <p className="text-xs font-medium text-destructive">{yearsError}</p>
      )}
      {kmError && (
        <p className="text-xs font-medium text-destructive">{kmError}</p>
      )}
    </div>
  );
}
