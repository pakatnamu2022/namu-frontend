"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { ModelVnSyncLog } from "../lib/modelsVn.interface";
import { Button } from "@/components/ui/button";

interface Props {
  log: ModelVnSyncLog | null;
  onClose: () => void;
}

export default function ModelVnDynamicsPayloadSheet({ log, onClose }: Props) {
  if (!log) return null;

  const payload = log.dynamics_payload;

  return (
    <GeneralSheet
      open={!!log}
      onClose={onClose}
      title={`Payload Dynamics — ${log.code}`}
      subtitle={log.model?.version}
      icon="Code"
      size="2xl"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4 overflow-auto max-h-[65vh]">
          <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </GeneralSheet>
  );
}
