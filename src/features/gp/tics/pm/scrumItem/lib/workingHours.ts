// Horario laboral del equipo: lunes a viernes 8h, sábado 5h, domingo no
// laborable. Estas funciones son la única fuente de verdad para calcular
// duraciones/horas estimadas y para encadenar fechas (recalcular hijos,
// crear/editar items), de modo que el Gantt y los formularios coincidan.

export function isNonWorkingDay(date: Date): boolean {
  return date.getDay() === 0; // domingo
}

export function hoursForDate(date: Date): number {
  const day = date.getDay();
  if (day === 0) return 0; // domingo
  if (day === 6) return 5; // sábado
  return 8; // lunes a viernes
}

export function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor.getTime() <= last.getTime()) {
    if (!isNonWorkingDay(cursor)) count++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function sumWorkingHours(start: Date, end: Date): number {
  let hours = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor.getTime() <= last.getTime()) {
    hours += hoursForDate(cursor);
    cursor.setDate(cursor.getDate() + 1);
  }
  return hours;
}

export function nextWorkingDay(date: Date): Date {
  const d = new Date(date);
  if (isNonWorkingDay(d)) d.setDate(d.getDate() + 1);
  return d;
}

// Suma `days` días laborables a partir de `start` (start cuenta como el
// primer día laborable si ya lo es; si cae domingo se corre al lunes).
export function addWorkingDays(start: Date, days: number): Date {
  let cursor = nextWorkingDay(start);
  if (days <= 1) return cursor;
  let remaining = days - 1;
  while (remaining > 0) {
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    cursor = nextWorkingDay(cursor);
    remaining--;
  }
  return cursor;
}

// Matcher de react-day-picker para deshabilitar los domingos en los
// selectores de rango de fechas.
export const SUNDAY_DISABLED_MATCHER = { dayOfWeek: [0] };
