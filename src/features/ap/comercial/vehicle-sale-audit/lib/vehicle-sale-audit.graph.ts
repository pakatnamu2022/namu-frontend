import {
  AuditCauseCode,
  AuditTimelineEvent,
} from "./vehicle-sale-audit.interface";
import { formatTimelineDate } from "./vehicle-sale-audit.constants";

/** Movimientos que pertenecen a un traslado (rama). */
const BRANCH_TYPES = new Set([
  "TRAVESIA",
  "EN TRAVESIA",
  "EN CURSO",
  "TRASLADO INTERNO",
]);
const GUIDE_RE = /Gu[ií]a[^:]*:\s*([A-Z0-9-]+)/;
const DOC_RE = /Documento:\s*(\S+)/;

export const guideOf = (event: AuditTimelineEvent): string | null =>
  BRANCH_TYPES.has(event.type)
    ? (event.note.match(GUIDE_RE)?.[1] ?? null)
    : null;

export type GraphRole = "plain" | "fork" | "branch" | "merge";

export interface GraphSegment {
  top: boolean;
  bottom: boolean;
}

export interface GraphEventRow {
  kind: "event";
  event: AuditTimelineEvent;
  guide: string | null;
  role: GraphRole;
  /** Carril donde se dibuja el punto (0 = línea principal del vehículo). */
  dotLane: number;
  /** Carril de la rama que se conecta con la línea principal. */
  branchLane: number | null;
  /** Carril que llevó el traslado, aunque el punto caiga en la línea principal. */
  guideLane: number | null;
  segments: GraphSegment[];
}

export interface GraphDayRow {
  kind: "day";
  label: string;
  segments: GraphSegment[];
}

export type GraphRow = GraphEventRow | GraphDayRow;

const MONTHS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

const dayLabel = (at: string) => {
  const m = at.match(/^(\d{2})-(\d{2})/);
  return m ? `${Number(m[2])} ${MONTHS[Number(m[1]) - 1] ?? m[1]}` : at;
};

export const timeOf = (at: string) => at.match(/(\d{2}:\d{2})/)?.[1] ?? "";

/**
 * Convierte los movimientos en un grafo tipo "git": la línea principal es el
 * vehículo; cada guía de traslado abre una rama que se une al llegar.
 */
export function buildGraph(events: AuditTimelineEvent[]): {
  rows: GraphRow[];
  lanes: number;
} {
  const guideLane = new Map<string, number>();
  const open: Record<number, boolean> = {};
  const rows: GraphRow[] = [];
  let maxLane = 0;

  const snapshot = (trunkOpen: boolean) => {
    const snap: Record<number, boolean> = { ...open, 0: trunkOpen };
    return snap;
  };
  const toSegments = (
    before: Record<number, boolean>,
    after: Record<number, boolean>,
  ): GraphSegment[] => {
    const size = Math.max(maxLane, ...Object.keys(before).map(Number)) + 1;
    return Array.from({ length: size }, (_, lane) => ({
      top: !!before[lane],
      bottom: !!after[lane],
    }));
  };
  const freeLane = () => {
    let lane = 1;
    while (open[lane]) lane++;
    return lane;
  };

  let lastDay = "";
  events.forEach((event, index) => {
    const label = dayLabel(event.at);
    const trunkBefore = index > 0;
    const trunkAfter = index < events.length - 1;

    if (label !== lastDay) {
      const snap = snapshot(trunkBefore);
      rows.push({ kind: "day", label, segments: toSegments(snap, snap) });
      lastDay = label;
    }

    const before = snapshot(trunkBefore);
    const guide = guideOf(event);
    let role: GraphRole = "plain";
    let dotLane = 0;
    let branchLane: number | null = null;
    let laneOfGuide: number | null = null;

    if (guide) {
      const known = guideLane.get(guide);
      if (known === undefined && event.type !== "TRASLADO INTERNO") {
        const lane = freeLane();
        guideLane.set(guide, lane);
        open[lane] = true;
        maxLane = Math.max(maxLane, lane);
        role = "fork";
        dotLane = lane;
        branchLane = lane;
        laneOfGuide = lane;
      } else if (known !== undefined) {
        laneOfGuide = known;
        if (event.type === "TRASLADO INTERNO") {
          role = "merge";
          dotLane = 0;
          branchLane = known;
          open[known] = false;
          guideLane.delete(guide);
        } else {
          role = "branch";
          dotLane = known;
        }
      }
    }

    const after = snapshot(trunkAfter);
    rows.push({
      kind: "event",
      event,
      guide,
      role,
      dotLane,
      branchLane,
      guideLane: laneOfGuide,
      segments: toSegments(before, after),
    });
  });

  const lanes = maxLane + 1;
  // Igualar el ancho de todas las filas
  rows.forEach((row) => {
    while (row.segments.length < lanes) {
      row.segments.push({ top: false, bottom: false });
    }
  });

  return { rows, lanes };
}

/**
 * Simula cómo quedaría la historia corregida:
 * - una llegada tardía se reubica justo después de su propia guía (donde debió
 *   ocurrir), antes de abrir otro traslado y de vender;
 * - cualquier otro movimiento que devolvió el vehículo a inventario se descarta.
 */
export function simulateFix(
  events: AuditTimelineEvent[],
  cause: AuditCauseCode,
): { events: AuditTimelineEvent[]; affectedIds: number[] } {
  let result = [...events];
  const affectedIds: number[] = [];

  events
    .filter((event) => event.flag === "bad")
    .forEach((bad) => {
      affectedIds.push(bad.id);
      const guide = guideOf(bad);
      if (cause === "LLEGADA_TARDIA" && guide) {
        let anchorIndex = -1;
        result.forEach((event, index) => {
          if (event.id !== bad.id && guideOf(event) === guide) {
            anchorIndex = index;
          }
        });
        if (anchorIndex >= 0) {
          const anchor = result[anchorIndex];
          result = result.filter((event) => event.id !== bad.id);
          result.splice(result.indexOf(anchor) + 1, 0, {
            ...bad,
            flag: "",
            simulated: "moved",
            originalAt: bad.at,
            at: anchor.at,
            status: "EN CURSO → INVENTARIO",
            wh: anchor.wh,
          });
          return;
        }
      }
      result = result.filter((event) => event.id !== bad.id);
    });

  return { events: result, affectedIds };
}

const splitWarehouse =(wh: string) => {
  const [from, to] = wh.split("→").map((s) => s.trim());
  return { from: from || "", to: to || "" };
};

const splitStatus = (status: string) => {
  const [from, to] = status.split("→").map((s) => s.trim());
  return { from: from || "", to: to || "" };
};

/** Texto en lenguaje llano de lo que significa cada movimiento. */
export function describeEvent(event: AuditTimelineEvent): {
  title: string;
  text: string;
} {
  const guide = event.note.match(GUIDE_RE)?.[1];
  const doc = event.note.match(DOC_RE)?.[1];
  const wh = splitWarehouse(event.wh);
  const st = splitStatus(event.status);
  const bad = event.flag === "bad";

  if (event.simulated === "moved") {
    return {
      title: `Llegó a tiempo el traslado ${guide ?? ""}`.trim(),
      text: `Así debió cerrarse: antes de abrir otro traslado y de vender. En la realidad llegó el ${formatTimelineDate(event.originalAt ?? event.at)}, cuando el vehículo ya estaba vendido.`,
    };
  }

  switch (event.type) {
    case "TRAVESIA":
    case "EN TRAVESIA":
      return {
        title: guide
          ? `Se registró la guía de traslado ${guide}`
          : "Vehículo en tránsito",
        text: "Se abre un traslado: el vehículo queda en tránsito hasta que la guía se contabilice y llegue.",
      };
    case "EN CURSO":
      return {
        title: guide ? `Guía ${guide} contabilizada` : "Traslado en curso",
        text: `El vehículo sale${wh.from ? ` de ${wh.from}` : ""}${wh.to ? ` hacia ${wh.to}` : ""} y queda EN CURSO: todavía no llegó, pero ya se puede facturar.`,
      };
    case "TRASLADO INTERNO":
      return bad
        ? {
            title: `Llegó tarde el traslado ${guide ?? ""}`.trim(),
            text: `Estaba ${st.from} y la llegada lo devolvió a ${st.to}${wh.to ? ` en ${wh.to}` : ""}. Este es el error: no debió pisar una venta ya hecha.`,
          }
        : {
            title: `Llegó el traslado ${guide ?? ""}`.trim(),
            text: `Llega${wh.to ? ` a ${wh.to}` : ""} y pasa a ${st.to}.`,
          };
    case "VENTA":
      return {
        title: doc ? `Se vendió: ${doc}` : "Se vendió",
        text: `Se factura el vehículo${wh.to ? ` en ${wh.to}` : ""} y pasa a ${st.to}.`,
      };
    case "REVERSION_NOTA_CREDITO":
      return {
        title: doc
          ? `La nota de crédito ${doc} lo devolvió a inventario`
          : "Una nota de crédito lo devolvió a inventario",
        text: "La nota de crédito anula la factura y el vehículo vuelve a inventario, sin comprobar si ya había una venta nueva.",
      };
    case "CANCELACION_FACTURA":
      return {
        title: doc
          ? `Se canceló la factura ${doc}`
          : "Se canceló una factura",
        text: `El vehículo pasa de ${st.from} a ${st.to}.`,
      };
    case "INVENTARIO":
      return {
        title: "Movimiento de inventario",
        text: event.note || `Pasa de ${st.from} a ${st.to}.`,
      };
    default:
      return {
        title: event.type,
        text: event.note || `Pasa de ${st.from} a ${st.to}.`,
      };
  }
}
