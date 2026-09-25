"use client"

import { DndContext, MouseSensor, useDraggable, useSensor } from "@dnd-kit/core"
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers"
import { useMouse, useThrottle, useWindowScroll } from "@uidotdev/usehooks"
import {
  addDays,
  addMonths,
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  endOfDay,
  endOfMonth,
  format,
  formatDate,
  formatDistance,
  getDate,
  getDaysInMonth,
  isSameDay,
  startOfDay,
  startOfMonth,
} from "date-fns"
import { es } from "date-fns/locale"
import { atom, useAtom, useSetAtom } from "jotai"
import throttle from "lodash.throttle"
import { ArrowRightIcon, GripVerticalIcon, PlusIcon, TrashIcon, Unlink2Icon } from "lucide-react"
import type {
  CSSProperties,
  DragEvent,
  DragEventHandler,
  FC,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode,
  RefObject,
} from "react"
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"

const draggingAtom = atom(false)
const scrollXAtom = atom(0)

// Estado del arrastre del "handle" de predecesor: mientras se arrastra,
// guarda el punto de origen (donde está el handle) y la posición actual del
// mouse (coords de viewport, iguales a las que da dataTransfer/drag events)
// para poder dibujar una línea fantasma que va siguiendo al cursor.
interface PredecessorDragState {
  originX: number
  originY: number
  x: number
  y: number
}
const predecessorDragAtom = atom<PredecessorDragState | null>(null)

export const useGanttDragging = () => useAtom(draggingAtom)
export const useGanttScrollX = () => useAtom(scrollXAtom)
export const useGanttContext = () => useContext(GanttContext)
export const useGanttPredecessorDrag = () => useAtom(predecessorDragAtom)
// Setter "write-only": no suscribe al componente al valor del átomo. Se
// actualiza en cada evento `drag` nativo (decenas de veces por segundo)
// mientras se arrastra el handle de predecesor; si cada GanttFeatureItemCard
// usara useGanttPredecessorDrag() solo para obtener el setter, TODAS las
// tarjetas del Gantt (de todos los sprints) se re-renderizarían en cada
// tick del drag, lo que hace que el navegador pierda el tracking del drop
// nativo a mitad de camino (el aro de "aquí se suelta" queda pintado pero
// el drop deja de confirmarse).
export const useSetGanttPredecessorDrag = () => useSetAtom(predecessorDragAtom)

export interface GanttStatus {
  id: string
  name: string
  color: string
}

export interface GanttFeature {
  id: string
  name: string
  startAt: Date
  endAt: Date
  status: GanttStatus
  lane?: string // Optional: features with the same lane will share a row
  itemType?: string // Optional: e.g. "historia" | "tarea", used to differentiate rows visually
  parentId?: string // Optional: id of the parent historia, used to restrict predecessor linking to the same domain
  hasPredecessor?: boolean // Optional: whether this feature has a predecessor link, to show the "unlink" button
  predecessorId?: string // Optional: id of the feature this one depends on, used to draw the dependency arrow
}

export interface GanttMarkerProps {
  id: string
  date: Date
  label: string
}

export type Range = "daily" | "weekly" | "monthly" | "quarterly" | "semiannual" | "yearly"

const MONTH_BASIS_RANGES: Range[] = ["monthly", "quarterly", "semiannual", "yearly"]

export type TimelineData = {
  year: number
  quarters: {
    months: {
      days: number
    }[]
  }[]
}[]

export interface GanttContextProps {
  zoom: number
  range: Range
  columnWidth: number
  sidebarWidth: number
  headerHeight: number
  rowHeight: number
  onAddItem: ((date: Date) => void) | undefined
  placeholderLength: number
  timelineData: TimelineData
  ref: RefObject<HTMLDivElement | null> | null
  scrollToFeature?: (feature: GanttFeature) => void
}

const getsDaysIn = (range: Range) => {
  // For when range is daily/weekly (day-precision ranges)
  let fn = (_date: Date) => 1

  if (MONTH_BASIS_RANGES.includes(range)) {
    fn = getDaysInMonth
  }

  return fn
}

const getDifferenceIn = (range: Range) => {
  let fn = differenceInDays

  if (MONTH_BASIS_RANGES.includes(range)) {
    fn = differenceInMonths
  }

  return fn
}

const getInnerDifferenceIn = (range: Range) => {
  let fn = differenceInHours

  if (MONTH_BASIS_RANGES.includes(range)) {
    fn = differenceInDays
  }

  return fn
}

const getStartOf = (range: Range) => {
  let fn = startOfDay

  if (MONTH_BASIS_RANGES.includes(range)) {
    fn = startOfMonth
  }

  return fn
}

const getEndOf = (range: Range) => {
  let fn = endOfDay

  if (MONTH_BASIS_RANGES.includes(range)) {
    fn = endOfMonth
  }

  return fn
}

const getAddRange = (range: Range) => {
  let fn = addDays

  if (MONTH_BASIS_RANGES.includes(range)) {
    fn = addMonths
  }

  return fn
}

const getDateByMousePosition = (context: GanttContextProps, mouseX: number) => {
  const timelineStartDate = new Date(context.timelineData[0].year, 0, 1)
  const columnWidth = (context.columnWidth * context.zoom) / 100
  const offset = Math.floor(mouseX / columnWidth)
  const daysIn = getsDaysIn(context.range)
  const addRange = getAddRange(context.range)
  const month = addRange(timelineStartDate, offset)
  const daysInMonth = daysIn(month)
  const pixelsPerDay = Math.round(columnWidth / daysInMonth)
  const dayOffset = Math.floor((mouseX % columnWidth) / pixelsPerDay)
  const actualDate = addDays(month, dayOffset)

  return actualDate
}

const createInitialTimelineData = (today: Date) => {
  const data: TimelineData = []

  data.push(
    { year: today.getFullYear() - 1, quarters: new Array(4).fill(null) },
    { year: today.getFullYear(), quarters: new Array(4).fill(null) },
    { year: today.getFullYear() + 1, quarters: new Array(4).fill(null) },
  )

  for (const yearObj of data) {
    yearObj.quarters = new Array(4).fill(null).map((_, quarterIndex) => ({
      months: new Array(3).fill(null).map((_, monthIndex) => {
        const month = quarterIndex * 3 + monthIndex
        return {
          days: getDaysInMonth(new Date(yearObj.year, month, 1)),
        }
      }),
    }))
  }

  return data
}

export const getOffset = (date: Date, timelineStartDate: Date, context: GanttContextProps) => {
  const parsedColumnWidth = (context.columnWidth * context.zoom) / 100
  const differenceIn = getDifferenceIn(context.range)
  const startOf = getStartOf(context.range)
  const fullColumns = differenceIn(startOf(date), timelineStartDate)

  if (context.range === "daily" || context.range === "weekly") {
    return parsedColumnWidth * fullColumns
  }

  const partialColumns = date.getDate()
  const daysInMonth = getDaysInMonth(date)
  const pixelsPerDay = parsedColumnWidth / daysInMonth

  return fullColumns * parsedColumnWidth + partialColumns * pixelsPerDay
}

export const getWidth = (startAt: Date, endAt: Date | null, context: GanttContextProps) => {
  const parsedColumnWidth = (context.columnWidth * context.zoom) / 100

  if (!endAt) {
    return parsedColumnWidth * 2
  }

  const differenceIn = getDifferenceIn(context.range)

  if (context.range === "daily" || context.range === "weekly") {
    const delta = differenceIn(endAt, startAt)

    return parsedColumnWidth * (delta ? delta : 1)
  }

  const daysInStartMonth = getDaysInMonth(startAt)
  const pixelsPerDayInStartMonth = parsedColumnWidth / daysInStartMonth

  if (isSameDay(startAt, endAt)) {
    return pixelsPerDayInStartMonth
  }

  const innerDifferenceIn = getInnerDifferenceIn(context.range)
  const startOf = getStartOf(context.range)

  if (isSameDay(startOf(startAt), startOf(endAt))) {
    return innerDifferenceIn(endAt, startAt) * pixelsPerDayInStartMonth
  }

  const startRangeOffset = daysInStartMonth - getDate(startAt)
  const endRangeOffset = getDate(endAt)
  const fullRangeOffset = differenceIn(startOf(endAt), startOf(startAt))
  const daysInEndMonth = getDaysInMonth(endAt)
  const pixelsPerDayInEndMonth = parsedColumnWidth / daysInEndMonth

  return (
    (fullRangeOffset - 1) * parsedColumnWidth +
    startRangeOffset * pixelsPerDayInStartMonth +
    endRangeOffset * pixelsPerDayInEndMonth
  )
}

const calculateInnerOffset = (date: Date, range: Range, columnWidth: number) => {
  const startOf = getStartOf(range)
  const endOf = getEndOf(range)
  const differenceIn = getInnerDifferenceIn(range)
  const startOfRange = startOf(date)
  const endOfRange = endOf(date)
  const totalRangeDays = differenceIn(endOfRange, startOfRange)
  const dayOfMonth = date.getDate()

  return (dayOfMonth / totalRangeDays) * columnWidth
}

const GanttContext = createContext<GanttContextProps>({
  zoom: 100,
  range: "monthly",
  columnWidth: 50,
  headerHeight: 60,
  sidebarWidth: 300,
  rowHeight: 36,
  onAddItem: undefined,
  placeholderLength: 2,
  timelineData: [],
  ref: null,
  scrollToFeature: undefined,
})

export interface GanttContentHeaderProps {
  renderHeaderItem: (index: number) => ReactNode
  title: string
  columns: number
}

export const GanttContentHeader: FC<GanttContentHeaderProps> = ({
  title,
  columns,
  renderHeaderItem,
}) => {
  const id = useId()

  return (
    <div
      className="sticky top-0 z-20 grid w-full shrink-0 bg-backdrop/90 backdrop-blur-sm"
      style={{ height: "var(--gantt-header-height)" }}
    >
      <div>
        <div
          className="sticky inline-flex whitespace-nowrap px-3 py-2 text-muted-foreground text-xs"
          style={{
            left: "var(--gantt-sidebar-width)",
          }}
        >
          <p>{title}</p>
        </div>
      </div>
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns: `repeat(${columns}, var(--gantt-column-width))`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div
            className="shrink-0 border-border/50 border-b py-1 text-center text-xs"
            key={`${id}-${index}`}
          >
            {renderHeaderItem(index)}
          </div>
        ))}
      </div>
    </div>
  )
}

const DailyHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map(year =>
    year.quarters
      .flatMap(quarter => quarter.months)
      .map((month, index) => (
        <div className="relative flex flex-col" key={`${year.year}-${index}`}>
          <GanttContentHeader
            columns={month.days}
            renderHeaderItem={(item: number) => (
              <div className="flex items-center justify-center gap-1">
                <p>{format(addDays(new Date(year.year, index, 1), item), "d")}</p>
                <p className="text-muted-foreground">
                  {format(addDays(new Date(year.year, index, 1), item), "EEEEE", { locale: es })}
                </p>
              </div>
            )}
            title={format(new Date(year.year, index, 1), "MMMM yyyy", { locale: es })}
          />
          <GanttColumns
            columns={month.days}
            isColumnSecondary={(item: number) =>
              [0, 6].includes(addDays(new Date(year.year, index, 1), item).getDay())
            }
          />
        </div>
      )),
  )
}

const MonthlyHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map(year => (
    <div className="relative flex flex-col" key={year.year}>
      <GanttContentHeader
        columns={year.quarters.flatMap(quarter => quarter.months).length}
        renderHeaderItem={(item: number) => (
          <p>{format(new Date(year.year, item, 1), "MMM", { locale: es })}</p>
        )}
        title={`${year.year}`}
      />
      <GanttColumns columns={year.quarters.flatMap(quarter => quarter.months).length} />
    </div>
  ))
}

const QuarterlyHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map(year =>
    year.quarters.map((quarter, quarterIndex) => (
      <div className="relative flex flex-col" key={`${year.year}-${quarterIndex}`}>
        <GanttContentHeader
          columns={quarter.months.length}
          renderHeaderItem={(item: number) => (
            <p>{format(new Date(year.year, quarterIndex * 3 + item, 1), "MMM", { locale: es })}</p>
          )}
          title={`Q${quarterIndex + 1} ${year.year}`}
        />
        <GanttColumns columns={quarter.months.length} />
      </div>
    )),
  )
}

const SemiannualHeader: FC = () => {
  const gantt = useContext(GanttContext)

  return gantt.timelineData.map(year =>
    [0, 1].map(halfIndex => {
      const months = year.quarters.flatMap(quarter => quarter.months).slice(halfIndex * 6, halfIndex * 6 + 6)
      return (
        <div className="relative flex flex-col" key={`${year.year}-${halfIndex}`}>
          <GanttContentHeader
            columns={months.length}
            renderHeaderItem={(item: number) => (
              <p>{format(new Date(year.year, halfIndex * 6 + item, 1), "MMM", { locale: es })}</p>
            )}
            title={`S${halfIndex + 1} ${year.year}`}
          />
          <GanttColumns columns={months.length} />
        </div>
      )
    }),
  )
}

const headers: Record<Range, FC> = {
  daily: DailyHeader,
  weekly: DailyHeader,
  monthly: MonthlyHeader,
  quarterly: QuarterlyHeader,
  semiannual: SemiannualHeader,
  yearly: MonthlyHeader,
}

export interface GanttHeaderProps {
  className?: string
}

export const GanttHeader: FC<GanttHeaderProps> = ({ className }) => {
  const gantt = useContext(GanttContext)
  const Header = headers[gantt.range]

  return (
    <div className={cn("-space-x-px flex h-full w-max divide-x divide-border/50", className)}>
      <Header />
    </div>
  )
}

export interface GanttSidebarItemProps {
  feature: GanttFeature
  onSelectItem?: (id: string) => void
  selected?: boolean
  onToggleSelect?: (id: string) => void
  /** Habilita el drag-and-drop para reordenar filas en el sidebar. */
  reorderable?: boolean
  onReorderDragStart?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onReorderDragOver?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onReorderDrop?: (id: string, event: DragEvent<HTMLDivElement>) => void
  onReorderDragEnd?: () => void
  /** Línea indicadora de dónde caerá el item que se está arrastrando. */
  dropIndicator?: "before" | "after" | null
  /** Resalte temporal (p.ej. al encontrarlo desde el buscador), distinto de
   *  `selected` para no confundirlo con la selección múltiple de bulk-move. */
  highlighted?: boolean
  className?: string
}

export const GanttSidebarItem: FC<GanttSidebarItemProps> = ({
  feature,
  onSelectItem,
  selected,
  onToggleSelect,
  reorderable,
  onReorderDragStart,
  onReorderDragOver,
  onReorderDrop,
  onReorderDragEnd,
  dropIndicator,
  highlighted,
  className,
}) => {
  const gantt = useContext(GanttContext)
  // feature.endAt ya llega como límite EXCLUSIVO (el llamador le suma 1 día
  // al último día inclusive de trabajo), así que no hace falta ajustar nada
  // acá para que formatDistance cuente los días reales.
  const duration = feature.endAt
    ? formatDistance(feature.startAt, feature.endAt, { locale: es })
    : `${formatDistance(feature.startAt, new Date(), { locale: es })} hasta ahora`

  const handleClick: MouseEventHandler<HTMLDivElement> = event => {
    if (event.target === event.currentTarget) {
      if (event.ctrlKey || event.metaKey) {
        onToggleSelect?.(feature.id)
        return
      }
      // Scroll to the feature in the timeline
      gantt.scrollToFeature?.(feature)
      // Call the original onSelectItem callback
      onSelectItem?.(feature.id)
    }
  }

  const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = event => {
    if (event.key === "Enter") {
      // Scroll to the feature in the timeline
      gantt.scrollToFeature?.(feature)
      // Call the original onSelectItem callback
      onSelectItem?.(feature.id)
    }
  }

  return (
    <div
      className={cn(
        "relative flex items-center gap-2.5 p-2.5 text-xs hover:bg-muted",
        selected && "bg-primary/10 hover:bg-primary/15",
        highlighted && "bg-amber-400/20 ring-1 ring-inset ring-amber-400",
        dropIndicator === "before" && "shadow-[inset_0_2px_0_0_var(--color-primary)]",
        dropIndicator === "after" && "shadow-[inset_0_-2px_0_0_var(--color-primary)]",
        className,
      )}
      key={feature.id}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      data-scrum-item
      draggable={reorderable}
      onDragStart={reorderable ? event => onReorderDragStart?.(feature.id, event) : undefined}
      onDragOver={reorderable ? event => onReorderDragOver?.(feature.id, event) : undefined}
      onDrop={reorderable ? event => onReorderDrop?.(feature.id, event) : undefined}
      onDragEnd={reorderable ? () => onReorderDragEnd?.() : undefined}
      style={{
        height: "var(--gantt-row-height)",
      }}
    >
      {reorderable && (
        <GripVerticalIcon className="pointer-events-none size-3.5 shrink-0 text-muted-foreground/50 cursor-grab" />
      )}
      {onToggleSelect ? (
        <Checkbox
          checked={selected ?? false}
          onCheckedChange={() => onToggleSelect(feature.id)}
          onClick={event => event.stopPropagation()}
          className="shrink-0"
        />
      ) : null}
      <div
        className="pointer-events-none h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: feature.status.color,
        }}
      />
      <p
        className={cn(
          "pointer-events-none flex-1 truncate text-left",
          feature.itemType === "historia"
            ? "font-semibold"
            : "pl-3 font-normal text-muted-foreground before:mr-1 before:content-['↳']",
        )}
      >
        {feature.name}
      </p>
      <p className="pointer-events-none text-muted-foreground">{duration}</p>
    </div>
  )
}

export const GanttSidebarHeader: FC = () => (
  <div
    className="sticky top-0 z-10 flex shrink-0 items-end justify-between gap-2.5 border-border/50 border-b bg-backdrop/90 p-2.5 font-medium text-muted-foreground text-xs backdrop-blur-sm"
    style={{ height: "var(--gantt-header-height)" }}
  >
    {/* <Checkbox className="shrink-0" /> */}
    <p className="flex-1 truncate text-left">Tareas</p>
    <p className="shrink-0">Duración</p>
  </div>
)

export interface GanttSidebarGroupProps {
  children: ReactNode
  name: string
  className?: string
}

export const GanttSidebarGroup: FC<GanttSidebarGroupProps> = ({ children, name, className }) => (
  <div className={className}>
    <p
      className="w-full truncate p-2.5 text-left font-medium text-muted-foreground text-xs"
      style={{ height: "var(--gantt-row-height)" }}
    >
      {name}
    </p>
    <div className="divide-y divide-border/50">{children}</div>
  </div>
)

export interface GanttSidebarProps {
  children: ReactNode
  className?: string
}

export const GanttSidebar: FC<GanttSidebarProps> = ({ children, className }) => (
  <div
    className={cn(
      "sticky left-0 z-30 h-max min-h-full overflow-clip border-border/50 border-r bg-background/90 backdrop-blur-md",
      className,
    )}
    data-roadmap-ui="gantt-sidebar"
  >
    <GanttSidebarHeader />
    <div className="space-y-4">{children}</div>
  </div>
)

export interface GanttAddFeatureHelperProps {
  top: number
  className?: string
}

export const GanttAddFeatureHelper: FC<GanttAddFeatureHelperProps> = ({ top, className }) => {
  const [scrollX] = useGanttScrollX()
  const gantt = useContext(GanttContext)
  const [mousePosition, mouseRef] = useMouse<HTMLDivElement>()

  const handleClick = () => {
    const ganttRect = gantt.ref?.current?.getBoundingClientRect()
    const x = mousePosition.x - (ganttRect?.left ?? 0) + scrollX - gantt.sidebarWidth
    const currentDate = getDateByMousePosition(gantt, x)

    gantt.onAddItem?.(currentDate)
  }

  return (
    <div
      className={cn("absolute top-0 w-full px-0.5", className)}
      ref={mouseRef}
      style={{
        marginTop: -gantt.rowHeight / 2,
        transform: `translateY(${top}px)`,
      }}
    >
      <button
        className="flex h-full w-full items-center justify-center rounded-md border border-dashed p-2"
        onClick={handleClick}
        type="button"
      >
        <PlusIcon className="pointer-events-none select-none text-muted-foreground" size={16} />
      </button>
    </div>
  )
}

export interface GanttColumnProps {
  index: number
  isColumnSecondary?: (item: number) => boolean
}

export const GanttColumn: FC<GanttColumnProps> = ({ index, isColumnSecondary }) => {
  const gantt = useContext(GanttContext)
  const [dragging] = useGanttDragging()
  const [mousePosition, mouseRef] = useMouse<HTMLDivElement>()
  const [hovering, setHovering] = useState(false)
  const [windowScroll] = useWindowScroll()

  const handleMouseEnter = () => setHovering(true)
  const handleMouseLeave = () => setHovering(false)

  const top = useThrottle(
    mousePosition.y - (mouseRef.current?.getBoundingClientRect().y ?? 0) - (windowScroll.y ?? 0),
    10,
  )

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden",
        isColumnSecondary?.(index) ? "bg-muted" : "",
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={mouseRef}
      role="button"
      tabIndex={0}
    >
      {!dragging && hovering && gantt.onAddItem ? <GanttAddFeatureHelper top={top} /> : null}
    </div>
  )
}

export interface GanttColumnsProps {
  columns: number
  isColumnSecondary?: (item: number) => boolean
}

export const GanttColumns: FC<GanttColumnsProps> = ({ columns, isColumnSecondary }) => {
  const id = useId()

  return (
    <div
      className="divide grid h-full w-full divide-x divide-border/50"
      style={{
        gridTemplateColumns: `repeat(${columns}, var(--gantt-column-width))`,
      }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <GanttColumn index={index} isColumnSecondary={isColumnSecondary} key={`${id}-${index}`} />
      ))}
    </div>
  )
}

export interface GanttCreateMarkerTriggerProps {
  onCreateMarker: (date: Date) => void
  className?: string
}

export const GanttCreateMarkerTrigger: FC<GanttCreateMarkerTriggerProps> = ({
  onCreateMarker,
  className,
}) => {
  const gantt = useContext(GanttContext)
  const [mousePosition, mouseRef] = useMouse<HTMLDivElement>()
  const [windowScroll] = useWindowScroll()
  const x = useThrottle(
    mousePosition.x - (mouseRef.current?.getBoundingClientRect().x ?? 0) - (windowScroll.x ?? 0),
    10,
  )

  const date = getDateByMousePosition(gantt, x)

  const handleClick = () => onCreateMarker(date)

  return (
    <div
      className={cn(
        "group pointer-events-none absolute top-0 left-0 h-full w-full select-none overflow-visible",
        className,
      )}
      ref={mouseRef}
    >
      <div
        className="-ml-2 pointer-events-auto sticky top-6 z-20 flex w-4 flex-col items-center justify-center gap-1 overflow-visible opacity-0 group-hover:opacity-100"
        style={{ transform: `translateX(${x}px)` }}
      >
        <button
          className="z-50 inline-flex h-4 w-4 items-center justify-center rounded-full bg-card"
          onClick={handleClick}
          type="button"
        >
          <PlusIcon className="text-muted-foreground" size={12} />
        </button>
        <div className="whitespace-nowrap rounded-full border border-border/50 bg-background/90 px-2 py-1 text-foreground text-xs backdrop-blur-lg">
          {formatDate(date, "MMM dd, yyyy", { locale: es })}
        </div>
      </div>
    </div>
  )
}

export interface GanttFeatureDragHelperProps {
  featureId: GanttFeature["id"]
  direction: "left" | "right"
  date: Date | null
}

export const GanttFeatureDragHelper: FC<GanttFeatureDragHelperProps> = ({
  direction,
  featureId,
  date,
}) => {
  const [, setDragging] = useGanttDragging()
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `feature-drag-helper-${featureId}`,
  })

  const isPressed = Boolean(attributes["aria-pressed"])

  useEffect(() => setDragging(isPressed), [isPressed, setDragging])

  return (
    <div
      className={cn(
        "group -translate-y-1/2 cursor-col-resize! absolute top-1/2 z-3 h-full w-6 rounded-md outline-none",
        direction === "left" ? "-left-2.5" : "-right-2.5",
      )}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <div
        className={cn(
          "-translate-y-1/2 absolute top-1/2 h-[80%] w-1 rounded-sm bg-muted-foreground opacity-0 transition-all",
          direction === "left" ? "left-2.5" : "right-2.5",
          direction === "left" ? "group-hover:left-0" : "group-hover:right-0",
          isPressed && (direction === "left" ? "left-0" : "right-0"),
          "group-hover:opacity-100",
          isPressed && "opacity-100",
        )}
      />
      {date && (
        <div
          className={cn(
            "-translate-x-1/2 absolute top-10 hidden whitespace-nowrap rounded-lg border border-border/50 bg-background/90 px-2 py-1 text-foreground text-xs backdrop-blur-lg group-hover:block",
            isPressed && "block",
          )}
        >
          {format(date, "MMM dd, yyyy", { locale: es })}
        </div>
      )}
    </div>
  )
}

// Tipo MIME usado en el dataTransfer nativo (HTML5 DnD) para arrastrar el
// "handle" de predecesor de una tarjeta a otra. Se usa DnD nativo (en vez de
// dnd-kit, que ya maneja el arrastre de la tarjeta para mover/redimensionar
// fechas) porque necesitamos soltar sobre tarjetas de otras filas/sprints,
// algo que dnd-kit no está configurado para resolver aquí.
const PREDECESSOR_DRAG_TYPE = "application/x-gantt-predecessor"

// Altura de fila fija usada tanto por GanttProvider (--gantt-row-height) como
// por GanttDependencyArrows para ubicar las flechas por fila globalmente
// (entre sprints distintos, no solo dentro de un mismo grupo).
export const GANTT_ROW_HEIGHT = 36

// A propósito, el MIME type de este drag NO codifica tipo ni dominio (tarea
// vs historia, misma historia padre, etc.): cualquier restricción codificada
// ahí hace que el navegador bloquee el drop a nivel nativo cuando no coincide
// (sin dragenter, sin aro, sin evento drop siquiera), y entonces la
// validación en handleLinkPredecessor (GanttView.tsx) nunca llega a
// ejecutarse ni a mostrar su toast — el drag queda muerto en silencio. Todas
// esas reglas se validan solo en el JS del drop, donde sí se le puede avisar
// al usuario por qué no se pudo enlazar.

export type GanttFeatureItemCardProps = Pick<GanttFeature, "id"> & {
  children?: ReactNode
  onDoubleClick?: (id: string) => void
  /** successorId = esta tarjeta (donde se soltó), predecessorId = la tarjeta arrastrada */
  onLinkPredecessor?: (successorId: string, predecessorId: string) => void
  selected?: boolean
  /** Resalte temporal (p.ej. al encontrarlo desde el buscador). */
  highlighted?: boolean
}

export const GanttFeatureItemCard: FC<GanttFeatureItemCardProps> = ({
  id,
  children,
  onDoubleClick,
  onLinkPredecessor,
  selected,
  highlighted,
}) => {
  const [, setDragging] = useGanttDragging()
  const setPredecessorDrag = useSetGanttPredecessorDrag()
  const { attributes, listeners, setNodeRef } = useDraggable({ id })
  const isPressed = Boolean(attributes["aria-pressed"])
  const [isDropTarget, setIsDropTarget] = useState(false)
  // El navegador dispara dragenter/dragleave en cada hijo por el que pasa el
  // mouse dentro de la tarjeta (el texto, el div de dnd-kit, etc.), no solo
  // al entrar/salir de la Card completa. Con un booleano simple eso hacía
  // parpadear el anillo azul al moverse hacia el centro. Un contador de
  // enter/leave evita apagarlo hasta que realmente se salió de la tarjeta.
  const dragEnterCountRef = useRef(0)

  useEffect(() => setDragging(isPressed), [isPressed, setDragging])

  const handleHandleDragStart: DragEventHandler<HTMLDivElement> = event => {
    event.stopPropagation()
    event.dataTransfer.setData(PREDECESSOR_DRAG_TYPE, id.toString())
    event.dataTransfer.effectAllowed = "link"
    const handleRect = event.currentTarget.getBoundingClientRect()
    const originX = handleRect.left + handleRect.width / 2
    const originY = handleRect.top + handleRect.height / 2
    setPredecessorDrag({ originX, originY, x: event.clientX, y: event.clientY })
  }

  const handleHandleDrag: DragEventHandler<HTMLDivElement> = event => {
    // El último evento "drag" antes de soltar suele llegar con clientX/Y en
    // 0 (limitación de seguridad del navegador); ignorarlo evita que la
    // línea fantasma salte al (0,0) justo antes de desaparecer.
    if (event.clientX === 0 && event.clientY === 0) return
    setPredecessorDrag(prev => (prev ? { ...prev, x: event.clientX, y: event.clientY } : prev))
  }

  const handleHandleDragEnd: DragEventHandler<HTMLDivElement> = () => {
    setPredecessorDrag(null)
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = event => {
    if (!onLinkPredecessor || !event.dataTransfer.types.includes(PREDECESSOR_DRAG_TYPE)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "link"
  }

  const handleDrop: DragEventHandler<HTMLDivElement> = event => {
    dragEnterCountRef.current = 0
    setIsDropTarget(false)
    if (!onLinkPredecessor || !event.dataTransfer.types.includes(PREDECESSOR_DRAG_TYPE)) return
    const predecessorId = event.dataTransfer.getData(PREDECESSOR_DRAG_TYPE)
    if (predecessorId && predecessorId !== id.toString()) {
      event.preventDefault()
      onLinkPredecessor(id.toString(), predecessorId)
    }
  }

  return (
    <Card
      className={cn(
        "group/gantt-card relative h-full w-full rounded-md bg-background p-2 text-xs shadow-sm",
        isDropTarget && "ring-2 ring-primary",
        selected && !isDropTarget && "ring-2 ring-primary/60",
        highlighted && !isDropTarget && "ring-2 ring-amber-400",
      )}
      data-scrum-item
      onDragEnter={event => {
        if (onLinkPredecessor && event.dataTransfer.types.includes(PREDECESSOR_DRAG_TYPE)) {
          dragEnterCountRef.current += 1
          setIsDropTarget(true)
        }
      }}
      onDragLeave={() => {
        dragEnterCountRef.current -= 1
        if (dragEnterCountRef.current <= 0) {
          dragEnterCountRef.current = 0
          setIsDropTarget(false)
        }
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "flex h-full w-full items-center justify-between gap-2 text-left",
          isPressed && "cursor-grabbing",
        )}
        {...attributes}
        {...listeners}
        ref={setNodeRef}
        onDoubleClick={() => onDoubleClick?.(id.toString())}
      >
        {children}
      </div>
      {onLinkPredecessor && (
        <div
          className="-right-2 -translate-y-1/2 absolute top-1/2 z-20 flex h-4 w-4 cursor-alias items-center justify-center rounded-full border border-border/50 bg-card opacity-0 shadow-sm transition-opacity group-hover/gantt-card:opacity-100"
          draggable
          onClick={event => event.stopPropagation()}
          onDrag={handleHandleDrag}
          onDragEnd={handleHandleDragEnd}
          onDragStart={handleHandleDragStart}
          onMouseDown={event => event.stopPropagation()}
          title="Arrastra para marcar esta tarea como predecesora de otra"
        >
          <ArrowRightIcon className="pointer-events-none text-muted-foreground" size={10} />
        </div>
      )}
    </Card>
  )
}

export type GanttFeatureItemProps = GanttFeature & {
  onMove?: (id: string, startDate: Date, endDate: Date | null) => void
  onDoubleClick?: (id: string) => void
  onLinkPredecessor?: (successorId: string, predecessorId: string) => void
  onRemovePredecessor?: (id: string) => void
  selected?: boolean
  /** Resalte temporal (p.ej. al encontrarlo desde el buscador). */
  highlighted?: boolean
  children?: ReactNode
  className?: string
}

export const GanttFeatureItem: FC<GanttFeatureItemProps> = ({
  onMove,
  onDoubleClick,
  onLinkPredecessor,
  onRemovePredecessor,
  selected,
  highlighted,
  children,
  className,
  ...feature
}) => {
  const [scrollX] = useGanttScrollX()
  const gantt = useContext(GanttContext)
  const timelineStartDate = useMemo(
    () => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1),
    [gantt.timelineData],
  )
  const [startAt, setStartAt] = useState<Date>(feature.startAt)
  const [endAt, setEndAt] = useState<Date | null>(feature.endAt)

  // Si las fechas del feature cambian por fuera (p.ej. se editó el item en
  // el sheet de detalle y se refrescó la query), el estado local del drag
  // debe seguir a las nuevas props; si no, la barra se queda "congelada" en
  // la posición vieja hasta que se recargue toda la página.
  useEffect(() => {
    setStartAt(feature.startAt)
  }, [feature.startAt])
  useEffect(() => {
    setEndAt(feature.endAt)
  }, [feature.endAt])

  // Memoize expensive calculations
  const width = useMemo(() => getWidth(startAt, endAt, gantt), [startAt, endAt, gantt])
  const offset = useMemo(
    () => getOffset(startAt, timelineStartDate, gantt),
    [startAt, timelineStartDate, gantt],
  )

  const addRange = useMemo(() => getAddRange(gantt.range), [gantt.range])
  const [mousePosition] = useMouse<HTMLDivElement>()

  const [previousMouseX, setPreviousMouseX] = useState(0)
  const [previousStartAt, setPreviousStartAt] = useState(startAt)
  const [previousEndAt, setPreviousEndAt] = useState(endAt)

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  })

  const handleItemDragStart = useCallback(() => {
    setPreviousMouseX(mousePosition.x)
    setPreviousStartAt(startAt)
    setPreviousEndAt(endAt)
  }, [mousePosition.x, startAt, endAt])

  const handleItemDragMove = useCallback(() => {
    const currentDate = getDateByMousePosition(gantt, mousePosition.x)
    const originalDate = getDateByMousePosition(gantt, previousMouseX)
    const delta =
      gantt.range === "daily"
        ? getDifferenceIn(gantt.range)(currentDate, originalDate)
        : getInnerDifferenceIn(gantt.range)(currentDate, originalDate)
    const newStartDate = addDays(previousStartAt, delta)
    const newEndDate = previousEndAt ? addDays(previousEndAt, delta) : null

    setStartAt(newStartDate)
    setEndAt(newEndDate)
  }, [gantt, mousePosition.x, previousMouseX, previousStartAt, previousEndAt])

  const onDragEnd = useCallback(
    () => onMove?.(feature.id, startAt, endAt),
    [onMove, feature.id, startAt, endAt],
  )

  const handleLeftDragMove = useCallback(() => {
    const ganttRect = gantt.ref?.current?.getBoundingClientRect()
    const x = mousePosition.x - (ganttRect?.left ?? 0) + scrollX - gantt.sidebarWidth
    const newStartAt = getDateByMousePosition(gantt, x)

    setStartAt(newStartAt)
  }, [gantt, mousePosition.x, scrollX])

  const handleRightDragMove = useCallback(() => {
    const ganttRect = gantt.ref?.current?.getBoundingClientRect()
    const x = mousePosition.x - (ganttRect?.left ?? 0) + scrollX - gantt.sidebarWidth
    const newEndAt = getDateByMousePosition(gantt, x)

    setEndAt(newEndAt)
  }, [gantt, mousePosition.x, scrollX])

  return (
    <div
      className={cn("relative flex w-max min-w-full py-0.5", className)}
      style={{ height: "var(--gantt-row-height)" }}
    >
      {feature.hasPredecessor && onRemovePredecessor && (
        <button
          className="-translate-y-1/2 pointer-events-auto absolute top-1/2 z-20 flex h-4 w-4 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground opacity-60 shadow-sm transition-opacity hover:text-destructive hover:opacity-100"
          onClick={() => onRemovePredecessor(feature.id)}
          style={{ left: Math.round(offset) - 20 }}
          title="Quitar predecesora"
          type="button"
        >
          <Unlink2Icon size={10} />
        </button>
      )}
      <div
        className="pointer-events-auto absolute top-0.5"
        style={{
          height: "calc(var(--gantt-row-height) - 4px)",
          width: Math.round(width),
          left: Math.round(offset),
        }}
      >
        {onMove && (
          <DndContext
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={onDragEnd}
            onDragMove={handleLeftDragMove}
            sensors={[mouseSensor]}
          >
            <GanttFeatureDragHelper date={startAt} direction="left" featureId={feature.id} />
          </DndContext>
        )}
        <DndContext
          modifiers={[restrictToHorizontalAxis]}
          onDragEnd={onDragEnd}
          onDragMove={handleItemDragMove}
          onDragStart={handleItemDragStart}
          sensors={[mouseSensor]}
        >
          <GanttFeatureItemCard
            id={feature.id}
            onDoubleClick={onDoubleClick}
            onLinkPredecessor={onLinkPredecessor}
            selected={selected}
            highlighted={highlighted}
          >
            {children ?? (
              <p
                className={cn(
                  "flex-1 whitespace-nowrap text-xs",
                  feature.itemType === "historia" ? "font-semibold" : "font-normal",
                )}
              >
                {feature.itemType !== "historia" && "↳ "}
                {feature.name}
              </p>
            )}
          </GanttFeatureItemCard>
        </DndContext>
        {onMove && (
          <DndContext
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={onDragEnd}
            onDragMove={handleRightDragMove}
            sensors={[mouseSensor]}
          >
            <GanttFeatureDragHelper
              date={endAt ?? addRange(startAt, 2)}
              direction="right"
              featureId={feature.id}
            />
          </DndContext>
        )}
      </div>
    </div>
  )
}

export interface GanttFeatureListGroupProps {
  children: ReactNode
  className?: string
}

export const GanttFeatureListGroup: FC<GanttFeatureListGroupProps> = ({ children, className }) => (
  <div className={cn("relative", className)} style={{ paddingTop: "var(--gantt-row-height)" }}>
    {children}
  </div>
)

export interface GanttDependencyArrowsProps {
  /** TODAS las features del Gantt (de todos los sprints), para poder resolver
   *  el predecessorId aunque la predecesora esté en otro grupo/sprint. */
  features: GanttFeature[]
  /** Fila global (0-based) de cada feature, contando los renglones de header
   *  de cada grupo de sprint y el hueco entre grupos como fracción de fila —
   *  así una flecha puede cruzar de un sprint a otro. */
  rowIndexById: Map<string, number>
  className?: string
}

/**
 * Arma un path SVG ortogonal (solo tramos horizontales/verticales) que pasa
 * por los waypoints dados, con las esquinas redondeadas. A diferencia de un
 * bezier con puntos de control fijos, un codo ortogonal no puede auto-
 * cruzarse ni degenerar en un lazo sin importar qué tan cerca estén los
 * puntos entre sí.
 */
const roundedElbowPath = (points: { x: number; y: number }[], radius = 5): string => {
  if (points.length < 2) return ""

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const next = points[i + 1]

    const toPrev = Math.min(radius, Math.hypot(curr.x - prev.x, curr.y - prev.y) / 2)
    const toNext = Math.min(radius, Math.hypot(next.x - curr.x, next.y - curr.y) / 2)

    const p1x = curr.x + Math.sign(prev.x - curr.x) * toPrev
    const p1y = curr.y + Math.sign(prev.y - curr.y) * toPrev
    const p2x = curr.x + Math.sign(next.x - curr.x) * toNext
    const p2y = curr.y + Math.sign(next.y - curr.y) * toNext

    d += ` L ${p1x} ${p1y} Q ${curr.x} ${curr.y}, ${p2x} ${p2y}`
  }
  const last = points[points.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

/**
 * Draws an elbow connector + arrowhead from the end of each item's real
 * predecessor bar to the start of its own bar, using the actual
 * `predecessorId` link (not a guessed row order), so the arrows always match
 * what the "quitar predecesora" button would remove.
 */
export const GanttDependencyArrows: FC<GanttDependencyArrowsProps> = ({
  features,
  rowIndexById,
  className,
}) => {
  const gantt = useContext(GanttContext)
  const markerId = useId()
  const timelineStartDate = useMemo(
    () => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1),
    [gantt.timelineData],
  )

  const bars = useMemo(
    () =>
      features.flatMap(feature => {
        const rowIndex = rowIndexById.get(feature.id)
        if (rowIndex === undefined) return []
        return [
          {
            id: feature.id,
            predecessorId: feature.predecessorId,
            rowIndex,
            offset: getOffset(feature.startAt, timelineStartDate, gantt),
            width: getWidth(feature.startAt, feature.endAt, gantt),
          },
        ]
      }),
    [features, rowIndexById, timelineStartDate, gantt],
  )

  const chainPairs = useMemo(() => {
    const byId = new Map(bars.map(bar => [bar.id, bar]))
    const pairs: { from: (typeof bars)[number]; to: (typeof bars)[number] }[] = []
    for (const bar of bars) {
      if (!bar.predecessorId) continue
      const from = byId.get(bar.predecessorId)
      if (from) pairs.push({ from, to: bar })
    }
    return pairs
  }, [bars])

  if (chainPairs.length === 0) {
    return null
  }

  const rowHeight = gantt.rowHeight
  const maxRight = Math.max(...bars.map(bar => bar.offset + bar.width))
  const maxRowIndex = Math.max(...bars.map(bar => bar.rowIndex))

  return (
    <svg
      className={cn("pointer-events-none absolute top-0 left-0 z-10 overflow-visible", className)}
      // marginTop replica el que aplica GanttFeatureList: este SVG se renderiza
      // como hermano de GanttFeatureList (no como hijo) para no heredar el
      // space-y-4 que ese contenedor aplica entre grupos de sprint, que
      // desalinearía la fila global calculada en rowIndexById.
      style={{ width: maxRight, height: (maxRowIndex + 1) * rowHeight, marginTop: "var(--gantt-header-height)" }}
    >
      <defs>
        <marker
          id={markerId}
          markerWidth={8}
          markerHeight={8}
          refX={6}
          refY={3}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" />
        </marker>
      </defs>
      {chainPairs.map(({ from, to }) => {
        const y1 = from.rowIndex * rowHeight + rowHeight / 2
        const y2 = to.rowIndex * rowHeight + rowHeight / 2
        // La flecha nace donde termina la barra "padre" y llega al inicio de
        // la barra final. Se traza como un codo ortogonal (horizontal-
        // vertical-horizontal) con esquinas redondeadas en vez de un bezier:
        // un bezier con un punto de control fijo podía degenerar en un lazo
        // cuando las filas estaban muy cerca en Y, y un codo ortogonal no
        // puede auto-cruzarse. Si la siguiente barra empieza antes de que
        // termine la anterior (se solapan en el tiempo), el codo baja recto
        // desde el borde derecho de la barra padre (de abajo hacia la
        // derecha) en vez de salir por un pasillo a la derecha y volver,
        // que generaba una vuelta innecesaria.
        const x1 = from.offset + from.width
        const x2 = to.offset
        const overlaps = x2 < x1 + 4
        const midX = overlaps ? x1 : x1 + (x2 - x1) / 2

        return (
          <path
            className="fill-none stroke-muted-foreground/60"
            d={roundedElbowPath([
              { x: x1, y: y1 },
              { x: midX, y: y1 },
              { x: midX, y: y2 },
              { x: x2, y: y2 },
            ])}
            key={`${from.id}-${to.id}`}
            markerEnd={`url(#${markerId})`}
            strokeWidth={1.5}
          />
        )
      })}
    </svg>
  )
}

export interface GanttFeatureRowProps {
  features: GanttFeature[]
  onMove?: (id: string, startAt: Date, endAt: Date | null) => void
  onLinkPredecessor?: (successorId: string, predecessorId: string) => void
  children?: (feature: GanttFeature) => ReactNode
  className?: string
}

export const GanttFeatureRow: FC<GanttFeatureRowProps> = ({
  features,
  onMove,
  onLinkPredecessor,
  children,
  className,
}) => {
  // Sort features by start date to handle potential overlaps
  const sortedFeatures = [...features].sort((a, b) => a.startAt.getTime() - b.startAt.getTime())

  // Calculate sub-row positions for overlapping features using a proper algorithm
  const featureWithPositions = []
  const subRowEndTimes: Date[] = [] // Track when each sub-row becomes free

  for (const feature of sortedFeatures) {
    let subRow = 0

    // Find the first sub-row that's free (doesn't overlap)
    while (subRow < subRowEndTimes.length && subRowEndTimes[subRow] > feature.startAt) {
      subRow++
    }

    // Update the end time for this sub-row
    if (subRow === subRowEndTimes.length) {
      subRowEndTimes.push(feature.endAt)
    } else {
      subRowEndTimes[subRow] = feature.endAt
    }

    featureWithPositions.push({ ...feature, subRow })
  }

  const maxSubRows = Math.max(1, subRowEndTimes.length)
  const subRowHeight = 36 // Base row height

  return (
    <div
      className={cn("relative", className)}
      style={{
        height: `${maxSubRows * subRowHeight}px`,
        minHeight: "var(--gantt-row-height)",
      }}
    >
      {featureWithPositions.map(feature => (
        <div
          className="absolute w-full"
          key={feature.id}
          style={{
            top: `${feature.subRow * subRowHeight}px`,
            height: `${subRowHeight}px`,
          }}
        >
          <GanttFeatureItem {...feature} onMove={onMove} onLinkPredecessor={onLinkPredecessor}>
            {children ? (
              children(feature)
            ) : (
              <p className="flex-1 truncate text-xs">{feature.name}</p>
            )}
          </GanttFeatureItem>
        </div>
      ))}
    </div>
  )
}

export interface GanttFeatureListProps {
  className?: string
  children: ReactNode
}

export const GanttFeatureList: FC<GanttFeatureListProps> = ({ className, children }) => (
  <div
    className={cn("absolute top-0 left-0 h-full w-max space-y-4", className)}
    style={{ marginTop: "var(--gantt-header-height)" }}
  >
    {children}
  </div>
)

export const GanttMarker: FC<
  GanttMarkerProps & {
    onRemove?: (id: string) => void
    className?: string
  }
> = memo(({ label, date, id, onRemove, className }) => {
  const gantt = useContext(GanttContext)
  const differenceIn = useMemo(() => getDifferenceIn(gantt.range), [gantt.range])
  const timelineStartDate = useMemo(
    () => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1),
    [gantt.timelineData],
  )

  // Memoize expensive calculations
  const offset = useMemo(
    () => differenceIn(date, timelineStartDate),
    [differenceIn, date, timelineStartDate],
  )
  const innerOffset = useMemo(
    () => calculateInnerOffset(date, gantt.range, (gantt.columnWidth * gantt.zoom) / 100),
    [date, gantt.range, gantt.columnWidth, gantt.zoom],
  )

  const handleRemove = useCallback(() => onRemove?.(id), [onRemove, id])

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-20 flex h-full select-none flex-col items-center justify-center overflow-visible"
      style={{
        width: 0,
        transform: `translateX(calc(var(--gantt-column-width) * ${offset} + ${innerOffset}px))`,
      }}
    >
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className={cn(
              "group pointer-events-auto sticky top-0 flex select-auto flex-col flex-nowrap items-center justify-center whitespace-nowrap rounded-b-md bg-card px-2 py-1 text-foreground text-xs",
              className,
            )}
          >
            {label}
            <span className="max-
            h-0 overflow-hidden opacity-80 transition-all group-hover:max-h-8">
              {formatDate(date, "MMM dd, yyyy", { locale: es })}
            </span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onRemove ? (
            <ContextMenuItem
              className="flex items-center gap-2 text-destructive"
              onClick={handleRemove}
            >
              <TrashIcon size={16} />
              Remove marker
            </ContextMenuItem>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
      <div className={cn("h-full w-px bg-card", className)} />
    </div>
  )
})

GanttMarker.displayName = "GanttMarker"

// Línea que sigue al cursor mientras se arrastra el handle de predecesor,
// para que quede claro que el drag "está agarrando algo" en vez de no dar
// ninguna señal hasta soltar. Se posiciona con `fixed` usando coordenadas de
// viewport (las mismas que dan los eventos de drag nativos), así que no hay
// que convertir nada al sistema de coordenadas con scroll del Gantt.
const GanttPredecessorDragGhost: FC = () => {
  const [predecessorDrag] = useGanttPredecessorDrag()
  if (!predecessorDrag) return null

  const { originX, originY, x, y } = predecessorDrag

  return (
    <svg className="pointer-events-none fixed inset-0 z-50 h-screen w-screen" style={{ overflow: "visible" }}>
      <title>Vínculo de predecesora en progreso</title>
      <defs>
        <marker id="gantt-ghost-arrowhead" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
          <path d="M0,0 L8,4 L0,8 Z" fill="var(--primary)" />
        </marker>
      </defs>
      <line
        markerEnd="url(#gantt-ghost-arrowhead)"
        stroke="var(--primary)"
        strokeDasharray="4 3"
        strokeLinecap="round"
        strokeWidth={2}
        x1={originX}
        x2={x}
        y1={originY}
        y2={y}
      />
      <circle cx={originX} cy={originY} fill="var(--primary)" r={3} />
    </svg>
  )
}

export interface GanttProviderProps {
  range?: Range
  zoom?: number
  onAddItem?: (date: Date) => void
  children: ReactNode
  className?: string
}

export const GanttProvider: FC<GanttProviderProps> = ({
  zoom = 100,
  range = "monthly",
  onAddItem,
  children,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [timelineData, setTimelineData] = useState<TimelineData>(
    createInitialTimelineData(new Date()),
  )
  const [, setScrollX] = useGanttScrollX()
  const [sidebarWidth, setSidebarWidth] = useState(0)

  const headerHeight = 60
  const rowHeight = GANTT_ROW_HEIGHT
  let columnWidth = 50

  if (range === "weekly") {
    columnWidth = 24
  } else if (range === "monthly") {
    columnWidth = 150
  } else if (range === "quarterly") {
    columnWidth = 100
  } else if (range === "semiannual") {
    columnWidth = 60
  } else if (range === "yearly") {
    columnWidth = 30
  }

  // Memoize CSS variables to prevent unnecessary re-renders
  const cssVariables = useMemo(
    () =>
      ({
        "--gantt-zoom": `${zoom}`,
        "--gantt-column-width": `${(zoom / 100) * columnWidth}px`,
        "--gantt-header-height": `${headerHeight}px`,
        "--gantt-row-height": `${rowHeight}px`,
        "--gantt-sidebar-width": `${sidebarWidth}px`,
      }) as CSSProperties,
    [zoom, columnWidth, sidebarWidth],
  )

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft =
        scrollRef.current.scrollWidth / 2 - scrollRef.current.clientWidth / 2
      setScrollX(scrollRef.current.scrollLeft)
    }
  }, [setScrollX])

  // Update sidebar width when DOM is ready
  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebarElement = scrollRef.current?.querySelector('[data-roadmap-ui="gantt-sidebar"]')
      const newWidth = sidebarElement ? 300 : 0
      setSidebarWidth(newWidth)
    }

    // Update immediately
    updateSidebarWidth()

    // Also update on resize or when children change
    const observer = new MutationObserver(updateSidebarWidth)
    if (scrollRef.current) {
      observer.observe(scrollRef.current, {
        childList: true,
        subtree: true,
      })
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Fix the useCallback to include all dependencies
  const handleScroll = useCallback(
    throttle(() => {
      const scrollElement = scrollRef.current
      if (!scrollElement) {
        return
      }

      const { scrollLeft, scrollWidth, clientWidth } = scrollElement
      setScrollX(scrollLeft)

      if (scrollLeft === 0) {
        // Extend timelineData to the past
        const firstYear = timelineData[0]?.year

        if (!firstYear) {
          return
        }

        const newTimelineData: TimelineData = [...timelineData]
        newTimelineData.unshift({
          year: firstYear - 1,
          quarters: new Array(4).fill(null).map((_, quarterIndex) => ({
            months: new Array(3).fill(null).map((_, monthIndex) => {
              const month = quarterIndex * 3 + monthIndex
              return {
                days: getDaysInMonth(new Date(firstYear, month, 1)),
              }
            }),
          })),
        })

        setTimelineData(newTimelineData)

        // Scroll a bit forward so it's not at the very start
        scrollElement.scrollLeft = scrollElement.clientWidth
        setScrollX(scrollElement.scrollLeft)
      } else if (scrollLeft + clientWidth >= scrollWidth) {
        // Extend timelineData to the future
        const lastYear = timelineData.at(-1)?.year

        if (!lastYear) {
          return
        }

        const newTimelineData: TimelineData = [...timelineData]
        newTimelineData.push({
          year: lastYear + 1,
          quarters: new Array(4).fill(null).map((_, quarterIndex) => ({
            months: new Array(3).fill(null).map((_, monthIndex) => {
              const month = quarterIndex * 3 + monthIndex
              return {
                days: getDaysInMonth(new Date(lastYear, month, 1)),
              }
            }),
          })),
        })

        setTimelineData(newTimelineData)

        // Scroll a bit back so it's not at the very end
        scrollElement.scrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth
        setScrollX(scrollElement.scrollLeft)
      }
    }, 100),
    [],
  )

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll)
    }

    return () => {
      // Fix memory leak by properly referencing the scroll element
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [handleScroll])

  const scrollToFeature = useCallback(
    (feature: GanttFeature) => {
      const scrollElement = scrollRef.current
      if (!scrollElement) {
        return
      }

      // Calculate timeline start date from timelineData
      const timelineStartDate = new Date(timelineData[0].year, 0, 1)

      // Calculate the horizontal offset for the feature's start date
      const offset = getOffset(feature.startAt, timelineStartDate, {
        zoom,
        range,
        columnWidth,
        sidebarWidth,
        headerHeight,
        rowHeight,
        onAddItem,
        placeholderLength: 2,
        timelineData,
        ref: scrollRef,
      })

      // Scroll to align the feature's start with the right side of the sidebar
      const targetScrollLeft = Math.max(0, offset)

      scrollElement.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth",
      })
    },
    [timelineData, zoom, range, columnWidth, sidebarWidth, headerHeight, rowHeight, onAddItem],
  )

  return (
    <GanttContext.Provider
      value={{
        zoom,
        range,
        headerHeight,
        columnWidth,
        sidebarWidth,
        rowHeight,
        onAddItem,
        timelineData,
        placeholderLength: 2,
        ref: scrollRef,
        scrollToFeature,
      }}
    >
      <div
        className={cn(
          "gantt relative grid h-full w-full flex-none select-none overflow-auto rounded-sm bg-muted",
          range,
          className,
        )}
        ref={scrollRef}
        style={{
          ...cssVariables,
          gridTemplateColumns: "var(--gantt-sidebar-width) 1fr",
        }}
      >
        {children}
      </div>
      <GanttPredecessorDragGhost />
    </GanttContext.Provider>
  )
}

export interface GanttTimelineProps {
  children: ReactNode
  className?: string
}

export const GanttTimeline: FC<GanttTimelineProps> = ({ children, className }) => (
  <div className={cn("relative flex h-full w-max flex-none overflow-clip", className)}>
    {children}
  </div>
)

export interface GanttTodayProps {
  className?: string
}

export const GanttToday: FC<GanttTodayProps> = ({ className }) => {
  const date = useMemo(() => new Date(), [])
  const gantt = useContext(GanttContext)
  const differenceIn = useMemo(() => getDifferenceIn(gantt.range), [gantt.range])
  const timelineStartDate = useMemo(
    () => new Date(gantt.timelineData.at(0)?.year ?? 0, 0, 1),
    [gantt.timelineData],
  )

  // Memoize expensive calculations
  const offset = useMemo(
    () => differenceIn(date, timelineStartDate),
    [differenceIn, date, timelineStartDate],
  )
  const innerOffset = useMemo(
    () => calculateInnerOffset(date, gantt.range, (gantt.columnWidth * gantt.zoom) / 100),
    [date, gantt.range, gantt.columnWidth, gantt.zoom],
  )

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-20 flex h-full select-none flex-col items-center justify-center overflow-visible"
      style={{
        width: 0,
        transform: `translateX(calc(var(--gantt-column-width) * ${offset} + ${innerOffset}px))`,
      }}
    >
      <div
        title={formatDate(date, "MMM dd, yyyy", { locale: es })}
        className="pointer-events-auto sticky top-0 size-2 rounded-full bg-red-500"
      />
      <div className={cn("h-full w-px bg-red-500", className)} />
    </div>
  )
}

// Demo - uses function to generate dates at runtime to avoid SSR/client mismatch
function createDemoData() {
  const today = new Date()
  const statuses: GanttStatus[] = [
    { id: "1", name: "Planned", color: "#6B7280" },
    { id: "2", name: "In Progress", color: "#F59E0B" },
    { id: "3", name: "Done", color: "#10B981" },
  ]

  const features: GanttFeature[] = [
    {
      id: "1",
      name: "Design System Setup",
      startAt: addDays(today, -30),
      endAt: addDays(today, -10),
      status: statuses[2],
    },
    {
      id: "2",
      name: "Component Library",
      startAt: addDays(today, -15),
      endAt: addDays(today, 15),
      status: statuses[1],
    },
    {
      id: "3",
      name: "Documentation",
      startAt: addDays(today, 5),
      endAt: addDays(today, 35),
      status: statuses[0],
    },
    {
      id: "4",
      name: "API Integration",
      startAt: addDays(today, -5),
      endAt: addDays(today, 25),
      status: statuses[1],
    },
    {
      id: "5",
      name: "Testing & QA",
      startAt: addDays(today, 20),
      endAt: addDays(today, 45),
      status: statuses[0],
    },
    {
      id: "6",
      name: "Launch Preparation",
      startAt: addDays(today, 40),
      endAt: addDays(today, 55),
      status: statuses[0],
    },
  ]

  const markers = [
    {
      id: "m1",
      date: addDays(today, -20),
      label: "Kickoff",
      className: "bg-blue-100 text-blue-900",
    },
    {
      id: "m2",
      date: addDays(today, 30),
      label: "Beta Release",
      className: "bg-purple-100 text-purple-900",
    },
    {
      id: "m3",
      date: addDays(today, 50),
      label: "Launch",
      className: "bg-green-100 text-green-900",
    },
  ]

  return { features, markers }
}

export function Demo() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<{
    features: GanttFeature[]
    markers: typeof demoMarkers
  } | null>(null)

  useEffect(() => {
    setMounted(true)
    setData(createDemoData())
  }, [])

  const handleMoveFeature = useCallback((id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return
    setData(prev =>
      prev
        ? {
            ...prev,
            features: prev.features.map(feature =>
              feature.id === id ? { ...feature, startAt, endAt } : feature,
            ),
          }
        : null,
    )
  }, [])

  // Prevent SSR to avoid dnd-kit hydration mismatch
  if (!mounted || !data) {
    return <div className="h-screen w-screen bg-muted/50 animate-pulse" />
  }

  return (
    <div className="h-screen w-screen">
      <GanttProvider className="border rounded-lg" range="monthly" zoom={100}>
        <GanttSidebar>
          <GanttSidebarGroup name="Product Roadmap">
            {data.features.map(feature => (
              <GanttSidebarItem feature={feature} key={feature.id} />
            ))}
          </GanttSidebarGroup>
        </GanttSidebar>
        <GanttTimeline>
          <GanttHeader />
          <GanttFeatureList>
            <GanttFeatureListGroup>
              {data.features.map(feature => (
                <GanttFeatureItem key={feature.id} onMove={handleMoveFeature} {...feature}>
                  <p className="flex-1 truncate text-xs">{feature.name}</p>
                </GanttFeatureItem>
              ))}
            </GanttFeatureListGroup>
          </GanttFeatureList>
          {data.markers.map(marker => (
            <GanttMarker key={marker.id} {...marker} />
          ))}
          <GanttToday />
        </GanttTimeline>
      </GanttProvider>
    </div>
  )
}

const demoMarkers: { id: string; date: Date; label: string; className: string }[] = []
