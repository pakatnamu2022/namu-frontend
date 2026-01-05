"use client";
import { getDay, getDaysInMonth, isSameDay } from "date-fns";
import { atom, useAtom } from "jotai";
import {
  Check,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDown,
} from "lucide-react";
import {
  createContext,
  memo,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
export type CalendarState = {
  month: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
  year: number;
};
// Initialize with current date - using function to ensure fresh date on each initialization
const monthAtom = atom<CalendarState["month"]>(
  (() => new Date().getMonth())() as CalendarState["month"]
);
const yearAtom = atom<CalendarState["year"]>(
  (() => new Date().getFullYear())()
);
export const useCalendarMonth = () => useAtom(monthAtom);
export const useCalendarYear = () => useAtom(yearAtom);
type CalendarContextProps = {
  locale: Intl.LocalesArgument;
  startDay: number;
};
const CalendarContext = createContext<CalendarContextProps>({
  locale: "en-US",
  startDay: 0,
});
export type Status = {
  id: string;
  name: string;
  color: string;
};
export type Feature = {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status: Status;
};
type ComboboxProps = {
  value: string;
  setValue: (value: string) => void;
  data: {
    value: string;
    label: string;
  }[];
  labels: {
    button: string;
    empty: string;
    search: string;
  };
  className?: string;
};
export const monthsForLocale = (
  localeName: Intl.LocalesArgument,
  monthFormat: Intl.DateTimeFormatOptions["month"] = "long"
) => {
  const format = new Intl.DateTimeFormat(localeName, { month: monthFormat })
    .format;
  return [...new Array(12).keys()].map((m) =>
    format(new Date(Date.UTC(2021, m, 2)))
  );
};
export const daysForLocale = (
  locale: Intl.LocalesArgument,
  startDay: number
) => {
  const weekdays: string[] = [];
  const baseDate = new Date(2024, 0, startDay);
  for (let i = 0; i < 7; i++) {
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: "short" }).format(baseDate)
    );
    baseDate.setDate(baseDate.getDate() + 1);
  }
  return weekdays;
};
const Combobox: React.FC<ComboboxProps> = ({
  value,
  setValue,
  data,
  labels,
  className,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className={cn("w-40 justify-between capitalize", className)}
          variant="outline"
        >
          {value
            ? data.find((item) => item.value === value)?.label
            : labels.button}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* Evitamos doble scrollbar: PopoverContent sin scroll y CommandList con max-h y overflow */}
      <PopoverContent className="w-40 p-0 overflow-hidden">
        <Command
          filter={(itemValue: string, search: string) => {
            const label = data.find((d) => d.value === itemValue)?.label;
            return label?.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder={labels.search} />

          {/* Limitamos la altura del list para que el scroll esté contenido aquí */}
          <CommandList className="max-h-44 overflow-auto">
            <CommandEmpty>{labels.empty}</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  className="capitalize"
                  key={item.value}
                  onSelect={(currentValue: string) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  value={item.value}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
type OutOfBoundsDayProps = {
  day: number;
};
const OutOfBoundsDay = ({ day }: OutOfBoundsDayProps) => (
  <div className="relative h-full w-full bg-secondary p-1 text-muted-foreground text-xs">
    {day}
  </div>
);
export type CalendarDayData = {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  features?: Feature[];
};

export type CalendarDayRenderProps = {
  dayData: CalendarDayData;
  onClick?: (dayData: CalendarDayData) => void;
  className?: string;
};

export type CalendarDayFeatureRenderProps = {
  dayData: CalendarDayData;
  onClick?: (dayData: CalendarDayData) => void;
  feature: Feature;
};

export type CalendarBodyProps = {
  features?: Feature[];
  children?: (props: CalendarDayFeatureRenderProps) => ReactNode;
  renderDay?: (props: CalendarDayRenderProps) => ReactNode;
  onDayClick?: (dayData: CalendarDayData) => void;
  showOutOfBoundsDays?: boolean;
  className?: string;
};
export const CalendarBody = ({
  features = [],
  children,
  renderDay,
  onDayClick,
  showOutOfBoundsDays = true,
  className,
}: CalendarBodyProps) => {
  const [month] = useCalendarMonth();
  const [year] = useCalendarYear();
  const { startDay } = useContext(CalendarContext);
  // Memoize expensive date calculations
  const currentMonthDate = useMemo(
    () => new Date(year, month, 1),
    [year, month]
  );
  const daysInMonth = useMemo(
    () => getDaysInMonth(currentMonthDate),
    [currentMonthDate]
  );
  const firstDay = useMemo(
    () => (getDay(currentMonthDate) - startDay + 7) % 7,
    [currentMonthDate, startDay]
  );
  // Memoize previous month calculations
  const prevMonthData = useMemo(() => {
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthDays = getDaysInMonth(new Date(prevMonthYear, prevMonth, 1));
    const prevMonthDaysArray = Array.from(
      { length: prevMonthDays },
      (_, i) => i + 1
    );
    return { prevMonthDays, prevMonthDaysArray };
  }, [month, year]);
  // Memoize next month calculations
  const nextMonthData = useMemo(() => {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonthDays = getDaysInMonth(new Date(nextMonthYear, nextMonth, 1));
    const nextMonthDaysArray = Array.from(
      { length: nextMonthDays },
      (_, i) => i + 1
    );
    return { nextMonthDaysArray };
  }, [month, year]);
  // Memoize features filtering by day to avoid recalculating on every render
  const featuresByDay = useMemo(() => {
    const result: { [day: number]: Feature[] } = {};
    for (let day = 1; day <= daysInMonth; day++) {
      result[day] = features.filter((feature) => {
        return isSameDay(new Date(feature.endAt), new Date(year, month, day));
      });
    }
    return result;
  }, [features, daysInMonth, year, month]);

  // Helper function to create day data
  const createDayData = useCallback(
    (
      day: number,
      targetMonth: number,
      targetYear: number,
      isCurrentMonth: boolean
    ): CalendarDayData => ({
      date: new Date(targetYear, targetMonth, day),
      day,
      month: targetMonth,
      year: targetYear,
      isCurrentMonth,
      features: isCurrentMonth ? featuresByDay[day] || [] : [],
    }),
    [featuresByDay]
  );

  // Default day renderer if none provided
  const defaultRenderDay = useCallback(
    (props: CalendarDayRenderProps) => {
      const { dayData, onClick, className: dayClassName } = props;
      const { day, isCurrentMonth, features: dayFeatures = [] } = dayData;

      if (!isCurrentMonth) {
        return showOutOfBoundsDays ? <OutOfBoundsDay day={day} /> : null;
      }

      return (
        <div
          className={cn(
            "relative flex h-full w-full flex-col gap-1 p-1 text-muted-foreground text-xs cursor-pointer hover:bg-muted/50 transition-colors",
            dayClassName
          )}
          onClick={() => onClick?.(dayData)}
        >
          <span className="font-medium">{day}</span>
          <div className="flex-1 overflow-hidden">
            {children
              ? dayFeatures
                  .slice(0, 3)
                  .map((feature, index) => (
                    <div key={`${feature.id}-${index}`}>
                      {children({ dayData, onClick, feature })}
                    </div>
                  ))
              : dayFeatures
                  .slice(0, 3)
                  .map((feature, index) => (
                    <CalendarItem
                      key={`${feature.id}-${index}`}
                      feature={feature}
                    />
                  ))}
          </div>
          {dayFeatures.length > 3 && (
            <span className="block text-muted-foreground text-xs">
              +{dayFeatures.length - 3} more
            </span>
          )}
        </div>
      );
    },
    [children, showOutOfBoundsDays]
  );
  // Use the provided renderDay function or default
  const dayRenderer = renderDay || defaultRenderDay;

  const days: ReactNode[] = [];

  // Previous month days
  for (let i = 0; i < firstDay; i++) {
    const day =
      prevMonthData.prevMonthDaysArray[
        prevMonthData.prevMonthDays - firstDay + i
      ];
    if (day) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const dayData = createDayData(day, prevMonth, prevMonthYear, false);

      const renderedDay = dayRenderer({
        dayData,
        onClick: onDayClick,
      });

      if (renderedDay) {
        days.push(
          <div className="h-full" key={`prev-${i}`}>
            {renderedDay}
          </div>
        );
      }
    }
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayData = createDayData(day, month, year, true);

    const renderedDay = dayRenderer({
      dayData,
      onClick: onDayClick,
    });

    days.push(
      <div className="h-full" key={`current-${day}`}>
        {renderedDay}
      </div>
    );
  }

  // Next month days
  const remainingDays = 7 - ((firstDay + daysInMonth) % 7);
  if (remainingDays < 7) {
    for (let i = 0; i < remainingDays; i++) {
      const day = nextMonthData.nextMonthDaysArray[i];
      if (day) {
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextMonthYear = month === 11 ? year + 1 : year;
        const dayData = createDayData(day, nextMonth, nextMonthYear, false);

        const renderedDay = dayRenderer({
          dayData,
          onClick: onDayClick,
        });

        if (renderedDay) {
          days.push(
            <div className="h-full" key={`next-${i}`}>
              {renderedDay}
            </div>
          );
        }
      }
    }
  }
  return (
    <div className={cn("grid grow grid-cols-7", className)}>
      {days.map((day, index) => (
        <div
          className={cn(
            "relative aspect-square overflow-hidden border-t border-r",
            index % 7 === 6 && "border-r-0"
          )}
          key={index}
        >
          {day}
        </div>
      ))}
    </div>
  );
};
export type CalendarDatePickerProps = {
  className?: string;
  children: ReactNode;
};
export const CalendarDatePicker = ({
  className,
  children,
}: CalendarDatePickerProps) => (
  <div className={cn("flex items-center gap-1", className)}>{children}</div>
);
export type CalendarMonthPickerProps = {
  className?: string;
};
export const CalendarMonthPicker = ({
  className,
}: CalendarMonthPickerProps) => {
  const [month, setMonth] = useCalendarMonth();
  const { locale } = useContext(CalendarContext);
  // Memoize month data to avoid recalculating date formatting
  const monthData = useMemo(() => {
    return monthsForLocale(locale).map((month, index) => ({
      value: index.toString(),
      label: month,
    }));
  }, [locale]);
  return (
    <Combobox
      className={className}
      data={monthData}
      labels={{
        button: "Select month",
        empty: "No month found",
        search: "Search month",
      }}
      setValue={(value) =>
        setMonth(Number.parseInt(value) as CalendarState["month"])
      }
      value={month.toString()}
    />
  );
};
export type CalendarYearPickerProps = {
  className?: string;
  start: number;
  end: number;
};
export const CalendarYearPicker = ({
  className,
  start,
  end,
}: CalendarYearPickerProps) => {
  const [year, setYear] = useCalendarYear();
  return (
    <Combobox
      className={className}
      data={Array.from({ length: end - start + 1 }, (_, i) => ({
        value: (start + i).toString(),
        label: (start + i).toString(),
      }))}
      labels={{
        button: "Select year",
        empty: "No year found",
        search: "Search year",
      }}
      setValue={(value) => setYear(Number.parseInt(value))}
      value={year.toString()}
    />
  );
};
export type CalendarDatePaginationProps = {
  className?: string;
};
export const CalendarDatePagination = ({
  className,
}: CalendarDatePaginationProps) => {
  const [month, setMonth] = useCalendarMonth();
  const [year, setYear] = useCalendarYear();
  
  const handlePreviousMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth((month - 1) as CalendarState["month"]);
    }
  }, [month, year, setMonth, setYear]);

  const handleNextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth((month + 1) as CalendarState["month"]);
    }
  }, [month, year, setMonth, setYear]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button onClick={handlePreviousMonth} size="icon" variant="ghost">
        <ChevronLeftIcon size={16} />
      </Button>
      <Button onClick={handleNextMonth} size="icon" variant="ghost">
        <ChevronRightIcon size={16} />
      </Button>
    </div>
  );
};
export type CalendarDateProps = {
  children: ReactNode;
};
export const CalendarDate = ({ children }: CalendarDateProps) => (
  <div className="flex items-center justify-between p-3">{children}</div>
);
export type CalendarHeaderProps = {
  className?: string;
};
export const CalendarHeader = ({ className }: CalendarHeaderProps) => {
  const { locale, startDay } = useContext(CalendarContext);
  // Memoize days data to avoid recalculating date formatting
  const daysData = useMemo(() => {
    return daysForLocale(locale, startDay);
  }, [locale, startDay]);
  return (
    <div className={cn("grid grow grid-cols-7", className)}>
      {daysData.map((day) => (
        <div className="p-3 text-right text-muted-foreground text-xs" key={day}>
          {day}
        </div>
      ))}
    </div>
  );
};
export type CalendarItemProps = {
  feature: Feature;
  className?: string;
};
export const CalendarItem = memo(
  ({ feature, className }: CalendarItemProps) => (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: feature.status.color,
        }}
      />
      <span className="truncate">{feature.name}</span>
    </div>
  )
);
CalendarItem.displayName = "CalendarItem";

// Helper components for common use cases
export type CalendarDayContentProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export const CalendarDayContent = ({
  children,
  onClick,
  className,
}: CalendarDayContentProps) => (
  <div
    className={cn(
      "p-1 rounded text-xs bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

export type CalendarDayButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  className?: string;
};

export const CalendarDayButton = ({
  children,
  onClick,
  variant = "default",
  size = "xs",
  className,
}: CalendarDayButtonProps) => (
  <Button
    onClick={onClick}
    variant={variant}
    size={size}
    className={cn("h-auto p-1 text-xs", className)}
  >
    {children}
  </Button>
);

export type CalendarDayBadgeProps = {
  children: ReactNode;
  color?: string;
  onClick?: () => void;
  className?: string;
};

export const CalendarDayBadge = ({
  children,
  color,
  onClick,
  className,
}: CalendarDayBadgeProps) => (
  <div
    className={cn(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium cursor-pointer",
      "bg-primary/10 text-primary hover:bg-primary/20",
      className
    )}
    style={color ? { backgroundColor: `${color}20`, color } : undefined}
    onClick={onClick}
  >
    {children}
  </div>
);
export type CalendarProviderProps = {
  locale?: Intl.LocalesArgument;
  startDay?: number;
  children: ReactNode;
  className?: string;
};
export const CalendarProvider = ({
  locale = "en-US",
  startDay = 0,
  children,
  className,
}: CalendarProviderProps) => (
  <CalendarContext.Provider value={{ locale, startDay }}>
    <div className={cn("relative flex flex-col", className)}>{children}</div>
  </CalendarContext.Provider>
);
