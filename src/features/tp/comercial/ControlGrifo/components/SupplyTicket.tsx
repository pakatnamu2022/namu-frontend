"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { SupplyControlResource } from "../lib/supplyControl.interface";
import { useRef } from "react";
import { formatTicketDate, formatTicketTime } from "../lib/supplyTicket.helpers";

interface SupplyTicketProps {
    record: SupplyControlResource;
    onClose?: () => void;
}

export function SupplyTicket({ record }: SupplyTicketProps) {
    const ticketRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!ticketRef.current) return;

        const printContent = ticketRef.current.innerHTML;

        const printWindow = window.open('', '_blank', 'width=400,height=600');
        if (!printWindow) {
            alert('Por favor, permite las ventanas emergentes para imprimir el ticket');
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket de Abastecimiento</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        padding: 10px;
                        max-width: 300px;
                        margin: 0 auto;
                        background: white;
                    }
                    .ticket {
                        text-align: center;
                    }
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
                    .info-row .label {
                        font-weight: bold;
                    }
                    .info-row .value {
                        text-align: right;
                    }
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
                    .table-row .desc {
                        flex: 1;
                        text-align: left;
                    }
                    .table-row .um {
                        width: 40px;
                        text-align: center;
                    }
                    .table-row .cant {
                        width: 60px;
                        text-align: right;
                    }
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
                    .print-button:hover {
                        background: #1e40af;
                    }
                    .no-print {
                        display: block !important;
                    }
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        body {
                            padding: 5px;
                            font-size: 11px;
                        }
                        .signature-line {
                            margin-top: 30px;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    ${printContent}
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
        `);

        printWindow.document.close();
    };

    return (
        <div className="space-y-4">
            {/* Ticket oculto para impresión */}
            <div ref={ticketRef} className="hidden print:block">
                <div className="ticket">
                    <div className="header">
                        <div className="company-name">TRANSPORTES PAKATNAMU SAC</div>
                        <div className="company-address">
                            Carretera a Lambayeque Mza. "A" Lote. 6
                        </div>
                        <div className="company-address">
                            Lambayeque - Lambayeque - Lambayeque
                        </div>
                        <div className="company-ruc">RUC: 20480582561</div>
                    </div>

                    <div className="info-row">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatTicketDate(record.recorded_at)}</span>
                    </div>
                    <div className="info-row" style={{ marginTop: '-2px' }}>
                        <span className="label">Hora:</span>
                        <span className="value">{formatTicketTime(record.recorded_at)}</span>
                    </div>

                    <div className="divider" />

                    <div className="info-row">
                        <span className="label">NOTA DE DESPACHO N°:</span>
                        <span className="value">{record.id}</span>
                    </div>

                    <div className="info-row">
                        <span className="label">Placa:</span>
                        <span className="value">{record.vehicle?.placa || "N/A"}</span>
                    </div>
                    <div className="info-row" style={{ marginTop: '-2px' }}>
                        <span className="label">Km:</span>
                        <span className="value">{record.mileage?.toLocaleString() || "0"}</span>
                    </div>

                    <div className="divider" />

                    <div className="info-row">
                        <span className="label">Conductor:</span>
                        <span className="value" style={{ fontSize: '10px' }}>
                            {record.driver?.nombre_completo?.toUpperCase() || "N/A"}
                        </span>
                    </div>

                    <div className="divider" />

                    <div className="table-header">
                        <span className="desc">Descripción</span>
                        <span className="um">U.M.</span>
                        <span className="cant">Cant.</span>
                    </div>
                    <div className="table-row">
                        <span className="desc">Diesel (Diesel B5 S50)</span>
                        <span className="um">GAL</span>
                        <span className="cant">{record.gallons?.toFixed(3) || "0.000"}</span>
                    </div>

                    <div className="divider" />

                    <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 'bold', margin: '6px 0', letterSpacing: '1px' }}>
                        SIN VALOR FISCAL
                    </div>

                    <div className="footer">
                        Con mi firma acepto el despacho y consumo de los productos detallados
                    </div>

                    <div className="signature">
                        <div className="signature-line">_________________________</div>
                        <div style={{ fontSize: '10px' }}>Firma del conductor</div>
                    </div>

                    <div style={{ fontSize: '8px', color: '#999', marginTop: '6px', textAlign: 'center' }}>
                        {record.is_base ? "Registro en Base" : "Registro Fuera de Base"}
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={handlePrint} className="gap-2" variant="outline">
                    <Printer className="h-4 w-4" />
                    Imprimir Ticket
                </Button>
            </div>
        </div>
    );
}