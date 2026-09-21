"use client";

import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { RowSelectionState } from "@tanstack/react-table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import BackButton from "@/shared/components/BackButton";
import SearchInput from "@/shared/components/SearchInput";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DataTable } from "@/shared/components/DataTable";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Undo2 } from "lucide-react";
import { ConfirmationDialog } from "@/shared/components/ConfirmationDialog";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { ELECTRONIC_DOCUMENT_ALMACEN } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";
import { useElectronicDocument } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.hook";
import {
  associatePurchaseTraverse,
  revertPurchaseTraverse,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.actions";
import { documentTraverseItemsColumns } from "@/features/ap/facturacion/electronic-documents/components/DocumentTraverseItemsColumns";
import { purchaseOrderTraverseItemsColumns } from "@/features/ap/facturacion/electronic-documents/components/PurchaseOrderTraverseItemsColumns";
import { useAvailableTraverseItems } from "@/features/ap/comercial/ordenes-compra-vehiculo/lib/vehiclePurchaseOrder.hook";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AssociatePurchaseTraversePage() {
  const { id } = useParams();
  const documentId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { ROUTE, ABSOLUTE_ROUTE, QUERY_KEY } = ELECTRONIC_DOCUMENT_ALMACEN;
  const permissions = useModulePermissions(ROUTE);
  const { checkRouteExists, isLoadingModule } = useCurrentModule();

  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const {
    data: document,
    isLoading: isLoadingDocument,
    refetch: refetchDocument,
  } = useElectronicDocument(documentId, !!documentId && documentId > 0);

  const traverseItems = useMemo(
    () => (document?.items || []).filter((item) => item.is_traverse),
    [document?.items],
  );

  const { data: availableItems, isLoading: isLoadingAvailableItems } =
    useAvailableTraverseItems({
      electronic_document_id: documentId,
      search,
      page,
      per_page,
    });

  const selectedItemIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((key) => Number(key));

  const associateMutation = useMutation({
    mutationFn: () => associatePurchaseTraverse(documentId, selectedItemIds),
    onSuccess: () => {
      successToast("Compra asociada correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["electronic-documents"] });
      refetchDocument();
      navigate(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al asociar la compra: ${msg}`);
    },
  });

  const revertMutation = useMutation({
    mutationFn: () => revertPurchaseTraverse(documentId),
    onSuccess: () => {
      successToast("Asociación de compra revertida correctamente");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ["electronic-documents"] });
      refetchDocument();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(`Error al revertir la asociación: ${msg}`);
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  if (!documentId || documentId <= 0) notFound();
  if (isLoadingModule || isLoadingDocument) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!document) notFound();

  const alreadyAssociated = document.associate_purchase_traverse;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Asociar Compra"
          subtitle={`Comprobante ${document.full_number}`}
          icon="ShoppingCart"
        />
        <BackButton route={ABSOLUTE_ROUTE} name="Ventas Travesía" />
      </HeaderTableWrapper>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-sm">Items de Travesía</CardTitle>
            <CardDescription>
              Repuestos del comprobante marcados como travesía
              {alreadyAssociated && (
                <Badge variant="outline" color="green" className="ml-2">
                  Compra ya asociada
                </Badge>
              )}
            </CardDescription>
          </div>

          {alreadyAssociated && permissions.canLinkCrossingPurchase && (
            <ConfirmationDialog
              title="Confirmar reversión"
              description="¿Está seguro de que desea revertir la asociación de compra de este comprobante? Podrá volver a asociarlo con otras órdenes de compra."
              onConfirm={() => revertMutation.mutate()}
              icon="warning"
              confirmText="Sí, revertir"
              cancelText="No, cancelar"
              trigger={
                <Button
                  variant="outline"
                  color="orange"
                  disabled={revertMutation.isPending}
                  className="gap-2"
                >
                  <Undo2 className="h-4 w-4" />
                  Revertir Asociación
                </Button>
              }
            />
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            columns={documentTraverseItemsColumns()}
            data={traverseItems}
            isVisibleColumnFilter={false}
          />
        </CardContent>
      </Card>

      {!alreadyAssociated && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Órdenes de Compra Disponibles
            </CardTitle>
            <CardDescription>
              Selecciona los items de órdenes de compra con saldo disponible
              para asociarlos a este comprobante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchInput
              value={search}
              onChange={handleSearchChange}
              placeholder="Buscar por producto, código u orden de compra..."
              className="max-w-sm"
            />

            <DataTable
              isLoading={isLoadingAvailableItems}
              columns={purchaseOrderTraverseItemsColumns()}
              data={availableItems?.data || []}
              enableRowSelection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={(row) => String(row.id)}
              isVisibleColumnFilter={false}
            />

            <DataTablePagination
              page={page}
              totalPages={availableItems?.meta.last_page || 1}
              totalData={availableItems?.meta.total || 0}
              onPageChange={setPage}
              per_page={per_page}
              setPerPage={setPerPage}
            />

            <div className="flex justify-end">
              <Button
                onClick={() => associateMutation.mutate()}
                disabled={
                  selectedItemIds.length === 0 ||
                  associateMutation.isPending ||
                  !permissions.canLinkCrossingPurchase
                }
                className="gap-2"
              >
                <Link2 className="h-4 w-4" />
                Asociar Compra
                {selectedItemIds.length > 0 && ` (${selectedItemIds.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
