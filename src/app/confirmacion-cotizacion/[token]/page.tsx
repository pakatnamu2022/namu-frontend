"use client";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  User,
  Package,
  Loader2,
  XCircle,
} from "lucide-react";
import {
  getPublicQuotationByToken,
  confirmQuotationByToken,
} from "@/features/ap/post-venta/repuestos/cotizacion-meson/lib/quotationMeson.actions";
import { OrderQuotationResource } from "@/features/ap/post-venta/taller/cotizacion/lib/proforma.interface";

type PageState =
  | "loading"
  | "ready"
  | "already_confirmed"
  | "expired"
  | "error"
  | "success";

export default function ConfirmacionCotizacionPage() {
  const { token } = useParams<{ token: string }>();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [quotation, setQuotation] = useState<OrderQuotationResource | null>(
    null,
  );
  const [alreadyConfirmedData, setAlreadyConfirmedData] = useState<{
    confirmed_at: string;
    confirmation_channel: string;
  } | null>(null);
  const [confirmedByName, setConfirmedByName] = useState("");
  const [notes, setNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [successData, setSuccessData] = useState<{
    quotation_number: string;
    confirmed_at: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setPageState("error");
      setErrorMessage("Token inválido.");
      return;
    }

    getPublicQuotationByToken(token)
      .then((response) => {
        if (!response.success) {
          setPageState("expired");
          setErrorMessage(response.message || "El enlace ha expirado.");
          return;
        }

        const {
          already_confirmed,
          confirmed_at,
          confirmation_channel,
          quotation,
        } = response.data;

        if (already_confirmed) {
          setAlreadyConfirmedData({ confirmed_at, confirmation_channel });
          setPageState("already_confirmed");
        } else if (quotation) {
          setQuotation(quotation);
          setPageState("ready");
        } else {
          setPageState("expired");
          setErrorMessage(response.message || "El enlace ha expirado.");
        }
      })
      .catch(() => {
        setPageState("error");
        setErrorMessage("No se pudo cargar la cotización. Intente más tarde.");
      });
  }, [token]);

  const handleConfirm = async () => {
    if (!token) return;
    setIsConfirming(true);
    try {
      const result = await confirmQuotationByToken(token, {
        notes: notes || undefined,
        confirmed_by_name: confirmedByName || undefined,
      });
      if (result.success && result.data) {
        setSuccessData({
          quotation_number: result.data.quotation_number,
          confirmed_at: result.data.confirmed_at,
        });
        setPageState("success");
      } else {
        setPageState("error");
        setErrorMessage(result.message || "Error al confirmar la cotización.");
      }
    } catch (error: any) {
      setPageState("error");
      setErrorMessage(
        error?.response?.data?.message || "Error al confirmar la cotización.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-blue-50/30 flex items-start justify-center p-4 pt-10">
      <div className="w-full max-w-2xl space-y-4">
        {/* Header */}
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Confirmación de Cotización
          </h1>
          <p className="text-muted-foreground text-sm">
            Grupo Pakatnamu — Repuestos
          </p>
        </div>

        {/* ── Loading ── */}
        {pageState === "loading" && (
          <div className="bg-white border rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Cargando cotización...
            </p>
          </div>
        )}

        {/* ── Ya confirmada ── */}
        {pageState === "already_confirmed" && alreadyConfirmedData && (
          <div className="bg-white border rounded-xl shadow-sm p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-orange-100 rounded-full p-4">
                <AlertTriangle className="h-10 w-10 text-orange-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">
              Esta cotización ya fue confirmada
            </h2>
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-left space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Canal</span>
                <Badge variant="outline" className="capitalize">
                  {alreadyConfirmedData.confirmation_channel}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium">
                  {new Date(
                    alreadyConfirmedData.confirmed_at,
                  ).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Si tiene alguna consulta, comuníquese con su asesor.
            </p>
          </div>
        )}

        {/* ── Expirado / Error ── */}
        {(pageState === "expired" || pageState === "error") && (
          <div className="bg-white border rounded-xl shadow-sm p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <h2 className="text-xl font-semibold">
              {pageState === "expired" ? "Enlace expirado" : "Error al cargar"}
            </h2>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
            <p className="text-muted-foreground text-sm">
              Solicite un nuevo link a su asesor.
            </p>
          </div>
        )}

        {/* ── Éxito ── */}
        {pageState === "success" && successData && (
          <div className="bg-white border rounded-xl shadow-sm p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-green-100 rounded-full p-4">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-green-700">
              ¡Cotización confirmada exitosamente!
            </h2>
            <p className="text-muted-foreground text-sm">
              Gracias por su preferencia. Nuestro equipo se pondrá en contacto
              con usted.
            </p>
            <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2 max-w-xs mx-auto text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cotización</span>
                <span className="font-semibold">
                  {successData.quotation_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confirmado el</span>
                <span className="font-medium">
                  {new Date(successData.confirmed_at).toLocaleDateString(
                    "es-PE",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Cotización lista para confirmar ── */}
        {pageState === "ready" && quotation && (
          <>
            {/* Info del cliente y vehículo */}
            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Cliente
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Nombre</p>
                  <p className="font-medium">{quotation.client.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <p className="font-medium">{quotation.client.email || "-"}</p>
                </div>
              </div>

              {quotation.vehicle && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                      Vehículo
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Placa</p>
                      <p className="font-semibold">{quotation.vehicle.plate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Marca</p>
                      <p className="font-medium">
                        {quotation.vehicle.model.brand}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Modelo</p>
                      <p className="font-medium">
                        {quotation.vehicle.model.version}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Info de la cotización */}
            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    Cotización
                  </h3>
                </div>
                <Badge variant="outline" className="font-mono">
                  {quotation.quotation_number}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Fecha</p>
                  <p className="font-medium">
                    {new Date(quotation.quotation_date).toLocaleDateString(
                      "es-PE",
                      { day: "2-digit", month: "2-digit", year: "numeric" },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Vence</p>
                  <p className="font-medium">
                    {new Date(quotation.expiration_date).toLocaleDateString(
                      "es-PE",
                      { day: "2-digit", month: "2-digit", year: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Detalle de productos */}
            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                  Productos / Repuestos
                </h3>
              </div>

              <div className="space-y-2">
                {quotation.details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b last:border-0 text-sm"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="font-medium truncate">
                        {detail.description}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {detail.quantity} {detail.unit_measure} ×{" "}
                        {quotation.type_currency.symbol}{" "}
                        {Number(detail.unit_price).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold shrink-0">
                      {quotation.type_currency.symbol}{" "}
                      {Number(detail.total_amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm mt-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {quotation.type_currency.symbol}{" "}
                    {Number(quotation.subtotal).toFixed(2)}
                  </span>
                </div>
                {quotation.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Descuento</span>
                    <span className="text-red-600">
                      -{quotation.type_currency.symbol}{" "}
                      {Number(quotation.discount_amount).toFixed(2)}
                    </span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    {quotation.type_currency.symbol}{" "}
                    {Number(quotation.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Formulario de confirmación */}
            <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="font-semibold">Confirmar Cotización</h3>
              <p className="text-sm text-muted-foreground">
                Al confirmar, acepta los términos y precios indicados en esta
                cotización.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Su nombre (opcional)
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder="Ej: Juan Pérez"
                    value={confirmedByName}
                    onChange={(e) => setConfirmedByName(e.target.value)}
                    disabled={isConfirming}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                    rows={3}
                    placeholder="Ej: Por favor agendar para el próximo lunes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isConfirming}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmar Cotización
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
