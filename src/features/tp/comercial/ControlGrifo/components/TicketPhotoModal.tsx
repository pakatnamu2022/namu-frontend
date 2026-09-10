// TicketPhotoModal.tsx

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Printer, Camera, Loader2 } from "lucide-react";
import { useSupplyById, useUploadTicketPhoto } from "../lib/supplyControl.hooks";
import { PhotoUploadField } from "./PhotoUploadField";

interface TicketPhotoModalProps {
    open: boolean;
    onClose: () => void;
    supplyId: number;
    onSuccess?: () => void;
    onRePrint?: () => void;
}

export function TicketPhotoModal({
    open,
    onClose,
    supplyId,
    onSuccess,
    onRePrint,
}: TicketPhotoModalProps) {
    const [photo, setPhoto] = useState<string | null>(null);
    const hasPrintedRef = useRef(false);
    const { mutate: uploadPhoto, isPending: isSubmitting } = useUploadTicketPhoto();
    const { data: supply, isLoading } = useSupplyById(supplyId);

    useEffect(() => {
        if (open && supply && !hasPrintedRef.current && !isLoading) {
            hasPrintedRef.current = true;
            handlePrintTicket();
        }
    }, [open, supply, isLoading]);

    const handlePrintTicket = useCallback(() => {
        if (!supply) return;

        const printWindow = window.open('', '_blank', 'width=400, heigth=600');
        if (printWindow) {
            const ticketHTML = generateTicketHTML(supply);
            printWindow.document.write(ticketHTML);
            printWindow.document.close();
        } else {
            console.error('🖨️ No se pudo abrir la ventana de impresión');
            alert('Por favor, permite las ventanas emergentes para imprimir el ticket');

        }
    }, [supply]);



    const handleSubmit = useCallback(() => {
        if (!photo) {
            return;
        }
        uploadPhoto(
            { id: supplyId, photo },
            {
                onSuccess: () => {
                    setPhoto(null);
                    onSuccess?.();
                    onClose();
                }
            }
        );
    }, [photo, supplyId, uploadPhoto, onSuccess, onClose]);

    const handleClose = useCallback(() => {
        setPhoto(null);
        hasPrintedRef.current = false;
        onClose();
    }, [onClose]);

    const handleRePrint = useCallback(() => {
        if (onRePrint) {
            onRePrint();
        } else if (supply) {
            handlePrintTicket();
        }
    }, [onRePrint, supply, handlePrintTicket]);


    const generateTicketHTML = (record: any): string => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ticket de Abastecimiento</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        padding: 10px;
                        max-width: 300px;
                        margin: 0 auto;
                        background: white;
                    }
                    .ticket { text-align: center; }
                    .header {
                        border-bottom: 1px dashed #000;
                        padding-bottom: 8px;
                        margin-bottom: 8px;
                    }
                    .company-name {
                        font-size: 14px;
                        font-weight: bold;
                        letter-spacing: 1px;
                    }
                    .company-address {
                        font-size: 10px;
                        color: #555;
                        margin: 2px 0;
                    }
                    .company-ruc {
                        font-size: 10px;
                        color: #555;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 3px 0;
                        font-size: 11px;
                    }
                    .info-row .label { font-weight: bold; }
                    .info-row .value { text-align: right; }
                    .divider {
                        border-top: 1px dashed #000;
                        margin: 6px 0;
                    }
                    .table-header {
                        display: flex;
                        justify-content: space-between;
                        font-weight: bold;
                        border-bottom: 1px solid #000;
                        padding-bottom: 3px;
                        margin-bottom: 3px;
                        font-size: 11px;
                    }
                    .table-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 2px 0;
                        font-size: 11px;
                    }
                    .table-row .desc { flex: 1; text-align: left; }
                    .table-row .um { width: 40px; text-align: center; }
                    .table-row .cant { width: 60px; text-align: right; }
                    .footer {
                        border-top: 1px dashed #000;
                        padding-top: 8px;
                        margin-top: 8px;
                        font-size: 10px;
                        color: #555;
                    }
                    .signature {
                        margin-top: 12px;
                        padding-top: 12px;
                        border-top: 1px solid #000;
                    }
                    .signature-line {
                        margin-top: 20px;
                        font-size: 10px;
                    }
                    .print-button {
                        display: block;
                        margin: 10px auto;
                        padding: 8px 20px;
                        background: #1a56db;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        font-weight: bold;
                    }
                    .print-button:hover { background: #1e40af; }
                    .no-print { display: block !important; }
                    @media print {
                        .no-print { display: none !important; }
                        body { padding: 5px; font-size: 11px; }
                        .signature-line { margin-top: 30px; }
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <div class="company-name">TRANSPORTES PAKATNAMU SAC</div>
                        <div class="company-address">Carretera a Lambayeque Mza. "A" Lote. 6</div>
                        <div class="company-address">Lambayeque - Lambayeque - Lambayeque</div>
                        <div class="company-ruc">RUC: 20480582561</div>
                    </div>

                    <div class="info-row">
                        <span class="label">Fecha:</span>
                        <span class="value">${record.recorded_at_formatted || record.recorded_at}</span>
                    </div>
                    <div class="info-row" style="margin-top: -2px;">
                        <span class="label">Hora:</span>
                        <span class="value">${record.recorded_at ? new Date(record.recorded_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>

                    <div class="divider"></div>

                    <div class="info-row">
                        <span class="label">NOTA DE DESPACHO N°:</span>
                        <span class="value">${record.id}</span>
                    </div>

                    <div class="info-row">
                        <span class="label">Placa:</span>
                        <span class="value">${record.vehicle?.placa || 'N/A'}</span>
                    </div>
                    <div class="info-row" style="margin-top: -2px;">
                        <span class="label">Km:</span>
                        <span class="value">${record.mileage?.toLocaleString() || '0'}</span>
                    </div>

                    <div class="divider"></div>

                    <div class="info-row">
                        <span class="label">Conductor:</span>
                        <span class="value" style="font-size: 10px;">
                            ${record.driver?.nombre_completo?.toUpperCase() || 'N/A'}
                        </span>
                    </div>

                    <div class="divider"></div>

                    <div class="table-header">
                        <span class="desc">Descripción</span>
                        <span class="um">U.M.</span>
                        <span class="cant">Cant.</span>
                    </div>
                    <div class="table-row">
                        <span class="desc">Diesel (Diesel B5 S50)</span>
                        <span class="um">GAL</span>
                        <span class="cant">${record.gallons?.toFixed(3) || '0.000'}</span>
                    </div>

                    <div class="divider"></div>

                    <div style="text-align: center; font-size: 11px; font-weight: bold; margin: 6px 0; letter-spacing: 1px;">
                        SIN VALOR FISCAL
                    </div>

                    <div class="footer">
                        Con mi firma acepto el despacho y consumo de los productos detallados
                    </div>

                    <div class="signature">
                        <div class="signature-line">_________________________</div>
                        <div style="font-size: 10px;">Firma del conductor</div>
                    </div>

                    <div style="font-size: 8px; color: #999; margin-top: 6px; text-align: center;">
                        ${record.is_base ? 'Registro en Base' : 'Registro Fuera de Base'}
                    </div>
                </div>
                <button class="print-button no-print" onclick="window.print(); setTimeout(() => window.close(), 1000);">
                    🖨️ Imprimir Ticket
                </button>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `;
    };

    if (isLoading) {
        return (
            <GeneralModal open={open} onClose={handleClose} title="Cargando...">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </GeneralModal>
        );
    }

    return (
        <GeneralModal
            open={open}
            onClose={handleClose}
            title="Subir Ticket Firmado"
            subtitle="Toma una foto del ticket después de firmarlo"
            icon="Camera"
            size="md"
        >
            <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                    <Printer className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                        ¡Ticket impreso correctamente!
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Ahora firma el ticket y toma una foto clara para subirla
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRePrint}
                        disabled={isSubmitting || !photo}
                        className="mt-3 gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Imprimiendo...
                            </>
                        ) : (
                            <>
                                <Printer className="h-4 w-4" />
                                Reimprimir
                            </>
                        )}
                    </Button>
                </div>

                <PhotoUploadField
                    label="Foto del Ticket Firmado"
                    value={photo}
                    onChange={setPhoto}
                    required
                    placeholder="Toma foto o sube de galería"
                    description="Asegúrate que la firma sea visible y la foto esté nítida"
                    disabled={isSubmitting}
                />

                <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Subir después
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !photo}
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Subiendo...
                            </>
                        ) : (
                            <>
                                <Camera className="h-4 w-4" />
                                Subir Ticket
                            </>
                        )}
                    </Button>
                </div>

                <p className="text-[10px] text-muted-foreground text-center">
                    Puedes subir la foto del ticket más tarde desde el detalle del abastecimiento
                </p>
            </div>
        </GeneralModal>
    );
}