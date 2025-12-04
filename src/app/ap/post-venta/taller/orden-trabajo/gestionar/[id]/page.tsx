"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Calendar,
  ClipboardCheck,
  FolderOpen,
  Receipt,
  UserCog,
  Package,
} from "lucide-react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { findWorkOrderById } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.actions";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";
import GeneralInformationTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/GeneralInformationTab";
import AppointmentTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/AppointmentTab";
import ReceptionTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/ReceptionTab";
import OpeningTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/OpeningTab";
import BillingTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/BillingTab";
import OperatorsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/OperatorsTab";
import PartsTab from "@/features/ap/post-venta/taller/orden-trabajo/components/tabs/PartsTab";
import { WorkOrderProvider } from "@/features/ap/post-venta/taller/orden-trabajo/contexts/WorkOrderContext";
import { useParams, useNavigate } from "react-router-dom";

export default function ManageWorkOrderPage() {
  const params = useParams();
  const router = useNavigate();
  const id = Number(params.id);
  const [activeTab, setActiveTab] = useState("general");

  const { ABSOLUTE_ROUTE } = WORKER_ORDER;

  // Fetch work order data
  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["workOrder", id],
    queryFn: () => findWorkOrderById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <FormSkeleton />;
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Orden de trabajo no encontrada</p>
      </div>
    );
  }

  return (
    <WorkOrderProvider>
      <div className="space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router(ABSOLUTE_ROUTE)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  Gestión de Orden de Trabajo
                </h1>
                <p className="text-sm text-gray-600 mt-1 font-bold">
                  #: {workOrder.correlative} - Placa: {workOrder.vehicle_plate}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-600">Estado</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  ID: {workOrder.status_id}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-6 px-6">
              <TabsList className="inline-flex w-auto min-w-full lg:w-full lg:grid lg:grid-cols-7 gap-1">
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">Información General</span>
                  <span className="md:hidden">General</span>
                </TabsTrigger>
                <TabsTrigger
                  value="appointment"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Cita</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reception"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <ClipboardCheck className="h-4 w-4 shrink-0" />
                  <span>Recepción</span>
                </TabsTrigger>
                <TabsTrigger
                  value="opening"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span>Apertura</span>
                </TabsTrigger>
                <TabsTrigger
                  value="billing"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Receipt className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Facturación</span>
                  <span className="sm:hidden">Factura</span>
                </TabsTrigger>
                <TabsTrigger
                  value="operators"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <UserCog className="h-4 w-4 shrink-0" />
                  <span>Operarios</span>
                </TabsTrigger>
                <TabsTrigger
                  value="parts"
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Package className="h-4 w-4 shrink-0" />
                  <span>Repuestos</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-6">
              <TabsContent value="general" className="space-y-4">
                <GeneralInformationTab workOrder={workOrder} />
              </TabsContent>

              <TabsContent value="appointment" className="space-y-4">
                <AppointmentTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="reception" className="space-y-4">
                <ReceptionTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="opening" className="space-y-4">
                <OpeningTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <BillingTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="operators" className="space-y-4">
                <OperatorsTab workOrderId={workOrder.id} />
              </TabsContent>

              <TabsContent value="parts" className="space-y-4">
                <PartsTab workOrderId={workOrder.id} />
              </TabsContent>
            </div>
          </Tabs>
        </Card>
      </div>
    </WorkOrderProvider>
  );
}
