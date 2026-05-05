import { useState } from "react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Banknote,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { PerDiemRequestResource } from "@/features/profile/viaticos/lib/perDiemRequest.interface";
import { deleteDepositFile } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { errorToast, successToast } from "@/core/core.function";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";

interface DepositVoucherSectionProps {
  request: PerDiemRequestResource;
  onVoucherDeleted?: () => void;
}

export default function DepositVoucherSection({
  request,
  onVoucherDeleted,
}: DepositVoucherSectionProps) {
  const [selectedVoucher, setSelectedVoucher] = useState<{
    url: string;
    label: string;
    mimeType?: string;
  } | null>(null);
  const [deletingVoucherId, setDeletingVoucherId] = useState<number | null>(
    null,
  );
  const [voucherToDelete, setVoucherToDelete] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const isMobile = useIsMobile();

  const getFileExtension = (path: string) => {
    return path.split(".").pop()?.toLowerCase();
  };

  const isPDF = (mimeType?: string, path?: string) => {
    if (mimeType) {
      return mimeType === "application/pdf";
    }
    return path ? getFileExtension(path) === "pdf" : false;
  };

  const isImage = (mimeType?: string, path?: string) => {
    if (mimeType) {
      return mimeType.startsWith("image/");
    }
    const ext = path ? getFileExtension(path) : "";
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  // Recopilar todos los comprobantes disponibles desde el array
  const vouchers =
    request.deposit_vouchers?.map((voucher) => ({
      id: voucher.id,
      url: voucher.url,
      label: voucher.description || `Comprobante ${voucher.id}`,
      mimeType: voucher.mimeType,
    })) || [];

  const handleVoucherClick = (
    url: string,
    label: string,
    mimeType?: string,
  ) => {
    if (isMobile) {
      // En móvil: abrir directamente en nueva pestaña
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // En escritorio: abrir modal
      setSelectedVoucher({ url, label, mimeType });
    }
  };

  const handleDeleteVoucher = async () => {
    if (!voucherToDelete) return;

    try {
      setDeletingVoucherId(voucherToDelete.id);
      await deleteDepositFile(request.id, voucherToDelete.id);
      successToast("Comprobante eliminado correctamente");
      onVoucherDeleted?.();
      setVoucherToDelete(null);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al eliminar el comprobante",
      );
    } finally {
      setDeletingVoucherId(null);
    }
  };

  const renderVoucherButton = (
    voucherId: number,
    url: string,
    label: string,
    mimeType?: string,
  ) => {
    const isImageFile = isImage(mimeType, url);
    const isPDFFile = isPDF(mimeType, url);
    const isDeleting = deletingVoucherId === voucherId;

    return (
      <Card className="p-3 relative">
        <Button
          onClick={() => setVoucherToDelete({ id: voucherId, label })}
          variant="ghost"
          color="red"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 z-10"
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
            {isPDFFile ? (
              <FileText className="h-5 w-5 text-primary" />
            ) : isImageFile ? (
              <ImageIcon className="h-5 w-5 text-primary" />
            ) : (
              <Banknote className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <p className="text-sm font-medium truncate">{label}</p>
            <p className="text-xs text-muted-foreground">
              {isPDFFile ? "Documento PDF" : isImageFile ? "Imagen" : "Archivo"}
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleVoucherClick(url, label, mimeType)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Banknote className="h-4 w-4 mr-2" />
          Ver Comprobante
        </Button>
      </Card>
    );
  };

  return (
    <>
      <GroupFormSection
        title="Comprobantes de Depósito"
        icon={Banknote}
        cols={{ sm: 1 }}
      >
        <div className="flex items-start gap-3">
          <Banknote className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-3">
              {vouchers.length === 0
                ? "Comprobantes de depósito"
                : vouchers.length === 1
                  ? "Comprobante de depósito"
                  : `${vouchers.length} Comprobantes de depósito`}
            </p>
            {vouchers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {vouchers.map((voucher) => (
                  <div key={voucher.id}>
                    {renderVoucherButton(
                      voucher.id,
                      voucher.url,
                      voucher.label,
                      voucher.mimeType,
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-4">
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Aún no se adjuntaron comprobantes de depósito
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </GroupFormSection>

      {/* Modal para vista previa en escritorio */}
      <Dialog
        open={!!selectedVoucher}
        onOpenChange={(open) => !open && setSelectedVoucher(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedVoucher?.label}</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              {isPDF(selectedVoucher.mimeType, selectedVoucher.url) ? (
                <div className="space-y-2">
                  <embed
                    src={selectedVoucher.url}
                    type="application/pdf"
                    className="w-full h-[600px] rounded-md"
                  />
                  <a
                    href={selectedVoucher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    Abrir PDF en nueva pestaña
                  </a>
                </div>
              ) : isImage(selectedVoucher.mimeType, selectedVoucher.url) ? (
                <div className="space-y-2">
                  <img
                    src={selectedVoucher.url}
                    alt={selectedVoucher.label}
                    className="w-full h-auto rounded-md"
                  />
                  <a
                    href={selectedVoucher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Abrir imagen en nueva pestaña
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Formato de archivo no soportado para vista previa
                  </p>
                  <a
                    href={selectedVoucher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <SimpleConfirmDialog
        open={!!voucherToDelete}
        onOpenChange={(open) => !open && setVoucherToDelete(null)}
        onConfirm={handleDeleteVoucher}
        title="¿Eliminar comprobante?"
        description={`¿Estás seguro de que deseas eliminar "${voucherToDelete?.label}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        icon="danger"
        isLoading={deletingVoucherId === voucherToDelete?.id}
      />
    </>
  );
}
