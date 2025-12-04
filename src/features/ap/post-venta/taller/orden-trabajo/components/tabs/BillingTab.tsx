"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Loader2,
  DollarSign,
  Plus,
  Check,
  X,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import { WorkOrderItemResource } from "../../../orden-trabajo-item/lib/workOrderItem.interface";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";

const getGroupColor = (groupNumber: number) => {
  return GROUP_COLORS[groupNumber] || DEFAULT_GROUP_COLOR;
};

interface BillingTabProps {
  workOrderId: number;
}

// Mock data para facturas existentes
const MOCK_INVOICES = [
  {
    id: 1,
    invoiceNumber: "F001-00123",
    groupNumber: 1,
    clientName: "Juan Pérez García",
    description: "Servicios de mantenimiento preventivo",
    amount: 850.0,
    taxAmount: 153.0,
    totalAmount: 1003.0,
    date: "2024-12-01",
    status: "paid",
  },
];

interface InvoiceFormData {
  groupNumber: number;
  clientName: string;
  description: string;
  amount: number;
  taxRate: number;
}

export default function BillingTab({ workOrderId }: BillingTabProps) {
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>({
    groupNumber: 0,
    clientName: "",
    description: "",
    amount: 0,
    taxRate: 18,
  });

  // Consultar la orden de trabajo con sus items
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", workOrderId],
    queryFn: () => findWorkOrderById(workOrderId),
  });

  const items = useMemo(() => workOrder?.items || [], [workOrder?.items]);

  // Auto-seleccionar el primer grupo si no hay ninguno seleccionado
  useEffect(() => {
    if (items.length > 0 && selectedGroupNumber === null) {
      const firstGroup = Math.min(...items.map((i) => i.group_number));
      setSelectedGroupNumber(firstGroup);
    }
  }, [items, selectedGroupNumber, setSelectedGroupNumber]);

  // Agrupar items por número de grupo
  const groupedItems = items.reduce((acc, item) => {
    const key = item.group_number;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<number, WorkOrderItemResource[]>);

  const selectedGroupItems = selectedGroupNumber
    ? groupedItems[selectedGroupNumber] || []
    : [];

  const handleCreateInvoice = () => {
    if (!selectedGroupNumber) {
      toast.error("Selecciona un grupo primero");
      return;
    }

    setFormData({
      groupNumber: selectedGroupNumber,
      clientName: "",
      description: `Factura por servicios del Grupo ${selectedGroupNumber}`,
      amount: 0,
      taxRate: 18,
    });
    setIsSheetOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmInvoice = () => {
    // Simular creación de factura
    const newInvoice = {
      id: invoices.length + 1,
      invoiceNumber: `F001-${String(invoices.length + 125).padStart(5, "0")}`,
      groupNumber: formData.groupNumber,
      clientName: formData.clientName,
      description: formData.description,
      amount: formData.amount,
      taxAmount: (formData.amount * formData.taxRate) / 100,
      totalAmount: formData.amount + (formData.amount * formData.taxRate) / 100,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setInvoices([...invoices, newInvoice]);
    toast.success("Factura creada exitosamente");
    setIsSheetOpen(false);
    setShowConfirmation(false);
    setFormData({
      groupNumber: 0,
      clientName: "",
      description: "",
      amount: 0,
      taxRate: 18,
    });
  };

  const getGroupInvoices = (groupNumber: number) => {
    return invoices.filter((inv) => inv.groupNumber === groupNumber);
  };

  const calculateTaxAmount = () => {
    return (formData.amount * formData.taxRate) / 100;
  };

  const calculateTotalAmount = () => {
    return formData.amount + calculateTaxAmount();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Cargando información...</span>
      </div>
    );
  }

  const selectedGroupInvoices = selectedGroupNumber
    ? getGroupInvoices(selectedGroupNumber)
    : [];
  const colors = selectedGroupNumber
    ? getGroupColor(selectedGroupNumber)
    : DEFAULT_GROUP_COLOR;

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Selector de grupos a la izquierda */}
      <div className="col-span-12 lg:col-span-3">
        <GroupSelector
          items={items}
          selectedGroupNumber={selectedGroupNumber}
          onSelectGroup={setSelectedGroupNumber}
        />
      </div>

      {/* Contenido principal */}
      <div className="col-span-12 lg:col-span-9">
        <div className="grid gap-6">
          {/* Header */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Facturación de Servicios
                  {selectedGroupNumber && (
                    <Badge
                      className="text-white ml-2"
                      style={{ backgroundColor: colors.badge }}
                    >
                      Grupo {selectedGroupNumber}
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Gestiona las facturas para este grupo
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Facturado</p>
                <p className="text-2xl font-bold text-green-600">
                  S/{" "}
                  {invoices
                    .reduce((sum, inv) => sum + inv.totalAmount, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Contenido del grupo seleccionado */}
          {selectedGroupNumber ? (
            <>
              {/* Items del grupo */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Trabajos del Grupo {selectedGroupNumber}
                  </h4>
                  <span className="text-sm text-gray-600">
                    {selectedGroupItems.length} trabajo(s)
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedGroupItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg text-sm"
                    >
                      <div className="shrink-0 w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <Badge
                          variant="outline"
                          className="text-xs mr-2 border-gray-300"
                        >
                          {item.type_planning_name}
                        </Badge>
                        <span className="text-gray-700">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Facturas del grupo */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Facturas Emitidas
                  </h4>
                  <Button onClick={handleCreateInvoice}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Factura
                  </Button>
                </div>

                {selectedGroupInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      No hay facturas para este grupo
                    </p>
                    <p className="text-xs text-gray-500">
                      Crea la primera factura para este grupo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedGroupInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {invoice.date}
                            </p>
                          </div>
                          <Badge
                            variant={
                              invoice.status === "paid"
                                ? "default"
                                : "secondary"
                            }
                            className={
                              invoice.status === "paid"
                                ? "bg-green-600"
                                : "bg-yellow-600"
                            }
                          >
                            {invoice.status === "paid" ? "Pagada" : "Pendiente"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">Cliente</p>
                            <p className="font-medium">{invoice.clientName}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-bold text-green-600">
                              S/ {invoice.totalAmount.toFixed(2)}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-600">Descripción</p>
                            <p className="text-gray-700">
                              {invoice.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Receipt className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Selecciona un grupo
                </h3>
                <p className="text-gray-500">
                  Elige un grupo de la izquierda para gestionar sus facturas
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Sheet para crear factura */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Crear Factura - Grupo {formData.groupNumber}
            </SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid gap-4">
              {/* Cliente */}
              <div>
                <Label htmlFor="clientName">
                  Cliente / Nombre de Facturación
                </Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) =>
                    setFormData({ ...formData, clientName: e.target.value })
                  }
                  placeholder="Nombre completo del cliente"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Puede ser diferente al titular del vehículo
                </p>
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="description">Descripción de la Factura</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detalle de los servicios facturados..."
                  rows={3}
                  required
                />
              </div>

              {/* Monto y Tax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Subtotal (S/)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="taxRate">Tasa de IGV (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxRate || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        taxRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Resumen de montos */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    S/ {formData.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    IGV ({formData.taxRate}%):
                  </span>
                  <span className="font-semibold">
                    S/ {calculateTaxAmount().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-green-600">
                    S/ {calculateTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <SheetFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit">
                <Check className="h-4 w-4 mr-2" />
                Crear Factura
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Confirmación */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar creación de factura?</AlertDialogTitle>
            <AlertDialogDescription>
              Se creará una factura para el Grupo {formData.groupNumber} por un
              total de S/ {calculateTotalAmount().toFixed(2)} a nombre de{" "}
              {formData.clientName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmInvoice}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
