import GeneralSheet from "@/shared/components/GeneralSheet";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InsuranceImportResult } from "../lib/insurance.actions";

interface Props {
  open: boolean;
  onClose: () => void;
  result: InsuranceImportResult | null;
}

export function InsuranceImportResultSheet({ open, onClose, result }: Props) {
  const summary = result?.summary;

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title="Reporte de importación de seguros"
      subtitle={result?.message}
      size="4xl"
    >
      {summary && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
          <div>
            <span className="text-muted-foreground">Empresa: </span>
            {summary.company_name ?? "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Periodo: </span>
            {summary.period_name ?? "-"}
          </div>
          <div>
            <span className="text-muted-foreground">Aseguradora: </span>
            {summary.business_partner_name}
          </div>
          <div>
            <span className="text-muted-foreground">Fecha: </span>
            {summary.imported_at}
          </div>
          <div>
            <span className="text-muted-foreground">Filas procesadas: </span>
            {summary.rows_processed}
          </div>
          <div>
            <span className="text-muted-foreground">Creados: </span>
            {summary.created}
            {" / "}
            <span className="text-muted-foreground">Actualizados: </span>
            {summary.updated}
            {" / "}
            <span className="text-muted-foreground">No importados: </span>
            {summary.not_imported}
          </div>
        </div>
      )}

      {!!summary?.global_errors?.length && (
        <div className="mb-4 rounded-md border border-destructive/50 p-3 text-sm text-destructive">
          {summary.global_errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fila</TableHead>
            <TableHead>N° Doc. Afiliado</TableHead>
            <TableHead>Contratante</TableHead>
            <TableHead>N° Doc. Contratante</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result?.report.map((row) => (
            <TableRow key={row.fila}>
              <TableCell>{row.fila}</TableCell>
              <TableCell>{row.doc_afiliado}</TableCell>
              <TableCell>{row.contratante}</TableCell>
              <TableCell>{row.doc_contratante}</TableCell>
              <TableCell>{row.tarifa}</TableCell>
              <TableCell>
                <Badge
                  color={row.estado === "Importado" ? "green" : "destructive"}
                >
                  {row.estado}
                </Badge>
              </TableCell>
              <TableCell>{row.motivo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GeneralSheet>
  );
}
