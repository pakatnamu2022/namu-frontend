import { cn } from "@/lib/utils";
import { Controller, Control } from "react-hook-form";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AttendanceCode {
  code: string;
  description: string | null;
}

interface AttendanceCodeChipsProps {
  control: Control<any>;
  name: string;
  label?: string;
  codes: AttendanceCode[];
}

const CHIP_PALETTE: Record<string, { idle: string; active: string }> = {
  D: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-blue-500/10",
    active: "bg-blue-700 text-white",
  },
  N: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-emerald-500/10",
    active: "bg-emerald-700 text-white",
  },
  F: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-red-500/10",
    active: "bg-red-700 text-white",
  },
  V: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-purple-500/10",
    active: "bg-purple-700 text-white",
  },
  L: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-amber-500/10",
    active: "bg-amber-700 text-white",
  },
  P: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-sky-500/10",
    active: "bg-sky-700 text-white",
  },
  T: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-teal-500/10",
    active: "bg-teal-700 text-white",
  },
  M: {
    idle:   "bg-gray-500/5 text-gray-800 hover:bg-orange-500/10",
    active: "bg-orange-700 text-white",
  },
};

const FALLBACK: { idle: string; active: string }[] = [
  { idle: "bg-slate-500/5 text-slate-700 hover:bg-slate-500/10", active: "bg-slate-600 text-white" },
  { idle: "bg-indigo-500/5 text-indigo-800 hover:bg-indigo-500/10", active: "bg-indigo-700 text-white" },
  { idle: "bg-pink-500/5 text-pink-800 hover:bg-pink-500/10", active: "bg-pink-700 text-white" },
  { idle: "bg-cyan-500/5 text-cyan-800 hover:bg-cyan-500/10", active: "bg-cyan-700 text-white" },
];

// Orden de prioridad: D y N primero
const TURN_PRIORITY = ["D", "N"];

function getColors(code: string) {
  const key = code.charAt(0).toUpperCase();
  return CHIP_PALETTE[key] ?? FALLBACK[code.charCodeAt(0) % FALLBACK.length];
}

function Chip({
  code,
  description,
  isSelected,
  onClick,
}: {
  code: string;
  description: string | null;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = getColors(code);
  return (
    <button
      type="button"
      onClick={onClick}
      title={description ?? code}
      className={cn(
        "inline-flex items-baseline gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        isSelected ? colors.active : colors.idle
      )}
    >
      {code}
      {description && (
        <span className={cn("max-w-[100px] truncate text-xs font-normal", isSelected ? "opacity-80" : "opacity-60")}>
          {description}
        </span>
      )}
    </button>
  );
}

export function AttendanceCodeChips({
  control,
  name,
  label = "Código de asistencia",
  codes,
}: AttendanceCodeChipsProps) {
  const turnCodes = TURN_PRIORITY
    .map((key) => codes.find((c) => c.code.toUpperCase() === key))
    .filter(Boolean) as AttendanceCode[];

  const otherCodes = codes.filter(
    (c) => !TURN_PRIORITY.includes(c.code.toUpperCase())
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </FormLabel>

          <div className="space-y-3 pt-1">
            {/* Turnos principales */}
            {turnCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {turnCodes.map((c) => (
                  <Chip
                    key={c.code}
                    code={c.code}
                    description={c.description}
                    isSelected={field.value === c.code}
                    onClick={() => field.onChange(c.code)}
                  />
                ))}
              </div>
            )}

            {/* Separator */}
            {turnCodes.length > 0 && otherCodes.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Otros
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}

            {/* Resto de códigos */}
            {otherCodes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {otherCodes.map((c) => (
                  <Chip
                    key={c.code}
                    code={c.code}
                    description={c.description}
                    isSelected={field.value === c.code}
                    onClick={() => field.onChange(c.code)}
                  />
                ))}
              </div>
            )}
          </div>

          {fieldState.error && <FormMessage>{fieldState.error.message}</FormMessage>}
        </FormItem>
      )}
    />
  );
}
