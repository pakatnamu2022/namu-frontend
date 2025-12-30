import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Card } from "@/components/ui/card";
import { Banknote, AlertCircle } from "lucide-react";
import type { PerDiemRequestResource } from "@/features/profile/viaticos/lib/perDiemRequest.interface";

interface DepositVoucherSectionProps {
  request: PerDiemRequestResource;
}

export default function DepositVoucherSection({
  request,
}: DepositVoucherSectionProps) {
  const getFileExtension = (path: string) => {
    return path.split(".").pop()?.toLowerCase();
  };

  const isPDF = (path: string) => {
    return getFileExtension(path) === "pdf";
  };

  const isImage = (path: string) => {
    const ext = getFileExtension(path);
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  return (
    <GroupFormSection
      title="Comprobante de Depósito"
      icon={Banknote}
      cols={{ sm: 1 }}
    >
      <div className="flex items-start gap-3">
        <Banknote className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Comprobante de depósito
          </p>
          {request.deposit_voucher_url ? (
            <Card className="p-4">
              {isPDF(request.deposit_voucher_url) ? (
                <div className="space-y-2">
                  <embed
                    src={request.deposit_voucher_url}
                    type="application/pdf"
                    className="w-full h-[600px] rounded-md"
                  />
                  <a
                    href={request.deposit_voucher_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    Abrir PDF en nueva pestaña
                  </a>
                </div>
              ) : isImage(request.deposit_voucher_url) ? (
                <div className="space-y-2">
                  <img
                    src={request.deposit_voucher_url}
                    alt="Comprobante de depósito"
                    className="w-full h-auto rounded-md"
                  />
                  <a
                    href={request.deposit_voucher_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
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
                    href={request.deposit_voucher_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-4">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Aún no se adjuntó depósito
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </GroupFormSection>
  );
}
