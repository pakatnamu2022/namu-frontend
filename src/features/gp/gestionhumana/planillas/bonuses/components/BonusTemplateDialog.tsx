"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadBonusTemplate } from "../lib/bonus.actions";
import { BonusPeriodInput } from "../lib/bonus.interface";
import { errorToast, successToast } from "@/core/core.function";

const MONTHS = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" },
];

function buildPeriodRange(
  fromYear: number,
  fromMonth: number,
  toYear: number,
  toMonth: number,
): BonusPeriodInput[] {
  const periods: BonusPeriodInput[] = [];
  let year = fromYear;
  let month = fromMonth;

  while (year < toYear || (year === toYear && month <= toMonth)) {
    periods.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return periods;
}

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: string;
  defaultYear: number;
  defaultMonth: number;
}

export default function BonusTemplateDialog({
  open,
  onClose,
  companyId,
  defaultYear,
  defaultMonth,
}: Props) {
  const [fromYear, setFromYear] = useState(defaultYear);
  const [fromMonth, setFromMonth] = useState(defaultMonth);
  const [toYear, setToYear] = useState(defaultYear);
  const [toMonth, setToMonth] = useState(defaultMonth);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClose = () => {
    setFromYear(defaultYear);
    setFromMonth(defaultMonth);
    setToYear(defaultYear);
    setToMonth(defaultMonth);
    onClose();
  };

  const handleDownload = async () => {
    if (!companyId) return;

    const periods = buildPeriodRange(fromYear, fromMonth, toYear, toMonth);

    if (periods.length === 0) {
      errorToast("El periodo final debe ser mayor o igual al inicial");
      return;
    }

    setIsDownloading(true);
    try {
      await downloadBonusTemplate(companyId, periods);
      successToast("Plantilla descargada correctamente");
      handleClose();
    } catch {
      errorToast("Error al descargar la plantilla");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Plantilla de bonificaciones</DialogTitle>
          <DialogDescription>
            Genera una plantilla Excel en formato matriz: una fila por
            trabajador activo de la empresa y una columna por cada mes del
            rango que elijas. Solo llenas el monto donde corresponda.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Desde</label>
            <div className="flex items-center gap-2">
              <Select
                value={String(fromMonth)}
                onValueChange={(v) => setFromMonth(Number(v))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                className="w-24"
                value={fromYear}
                onChange={(e) => setFromYear(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hasta</label>
            <div className="flex items-center gap-2">
              <Select
                value={String(toMonth)}
                onValueChange={(v) => setToMonth(Number(v))}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                className="w-24"
                value={toYear}
                onChange={(e) => setToYear(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading || !companyId}
          >
            <Download className="size-4 mr-1.5" />
            {isDownloading ? "Descargando..." : "Descargar plantilla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
