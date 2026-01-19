import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

type TailwindColor =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

type ColorIntensity =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "950";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  footer?: string;
  icon?: LucideIcon;
  variant?: "outline" | "default";
  color?: TailwindColor;
  colorIntensity?: ColorIntensity;
  showProgress?: boolean;
  progressValue?: number;
  progressMax?: number;
  className?: string;
}

// Mapeo de colores de background
const colorBgMap: Record<TailwindColor, Record<ColorIntensity, string>> = {
  slate: {
    "50": "bg-slate-50",
    "100": "bg-slate-100",
    "200": "bg-slate-200",
    "300": "bg-slate-300",
    "400": "bg-slate-400",
    "500": "bg-slate-500",
    "600": "bg-slate-600",
    "700": "bg-slate-700",
    "800": "bg-slate-800",
    "900": "bg-slate-900",
    "950": "bg-slate-950",
  },
  gray: {
    "50": "bg-gray-50",
    "100": "bg-gray-100",
    "200": "bg-gray-200",
    "300": "bg-gray-300",
    "400": "bg-gray-400",
    "500": "bg-gray-500",
    "600": "bg-gray-600",
    "700": "bg-gray-700",
    "800": "bg-gray-800",
    "900": "bg-gray-900",
    "950": "bg-gray-950",
  },
  zinc: {
    "50": "bg-zinc-50",
    "100": "bg-zinc-100",
    "200": "bg-zinc-200",
    "300": "bg-zinc-300",
    "400": "bg-zinc-400",
    "500": "bg-zinc-500",
    "600": "bg-zinc-600",
    "700": "bg-zinc-700",
    "800": "bg-zinc-800",
    "900": "bg-zinc-900",
    "950": "bg-zinc-950",
  },
  neutral: {
    "50": "bg-neutral-50",
    "100": "bg-neutral-100",
    "200": "bg-neutral-200",
    "300": "bg-neutral-300",
    "400": "bg-neutral-400",
    "500": "bg-neutral-500",
    "600": "bg-neutral-600",
    "700": "bg-neutral-700",
    "800": "bg-neutral-800",
    "900": "bg-neutral-900",
    "950": "bg-neutral-950",
  },
  stone: {
    "50": "bg-stone-50",
    "100": "bg-stone-100",
    "200": "bg-stone-200",
    "300": "bg-stone-300",
    "400": "bg-stone-400",
    "500": "bg-stone-500",
    "600": "bg-stone-600",
    "700": "bg-stone-700",
    "800": "bg-stone-800",
    "900": "bg-stone-900",
    "950": "bg-stone-950",
  },
  red: {
    "50": "bg-red-50",
    "100": "bg-red-100",
    "200": "bg-red-200",
    "300": "bg-red-300",
    "400": "bg-red-400",
    "500": "bg-red-500",
    "600": "bg-red-600",
    "700": "bg-red-700",
    "800": "bg-red-800",
    "900": "bg-red-900",
    "950": "bg-red-950",
  },
  orange: {
    "50": "bg-orange-50",
    "100": "bg-orange-100",
    "200": "bg-orange-200",
    "300": "bg-orange-300",
    "400": "bg-orange-400",
    "500": "bg-orange-500",
    "600": "bg-orange-600",
    "700": "bg-orange-700",
    "800": "bg-orange-800",
    "900": "bg-orange-900",
    "950": "bg-orange-950",
  },
  amber: {
    "50": "bg-amber-50",
    "100": "bg-amber-100",
    "200": "bg-amber-200",
    "300": "bg-amber-300",
    "400": "bg-amber-400",
    "500": "bg-amber-500",
    "600": "bg-amber-600",
    "700": "bg-amber-700",
    "800": "bg-amber-800",
    "900": "bg-amber-900",
    "950": "bg-amber-950",
  },
  yellow: {
    "50": "bg-yellow-50",
    "100": "bg-yellow-100",
    "200": "bg-yellow-200",
    "300": "bg-yellow-300",
    "400": "bg-yellow-400",
    "500": "bg-yellow-500",
    "600": "bg-yellow-600",
    "700": "bg-yellow-700",
    "800": "bg-yellow-800",
    "900": "bg-yellow-900",
    "950": "bg-yellow-950",
  },
  lime: {
    "50": "bg-lime-50",
    "100": "bg-lime-100",
    "200": "bg-lime-200",
    "300": "bg-lime-300",
    "400": "bg-lime-400",
    "500": "bg-lime-500",
    "600": "bg-lime-600",
    "700": "bg-lime-700",
    "800": "bg-lime-800",
    "900": "bg-lime-900",
    "950": "bg-lime-950",
  },
  green: {
    "50": "bg-green-50",
    "100": "bg-green-100",
    "200": "bg-green-200",
    "300": "bg-green-300",
    "400": "bg-green-400",
    "500": "bg-green-500",
    "600": "bg-green-600",
    "700": "bg-green-700",
    "800": "bg-green-800",
    "900": "bg-green-900",
    "950": "bg-green-950",
  },
  emerald: {
    "50": "bg-emerald-50",
    "100": "bg-emerald-100",
    "200": "bg-emerald-200",
    "300": "bg-emerald-300",
    "400": "bg-emerald-400",
    "500": "bg-emerald-500",
    "600": "bg-emerald-600",
    "700": "bg-emerald-700",
    "800": "bg-emerald-800",
    "900": "bg-emerald-900",
    "950": "bg-emerald-950",
  },
  teal: {
    "50": "bg-teal-50",
    "100": "bg-teal-100",
    "200": "bg-teal-200",
    "300": "bg-teal-300",
    "400": "bg-teal-400",
    "500": "bg-teal-500",
    "600": "bg-teal-600",
    "700": "bg-teal-700",
    "800": "bg-teal-800",
    "900": "bg-teal-900",
    "950": "bg-teal-950",
  },
  cyan: {
    "50": "bg-cyan-50",
    "100": "bg-cyan-100",
    "200": "bg-cyan-200",
    "300": "bg-cyan-300",
    "400": "bg-cyan-400",
    "500": "bg-cyan-500",
    "600": "bg-cyan-600",
    "700": "bg-cyan-700",
    "800": "bg-cyan-800",
    "900": "bg-cyan-900",
    "950": "bg-cyan-950",
  },
  sky: {
    "50": "bg-sky-50",
    "100": "bg-sky-100",
    "200": "bg-sky-200",
    "300": "bg-sky-300",
    "400": "bg-sky-400",
    "500": "bg-sky-500",
    "600": "bg-sky-600",
    "700": "bg-sky-700",
    "800": "bg-sky-800",
    "900": "bg-sky-900",
    "950": "bg-sky-950",
  },
  blue: {
    "50": "bg-blue-50",
    "100": "bg-blue-100",
    "200": "bg-blue-200",
    "300": "bg-blue-300",
    "400": "bg-blue-400",
    "500": "bg-blue-500",
    "600": "bg-blue-600",
    "700": "bg-blue-700",
    "800": "bg-blue-800",
    "900": "bg-blue-900",
    "950": "bg-blue-950",
  },
  indigo: {
    "50": "bg-indigo-50",
    "100": "bg-indigo-100",
    "200": "bg-indigo-200",
    "300": "bg-indigo-300",
    "400": "bg-indigo-400",
    "500": "bg-indigo-500",
    "600": "bg-indigo-600",
    "700": "bg-indigo-700",
    "800": "bg-indigo-800",
    "900": "bg-indigo-900",
    "950": "bg-indigo-950",
  },
  violet: {
    "50": "bg-violet-50",
    "100": "bg-violet-100",
    "200": "bg-violet-200",
    "300": "bg-violet-300",
    "400": "bg-violet-400",
    "500": "bg-violet-500",
    "600": "bg-violet-600",
    "700": "bg-violet-700",
    "800": "bg-violet-800",
    "900": "bg-violet-900",
    "950": "bg-violet-950",
  },
  purple: {
    "50": "bg-purple-50",
    "100": "bg-purple-100",
    "200": "bg-purple-200",
    "300": "bg-purple-300",
    "400": "bg-purple-400",
    "500": "bg-purple-500",
    "600": "bg-purple-600",
    "700": "bg-purple-700",
    "800": "bg-purple-800",
    "900": "bg-purple-900",
    "950": "bg-purple-950",
  },
  fuchsia: {
    "50": "bg-fuchsia-50",
    "100": "bg-fuchsia-100",
    "200": "bg-fuchsia-200",
    "300": "bg-fuchsia-300",
    "400": "bg-fuchsia-400",
    "500": "bg-fuchsia-500",
    "600": "bg-fuchsia-600",
    "700": "bg-fuchsia-700",
    "800": "bg-fuchsia-800",
    "900": "bg-fuchsia-900",
    "950": "bg-fuchsia-950",
  },
  pink: {
    "50": "bg-pink-50",
    "100": "bg-pink-100",
    "200": "bg-pink-200",
    "300": "bg-pink-300",
    "400": "bg-pink-400",
    "500": "bg-pink-500",
    "600": "bg-pink-600",
    "700": "bg-pink-700",
    "800": "bg-pink-800",
    "900": "bg-pink-900",
    "950": "bg-pink-950",
  },
  rose: {
    "50": "bg-rose-50",
    "100": "bg-rose-100",
    "200": "bg-rose-200",
    "300": "bg-rose-300",
    "400": "bg-rose-400",
    "500": "bg-rose-500",
    "600": "bg-rose-600",
    "700": "bg-rose-700",
    "800": "bg-rose-800",
    "900": "bg-rose-900",
    "950": "bg-rose-950",
  },
};

// Mapeo de colores de texto con contraste
const colorTextMap: Record<TailwindColor, Record<ColorIntensity, string>> = {
  slate: {
    "50": "text-slate-900",
    "100": "text-slate-900",
    "200": "text-slate-900",
    "300": "text-slate-900",
    "400": "text-slate-900",
    "500": "text-slate-50",
    "600": "text-slate-50",
    "700": "text-slate-50",
    "800": "text-slate-50",
    "900": "text-slate-50",
    "950": "text-slate-50",
  },
  gray: {
    "50": "text-gray-900",
    "100": "text-gray-900",
    "200": "text-gray-900",
    "300": "text-gray-900",
    "400": "text-gray-900",
    "500": "text-gray-50",
    "600": "text-gray-50",
    "700": "text-gray-50",
    "800": "text-gray-50",
    "900": "text-gray-50",
    "950": "text-gray-50",
  },
  zinc: {
    "50": "text-zinc-900",
    "100": "text-zinc-900",
    "200": "text-zinc-900",
    "300": "text-zinc-900",
    "400": "text-zinc-900",
    "500": "text-zinc-50",
    "600": "text-zinc-50",
    "700": "text-zinc-50",
    "800": "text-zinc-50",
    "900": "text-zinc-50",
    "950": "text-zinc-50",
  },
  neutral: {
    "50": "text-neutral-900",
    "100": "text-neutral-900",
    "200": "text-neutral-900",
    "300": "text-neutral-900",
    "400": "text-neutral-900",
    "500": "text-neutral-50",
    "600": "text-neutral-50",
    "700": "text-neutral-50",
    "800": "text-neutral-50",
    "900": "text-neutral-50",
    "950": "text-neutral-50",
  },
  stone: {
    "50": "text-stone-900",
    "100": "text-stone-900",
    "200": "text-stone-900",
    "300": "text-stone-900",
    "400": "text-stone-900",
    "500": "text-stone-50",
    "600": "text-stone-50",
    "700": "text-stone-50",
    "800": "text-stone-50",
    "900": "text-stone-50",
    "950": "text-stone-50",
  },
  red: {
    "50": "text-red-900",
    "100": "text-red-900",
    "200": "text-red-900",
    "300": "text-red-900",
    "400": "text-red-900",
    "500": "text-red-50",
    "600": "text-red-50",
    "700": "text-red-50",
    "800": "text-red-50",
    "900": "text-red-50",
    "950": "text-red-50",
  },
  orange: {
    "50": "text-orange-900",
    "100": "text-orange-900",
    "200": "text-orange-900",
    "300": "text-orange-900",
    "400": "text-orange-900",
    "500": "text-orange-50",
    "600": "text-orange-50",
    "700": "text-orange-50",
    "800": "text-orange-50",
    "900": "text-orange-50",
    "950": "text-orange-50",
  },
  amber: {
    "50": "text-amber-900",
    "100": "text-amber-900",
    "200": "text-amber-900",
    "300": "text-amber-900",
    "400": "text-amber-900",
    "500": "text-amber-50",
    "600": "text-amber-50",
    "700": "text-amber-50",
    "800": "text-amber-50",
    "900": "text-amber-50",
    "950": "text-amber-50",
  },
  yellow: {
    "50": "text-yellow-900",
    "100": "text-yellow-900",
    "200": "text-yellow-900",
    "300": "text-yellow-900",
    "400": "text-yellow-900",
    "500": "text-yellow-900",
    "600": "text-yellow-50",
    "700": "text-yellow-50",
    "800": "text-yellow-50",
    "900": "text-yellow-50",
    "950": "text-yellow-50",
  },
  lime: {
    "50": "text-lime-900",
    "100": "text-lime-900",
    "200": "text-lime-900",
    "300": "text-lime-900",
    "400": "text-lime-900",
    "500": "text-lime-900",
    "600": "text-lime-50",
    "700": "text-lime-50",
    "800": "text-lime-50",
    "900": "text-lime-50",
    "950": "text-lime-50",
  },
  green: {
    "50": "text-green-900",
    "100": "text-green-900",
    "200": "text-green-900",
    "300": "text-green-900",
    "400": "text-green-900",
    "500": "text-green-50",
    "600": "text-green-50",
    "700": "text-green-50",
    "800": "text-green-50",
    "900": "text-green-50",
    "950": "text-green-50",
  },
  emerald: {
    "50": "text-emerald-900",
    "100": "text-emerald-900",
    "200": "text-emerald-900",
    "300": "text-emerald-900",
    "400": "text-emerald-900",
    "500": "text-emerald-50",
    "600": "text-emerald-50",
    "700": "text-emerald-50",
    "800": "text-emerald-50",
    "900": "text-emerald-50",
    "950": "text-emerald-50",
  },
  teal: {
    "50": "text-teal-900",
    "100": "text-teal-900",
    "200": "text-teal-900",
    "300": "text-teal-900",
    "400": "text-teal-900",
    "500": "text-teal-50",
    "600": "text-teal-50",
    "700": "text-teal-50",
    "800": "text-teal-50",
    "900": "text-teal-50",
    "950": "text-teal-50",
  },
  cyan: {
    "50": "text-cyan-900",
    "100": "text-cyan-900",
    "200": "text-cyan-900",
    "300": "text-cyan-900",
    "400": "text-cyan-900",
    "500": "text-cyan-900",
    "600": "text-cyan-50",
    "700": "text-cyan-50",
    "800": "text-cyan-50",
    "900": "text-cyan-50",
    "950": "text-cyan-50",
  },
  sky: {
    "50": "text-sky-900",
    "100": "text-sky-900",
    "200": "text-sky-900",
    "300": "text-sky-900",
    "400": "text-sky-900",
    "500": "text-sky-50",
    "600": "text-sky-50",
    "700": "text-sky-50",
    "800": "text-sky-50",
    "900": "text-sky-50",
    "950": "text-sky-50",
  },
  blue: {
    "50": "text-blue-900",
    "100": "text-blue-900",
    "200": "text-blue-900",
    "300": "text-blue-900",
    "400": "text-blue-900",
    "500": "text-blue-50",
    "600": "text-blue-50",
    "700": "text-blue-50",
    "800": "text-blue-50",
    "900": "text-blue-50",
    "950": "text-blue-50",
  },
  indigo: {
    "50": "text-indigo-900",
    "100": "text-indigo-900",
    "200": "text-indigo-900",
    "300": "text-indigo-900",
    "400": "text-indigo-900",
    "500": "text-indigo-50",
    "600": "text-indigo-50",
    "700": "text-indigo-50",
    "800": "text-indigo-50",
    "900": "text-indigo-50",
    "950": "text-indigo-50",
  },
  violet: {
    "50": "text-violet-900",
    "100": "text-violet-900",
    "200": "text-violet-900",
    "300": "text-violet-900",
    "400": "text-violet-900",
    "500": "text-violet-50",
    "600": "text-violet-50",
    "700": "text-violet-50",
    "800": "text-violet-50",
    "900": "text-violet-50",
    "950": "text-violet-50",
  },
  purple: {
    "50": "text-purple-900",
    "100": "text-purple-900",
    "200": "text-purple-900",
    "300": "text-purple-900",
    "400": "text-purple-900",
    "500": "text-purple-50",
    "600": "text-purple-50",
    "700": "text-purple-50",
    "800": "text-purple-50",
    "900": "text-purple-50",
    "950": "text-purple-50",
  },
  fuchsia: {
    "50": "text-fuchsia-900",
    "100": "text-fuchsia-900",
    "200": "text-fuchsia-900",
    "300": "text-fuchsia-900",
    "400": "text-fuchsia-900",
    "500": "text-fuchsia-50",
    "600": "text-fuchsia-50",
    "700": "text-fuchsia-50",
    "800": "text-fuchsia-50",
    "900": "text-fuchsia-50",
    "950": "text-fuchsia-50",
  },
  pink: {
    "50": "text-pink-900",
    "100": "text-pink-900",
    "200": "text-pink-900",
    "300": "text-pink-900",
    "400": "text-pink-900",
    "500": "text-pink-50",
    "600": "text-pink-50",
    "700": "text-pink-50",
    "800": "text-pink-50",
    "900": "text-pink-50",
    "950": "text-pink-50",
  },
  rose: {
    "50": "text-rose-900",
    "100": "text-rose-900",
    "200": "text-rose-900",
    "300": "text-rose-900",
    "400": "text-rose-900",
    "500": "text-rose-50",
    "600": "text-rose-50",
    "700": "text-rose-50",
    "800": "text-rose-50",
    "900": "text-rose-50",
    "950": "text-rose-50",
  },
};

// Mapeo de colores para valor (outline variant)
const colorValueMap: Record<TailwindColor, string> = {
  slate: "text-slate-600 dark:text-slate-400",
  gray: "text-gray-600 dark:text-gray-400",
  zinc: "text-zinc-600 dark:text-zinc-400",
  neutral: "text-neutral-600 dark:text-neutral-400",
  stone: "text-stone-600 dark:text-stone-400",
  red: "text-red-600 dark:text-red-400",
  orange: "text-orange-600 dark:text-orange-400",
  amber: "text-amber-600 dark:text-amber-400",
  yellow: "text-yellow-600 dark:text-yellow-400",
  lime: "text-lime-600 dark:text-lime-400",
  green: "text-green-600 dark:text-green-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  teal: "text-teal-600 dark:text-teal-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  sky: "text-sky-600 dark:text-sky-400",
  blue: "text-blue-600 dark:text-blue-400",
  indigo: "text-indigo-600 dark:text-indigo-400",
  violet: "text-violet-600 dark:text-violet-400",
  purple: "text-purple-600 dark:text-purple-400",
  fuchsia: "text-fuchsia-600 dark:text-fuchsia-400",
  pink: "text-pink-600 dark:text-pink-400",
  rose: "text-rose-600 dark:text-rose-400",
};

// Mapeo de colores para barra de progreso (outline variant)
const colorProgressMap: Record<TailwindColor, string> = {
  slate: "bg-slate-600",
  gray: "bg-gray-600",
  zinc: "bg-zinc-600",
  neutral: "bg-neutral-600",
  stone: "bg-stone-600",
  red: "bg-red-600",
  orange: "bg-orange-600",
  amber: "bg-amber-600",
  yellow: "bg-yellow-600",
  lime: "bg-lime-600",
  green: "bg-green-600",
  emerald: "bg-emerald-600",
  teal: "bg-teal-600",
  cyan: "bg-cyan-600",
  sky: "bg-sky-600",
  blue: "bg-blue-600",
  indigo: "bg-indigo-600",
  violet: "bg-violet-600",
  purple: "bg-purple-600",
  fuchsia: "bg-fuchsia-600",
  pink: "bg-pink-600",
  rose: "bg-rose-600",
};

export function MetricCard({
  title,
  value,
  subtitle,
  footer,
  icon: Icon,
  variant = "outline",
  color = "blue",
  colorIntensity = "600",
  showProgress = false,
  progressValue = 0,
  progressMax = 100,
  className,
}: MetricCardProps) {
  const progressPercentage =
    progressMax > 0 ? (progressValue / progressMax) * 100 : 0;

  const bgClass =
    variant === "default" ? colorBgMap[color][colorIntensity] : "";
  const textClass =
    variant === "default" ? colorTextMap[color][colorIntensity] : "";
  const valueClass =
    variant === "default"
      ? colorTextMap[color][colorIntensity]
      : colorValueMap[color];
  const bgClassIcon = colorBgMap[color][colorIntensity];

  return (
    <Card
      className={cn(
        "overflow-hidden",
        "@container/card",
        variant === "outline" && "bg-linear-to-br from-muted to-background",
        variant === "default" && bgClass,
        className,
      )}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex w-full justify-between items-center">
          <CardDescription
            className={cn(
              "line-clamp-1 font-semibold",
              variant === "default" && textClass,
            )}
          >
            {title}
          </CardDescription>

          {Icon && (
            <div className={cn("p-1 rounded-md", bgClassIcon)}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        <CardTitle
          className={cn(
            "text-2xl font-semibold tabular-nums @[250px]/card:text-3xl mb-0",
            valueClass,
          )}
        >
          {value}
        </CardTitle>
        {subtitle && (
          <p
            className={cn(
              "text-xs line-clamp-1",
              variant === "default" ? textClass : "text-muted-foreground",
            )}
          >
            {subtitle}
          </p>
        )}
      </CardHeader>
      {(footer || showProgress) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm px-4 pb-4">
          {footer && (
            <div
              className={cn(
                "line-clamp-1 flex gap-2 font-medium items-center",
                variant === "default" && textClass,
              )}
            >
              {footer}
              {Icon && <Icon className="size-4" />}
            </div>
          )}
          {showProgress && (
            <Progress
              value={progressPercentage}
              className={cn(
                "h-1.5",
                variant === "default"
                  ? "bg-black/10 dark:bg-white/10"
                  : "bg-gray-200 dark:bg-gray-800",
              )}
              indicatorClassName={cn(
                variant === "default" ? "bg-white/30" : colorProgressMap[color],
              )}
            />
          )}
        </CardFooter>
      )}
    </Card>
  );
}
