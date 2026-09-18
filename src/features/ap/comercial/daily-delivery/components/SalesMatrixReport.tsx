"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterMultiSelect } from "@/shared/components/FilterMultiSelect";
import { useDownloadReport } from "@/shared/lib/reports/reports.hook";
import { useSelectOptions } from "@/shared/lib/reports/reports.hook";
import {
  SALES_MATRIX_ENDPOINT,
  useSalesMatrix,
} from "../lib/sales-matrix.hook";
import { SalesMatrixNode } from "../lib/sales-matrix.interface";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Dic",
];

const YEARS_BACK = 4;

type RowLevel = "brand" | "family" | "model";

const ROW_STYLES: Record<RowLevel, string> = {
  brand: "bg-muted font-semibold",
  family: "bg-card font-medium",
  model: "bg-card text-[13px] text-muted-foreground",
};

const INDENT: Record<RowLevel, string> = {
  brand: "pl-3",
  family: "pl-9",
  model: "pl-16",
};

const toIds = (values: string[]) => values.map(Number).filter(Boolean);

export default function SalesMatrixReport() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [shopIds, setShopIds] = useState<string[]>([]);
  const [sedeIds, setSedeIds] = useState<string[]>([]);
  // Por defecto las marcas se ven abiertas (con sus familias) y las familias cerradas.
  const [closedBrands, setClosedBrands] = useState<Set<string>>(new Set());
  const [openFamilies, setOpenFamilies] = useState<Set<string>>(new Set());

  const params = useMemo(
    () => ({
      year,
      ...(shopIds.length > 0 && { shop_id: toIds(shopIds) }),
      ...(sedeIds.length > 0 && { sede_id: toIds(sedeIds) }),
    }),
    [year, shopIds, sedeIds],
  );

  const { data, isLoading, isFetching, error } = useSalesMatrix(params);
  const { mutate: download, isPending: isDownloading } = useDownloadReport();

  const { data: shops, isLoading: loadingShops } =
    useSelectOptions("/gp/mg/sede/my-shops");
  const { data: sedes, isLoading: loadingSedes } =
    useSelectOptions("/gp/mg/sede/my");

  const shopOptions = useMemo(
    () =>
      (shops ?? []).map((item: any) => ({
        label: item.description,
        value: String(item.id),
      })),
    [shops],
  );

  // Varias sedes de distintas empresas pueden compartir el mismo nombre.
  const sedeOptions = useMemo(
    () =>
      (sedes ?? []).map((item: any) => ({
        label: item.suc_abrev ?? item.abreviatura,
        value: String(item.id),
      })),
    [sedes],
  );

  const years = useMemo(
    () => Array.from({ length: YEARS_BACK + 1 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const months = MONTHS.slice(0, data?.last_month ?? 12);

  const bestMonth = useMemo(() => {
    if (!data || data.totals.total === 0) return null;
    const counts = data.totals.months.slice(0, data.last_month);
    const max = Math.max(...counts);
    return { label: MONTHS[counts.indexOf(max)], value: max };
  }, [data]);

  const toggleBrand = (key: string) =>
    setClosedBrands((prev) => toggle(prev, key));
  const toggleFamily = (key: string) =>
    setOpenFamilies((prev) => toggle(prev, key));

  const expandAll = () => {
    setClosedBrands(new Set());
    setOpenFamilies(
      new Set(
        (data?.rows ?? []).flatMap((brand) =>
          brand.children.map((family) => familyKey(brand, family)),
        ),
      ),
    );
  };

  const collapseAll = () => {
    setClosedBrands(new Set((data?.rows ?? []).map((brand) => brand.name)));
    setOpenFamilies(new Set());
  };

  const handleDownload = () =>
    download({
      endpoint: `${SALES_MATRIX_ENDPOINT}/export`,
      params,
      fileName: `Reporte_Ventas_Mensual_${year}`,
      method: "get",
    });

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <FilterField label="Año">
            <Select
              value={String(year)}
              onValueChange={(value) => setYear(Number(value))}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Shop">
            <FilterMultiSelect
              value={shopIds}
              onChange={setShopIds}
              options={shopOptions}
              placeholder="Todas"
              isLoadingOptions={loadingShops}
              className="w-56"
            />
          </FilterField>

          <FilterField label="Sede">
            <FilterMultiSelect
              value={sedeIds}
              onChange={setSedeIds}
              options={sedeOptions}
              placeholder="Todas"
              isLoadingOptions={loadingSedes}
              className="w-48"
            />
          </FilterField>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={expandAll}
            disabled={!data}
          >
            <ChevronsUpDown className="size-4" />
            Expandir todo
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            disabled={!data}
          >
            <ChevronsDownUp className="size-4" />
            Contraer todo
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading || isLoading}
          >
            {isDownloading ? (
              <Loader className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Descargar Excel
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "No se pudo cargar la matriz de ventas."}
        </div>
      ) : isLoading || !data ? (
        <div className="h-96 animate-pulse rounded-xl bg-muted/40" />
      ) : data.rows.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No hay vehículos vendidos en {year} con los filtros seleccionados.
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-8">
            <Stat label={`Vehículos vendidos ${year}`} value={data.totals.total} />
            <Stat label="Marcas" value={data.rows.length} />
            {bestMonth && (
              <Stat
                label="Mejor mes"
                value={bestMonth.label}
                hint={`${bestMonth.value} vehículos`}
              />
            )}
          </div>

          <div
            className={cn(
              "overflow-x-auto rounded-xl bg-card shadow-md transition-opacity",
              isFetching && "opacity-60",
            )}
          >
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-slate-700 text-white">
                  <th className="sticky left-0 z-10 min-w-72 bg-slate-700 py-2.5 pl-3 text-left font-semibold">
                    Cuenta de VIN
                  </th>
                  {months.map((month) => (
                    <th
                      key={month}
                      className="w-14 px-2 py-2.5 text-right font-semibold"
                    >
                      {month}
                    </th>
                  ))}
                  <th className="w-28 whitespace-nowrap px-3 py-2.5 text-right font-semibold">
                    Total general
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.rows.map((brand) => {
                  const brandOpen = !closedBrands.has(brand.name);
                  return (
                    <Fragment key={brand.name}>
                      <MatrixRow
                        level="brand"
                        node={brand}
                        monthCount={months.length}
                        expandable={brand.children.length > 0}
                        expanded={brandOpen}
                        onToggle={() => toggleBrand(brand.name)}
                        highlightMax
                      />

                      {brandOpen &&
                        brand.children.map((family) => {
                          const key = familyKey(brand, family);
                          const familyOpen = openFamilies.has(key);
                          return (
                            <Fragment key={key}>
                              <MatrixRow
                                level="family"
                                node={family}
                                monthCount={months.length}
                                expandable={family.children.length > 0}
                                expanded={familyOpen}
                                onToggle={() => toggleFamily(key)}
                              />

                              {familyOpen &&
                                family.children.map((model) => (
                                  <MatrixRow
                                    key={`${key}|${model.name}`}
                                    level="model"
                                    node={model}
                                    monthCount={months.length}
                                  />
                                ))}
                            </Fragment>
                          );
                        })}
                    </Fragment>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="bg-slate-700 font-bold text-white">
                  <td className="sticky left-0 z-10 bg-slate-700 py-2.5 pl-3">
                    Total general
                  </td>
                  {data.totals.months.slice(0, months.length).map((value, i) => (
                    <td key={i} className="px-2 py-2.5 text-right tabular-nums">
                      {value || ""}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {data.totals.total}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            Se cuenta un VIN por el mes de emisión de su comprobante vigente
            (las refacturaciones se atribuyen al primer comprobante). Shop y
            sede corresponden a la serie del comprobante.
          </p>
        </>
      )}
    </div>
  );
}

const toggle = (set: Set<string>, key: string) => {
  const next = new Set(set);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
};

const familyKey = (brand: SalesMatrixNode, family: SalesMatrixNode) =>
  `${brand.name}|${family.name}`;

interface MatrixRowProps {
  level: RowLevel;
  node: SalesMatrixNode;
  monthCount: number;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  highlightMax?: boolean;
}

function MatrixRow({
  level,
  node,
  monthCount,
  expandable = false,
  expanded = false,
  onToggle,
  highlightMax = false,
}: MatrixRowProps) {
  const months = node.months.slice(0, monthCount);
  const max = highlightMax ? Math.max(...months) : 0;
  const cell = ROW_STYLES[level];

  return (
    <tr
      className={cn("group", expandable && "cursor-pointer")}
      onClick={expandable ? onToggle : undefined}
    >
      <td
        className={cn(
          "sticky left-0 z-[1] py-2 pr-3 group-hover:bg-accent",
          cell,
          INDENT[level],
        )}
      >
        <div className="flex items-center gap-1.5">
          {expandable ? (
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-90",
              )}
            />
          ) : (
            <span className="size-4 shrink-0" />
          )}
          <span className="truncate" title={node.name}>
            {node.name}
          </span>
        </div>
      </td>

      {months.map((value, i) => (
        <td
          key={i}
          className={cn(
            "px-2 py-2 text-right tabular-nums group-hover:bg-accent",
            cell,
          )}
        >
          {value > 0 &&
            (highlightMax && value === max ? (
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-400">
                {value}
              </span>
            ) : (
              value
            ))}
        </td>
      ))}

      <td
        className={cn(
          "px-3 py-2 text-right font-semibold tabular-nums group-hover:bg-accent",
          cell,
        )}
      >
        {node.total}
      </td>
    </tr>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
