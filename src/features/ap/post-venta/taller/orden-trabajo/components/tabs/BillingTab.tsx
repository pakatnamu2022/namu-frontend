"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, Plus, Receipt } from "lucide-react";
import { toast } from "sonner";
import { findWorkOrderById } from "../../lib/workOrder.actions";
import {
  DEFAULT_GROUP_COLOR,
  GROUP_COLORS,
} from "../../lib/workOrder.interface";
import { WorkOrderItemResource } from "../../../orden-trabajo-item/lib/workOrderItem.interface";
import GroupSelector from "../GroupSelector";
import { useWorkOrderContext } from "../../contexts/WorkOrderContext";
import InvoiceForm, { InvoiceFormData } from "../InvoiceForm";

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

export default function BillingTab({ workOrderId }: BillingTabProps) {
  const { selectedGroupNumber, setSelectedGroupNumber } = useWorkOrderContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [formData, setFormData] = useState<InvoiceFormData>({
    groupNumber: 0,
    customer_id: "",
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
      customer_id: "",
      clientName: "",
      description: `Factura por servicios del Grupo ${selectedGroupNumber}`,
      amount: 0,
      taxRate: 18,
    });
    setIsSheetOpen(true);
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
    setIsSheetOpen(false);
    setFormData({
      groupNumber: 0,
      customer_id: "",
      clientName: "",
      description: "",
      amount: 0,
      taxRate: 18,
    });
  };

  const getGroupInvoices = (groupNumber: number) => {
    return invoices.filter((inv) => inv.groupNumber === groupNumber);
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
    <div className="space-y-6">
      {/* Selector de grupos en la parte superior */}
      <GroupSelector
        items={items}
        selectedGroupNumber={selectedGroupNumber}
        onSelectGroup={setSelectedGroupNumber}
      />

      {/* Contenido principal */}
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
                    <span className="text-gray-700">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Facturas del grupo */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Facturas Emitidas</h4>
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
                        <p className="text-sm text-gray-600">{invoice.date}</p>
                      </div>
                      <Badge
                        variant={
                          invoice.status === "paid" ? "default" : "secondary"
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
                        <p className="text-gray-700">{invoice.description}</p>
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

      {/* Formulario de factura */}
      <InvoiceForm
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleConfirmInvoice}
      />
    </div>
  );
}
