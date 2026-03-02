import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export const colorMap = {
  default:   { icon: "text-primary dark:text-primary-foreground",           bg: "bg-muted" },
  primary:   { icon: "text-primary dark:text-primary-foreground",           bg: "bg-primary/5 dark:bg-primary/10" },
  secondary: { icon: "text-secondary dark:text-secondary-foreground",       bg: "bg-secondary/5 dark:bg-secondary/10" },
  slate:     { icon: "text-slate-700 dark:text-slate-300",                  bg: "bg-slate-50 dark:bg-slate-900" },
  gray:      { icon: "text-gray-700 dark:text-gray-300",                    bg: "bg-gray-50 dark:bg-gray-900" },
  zinc:      { icon: "text-zinc-700 dark:text-zinc-300",                    bg: "bg-zinc-50 dark:bg-zinc-900" },
  neutral:   { icon: "text-neutral-700 dark:text-neutral-300",              bg: "bg-neutral-50 dark:bg-neutral-900" },
  stone:     { icon: "text-stone-700 dark:text-stone-300",                  bg: "bg-stone-50 dark:bg-stone-900" },
  red:       { icon: "text-red-700 dark:text-red-300",                      bg: "bg-red-50 dark:bg-red-950" },
  orange:    { icon: "text-orange-700 dark:text-orange-300",                bg: "bg-orange-50 dark:bg-orange-950" },
  amber:     { icon: "text-amber-700 dark:text-amber-300",                  bg: "bg-amber-50 dark:bg-amber-950" },
  yellow:    { icon: "text-yellow-700 dark:text-yellow-300",                bg: "bg-yellow-50 dark:bg-yellow-950" },
  lime:      { icon: "text-lime-700 dark:text-lime-300",                    bg: "bg-lime-50 dark:bg-lime-950" },
  green:     { icon: "text-green-700 dark:text-green-300",                  bg: "bg-green-50 dark:bg-green-950" },
  emerald:   { icon: "text-emerald-700 dark:text-emerald-300",              bg: "bg-emerald-50 dark:bg-emerald-950" },
  teal:      { icon: "text-teal-700 dark:text-teal-300",                    bg: "bg-teal-50 dark:bg-teal-950" },
  cyan:      { icon: "text-cyan-700 dark:text-cyan-300",                    bg: "bg-cyan-50 dark:bg-cyan-950" },
  sky:       { icon: "text-sky-700 dark:text-sky-300",                      bg: "bg-sky-50 dark:bg-sky-950" },
  blue:      { icon: "text-blue-700 dark:text-blue-300",                    bg: "bg-blue-50 dark:bg-blue-950" },
  indigo:    { icon: "text-indigo-700 dark:text-indigo-300",                bg: "bg-indigo-50 dark:bg-indigo-950" },
  violet:    { icon: "text-violet-700 dark:text-violet-300",                bg: "bg-violet-50 dark:bg-violet-950" },
  purple:    { icon: "text-purple-700 dark:text-purple-300",                bg: "bg-purple-50 dark:bg-purple-950" },
  fuchsia:   { icon: "text-fuchsia-700 dark:text-fuchsia-300",              bg: "bg-fuchsia-50 dark:bg-fuchsia-950" },
  pink:      { icon: "text-pink-700 dark:text-pink-300",                    bg: "bg-pink-50 dark:bg-pink-950" },
  rose:      { icon: "text-rose-700 dark:text-rose-300",                    bg: "bg-rose-50 dark:bg-rose-950" },
} as const;

export type GroupFormSectionColor = keyof typeof colorMap;

interface FormSectionProps {
  title: string;
  icon: LucideIcon;
  color?: GroupFormSectionColor;
  children: ReactNode;
  cols?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6;
    md?: 1 | 2 | 3 | 4 | 5 | 6;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
    "2xl"?: 1 | 2 | 3 | 4 | 5 | 6;
  };
  className?: string;
  gap?: string;
  headerExtra?: ReactNode;
}

const colsMap = {
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  },
  "2xl": {
    1: "2xl:grid-cols-1",
    2: "2xl:grid-cols-2",
    3: "2xl:grid-cols-3",
    4: "2xl:grid-cols-4",
    5: "2xl:grid-cols-5",
    6: "2xl:grid-cols-6",
  },
} as const;

export const GroupFormSection = ({
  title,
  icon: Icon,
  color = "default",
  children,
  cols = { sm: 2, md: 3, lg: 4 },
  className,
  gap = "gap-3",
  headerExtra,
}: FormSectionProps) => {
  const { icon: iconClass, bg: bgClass } = colorMap[color];

  const gridClasses = [
    "grid",
    "grid-cols-1",
    cols.sm && colsMap.sm[cols.sm],
    cols.md && colsMap.md[cols.md],
    cols.lg && colsMap.lg[cols.lg],
    cols.xl && colsMap.xl[cols.xl],
    cols["2xl"] && colsMap["2xl"][cols["2xl"]],
    gap,
    "items-start",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        `bg-background rounded-md border border-muted shadow-sm overflow-hidden`,
        className,
      )}
    >
      <div className={`${bgClass} px-3 py-1.5 border-b border-muted`}>
        <div className="flex flex-row flex-wrap justify-between sm:items-center gap-3">
          <h3
            className={cn(
              "text-sm md:text-base font-semibold flex items-center",
              iconClass,
            )}
          >
            <Icon className={`size-4 md:size-5 mr-2`} />
            {title}
          </h3>
          {headerExtra}
        </div>
      </div>
      <div className="p-3">
        <div className={cn(gridClasses)}>{children}</div>
      </div>
    </div>
  );
};
