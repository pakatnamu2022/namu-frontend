"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { uploadAssignmentFile } from "../lib/assignments.actions";
import { errorToast, successToast } from "@/core/core.function";

interface Props {
  open: boolean;
  assignmentId: number;
  type: "assignment" | "unassignment";
  onClose: () => void;
  onSuccess: () => void;
}

export default function EquipmentAssignmentUploadModal({
  open,
  assignmentId,
  type,
  onClose,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => uploadAssignmentFile(assignmentId, file!, type),
    onSuccess: () => {
      successToast("Archivo subido correctamente.");
      setFile(null);
      setPreviewUrl("");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al subir el archivo.",
      );
    },
  });

  const handleClose = () => {
    setFile(null);
    setPreviewUrl("");
    onClose();
  };

  const isAssignment = type === "assignment";

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title={isAssignment ? "Subir acta de asignación" : "Subir acta de devolución"}
      subtitle="Sube el documento firmado (PDF o imagen)"
      icon="Upload"
    >
      <div className="space-y-4 p-2">
        <FileUploadWithCamera
          label={isAssignment ? "Acta de asignación firmada" : "Acta de devolución firmada"}
          accept="image/*,application/pdf"
          value={file}
          previewUrl={previewUrl}
          onChange={(f, url) => {
            setFile(f);
            setPreviewUrl(url);
          }}
          disabled={isPending}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => mutate()}
            disabled={isPending || !file}
            color={isAssignment ? "blue" : "red"}
          >
            {isPending ? "Subiendo..." : "Subir archivo"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
