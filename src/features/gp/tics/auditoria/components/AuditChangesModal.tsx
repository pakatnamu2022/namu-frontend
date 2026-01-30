"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { AuditLogsResource } from "../lib/auditLogs.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  audit: AuditLogsResource;
}

function parseValues(value: any): Record<string, any> {
  if (!value) return {};
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return {};
  }
}

export default function AuditChangesModal({ open, onClose, audit }: Props) {
  const oldValues = parseValues(audit.old_values);
  const newValues = parseValues(audit.new_values);

  const allKeys = Array.from(
    new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
  );

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Comparación de Cambios"
      subtitle={`${audit.action_description} - ${audit.model_name}`}
      icon="GitCompareArrows"
      size="2xl"
    >
      <div className="overflow-auto max-h-[60vh]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-medium">Campo</th>
              <th className="text-left p-2 font-medium text-red-600">
                Valor Anterior
              </th>
              <th className="text-left p-2 font-medium text-green-600">
                Valor Nuevo
              </th>
            </tr>
          </thead>
          <tbody>
            {allKeys.map((key) => {
              const oldVal = oldValues[key];
              const newVal = newValues[key];
              const changed =
                JSON.stringify(oldVal) !== JSON.stringify(newVal);

              return (
                <tr
                  key={key}
                  className={`border-b ${changed ? "bg-muted/50" : ""}`}
                >
                  <td className="p-2 font-medium">{key}</td>
                  <td className="p-2">
                    <span
                      className={
                        changed
                          ? "bg-red-100 dark:bg-red-950 px-1 rounded"
                          : ""
                      }
                    >
                      {oldVal !== undefined
                        ? String(oldVal)
                        : "-"}
                    </span>
                  </td>
                  <td className="p-2">
                    <span
                      className={
                        changed
                          ? "bg-green-100 dark:bg-green-950 px-1 rounded"
                          : ""
                      }
                    >
                      {newVal !== undefined
                        ? String(newVal)
                        : "-"}
                    </span>
                  </td>
                </tr>
              );
            })}
            {allKeys.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                  No hay cambios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </GeneralModal>
  );
}
