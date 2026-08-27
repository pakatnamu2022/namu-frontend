"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageWrapper from "@/shared/components/PageWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { errorToast, successToast } from "@/core/core.function";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import type { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { bulkStoreAttendance } from "../lib/attendance.actions";
import {
  ATTENDANCE,
  MARK_TYPE_COLORS,
  MARK_TYPE_LABELS,
  MARK_TYPE_OPTIONS,
} from "../lib/attendance.constants";
import type { MarkType } from "../lib/attendance.interface";

interface MarkRow {
  mark_type: MarkType | "";
  time: string;
}

interface DateBlock {
  date: string;
  marks: MarkRow[];
}

const MARK_TYPE_SELECT_OPTIONS = MARK_TYPE_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

// Orden natural de una jornada: entrada -> salida almuerzo -> regreso -> salida
const MARK_ORDER: MarkType[] = [
  "check_in",
  "lunch_out",
  "lunch_in",
  "check_out",
];

// Horas por defecto de las 4 marcaciones de la jornada del trabajador
const DEFAULT_MARK_TIMES: Record<MarkType, string> = {
  check_in: "08:00:00",
  lunch_out: "13:00:00",
  lunch_in: "14:25:00",
  check_out: "18:00:00",
};

const defaultMarks = (): MarkRow[] =>
  MARK_ORDER.map((mark_type) => ({
    mark_type,
    time: DEFAULT_MARK_TIMES[mark_type],
  }));

const isValidTime = (t: string) => /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(t);

const parseDateStr = (d: string) => parseISO(`${d}T00:00:00`);

const formatLongDate = (d: string) =>
  format(parseDateStr(d), "EEEE d 'de' MMMM yyyy", { locale: es });

const formatShortDate = (d: string) =>
  format(parseDateStr(d), "d MMM", { locale: es });

const makeBlock = (date: string): DateBlock => ({
  date,
  marks: defaultMarks(),
});

/** Devuelve el primer error de un bloque de fecha, o null si es válido. */
function validateBlock(block: DateBlock): string | null {
  if (!block.date) return "Falta la fecha";
  if (block.marks.length === 0) return "Agrega al menos una marcación";
  if (block.marks.length > 4) return "Máximo 4 marcaciones por fecha";

  const seen = new Set<MarkType>();
  for (const m of block.marks) {
    if (!m.mark_type) return "Selecciona el tipo de cada marcación";
    if (!isValidTime(m.time)) return "Cada marcación necesita una hora válida";
    if (seen.has(m.mark_type))
      return `"${MARK_TYPE_LABELS[m.mark_type]}" está repetido en la misma fecha`;
    seen.add(m.mark_type);
  }

  // Validar coherencia horaria según el orden natural de la jornada
  const ordered = [...block.marks].sort(
    (a, b) =>
      MARK_ORDER.indexOf(a.mark_type as MarkType) -
      MARK_ORDER.indexOf(b.mark_type as MarkType),
  );
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].time < ordered[i - 1].time) {
      return `La hora de "${MARK_TYPE_LABELS[ordered[i].mark_type as MarkType]}" no puede ser anterior a la de "${MARK_TYPE_LABELS[ordered[i - 1].mark_type as MarkType]}"`;
    }
  }

  return null;
}

export default function AttendanceBulkStorePage() {
  const navigate = useNavigate();
  const { ROUTE, ABSOLUTE_ROUTE } = ATTENDANCE;
  const { checkRouteExists, isLoadingModule } = useCurrentModule();

  const [sedeId, setSedeId] = useState("");
  const [personId, setPersonId] = useState("");
  // Mapa fecha(yyyy-MM-dd) -> bloque, para conservar las marcaciones al
  // marcar/desmarcar días en el calendario.
  const [blocks, setBlocks] = useState<Record<string, DateBlock>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: sedes = [] } = useAllSedes();

  const { data: workers = [], isFetching: loadingWorkers } = useAllWorkers(
    { sede_id: sedeId, status_id: STATUS_WORKER.ACTIVE },
    !!sedeId,
  );

  const sedeOptions = useMemo(
    () => sedes.map((s) => ({ value: String(s.id), label: s.abreviatura })),
    [sedes],
  );

  const workerOptions = useMemo(
    () =>
      workers.map((w: WorkerResource) => ({
        value: String(w.id),
        label: w.name,
        description: w.document,
      })),
    [workers],
  );

  // Fechas ordenadas cronológicamente para renderizar las tarjetas.
  const orderedDates = useMemo(
    () => Object.keys(blocks).sort(),
    [blocks],
  );

  const selectedDays = useMemo(
    () => orderedDates.map(parseDateStr),
    [orderedDates],
  );

  const blockErrors = useMemo(
    () =>
      orderedDates.reduce<Record<string, string | null>>((acc, d) => {
        acc[d] = validateBlock(blocks[d]);
        return acc;
      }, {}),
    [orderedDates, blocks],
  );

  const validCount = orderedDates.filter((d) => !blockErrors[d]).length;

  const canSubmit =
    !!sedeId &&
    !!personId &&
    orderedDates.length > 0 &&
    orderedDates.every((d) => blockErrors[d] === null) &&
    !submitting;

  const handleSedeChange = (v: string) => {
    setSedeId(v);
    setPersonId("");
  };

  // El calendario entrega el listado completo de días seleccionados.
  const handleCalendarSelect = (days: Date[] | undefined) => {
    const next = days ?? [];
    const nextKeys = new Set(next.map((d) => format(d, "yyyy-MM-dd")));
    setBlocks((prev) => {
      const result: Record<string, DateBlock> = {};
      // Conservar los bloques que siguen seleccionados
      for (const key of Object.keys(prev)) {
        if (nextKeys.has(key)) result[key] = prev[key];
      }
      // Crear bloques nuevos con marcaciones por defecto
      for (const key of nextKeys) {
        if (!result[key]) result[key] = makeBlock(key);
      }
      return result;
    });
  };

  const removeBlock = (date: string) =>
    setBlocks((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([key]) => key !== date),
      ),
    );

  const clearAll = () => setBlocks({});

  const patchMark = (
    date: string,
    markIndex: number,
    patch: Partial<MarkRow>,
  ) =>
    setBlocks((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        marks: prev[date].marks.map((m, i) =>
          i === markIndex ? { ...m, ...patch } : m,
        ),
      },
    }));

  const addMark = (date: string) =>
    setBlocks((prev) => {
      const block = prev[date];
      if (block.marks.length >= 4) return prev;
      const used = new Set(block.marks.map((m) => m.mark_type));
      const next = MARK_ORDER.find((t) => !used.has(t)) ?? "";
      return {
        ...prev,
        [date]: {
          ...block,
          marks: [
            ...block.marks,
            { mark_type: next, time: next ? DEFAULT_MARK_TIMES[next] : "" },
          ],
        },
      };
    });

  const removeMark = (date: string, markIndex: number) =>
    setBlocks((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        marks: prev[date].marks.filter((_, i) => i !== markIndex),
      },
    }));

  const resetMarks = (date: string) =>
    setBlocks((prev) => ({
      ...prev,
      [date]: { ...prev[date], marks: defaultMarks() },
    }));

  // Copiar las marcaciones de una fecha a todas las demás fechas seleccionadas.
  const applyToAll = (date: string) =>
    setBlocks((prev) => {
      const template = prev[date].marks.map((m) => ({ ...m }));
      const result: Record<string, DateBlock> = {};
      for (const key of Object.keys(prev)) {
        result[key] =
          key === date
            ? prev[key]
            : { ...prev[key], marks: template.map((m) => ({ ...m })) };
      }
      return result;
    });

  const onSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const result = await bulkStoreAttendance({
        person_id: Number(personId),
        sede_id: Number(sedeId),
        dates: orderedDates.map((d) => ({
          date: d,
          marks: blocks[d].marks.map((m) => ({
            time: m.time,
            mark_type: m.mark_type as MarkType,
          })),
        })),
      });

      const detail =
        result.created !== undefined
          ? `${result.created} marcaciones creadas${
              result.skipped ? `, ${result.skipped} omitidas` : ""
            }`
          : "";

      successToast(
        result.message ??
          `Marcaciones registradas${detail ? `: ${detail}` : ""}`,
      );
      navigate(ABSOLUTE_ROUTE);
    } catch (err: any) {
      errorToast(
        err?.response?.data?.message ?? "Error al registrar las marcaciones",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title="Registrar marcación masiva"
          subtitle="Selecciona las fechas en el calendario y define las marcaciones de cada jornada"
          icon="CalendarPlus"
          backRoute={ABSOLUTE_ROUTE}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ABSOLUTE_ROUTE)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button size="sm" onClick={onSubmit} disabled={!canSubmit}>
            {submitting ? (
              <>
                <Loader2 className="size-4 mr-1.5 animate-spin" />
                Registrando…
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4 mr-1.5" />
                Registrar {orderedDates.length > 0 && `(${validCount})`}
              </>
            )}
          </Button>
        </div>
      </HeaderTableWrapper>

      <div className="grid gap-6 lg:grid-cols-[minmax(300px,340px)_1fr] items-start pb-10">
        {/* Panel izquierdo: colaborador + calendario */}
        <div className="grid gap-4 lg:sticky lg:top-4">
          <div className="rounded-xl border bg-card p-4 grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-xs md:text-sm">Sede</Label>
              <SearchableSelect
                options={sedeOptions}
                value={sedeId}
                onChange={handleSedeChange}
                placeholder="Selecciona una sede"
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs md:text-sm">Colaborador</Label>
              <SearchableSelect
                options={workerOptions}
                value={personId}
                onChange={setPersonId}
                placeholder={
                  !sedeId
                    ? "Selecciona una sede primero"
                    : loadingWorkers
                      ? "Cargando colaboradores…"
                      : "Selecciona un colaborador"
                }
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs md:text-sm flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                Fechas
              </Label>
              {orderedDates.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={clearAll}
                >
                  Limpiar
                </Button>
              )}
            </div>

            <div className="flex justify-center">
              <Calendar
                mode="multiple"
                selected={selectedDays}
                onSelect={handleCalendarSelect}
                disabled={{ after: new Date() }}
                locale={es}
                showOutsideDays={false}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {orderedDates.length === 0
                ? "Ninguna fecha seleccionada"
                : `${orderedDates.length} fecha${orderedDates.length === 1 ? "" : "s"} seleccionada${orderedDates.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        {/* Panel derecho: tarjetas por fecha ordenadas cronológicamente */}
        <div className="grid gap-3">
          {orderedDates.length === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-10 text-center">
              <CalendarPlus className="size-8 mx-auto text-muted-foreground/60" />
              <p className="mt-3 text-sm font-medium text-muted-foreground">
                Selecciona una o varias fechas en el calendario
              </p>
              <p className="mt-1 text-xs text-muted-foreground/80">
                Cada fecha aparecerá aquí con sus 4 marcaciones listas para
                ajustar.
              </p>
            </div>
          ) : (
            orderedDates.map((date, idx) => {
              const block = blocks[date];
              const usedTypes = new Set(
                block.marks.map((m) => m.mark_type).filter(Boolean),
              );
              const error = blockErrors[date];
              return (
                <div
                  key={date}
                  className={cn(
                    "rounded-xl border bg-card p-4 grid gap-4",
                    error && "border-destructive/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-[10px] font-medium leading-none uppercase">
                          {format(parseDateStr(date), "MMM", { locale: es })}
                        </span>
                        <span className="text-base font-bold leading-none">
                          {format(parseDateStr(date), "d")}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold capitalize truncate">
                          {formatLongDate(date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha {idx + 1} de {orderedDates.length} ·{" "}
                          {block.marks.length}/4 marcaciones
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {orderedDates.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground"
                          onClick={() => applyToAll(date)}
                          title="Copiar estas marcaciones a todas las fechas"
                        >
                          Aplicar a todas
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground"
                        onClick={() => resetMarks(date)}
                      >
                        Restablecer
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive"
                        onClick={() => removeBlock(date)}
                        title="Quitar fecha"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {block.marks.map((mark, mi) => {
                      const options = MARK_TYPE_SELECT_OPTIONS.filter(
                        (o) =>
                          o.value === mark.mark_type ||
                          !usedTypes.has(o.value as MarkType),
                      );
                      const badgeClass = mark.mark_type
                        ? MARK_TYPE_COLORS[mark.mark_type]
                        : "bg-muted text-muted-foreground border-transparent";
                      return (
                        <div
                          key={mi}
                          className="rounded-lg border bg-muted/30 p-2.5 grid gap-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                                badgeClass,
                              )}
                            >
                              {mark.mark_type
                                ? MARK_TYPE_LABELS[mark.mark_type]
                                : "Sin tipo"}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-6 shrink-0"
                              onClick={() => removeMark(date, mi)}
                              disabled={block.marks.length === 1}
                              title="Quitar marcación"
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                          <SearchableSelect
                            options={options}
                            value={mark.mark_type}
                            onChange={(v) =>
                              patchMark(date, mi, {
                                mark_type: (v as MarkType) || "",
                              })
                            }
                            placeholder="Tipo"
                          />
                          <input
                            type="time"
                            step={1}
                            value={mark.time}
                            onChange={(e) =>
                              patchMark(date, mi, { time: e.target.value })
                            }
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        </div>
                      );
                    })}

                    {block.marks.length < 4 && (
                      <button
                        type="button"
                        onClick={() => addMark(date)}
                        className="flex min-h-28 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/10 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                      >
                        <Plus className="size-4 mb-1" />
                        Agregar marcación
                      </button>
                    )}
                  </div>

                  {error && (
                    <p className="text-xs text-destructive">{error}</p>
                  )}
                </div>
              );
            })
          )}

          {orderedDates.length > 1 && (
            <p className="text-xs text-muted-foreground px-1">
              Se registrarán {orderedDates.length} fechas ·{" "}
              {formatShortDate(orderedDates[0])} –{" "}
              {formatShortDate(orderedDates[orderedDates.length - 1])}
            </p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
