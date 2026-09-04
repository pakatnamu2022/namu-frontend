"use client";

import { useState } from "react";
import { Plus, Trash2, Download } from "lucide-react";
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
import { downloadHistoricalBonusTemplate } from "../lib/payroll-calculation.actions";
import { HistoricalPeriodInput } from "../lib/payroll-calculation.interface";
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

interface Props {
  open: boolean;
  onClose: () => void;
  companyId: number;
  companyName?: string;
  defaultYear: number;
  defaultMonth: number;
}

export default function PayrollHistoricalBonusTemplateDialog({
  open,
  onClose,
  companyId,
  companyName,
  defaultYear,
  defaultMonth,
}: Props) {
  const [periods, setPeriods] = useState<HistoricalPeriodInput[]>([
    { year: defaultYear, month: defaultMonth },
  ]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClose = () => {
    setPeriods([{ year: defaultYear, month: defaultMonth }]);
    onClose();
  };

  const addPeriod = () => {
    const last = periods[periods.length - 1];
    const nextMonth = last.month === 12 ? 1 : last.month + 1;
    const nextYear = last.month === 12 ? last.year + 1 : last.year;
    setPeriods([...periods, { year: nextYear, month: nextMonth }]);
  };

  const removePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const updatePeriod = (
    index: number,
    field: keyof HistoricalPeriodInput,
    value: number,
  ) => {
    setPeriods(
      periods.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };

  const handleDownload = async () => {
    if (periods.length === 0) {
      errorToast("Agrega al menos un período (año y mes)");
      return;
    }
    setIsDownloading(true);
    try {
      await downloadHistoricalBonusTemplate(companyId, periods);
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
          <DialogTitle>Plantilla de histórico de bono/comisión</DialogTitle>
          <DialogDescription>
            {companyName ? `Empresa: ${companyName}. ` : ""}
            Genera una plantilla Excel con los trabajadores activos y una fila
            por trabajador+mes (en cero) para los meses que elijas — bono de
            conductores u otra comisión variable que deba entrar en el
            promedio de gratificación/CTS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {periods.map((period, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={String(period.month)}
                onValueChange={(v) => updatePeriod(index, "month", Number(v))}
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
                value={period.year}
                onChange={(e) =>
                  updatePeriod(index, "year", Number(e.target.value))
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePeriod(index)}
                disabled={periods.length === 1}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" size="sm" onClick={addPeriod}>
            <Plus className="size-4 mr-1.5" /> Agregar mes
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
            <Download className="size-4 mr-1.5" />
            {isDownloading ? "Descargando..." : "Descargar plantilla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
