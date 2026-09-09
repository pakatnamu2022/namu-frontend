import { SupplyControlResource } from "./supplyControl.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";


export const getDriverIdFromUser = (userComplete: any): number | null => {
    if (!userComplete) return null;

    const isDriver = userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION' ||
        userComplete?.position?.toUpperCase() === 'INSTRUCTOR DE FLOTA';

    if (isDriver) {
        return userComplete?.partner_id || null;
    }

    return null;
};

export const isAssistant = (userComplete: any): boolean => {
    return userComplete?.position?.toUpperCase() === 'ASISTENTE DE OPERACIONES';
};

export const isDriver = (userComplete: any): boolean => {
    return userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION' ||
        userComplete?.position?.toUpperCase() === 'INSTRUCTOR DE FLOTA';
};

export const getDefaultIsBase = (supplierName: string): boolean => {
    return supplierName?.toUpperCase() === 'BASE TP';
};

export const formatTicketDate = (date: string | null): string => {
    if (!date) return "-";
    try {
        return format(new Date(date), "dd/MM/yyyy", { locale: es });
    } catch {
        return date;
    }
};

export const formatTicketTime = (date: string | null): string => {
    if (!date) return "-";
    try {
        return format(new Date(date), "HH:mm:ss", { locale: es });
    } catch {
        return date;
    }
};

export const generateTicketHTML = (record: SupplyControlResource): string => {
    const formatDate = formatTicketDate;
    const formatTime = formatTicketTime;

    const formatMileage = (mileage: number | undefined): string => {
        if (!mileage && mileage !== 0) return "0";
        return String(mileage);
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ticket de Abastecimiento</title>
            <style>
                @page {
                    margin: 0mm 0mm 0mm 0mm !important;
                    size: 80mm 210mm !important;
                }
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 11px;
                    line-height: 1.4;
                    padding: 1px 2px;
                    max-width: 280px;
                    width: 280px;
                    margin: 0 auto;
                    background: white;
                }
                .ticket {
                    text-align: center;
                    width: 100%;
                    padding: 0;
                }
                .header {
                    padding-bottom: 3px;
                    margin-bottom: 3px;
                }
                .company-name {
                    font-size: 13px;
                    font-weight: bold;
                    letter-spacing: 0.5px;
                    margin-bottom: 1px;
                }
                .company-address {
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                    margin: 0px 0;
                    line-height: 1.2;
                }
                .company-ruc {
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                }
                .info-row {
                    padding: 1px 0;
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                }
                .divider {
                    border-top: 1px dashed #000;
                    margin: 2px 0;
                }
                .table-container {
                    text-align: left;
                    padding: 0;
                    margin: 2px 0;
                    padding-top: 10px;
                    padding-bottom: 10px;
                }
                .table-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    border-top: 1px solid #000;
                    border-bottom: 1px solid #000;
                    padding-bottom: 1px;
                    margin-bottom: 1px;
                    font-size: 11px;
                }
                .table-header .um-header {
                    width: 35px;
                    text-align: left;
                    font-weight: bold;
                    padding-left: 8px;
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .table-header .desc {
                    flex: 1;
                    text-align: left;
                    font-weight: bold;
                    padding-top: 4px;
                    padding-bottom: 4px;
                }
                .table-header .cant {
                    width: 50px;
                    text-align: right;
                    font-weight: bold;
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .table-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 1px 0;
                    font-size: 11px;
                    font-weight: bold;
                    border-bottom: 1px solid #000;
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .table-row .desc {
                    flex: 1;
                    text-align: left;
                    font-weight: bold;
                }
                .table-row .um-value {
                    width: 35px;
                    text-align: left;
                    font-weight: bold;
                    padding-left: 8px;
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .table-row .cant {
                    width: 50px;
                    text-align: right;
                    font-weight: bold;
                    padding-top: 2px;
                    padding-bottom: 2px;
                }
                .footer {
                    padding-top: 6px;
                    margin-top: 3px;
                    margin-bottom: 35px;
                    font-size: 11px;
                    font-weight: bold;
                    color: #000;
                    text-align: center;
                }
                .signature {
                    margin-top: 20px;
                    padding-top: 10px;
                    text-align: center;
                }
                .signature-line {
                    margin-top: 12px;
                    font-size: 11px;
                    font-weight: bold;
                }
                .print-button {
                    display: block;
                    margin: 4px auto;
                    padding: 4px 12px;
                    background: #1a56db;
                    color: white;
                    border: none;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 10px;
                    font-weight: bold;
                }
                .print-button:hover {
                    background: #1e40af;
                }
                .no-print {
                    display: block !important;
                }
                .sin-valor {
                    text-align: center;
                    font-size: 11px;
                    font-weight: bold;
                    margin: 2px 0;
                    letter-spacing: 1px;
                }
                .badge-ubicacion {
                    font-size: 11px;
                    font-weight: bold;
                    color: #666;
                    margin-top: 2px;
                    text-align: center;
                    border-top: 1px dashed #ddd;
                    padding-top: 2px;
                }
                .info-row-client {
                    padding: 1px 0;
                    font-size: 11px;
                    font-weight: bold;
                    text-align: center;
                    margin-top: 2px;
                }
                .location-info {
                    font-size: 10px;
                    font-weight: bold;
                    color: #333;
                    margin: 1px 0;
                    line-height: 1.3;
                    text-align: center;
                }
                
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        padding: 0.5px 1px !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .ticket {
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    html, body {
                        zoom: 1 !important;
                        -webkit-print-size-adjust: 100% !important;
                        print-size-adjust: 100% !important;
                    }
                    .ticket {
                        page-break-after: always;
                    }
                }
            </style>
        </head>
        <body>
            <div class="ticket">
                <!-- Header -->
                <div class="header">
                    <div class="company-name">TRANSPORTES PAKATNAMU SAC</div>
                    <div class="company-address">Carretera a Lambayeque Mza. "A" Lote. 6</div>
                    <div class="company-address">Lambayeque - Lambayeque - Lambayeque</div>
                    <div class="company-ruc">RUC: 20480582561</div>
                </div>

                <!-- Fecha y Hora centrados -->
                <div class="info-row">
                    Fecha: ${formatDate(record.recorded_at)}
                </div>
                <div class="info-row" style="margin-top: -2px;">
                    Hora: ${formatTime(record.recorded_at)}
                </div>

                <!-- N° de Despacho centrado -->
                <div class="info-row">
                    NOTA DE DESPACHO N°: ${record.id}
                </div>

                <!-- Placa y Km centrados -->
                <div class="info-row">
                    Placa: ${record.vehicle?.placa || "N/A"}
                </div>
                <div class="info-row" style="margin-top: -2px;">
                    Km: ${formatMileage(record.mileage)}
                </div>

                <!-- Ubicación detallada -->
                <div class="info-row-client">
                    TRANSPORTES PAKATNAMU SAC
                </div>
                <div class="info-row-client" style="margin-top: -2px;">
                    Carretera a Lambayeque Mza. "A" Lote. 6 -
                </div>
                <div class="info-row-client" style="margin-top: -2px;">
                    Lambayeque - Lambayeque - Lambayeque
                </div>
                <div class="info-row-client" style="margin-top: -2px;">
                    RUC: 20480582561
                </div>
                
                <!-- Conductor centrado -->
                <div class="info-row">
                    Conductor: ${record.driver?.nombre_completo?.toUpperCase() || "N/A"}
                </div>

                <!-- Tabla de productos -->
                <div class="table-container">
                    <div class="table-header">
                        <span class="desc">Descripción</span>
                        <span class="um-header">U.M.</span>
                        <span class="cant">Cant.</span>
                    </div>
                    <div class="table-row">
                        <span class="desc">Diesel (Diesel B5 S50)</span>
                        <span class="um-value">GAL</span>
                        <span class="cant">${record.gallons?.toFixed(3) || "0.000"}</span>
                    </div>
                </div>


                <!-- SIN VALOR FISCAL -->
                <div class="sin-valor">SIN VALOR FISCAL</div>

                <!-- Footer con margen inferior aumentado -->
                <div class="footer">
                    Con mi firma acepto el despacho y consumo de los productos detallados
                </div>

                <!-- Firma con más espacio -->
                <div class="signature">
                    <div class="signature-line">_________________________</div>
                    <div style="font-size: 11px; font-weight: bold; margin-top: 2px;">Firma del conductor</div>
                </div>

                <!-- Ubicación -->
                <div class="badge-ubicacion">
                    ${record.is_base ? "✓ REGISTRO EN BASE" : "✓ REGISTRO FUERA DE BASE"}
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

export const openPrintWindow = (record: SupplyControlResource): void => {
    const ticketHTML = generateTicketHTML(record);
    const printWindow = window.open('', '_blank', 'width=400,height=600');

    if (printWindow) {
        printWindow.document.write(ticketHTML);
        printWindow.document.close();
    } else {
        alert('Por favor, permite las ventanas emergentes para imprimir el ticket');
    }
};