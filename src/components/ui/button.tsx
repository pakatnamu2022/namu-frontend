import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";

// Color map: define cada color UNA vez con todas sus variantes
const colorClasses = {
  blue: {
    text: "text-blue-500 dark:text-blue-400",
    border: "border-blue-500 dark:border-blue-400",
    bg: "bg-blue-500 dark:bg-blue-600 text-white",
    hover: "hover:bg-blue-50 dark:hover:bg-blue-950",
  },
  green: {
    text: "text-green-500 dark:text-green-400",
    border: "border-green-500 dark:border-green-400",
    bg: "bg-green-500 dark:bg-green-600 text-white",
    hover: "hover:bg-green-50 dark:hover:bg-green-950",
  },
  red: {
    text: "text-red-500 dark:text-red-400",
    border: "border-red-500 dark:border-red-400",
    bg: "bg-red-500 dark:bg-red-600 text-white",
    hover: "hover:bg-red-50 dark:hover:bg-red-950",
  },
  purple: {
    text: "text-purple-500 dark:text-purple-400",
    border: "border-purple-500 dark:border-purple-400",
    bg: "bg-purple-500 dark:bg-purple-600 text-white",
    hover: "hover:bg-purple-50 dark:hover:bg-purple-950",
  },
  orange: {
    text: "text-orange-500 dark:text-orange-400",
    border: "border-orange-500 dark:border-orange-400",
    bg: "bg-orange-500 dark:bg-orange-600 text-white",
    hover: "hover:bg-orange-50 dark:hover:bg-orange-950",
  },
  lime: {
    text: "text-lime-500 dark:text-lime-400",
    border: "border-lime-500 dark:border-lime-400",
    bg: "bg-lime-500 dark:bg-lime-600 text-white",
    hover: "hover:bg-lime-50 dark:hover:bg-lime-950",
  },
  indigo: {
    text: "text-indigo-500 dark:text-indigo-400",
    border: "border-indigo-500 dark:border-indigo-400",
    bg: "bg-indigo-500 dark:bg-indigo-600 text-white",
    hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950",
  },
  amber: {
    text: "text-amber-500 dark:text-amber-400",
    border: "border-amber-500 dark:border-amber-400",
    bg: "bg-amber-500 dark:bg-amber-600 text-white",
    hover: "hover:bg-amber-50 dark:hover:bg-amber-950",
  },
} as const;

// Generar compound variants automáticamente desde el color map
const colorKeys = Object.keys(colorClasses) as Array<keyof typeof colorClasses>;

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neutral: "bg-background text-foreground",
        tertiary:
          "bg-tertiary text-tertiary-foreground hover:bg-tertiary/80 border",
      },
      color: Object.fromEntries(colorKeys.map((key) => [key, ""])) as Record<
        keyof typeof colorClasses,
        string
      >,
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-7 px-3 rounded-sm",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs md:text-sm",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-7",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    compoundVariants: [
      // Default (solid) + colores
      ...colorKeys.map((color) => ({
        variant: "default" as const,
        color,
        class: `${colorClasses[color].bg} hover:opacity-90`,
      })),

      // Outline + colores
      ...colorKeys.map((color) => ({
        variant: "outline" as const,
        color,
        class: `${colorClasses[color].text} ${colorClasses[color].hover}`,
      })),

      // Ghost + colores
      ...colorKeys.map((color) => ({
        variant: "ghost" as const,
        color,
        class: `${colorClasses[color].text} ${colorClasses[color].hover}`,
      })),
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltip?: React.ReactNode; // ✅ puede ser string o JSX
  delayDuration?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      color,
      asChild = false,
      tooltip,
      delayDuration,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? SlotPrimitive.Slot : "button";
    const button = (
      <Comp
        className={cn(buttonVariants({ variant, size, color, className }))}
        ref={ref}
        {...props}
      />
    );

    return tooltip ? (
      <Tooltip
        delayDuration={delayDuration ?? 300}
        disableHoverableContent={true}
      >
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    ) : (
      button
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
