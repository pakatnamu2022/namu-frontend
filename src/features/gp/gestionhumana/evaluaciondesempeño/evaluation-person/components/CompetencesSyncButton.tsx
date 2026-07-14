"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import { CompetencesSyncPreviewModal } from "./CompetencesSyncPreviewModal";

interface Props {
  evaluationId: number;
  onSync: () => void;
  loading?: boolean;
}

export default function CompetencesSyncButton({
  evaluationId,
  onSync,
  loading,
}: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="w-full md:w-auto"
        onClick={() => setPreviewOpen(true)}
        disabled={loading}
      >
        <ListChecks className={cn("size-4", { "animate-pulse": loading })} />
        Sincronizar Competencias
      </Button>

      <CompetencesSyncPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        evaluationId={evaluationId}
        onConfirm={onSync}
      />
    </>
  );
}
