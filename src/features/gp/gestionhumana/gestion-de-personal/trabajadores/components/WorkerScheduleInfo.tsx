import { Clock } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import type { WorkScheduleResource } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.interface";
import { DAY_OF_WEEK_LABELS } from "@/features/gp/gestionhumana/asistencias/horarios/lib/work-schedule.constants";

function fmt(t: string | null | undefined) {
  return t ? t.slice(0, 5) : "—";
}

function TimeSlot({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="tabular-nums font-mono text-sm font-semibold">{value}</span>
    </div>
  );
}

interface WorkerScheduleInfoProps {
  schedule: WorkScheduleResource;
}

export function WorkerScheduleInfo({ schedule }: WorkerScheduleInfoProps) {
  const hasDetails = schedule.details && schedule.details.length > 0;

  return (
    <GroupFormSection
      title={`Horario: ${schedule.name}`}
      icon={Clock}
      color="violet"
      cols={{ sm: 1 }}
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TimeSlot label="Entrada" value={fmt(schedule.checkin)} />
          {schedule.lunch_out && (
            <TimeSlot label="Sal. almuerzo" value={fmt(schedule.lunch_out)} />
          )}
          {schedule.lunch_in && (
            <TimeSlot label="Reg. almuerzo" value={fmt(schedule.lunch_in)} />
          )}
          <TimeSlot label="Salida" value={fmt(schedule.checkout)} />
        </div>

        {hasDetails && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Excepciones por día
            </p>
            <div className="rounded-md bg-muted/40 divide-y divide-muted overflow-hidden">
              {schedule.details.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center gap-4 px-3 py-1.5 text-xs"
                >
                  <span className="w-24 font-medium text-foreground">
                    {DAY_OF_WEEK_LABELS[d.day_of_week]}
                  </span>
                  <span className="tabular-nums font-mono text-muted-foreground">
                    {fmt(d.checkin)} → {fmt(d.checkout)}
                  </span>
                  {(d.lunch_out || d.lunch_in) && (
                    <span className="tabular-nums font-mono text-muted-foreground/60">
                      almuerzo {fmt(d.lunch_out)}–{fmt(d.lunch_in)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
