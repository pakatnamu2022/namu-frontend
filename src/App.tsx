import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuthStore } from "./features/auth/lib/auth.store";
import DashboardSkeleton from "./shared/components/DashboardSkeleton";
import { AuthInitializer } from "./shared/components/AuthInitializer";
import { TitleUpdater } from "./components/TitleUpdater";
import { FC, JSX, Suspense } from "react";
import ModulePerformanceEvaluationPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/page";
import HierarchicalCategoryPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/page";
import AddHierarchicalCategoryPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/agregar/page";
import CyclePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/page";
import AddCyclePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/agregar/page";
import UpdateCyclePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/actualizar/[id]/page";
import CyclePersonDetailPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/[id]/page";
import CompetencesPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/page";
import AddCompetencePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/agregar/page";
import UpdateCompetencePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/actualizar/[id]/page";
import EvaluationPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/page";
import AddEvaluationPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/agregar/page";
import UpdateEvaluationPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/actualizar/[id]/page";
import EvaluationPersonPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/[id]/page";
import EvaluationDetailPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/page";
import EvaluationDetailPersonPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/[person]/page";
import AgendaPage from "./app/ap/comercial/agenda/page";
import OpportunitiesKanbanPage from "./app/ap/comercial/agenda/oportunidades/page";
import AddOpportunityPage from "./app/ap/comercial/agenda/oportunidades/agregar/page";
import UpdateOpportunityPage from "./app/ap/comercial/agenda/oportunidades/actualizar/[id]/page";
import OpportunityDetailPage from "./app/ap/comercial/agenda/oportunidades/[id]/page";
import CustomersPage from "./app/ap/comercial/clientes/page";
import AddCustomersPage from "./app/ap/comercial/clientes/agregar/page";
import UpdateCustomersPage from "./app/ap/comercial/clientes/actualizar/[id]/page";
import CustomerEstablishmentsListPage from "./app/ap/comercial/clientes/establecimientos/[id]/page";
import AddCustomerEstablishmentPage from "./app/ap/comercial/clientes/establecimientos/[id]/agregar/page";
import UpdateCustomerEstablishmentPage from "./app/ap/comercial/clientes/establecimientos/[id]/actualizar/[establishmentId]/page";
import SuppliersPage from "./app/ap/comercial/proveedores/page";
import AddSupplierPage from "./app/ap/comercial/proveedores/agregar/page";
import UpdateSuppliersPage from "./app/ap/comercial/proveedores/actualizar/[id]/page";
import SupplierEstablishmentsListPage from "./app/ap/comercial/proveedores/establecimientos/[id]/page";
import AddSupplierEstablishmentPage from "./app/ap/comercial/proveedores/establecimientos/[id]/agregar/page";
import UpdateSupplierEstablishmentPage from "./app/ap/comercial/proveedores/establecimientos/[id]/actualizar/[establishmentId]/page";
import ElectronicDocumentsPage from "./app/ap/comercial/electronic-documents/page";
import AddElectronicDocumentPage from "./app/ap/comercial/electronic-documents/agregar/page.tsx";
import UpdateElectronicDocumentPage from "./app/ap/comercial/electronic-documents/actualizar/[id]/page";
import AddCreditNotePage from "./app/ap/comercial/electronic-documents/[id]/credit-note/page";
import UpdateCreditNotePage from "./app/ap/comercial/electronic-documents/[id]/credit-note/actualizar/[credit]/page";
import AddDebitNotePage from "./app/ap/comercial/electronic-documents/[id]/debit-note/page";
import UpdateDebitNotePage from "./app/ap/comercial/electronic-documents/[id]/debit-note/actualizar/[debit]/page";
import VehiclesPage from "./app/ap/comercial/vehiculos/page";
import VehiclePurchaseOrderPage from "./app/ap/comercial/compra-vehiculo-nuevo/page";
import AddVehiclePurchaseOrderPage from "./app/ap/comercial/compra-vehiculo-nuevo/agregar/page";
import ResendVehiclePurchaseOrderPage from "./app/ap/comercial/compra-vehiculo-nuevo/reenviar/[id]/page";
import VehicleDeliveryPage from "./app/ap/comercial/entrega-vehiculo/page";
import AddVehicleDeliveryPage from "./app/ap/comercial/entrega-vehiculo/agregar/page";
import ShippingGuidePage from "./app/ap/comercial/entrega-vehiculo/guia-remision/[id]/page";
import ShipmentsReceptionsPage from "./app/ap/comercial/envios-recepciones/page";
import AddShipmentsReceptionsPage from "./app/ap/comercial/envios-recepciones/agregar/page";
import UpdateShipmentsReceptionsPage from "./app/ap/comercial/envios-recepciones/actualizar/[id]/page";
import ReceptionCheckListPage from "./app/ap/comercial/envios-recepciones/checklist/[id]/page";
import StoreVisitsPage from "./app/ap/comercial/visitas-tienda/page";
import AddStoreVisitsPage from "./app/ap/comercial/visitas-tienda/agregar/page";
import UpdateStoreVisitsPage from "./app/ap/comercial/visitas-tienda/actualizar/[id]/page";
import ManageLeadsPage from "./app/ap/comercial/gestionar-leads/page";
import PurchaseRequestQuotePage from "./app/ap/comercial/solicitudes-cotizaciones/page";
import AddPurchaseRequestQuotePage from "./app/ap/comercial/solicitudes-cotizaciones/[opportunity_id]/agregar/page";
import UpdatePurchaseRequestQuotePage from "./app/ap/comercial/solicitudes-cotizaciones/actualizar/[id]/page";
import DashboardStoreVisitsPage from "./app/ap/comercial/dashboard-visitas-leads/page";
import ReasonsRejectionPage from "./app/ap/comercial/motivos-descarte/page";
import ReportesComercialPage from "./app/ap/comercial/reportes/page";
import { NotFoundBoundary } from "./shared/components/NotFoundBoundary";
import ExcludedPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/excluidos/page";
import MetricPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/page";
import AddMetricPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/agregar/page";
import UpdateMetricPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/actualizar/[id]/page";
import ObjectivePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/page";
import AddObjectivePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/agregar/page";
import UpdateObjectivePage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/actualizar/[id]/page";
import ParameterPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/page";
import AddParameterPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/agregar/page";
import UpdateParameterPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/actualizar/[id]/page";
import PeriodPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/page";
import AddPeriodPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/agregar/page";
import UpdatePeriodPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/actualizar/[id]/page";
import EvaluatorParPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/asignacion-pares/page";
import EvaluationModelPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/page";
import AddEvaluationModelPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/agregar/page";
import UpdateEvaluationModelPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/actualizar/[id]/page";
import MyPerformance from "./app/perfil/mi-desempeno/page";
import VacationPage from "./app/perfil/vacaciones/page";
import ModulePage from "./components/ModulePage";
import CommercialPage from "./app/ap/comercial/page.tsx";
import DashboardDeliveryPage from "./app/ap/comercial/dashboard-entregas/page.tsx";
import TeamLeadsDashboard from "./app/ap/comercial/dashboard-equipo-leads/page.tsx";
import ExhibitionVehiclesPage from "./app/ap/comercial/vehiculos-exhibicion/page";
import AddExhibitionVehiclesPage from "./app/ap/comercial/vehiculos-exhibicion/agregar/page";
import UpdateExhibitionVehiclesPage from "./app/ap/comercial/vehiculos-exhibicion/actualizar/[id]/page";
import PositionsPage from "./app/gp/gestion-humana/configuraciones/posiciones/page";
import AddPositionPage from "./app/gp/gestion-humana/configuraciones/posiciones/agregar/page";

// ============================================================================
// LAYOUTS
// ============================================================================
import DashboardLayout from "./features/dashboard/components/DashboardLayout";
import MainLayout from "./features/dashboard/components/MainLayout";
import APComercialLayout from "./app/ap/comercial/layout";
import APConfiguracionesLayout from "./app/ap/configuraciones/layout";
import APPostVentaLayout from "./app/ap/post-venta/layout.tsx";
import GPGestionSistemaLayout from "./app/gp/gestion-del-sistema/layout";
import GPGestionHumanaLayout from "./app/gp/gestion-humana/layout";
import GPMaestroGeneralLayout from "./app/gp/maestro-general/layout";
import GPTicsLayout from "./app/gp/tics/layout";
import TPComercialLayout from "./app/tp/comercial-tp/layout";

// ============================================================================
// ROOT & PUBLIC PAGES
// ============================================================================
import LoginPage from "./app/page";
import NotFoundPage from "./app/not-found";
import CompaniesPage from "./app/companies/page.tsx";
import ModulesCompanyPage from "./app/modules/[company]/page.tsx";
import ModulesCompanyModulePage from "./app/modules/[company]/[module]/page.tsx";
import FeedRoutePage from "./app/feed/page.tsx";
import TestPage from "./app/test/page.tsx";
import TrainingPage from "./app/perfil/capacitaciones/page.tsx";
import DocumentPage from "./app/perfil/documentos/page.tsx";
import TeamPage from "./app/perfil/equipo/page.tsx";
import TeamIndicatorsPage from "./app/perfil/equipo/indicadores/page.tsx";
import NamuPerformancePage from "./app/perfil/equipo/[id]/page.tsx";
import NamuPerformanceEvaluationPage from "./app/perfil/equipo/[id]/evaluar/page.tsx";
import NamuPerformanceHistoryPage from "./app/perfil/equipo/[id]/historial/page.tsx";
import PlanDesarrolloPage from "./app/perfil/equipo/[id]/plan-desarrollo/page.tsx";
import CrearPlanDesarrolloPage from "./app/perfil/equipo/[id]/plan-desarrollo/agregar/page.tsx";
import EconomicActivityPage from "./app/ap/configuraciones/maestros-general/actividad-economica/page.tsx";
import WarehousePage from "./app/ap/configuraciones/maestros-general/almacenes/page.tsx";
import AddWarehousePage from "./app/ap/configuraciones/maestros-general/almacenes/agregar/page.tsx";
import UpdateWarehousePage from "./app/ap/configuraciones/maestros-general/almacenes/actualizar/[id]/page.tsx";
import UserSeriesAssignmentPage from "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/page.tsx";
import AddUserSeriesAssignmentPage from "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/agregar/page.tsx";
import UpdateUserSeriesAssignmentPage from "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/actualizar/[id]/page.tsx";
import AssignSalesSeriesPage from "./app/ap/configuraciones/maestros-general/asignar-serie-venta/page.tsx";
import AddAssignSalesSeriesPage from "./app/ap/configuraciones/maestros-general/asignar-serie-venta/agregar/page.tsx";
import UpdateAssignSalesSeriesPage from "./app/ap/configuraciones/maestros-general/asignar-serie-venta/actualizar/[id]/page.tsx";
import BankPage from "./app/ap/configuraciones/maestros-general/bancos/page.tsx";
import ApBankPage from "./app/ap/configuraciones/maestros-general/chequeras/page.tsx";
import AddApBankPage from "./app/ap/configuraciones/maestros-general/chequeras/agregar/page.tsx";
import UpdateApBankPage from "./app/ap/configuraciones/maestros-general/chequeras/actualizar/[id]/page.tsx";
import ClassArticlePage from "./app/ap/configuraciones/maestros-general/clase-articulo/page.tsx";
import AddClassArticlePage from "./app/ap/configuraciones/maestros-general/clase-articulo/agregar/page.tsx";
import UpdateClassArticlePage from "./app/ap/configuraciones/maestros-general/clase-articulo/actualizar/[id]/page.tsx";
import MaritalStatusPage from "./app/ap/configuraciones/maestros-general/estado-civil/page.tsx";
import ClientOriginPage from "./app/ap/configuraciones/maestros-general/origen-cliente/page.tsx";
import AccountingAccountPlanPage from "./app/ap/configuraciones/maestros-general/plan-cuenta-contable/page.tsx";
import PersonSegmentPage from "./app/ap/configuraciones/maestros-general/segmentos-persona/page.tsx";
import TaxClassTypesPage from "./app/ap/configuraciones/maestros-general/tipos-clase-impuesto/page.tsx";
import VoucherTypesPage from "./app/ap/configuraciones/maestros-general/tipos-comprobante/page.tsx";
import AccountingAccountTypePage from "./app/ap/configuraciones/maestros-general/tipos-cuenta-contable/page.tsx";
import DocumentTypePage from "./app/ap/configuraciones/maestros-general/tipos-documento/page.tsx";
import CurrencyTypesPage from "./app/ap/configuraciones/maestros-general/tipos-moneda/page.tsx";
import TypesOperationPage from "./app/ap/configuraciones/maestros-general/tipos-operacion/page.tsx";
import TypeClientPage from "./app/ap/configuraciones/maestros-general/tipos-persona/page.tsx";
import TypeGenderPage from "./app/ap/configuraciones/maestros-general/tipos-sexo/page.tsx";
import DistrictPage from "./app/ap/configuraciones/maestros-general/ubigeos/page.tsx";
import AddDistrictPage from "./app/ap/configuraciones/maestros-general/ubigeos/agregar/page.tsx";
import UpdateDistrictPage from "./app/ap/configuraciones/maestros-general/ubigeos/actualizar/[id]/page.tsx";
import UnitMeasurementPage from "./app/ap/configuraciones/maestros-general/unidad-medida/page.tsx";
import VehicleCategoryPage from "./app/ap/configuraciones/vehiculos/categorias/page.tsx";
import CategoryChecklistPage from "./app/ap/configuraciones/vehiculos/categorias-checklist/page.tsx";
import DeliveryChecklistPage from "./app/ap/configuraciones/vehiculos/checklist-entrega/page.tsx";
import ReceptionChecklistPage from "./app/ap/configuraciones/vehiculos/checklist-recepcion/page.tsx";
import VehicleColorPage from "./app/ap/configuraciones/vehiculos/colores-vehiculo/page.tsx";
import VehicleStatusPage from "./app/ap/configuraciones/vehiculos/estados-vehiculo/page.tsx";
import AddVehicleStatusPage from "./app/ap/configuraciones/vehiculos/estados-vehiculo/agregar/page.tsx";
import UpdateVehicleStatusPage from "./app/ap/configuraciones/vehiculos/estados-vehiculo/actualizar/[id]/page.tsx";
import FamiliesPage from "./app/ap/configuraciones/vehiculos/familias/page.tsx";
import BrandGroupPage from "./app/ap/configuraciones/vehiculos/grupo-marcas/page.tsx";
import BrandsPage from "./app/ap/configuraciones/vehiculos/marcas/page.tsx";
import AddBrandsPage from "./app/ap/configuraciones/vehiculos/marcas/agregar/page.tsx";
import UpdateBrandPage from "./app/ap/configuraciones/vehiculos/marcas/actualizar/[id]/page.tsx";
import ModelsVnPage from "./app/ap/configuraciones/vehiculos/modelos-vn/page.tsx";
import AddModelsVnPage from "./app/ap/configuraciones/vehiculos/modelos-vn/agregar/page.tsx";
import UpdateModelsVnPage from "./app/ap/configuraciones/vehiculos/modelos-vn/actualizar/[id]/page.tsx";
import ModelsVnPvPage from "./app/ap/post-venta/taller/modelos-vn-taller/page.tsx";
import AddModelsVnPvPage from "@/app/ap/post-venta/taller/modelos-vn-taller/agregar/page.tsx";
import UpdateModelsVnPvPage from "@/app/ap/post-venta/taller/modelos-vn-taller/actualizar/[id]/page.tsx";
import ModelsVnRepuestosPage from "./app/ap/post-venta/repuestos/modelos-vn-repuestos/page.tsx";
import AddModelsVnRepuestosPage from "./app/ap/post-venta/repuestos/modelos-vn-repuestos/agregar/page.tsx";
import UpdateModelsVnRepuestosPage from "./app/ap/post-venta/repuestos/modelos-vn-repuestos/actualizar/[id]/page.tsx";
import TypeVehicleOriginPage from "./app/ap/configuraciones/vehiculos/origen-vehiculo/page.tsx";
import BodyTypePage from "./app/ap/configuraciones/vehiculos/tipos-carroceria/page.tsx";
import FuelTypePage from "./app/ap/configuraciones/vehiculos/tipos-combustible/page.tsx";
import EngineTypesPage from "./app/ap/configuraciones/vehiculos/tipos-motor/page.tsx";
import SupplierOrderTypePage from "./app/ap/configuraciones/vehiculos/tipos-pedido-proveedor/page.tsx";
import ProductTypePage from "./app/ap/configuraciones/vehiculos/tipos-producto/page.tsx";
import TractionTypePage from "./app/ap/configuraciones/vehiculos/tipos-traccion/page.tsx";
import VehicleTypePage from "./app/ap/configuraciones/vehiculos/tipos-vehiculo/page.tsx";
import GearShiftTypePage from "./app/ap/configuraciones/vehiculos/transmision-vehiculo/page.tsx";
import ReasonsAdjustmentPage from "./app/ap/configuraciones/postventa/motivos-ajuste/page.tsx";
import ReasonDiscardingSparePartPage from "./app/ap/configuraciones/postventa/motivos-descarte-repuesto/page.tsx";
import TypesOperationsAppointmentPage from "./app/ap/configuraciones/postventa/tipos-operacion-cita/page.tsx";
import TypesPlanningPage from "./app/ap/configuraciones/postventa/tipos-planificacion/page.tsx";
import CommercialManagerBrandGroupPage from "./app/ap/configuraciones/ventas/asignar-grupo-marca/page.tsx";
import AddCommercialManagerBrandGroupPage from "./app/ap/configuraciones/ventas/asignar-grupo-marca/agregar/page.tsx";
import UpdateCommercialManagerBrandGroupPage from "./app/ap/configuraciones/ventas/asignar-grupo-marca/actualizar/[id]/page.tsx";
import AssignmentLeadershipPage from "./app/ap/configuraciones/ventas/asignar-jefe/page.tsx";
import AddAssignmentLeadershipPage from "./app/ap/configuraciones/ventas/asignar-jefe/agregar/page.tsx";
import UpdateAssignmentLeadershipPage from "./app/ap/configuraciones/ventas/asignar-jefe/actualizar/[id]/page.tsx";
import AssignBrandConsultantPage from "./app/ap/configuraciones/ventas/asignar-marca/page.tsx";
import AddAssignBrandConsultantPage from "./app/ap/configuraciones/ventas/asignar-marca/gestionar/page.tsx";
import AssignCompanyBranchPage from "./app/ap/configuraciones/ventas/asignar-sede/page.tsx";
import AddAssignCompanyBranchPage from "./app/ap/configuraciones/ventas/asignar-sede/agregar/page.tsx";
import UpdateAssignCompanyBranchPage from "./app/ap/configuraciones/ventas/asignar-sede/actualizar/[id]/page.tsx";
import ApSafeCreditGoalPage from "./app/ap/configuraciones/ventas/metas-credito-seguro/page.tsx";
import ApGoalSellOutInPage from "./app/ap/configuraciones/ventas/metas-venta/page.tsx";
import AddApGoalSellOutInPage from "./app/ap/configuraciones/ventas/metas-venta/gestionar/page.tsx";
import ApGoalSellOutInSummaryPage from "./app/ap/configuraciones/ventas/metas-venta/resumen/page.tsx";
import ShopPage from "./app/ap/configuraciones/ventas/tiendas/page.tsx";
import WarehouseManagementPage from "@/app/ap/post-venta/gestion-de-almacen/page.tsx";
import ProductCategoryPage from "@/app/ap/post-venta/gestion-de-almacen/categorias-producto/page.tsx";
import BrandsPVPage from "./app/ap/post-venta/gestion-de-almacen/marcas-producto/page.tsx";
import AddBrandsPVPage from "@/app/ap/post-venta/gestion-de-almacen/marcas-producto/agregar/page.tsx";
import UpdateBrandsPVPage from "@/app/ap/post-venta/gestion-de-almacen/marcas-producto/actualizar/[id]/page.tsx";
import ProductPVPage from "./app/ap/post-venta/gestion-de-almacen/productos/page.tsx";
import AddProductPVPage from "@/app/ap/post-venta/gestion-de-almacen/productos/agregar/page.tsx";
import UpdateProductPVPage from "@/app/ap/post-venta/gestion-de-almacen/productos/actualizar/[id]/page.tsx";
import AssignWarehousePage from "@/app/ap/post-venta/gestion-de-almacen/productos/asignar-almacen/[id]/page.tsx";
import ProductTransferPage from "./app/ap/post-venta/gestion-de-almacen/transferencia-producto/page.tsx";
import AddProductTransferPage from "@/app/ap/post-venta/gestion-de-almacen/transferencia-producto/agregar/page.tsx";
import UpdateProductTransferPage from "@/app/ap/post-venta/gestion-de-almacen/transferencia-producto/actualizar/[id]/page.tsx";
import TransferReceptionsPage from "@/app/ap/post-venta/gestion-de-almacen/transferencia-producto/recepcion/[productTransferId]/page.tsx";
import CreateTransferReceptionPage from "@/app/ap/post-venta/gestion-de-almacen/transferencia-producto/recepcion/agregar/[productTransferId]/page.tsx";
import AdjustmentsProductPage from "./app/ap/post-venta/gestion-de-almacen/ajuste-producto/page.tsx";
import AddAdjustmentsProductPage from "@/app/ap/post-venta/gestion-de-almacen/ajuste-producto/agregar/page.tsx";
import UpdateAdjustmentsProductPage from "@/app/ap/post-venta/gestion-de-almacen/ajuste-producto/actualizar/[id]/page.tsx";
import InventoryPage from "./app/ap/post-venta/gestion-de-almacen/inventario/page.tsx";
import InventoryKardexPage from "@/app/ap/post-venta/gestion-de-almacen/inventario/kardex/page.tsx";
import ProductKardexPage from "@/app/ap/post-venta/gestion-de-almacen/inventario/movimientos/[productId]/[warehouseId]/page.tsx";
import PurchaseHistoryPage from "@/app/ap/post-venta/gestion-de-almacen/inventario/historico-compras/[productId]/[warehouseId]/page.tsx";
import ReceptionsProductsPage from "@/app/ap/post-venta/gestion-de-almacen/pedido-proveedor/recepcionar/[supplierOrderId]/page.tsx";
import UpdateReceptionProductPage from "@/app/ap/post-venta/gestion-de-almacen/pedido-proveedor/recepcionar/actualizar/[supplierOrderId]/[id]/page.tsx";
import AddReceptionProductPage from "@/app/ap/post-venta/gestion-de-almacen/pedido-proveedor/recepcionar/agregar/[supplierOrderId]/page.tsx";
import SupplierOrderPage from "./app/ap/post-venta/gestion-de-almacen/pedido-proveedor/page.tsx";
import AddSupplierOrderPage from "@/app/ap/post-venta/gestion-de-almacen/pedido-proveedor/agregar/page.tsx";
import UpdateSupplierOrderPage from "@/app/ap/post-venta/gestion-de-almacen/pedido-proveedor/actualizar/[id]/page.tsx";
import InvoiceReceptionPage from "@/app/ap/post-venta/gestion-de-almacen/pedido-proveedor/recepcionar/facturar/[receptionId]/page.tsx";
import WarehousePurchaseRequestPage from "./app/ap/post-venta/gestion-de-almacen/solicitud-compra-almacen/page.tsx";
import AddWarehousePurchaseRequestPage from "@/app/ap/post-venta/gestion-de-almacen/solicitud-compra-almacen/agregar/page.tsx";
import UpdateWarehousePurchaseRequestPage from "@/app/ap/post-venta/gestion-de-almacen/solicitud-compra-almacen/actualizar/[id]/page.tsx";
import SparePartsPage from "./app/ap/post-venta/repuestos/page.tsx";
import ApprovedAccesoriesPage from "./app/ap/post-venta/repuestos/accesorios-homologados/page.tsx";
import AddApprovedAccesoriesPage from "./app/ap/post-venta/repuestos/accesorios-homologados/agregar/page.tsx";
import UpdateApprovedAccesoriesPage from "./app/ap/post-venta/repuestos/accesorios-homologados/actualizar/[id]/page.tsx";
import OrderQuotationMesonPage from "./app/ap/post-venta/repuestos/cotizacion-meson/page.tsx";
import AddOrderQuotationMesonPage from "./app/ap/post-venta/repuestos/cotizacion-meson/agregar/page.tsx";
import UpdateOrderQuotationMesonPage from "./app/ap/post-venta/repuestos/cotizacion-meson/actualizar/[id]/page.tsx";
import BillOrderQuotationMesonPage from "./app/ap/post-venta/repuestos/cotizacion-meson/facturar/[id]/page.tsx";
import SalesReceiptsRepuestoPage from "./app/ap/post-venta/repuestos/comprobante-venta-repuesto/page.tsx";
import PurchaseRequestRepuestoPage from "./app/ap/post-venta/repuestos/solicitud-compra-repuesto/page.tsx";
import AddPurchaseRequestRepuestoPage from "./app/ap/post-venta/repuestos/solicitud-compra-repuesto/agregar/page.tsx";
import UpdatePurchaseRequestRepuestoPage from "./app/ap/post-venta/repuestos/solicitud-compra-repuesto/actualizar/[id]/page.tsx";
import VehiclesRepuestosPage from "./app/ap/post-venta/repuestos/vehiculos-repuestos/page.tsx";
import AddVehiclesRepuestosPage from "./app/ap/post-venta/repuestos/vehiculos-repuestos/agregar/page.tsx";
import UpdateVehiclesRepuestosPage from "./app/ap/post-venta/repuestos/vehiculos-repuestos/actualizar/[id]/page.tsx";
import ProductRepuestoPage from "./app/ap/post-venta/repuestos/producto-repuesto/page.tsx";
import AddProductRepuestoPage from "./app/ap/post-venta/repuestos/producto-repuesto/agregar/page.tsx";
import UpdateProductRepuestoPage from "./app/ap/post-venta/repuestos/producto-repuesto/actualizar/[id]/page.tsx";
import InventoryRepuestoPage from "./app/ap/post-venta/repuestos/inventario-repuesto/page.tsx";
import ProductRepuestoKardexPage from "./app/ap/post-venta/repuestos/inventario-repuesto/movimientos/[productId]/[warehouseId]/page.tsx";
import CustomersRpPage from "./app/ap/post-venta/repuestos/clientes-repuestos/page.tsx";
import AddCustomersRpPage from "./app/ap/post-venta/repuestos/clientes-repuestos/agregar/page.tsx";
import UpdateCustomersRpPage from "./app/ap/post-venta/repuestos/clientes-repuestos/actualizar/[id]/page.tsx";
import CustomerRpEstablishmentsListPage from "./app/ap/post-venta/repuestos/clientes-repuestos/establecimientos/[id]/page.tsx";
import AddCustomerRpEstablishmentPage from "./app/ap/post-venta/repuestos/clientes-repuestos/establecimientos/[id]/agregar/page.tsx";
import UpdateCustomerRpEstablishmentPage from "./app/ap/post-venta/repuestos/clientes-repuestos/establecimientos/[id]/actualizar/[establishmentId]/page.tsx";
import WorkshopPage from "./app/ap/post-venta/taller/page.tsx";
import CardWashPage from "./app/ap/post-venta/taller/lavado-vehiculo/page.tsx";
import AppointmentPlanningPage from "./app/ap/post-venta/taller/citas/page.tsx";
import AddAppointmentPlanningPage from "./app/ap/post-venta/taller/citas/agregar/page.tsx";
import UpdateAppointmentPlanningPage from "./app/ap/post-venta/taller/citas/actualizar/[id]/page.tsx";
import OrderQuotationPage from "./app/ap/post-venta/taller/cotizacion-taller/page.tsx";
import AddOrderQuotationPage from "./app/ap/post-venta/taller/cotizacion-taller/agregar/page.tsx";
import UpdateOrderQuotationPage from "@/app/ap/post-venta/taller/cotizacion-taller/actualizar/[id]/page.tsx";
import ManageOrderQuotationPage from "@/app/ap/post-venta/taller/cotizacion-taller/gestionar/[id]/page.tsx";
import AprobacionProductosPage from "@/app/ap/post-venta/taller/cotizacion-taller/aprobar/[id]/page.tsx";
import PurchaseRequestPVPage from "./app/ap/post-venta/taller/solicitud-compra-taller/page.tsx";
import AddPurchaseRequestPVPage from "./app/ap/post-venta/taller/solicitud-compra-taller/agregar/page.tsx";
import UpdatePurchaseRequestPVPage from "@/app/ap/post-venta/taller/solicitud-compra-taller/actualizar/[id]/page.tsx";
import CustomersPvPage from "./app/ap/post-venta/taller/clientes-taller/page.tsx";
import AddCustomersPvPage from "@/app/ap/post-venta/taller/clientes-taller/agregar/page.tsx";
import UpdateCustomersPvPage from "@/app/ap/post-venta/taller/clientes-taller/actualizar/[id]/page.tsx";
import CustomerPvEstablishmentsListPage from "./app/ap/post-venta/taller/clientes-taller/establecimientos/[id]/page.tsx";
import AddCustomerPvEstablishmentPage from "@/app/ap/post-venta/taller/clientes-taller/establecimientos/[id]/agregar/page.tsx";
import UpdateCustomerPvEstablishmentPage from "@/app/ap/post-venta/taller/clientes-taller/establecimientos/[id]/actualizar/[establishmentId]/page.tsx";
import VehiclesPostVentaPage from "./app/ap/post-venta/taller/vehiculos-taller/page.tsx";
import AddVehiclePVPage from "@/app/ap/post-venta/taller/vehiculos-taller/agregar/page.tsx";
import UpdateVehiclePVPage from "@/app/ap/post-venta/taller/vehiculos-taller/actualizar/[id]/page.tsx";
import WorkOrderPage from "./app/ap/post-venta/taller/orden-trabajo/page.tsx";
import AddWorkOrderPage from "./app/ap/post-venta/taller/orden-trabajo/agregar/page.tsx";
import UpdateWorkOrderPage from "./app/ap/post-venta/taller/orden-trabajo/actualizar/[id]/page.tsx";
import ManageWorkOrderPage from "./app/ap/post-venta/taller/orden-trabajo/gestionar/[id]/page.tsx";
import GeneralInformationPage from "./app/ap/post-venta/taller/orden-trabajo/gestionar/[id]/informacion-general/page.tsx";
import WorkOrderPlanningPage from "./app/ap/post-venta/taller/planificacion-orden-trabajo/page.tsx";
import AddWorkOrderPlanningPage from "./app/ap/post-venta/taller/planificacion-orden-trabajo/agregar/page.tsx";
import AssignedWorkPage from "./app/ap/post-venta/taller/trabajos-asignados/page.tsx";
import VehicleInspectionPage from "./app/ap/post-venta/taller/orden-trabajo/[workOrderId]/inspeccion/page.tsx";
import SalesReceiptsTallerPage from "./app/ap/post-venta/taller/comprobante-venta-taller/page.tsx";
import RolePage from "./app/gp/gestion-del-sistema/roles/page.tsx";
import PermissionPage from "./app/gp/gestion-del-sistema/roles/permisos/[id]/page.tsx";
import AddUserPage from "./app/gp/gestion-del-sistema/usuarios/agregar/page.tsx";
import UpdateUserPage from "./app/gp/gestion-del-sistema/usuarios/actualizar/[id]/page.tsx";
import ViewPage from "./app/gp/gestion-del-sistema/vistas/page.tsx";
import AddViewPage from "./app/gp/gestion-del-sistema/vistas/agregar/page.tsx";
import UpdateViewPage from "./app/gp/gestion-del-sistema/vistas/actualizar/[id]/page.tsx";
import ViewPermissionsPage from "./app/gp/gestion-del-sistema/vistas/permisos/[id]/page.tsx";
import WorkersPage from "./app/gp/gestion-humana/gestion-de-personal/trabajadores/page.tsx";
import UpdateWorkerSignaturePage from "./app/gp/gestion-humana/gestion-de-personal/trabajadores/actualizar/[id]/page.tsx";
import PerDiemCategoryPage from "./app/gp/gestion-humana/viaticos/categoria-viaticos/page.tsx";
import PerDiemPolicyPage from "./app/gp/gestion-humana/viaticos/politica-viaticos/page.tsx";
import AddPerDiemPolicyPage from "./app/gp/gestion-humana/viaticos/politica-viaticos/agregar/page.tsx";
import UpdatePerDiemPolicyPage from "./app/gp/gestion-humana/viaticos/politica-viaticos/actualizar/[id]/page.tsx";
import HotelAgreementPage from "./app/gp/gestion-humana/viaticos/convenios-hoteles/page.tsx";
import AddHotelAgreementPage from "./app/gp/gestion-humana/viaticos/convenios-hoteles/agregar/page.tsx";
import UpdateHotelAgreementPage from "./app/gp/gestion-humana/viaticos/convenios-hoteles/actualizar/[id]/page.tsx";
import ExpenseTypePage from "./app/gp/gestion-humana/viaticos/tipo-gasto/page.tsx";
import PerDiemRatePage from "./app/gp/gestion-humana/viaticos/tarifa/page.tsx";
import AddPerDiemRatePage from "./app/gp/gestion-humana/viaticos/tarifa/agregar/page.tsx";
import UpdatePerDiemRatePage from "./app/gp/gestion-humana/viaticos/tarifa/actualizar/[id]/page.tsx";
import PerDiemRequestPage from "./app/gp/gestion-humana/viaticos/solicitud-viaticos/page.tsx";
import PerDiemRequestDetailAdminPage from "./app/gp/gestion-humana/viaticos/solicitud-viaticos/[id]/page.tsx";
import AddAdminHotelReservationPage from "./app/gp/gestion-humana/viaticos/solicitud-viaticos/[id]/reserva-hotel/agregar/page.tsx";
import UpdateAdminHotelReservationPage from "./app/gp/gestion-humana/viaticos/solicitud-viaticos/[id]/reserva-hotel/actualizar/[reservationId]/page.tsx";
import UpdateAdminAPHotelReservationPage from "./app/ap/contabilidad/solicitud-viaticos/[id]/reserva-hotel/actualizar/[reservationId]/page.tsx";
import AddPerDiemRequestPage from "./app/perfil/viaticos/agregar/page.tsx";
import UpdatePerDiemRequestPage from "./app/perfil/viaticos/actualizar/[id]/page.tsx";
import ApprovePerDiemRequestPage from "./app/perfil/viaticos/aprobar/page.tsx";
import ApproveSettlementPage from "./app/perfil/viaticos/aprobar-liquidaciones/page.tsx";
import PerDiemRequestDetailPage from "./app/perfil/viaticos/[id]/page.tsx";
import AddExpensePage from "./app/perfil/viaticos/[id]/gastos/agregar/page.tsx";
import UpdateExpensePage from "./app/perfil/viaticos/[id]/gastos/actualizar/[expenseId]/page.tsx";
import UploadDepositPage from "./app/ap/contabilidad/solicitud-viaticos/[id]/deposito/page.tsx";
import AccountantDistrictAssignmentPage from "./app/gp/gestion-humana/viaticos/asignacion-asistentes/page.tsx";
import UpdatePositionPage from "./app/gp/gestion-humana/configuraciones/posiciones/actualizar/[id]/page";
import UpdateHierarchicalCategoryPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/actualizar/[id]/page";
import PayrollConceptsPage from "./app/gp/gestion-humana/planillas/conceptos/page";
import AddPayrollConceptPage from "./app/gp/gestion-humana/planillas/conceptos/agregar/page";
import UpdatePayrollConceptPage from "./app/gp/gestion-humana/planillas/conceptos/actualizar/[id]/page";
import SedePage from "./app/gp/maestro-general/sede/page.tsx";
import UpdateSedePage from "./app/gp/maestro-general/sede/actualizar/[id]/page.tsx";
import AddSedePage from "./app/gp/maestro-general/sede/agregar/page.tsx";
import TICsModulePage from "./app/gp/tics/page.tsx";
import EquipmentPage from "./app/gp/tics/equipos/page.tsx";
import AddEquipmentPage from "./app/gp/tics/equipos/agregar/page.tsx";
import UpdateEquipmentPage from "./app/gp/tics/equipos/actualizar/[id]/page.tsx";
import AuditLogsPage from "./app/gp/tics/auditoria/page.tsx";
import CompanyModulePage from "./app/[company]/[module]/page.tsx";
import CompanyModuleSubmodulePage from "./app/[company]/[module]/[submodule]/page.tsx";
import ProfilePage from "./app/perfil/page.tsx";
import UserPage from "./app/gp/gestion-del-sistema/usuarios/page.tsx";
import MyPerDiemPage from "./app/perfil/viaticos/page.tsx";
import AddGeneralElectronicDocumentPage from "./app/ap/comercial/electronic-documents/agregar-otros/page.tsx";
import PerDiemRequestAPPage from "./app/ap/contabilidad/solicitud-viaticos/page.tsx";
import PerDiemRequestDetailAdminAPPage from "./app/ap/contabilidad/solicitud-viaticos/[id]/page.tsx";
import CommercialMastersPage from "./app/ap/configuraciones/maestros-general/maestros-generales/page.tsx";
import ControlTravelPage from "./app/tp/comercial-tp/control-viajes/page.tsx";

import GeneralMastersPage from "./app/gp/maestros-generales/page.tsx";
import { PER_DIEM_REQUEST } from "./features/profile/viaticos/lib/perDiemRequest.constants.ts";
import ControlFreightPage from "./app/tp/comercial-tp/control-fletes/page.tsx";
import PayrollPeriodsPage from "./app/gp/gestion-humana/planillas/periodos/page.tsx";
import AddPayrollPeriodPage from "./app/gp/gestion-humana/planillas/periodos/agregar/page.tsx";
import UpdatePayrollPeriodPage from "./app/gp/gestion-humana/planillas/periodos/actualizar/[id]/page.tsx";
import WorkTypePage from "./app/gp/gestion-humana/planillas/tipo-dia-trabajo/page.tsx";
import AddWorkTypePage from "./app/gp/gestion-humana/planillas/tipo-dia-trabajo/agregar/page.tsx";
import UpdateWorkTypePage from "./app/gp/gestion-humana/planillas/tipo-dia-trabajo/actualizar/[id]/page.tsx";
import ManageSegmentsPage from "./app/gp/gestion-humana/planillas/tipo-dia-trabajo/segmentos/[id]/page.tsx";
import WorkSchedulesPage from "./app/gp/gestion-humana/planillas/dia-trabajo/page.tsx";
import ProfileLayout from "./features/dashboard/components/ProfileLayout.tsx";
import ControlGoalPage from "./app/tp/comercial-tp/control-metas/page.tsx";
import EquipmentTypePage from "./app/gp/tics/tipos-de-equipo/page.tsx";
import { PHONE_LINE } from "./features/gp/tics/phoneLine/lib/phoneLine.constants.ts";
import PhoneLinePage from "./app/gp/tics/lineas-telefonicas/page.tsx";
import AddPhoneLinePage from "./app/gp/tics/lineas-telefonicas/agregar/page.tsx";
import UpdatePhoneLinePage from "./app/gp/tics/lineas-telefonicas/actualizar/[id]/page.tsx";
import ControlVehicleAssignmentPage from "./app/tp/comercial-tp/control-asignacionVehiculos/page.tsx";

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
  // const { isAuthenticated, isHydrated } = useAuthStore();
  const { isAuthenticated } = useAuthStore();

  // if (!isHydrated) {
  //   return <DashboardSkeleton />;
  // }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ============================================================================
// LOADING COMPONENT
// ============================================================================
const LoadingFallback = () => <DashboardSkeleton />;

const RouterCrud = (
  path: string,
  page: JSX.Element,
  addPage: JSX.Element,
  editPage: JSX.Element,
  detailPage?: JSX.Element,
) => {
  return (
    <>
      <Route path={path} element={page} />
      <Route path={`${path}/agregar`} element={addPage} />
      <Route path={`${path}/actualizar/:id`} element={editPage} />
      {detailPage && <Route path={`${path}/:id`} element={detailPage} />}
    </>
  );
};

const { ROUTE: PER_DIEM_REQUEST_ROUTE } = PER_DIEM_REQUEST;

// ============================================================================
// APP COMPONENT
// ============================================================================
function App() {
  return (
    <BrowserRouter>
      <TitleUpdater />
      <AuthInitializer />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ============================================================ */}
          {/* PUBLIC ROUTES */}
          {/* ============================================================ */}
          <Route path="/" element={<LoginPage />} />

          {/* ============================================================ */}
          {/* PROTECTED ROUTES */}
          {/* ============================================================ */}
          <Route
            element={
              <ProtectedRoute>
                <NotFoundBoundary>
                  <Outlet />
                </NotFoundBoundary>
              </ProtectedRoute>
            }
          >
            {/* Companies & Modules Selection */}
            <Route
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Outlet />
                  </MainLayout>
                </Suspense>
              }
            >
              <Route path="/companies" element={<CompaniesPage />} />
              <Route
                path="/modules/:company"
                element={<ModulesCompanyPage />}
              />
              <Route
                path="/modules/:company/:module"
                element={<ModulesCompanyModulePage />}
              />
            </Route>

            {/* Feed */}
            <Route path="/feed" element={<FeedRoutePage />} />

            {/* Test */}
            <Route path="/test" element={<TestPage />} />

            {/* ======================================================== */}
            {/* PERFIL SECTION */}
            {/* ======================================================== */}
            <Route
              path="/perfil"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <ProfileLayout>
                    <Outlet />
                  </ProfileLayout>
                </Suspense>
              }
            >
              <Route index element={<ProfilePage />} />
              <Route path="capacitaciones" element={<TrainingPage />} />
              <Route path="documentos" element={<DocumentPage />} />
              <Route path="equipo" element={<TeamPage />} />
              <Route
                path="equipo/indicadores"
                element={<TeamIndicatorsPage />}
              />
              <Route path="equipo/:id" element={<NamuPerformancePage />} />
              <Route
                path="equipo/:id/evaluar"
                element={<NamuPerformanceEvaluationPage />}
              />
              <Route
                path="equipo/:id/historial"
                element={<NamuPerformanceHistoryPage />}
              />
              <Route
                path="equipo/:id/plan-desarrollo"
                element={<PlanDesarrolloPage />}
              />
              <Route
                path="equipo/:id/plan-desarrollo/crear"
                element={<CrearPlanDesarrolloPage />}
              />
              <Route path="mi-desempeno" element={<MyPerformance />} />
              <Route path="vacaciones" element={<VacationPage />} />
              <Route
                path={PER_DIEM_REQUEST_ROUTE}
                element={<MyPerDiemPage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/agregar`}
                element={<AddPerDiemRequestPage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/actualizar/:id`}
                element={<UpdatePerDiemRequestPage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/aprobar`}
                element={<ApprovePerDiemRequestPage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/aprobar-liquidaciones`}
                element={<ApproveSettlementPage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/:id`}
                element={<PerDiemRequestDetailPage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/:id/gastos/agregar`}
                element={<AddExpensePage />}
              />
              <Route
                path={`${PER_DIEM_REQUEST_ROUTE}/:id/gastos/actualizar/:expenseId`}
                element={<UpdateExpensePage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* AP - COMERCIAL */}
            {/* ======================================================== */}
            <Route
              path="/ap/comercial"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <APComercialLayout>
                    <Outlet />
                  </APComercialLayout>
                </Suspense>
              }
            >
              {/* Dashboard Principal */}
              <Route index element={<CommercialPage />} />

              {/* Agenda */}
              <Route path="agenda" element={<AgendaPage />} />

              {/* Oportunidades */}
              {RouterCrud(
                "agenda/oportunidades",
                <OpportunitiesKanbanPage />,
                <AddOpportunityPage />,
                <UpdateOpportunityPage />,
                <OpportunityDetailPage />,
              )}

              {/* Clientes */}
              {RouterCrud(
                "clientes",
                <CustomersPage />,
                <AddCustomersPage />,
                <UpdateCustomersPage />,
              )}

              {/* Establecimientos */}
              <Route
                path="clientes/establecimientos/:id"
                element={<CustomerEstablishmentsListPage />}
              />
              <Route
                path="clientes/establecimientos/:id/agregar"
                element={<AddCustomerEstablishmentPage />}
              />
              <Route
                path="clientes/establecimientos/:id/actualizar/:establishmentId"
                element={<UpdateCustomerEstablishmentPage />}
              />

              {/* Proveedores */}
              {RouterCrud(
                "proveedores",
                <SuppliersPage />,
                <AddSupplierPage />,
                <UpdateSuppliersPage />,
              )}

              {/* Establecimientos Proveedores */}
              <Route
                path="proveedores/establecimientos/:id"
                element={<SupplierEstablishmentsListPage />}
              />
              <Route
                path="proveedores/establecimientos/:id/agregar"
                element={<AddSupplierEstablishmentPage />}
              />
              <Route
                path="proveedores/establecimientos/:id/actualizar/:establishmentId"
                element={<UpdateSupplierEstablishmentPage />}
              />

              {/* Electronic Documents */}
              {RouterCrud(
                "comprobantes-venta",
                <ElectronicDocumentsPage />,
                <AddElectronicDocumentPage />,
                <UpdateElectronicDocumentPage />,
              )}

              <Route
                path="comprobantes-venta/agregar-otros"
                element={<AddGeneralElectronicDocumentPage />}
              />

              {/* Credit Note */}
              <Route
                path="comprobantes-venta/:id/credit-note"
                element={<AddCreditNotePage />}
              />
              <Route
                path="comprobantes-venta/:id/credit-note/actualizar/:credit"
                element={<UpdateCreditNotePage />}
              />

              {/* Debit Note */}
              <Route
                path="comprobantes-venta/:id/debit-note"
                element={<AddDebitNotePage />}
              />
              <Route
                path="comprobantes-venta/:id/debit-note/actualizar/:debit"
                element={<UpdateDebitNotePage />}
              />

              {/* Vehículos */}
              <Route path="vehiculos" element={<VehiclesPage />} />

              {/* Compra Vehículo Nuevo */}
              <Route
                path="compra-vehiculo-nuevo"
                element={<VehiclePurchaseOrderPage />}
              />
              <Route
                path="compra-vehiculo-nuevo/agregar"
                element={<AddVehiclePurchaseOrderPage />}
              />
              <Route
                path="compra-vehiculo-nuevo/reenviar/:id"
                element={<ResendVehiclePurchaseOrderPage />}
              />

              {/* Entrega Vehículo */}
              <Route
                path="entrega-vehiculo"
                element={<VehicleDeliveryPage />}
              />
              <Route
                path="entrega-vehiculo/agregar"
                element={<AddVehicleDeliveryPage />}
              />
              <Route
                path="entrega-vehiculo/guia-remision/:id"
                element={<ShippingGuidePage />}
              />

              {/* Envios & Recepciones */}
              {RouterCrud(
                "envios-recepciones",
                <ShipmentsReceptionsPage />,
                <AddShipmentsReceptionsPage />,
                <UpdateShipmentsReceptionsPage />,
              )}
              <Route
                path="envios-recepciones/checklist/:id"
                element={<ReceptionCheckListPage />}
              />

              {/* Ventas & Leads */}
              {RouterCrud(
                "visitas-tienda",
                <StoreVisitsPage />,
                <AddStoreVisitsPage />,
                <UpdateStoreVisitsPage />,
              )}

              {/* Gestionar Leads */}
              <Route path="gestionar-leads" element={<ManageLeadsPage />} />

              {/* Solicitudes Cotizaciones */}
              <Route
                path="solicitudes-cotizaciones"
                element={<PurchaseRequestQuotePage />}
              />
              <Route
                path="solicitudes-cotizaciones/:opportunity_id/agregar"
                element={<AddPurchaseRequestQuotePage />}
              />
              <Route
                path="solicitudes-cotizaciones/actualizar/:id"
                element={<UpdatePurchaseRequestQuotePage />}
              />

              {/* Dashboard Entregas */}
              <Route
                path="dashboard-entregas"
                element={<DashboardDeliveryPage />}
              />

              {/* Dashboard Equipo Leads */}
              <Route
                path="dashboard-equipo-leads"
                element={<TeamLeadsDashboard />}
              />

              {/* Dashboard Visitas Leads */}
              <Route
                path="dashboard-visitas-leads"
                element={<DashboardStoreVisitsPage />}
              />

              {/* Motivos Descarte */}
              <Route
                path="motivos-descarte"
                element={<ReasonsRejectionPage />}
              />

              {/* Vehículos de Exhibición */}
              {RouterCrud(
                "vehiculos-exhibicion",
                <ExhibitionVehiclesPage />,
                <AddExhibitionVehiclesPage />,
                <UpdateExhibitionVehiclesPage />,
              )}

              {/* Reportes */}
              <Route path="reportes" element={<ReportesComercialPage />} />
            </Route>

            {/* ======================================================== */}
            {/* AP - CONFIGURACIONES */}
            {/* ======================================================== */}
            <Route
              path="/ap/configuraciones"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <APConfiguracionesLayout>
                    <Outlet />
                  </APConfiguracionesLayout>
                </Suspense>
              }
            >
              {/* Dashboard Principal */}
              <Route path="maestros-general" element={<ModulePage />} />

              {/* Maestros General */}
              <Route
                path="maestros-general/maestros-generales"
                element={<CommercialMastersPage />}
              />
              <Route
                path="maestros-general/actividad-economica"
                element={<EconomicActivityPage />}
              />
              <Route
                path="maestros-general/almacenes"
                element={<WarehousePage />}
              />
              <Route
                path="maestros-general/almacenes/agregar"
                element={<AddWarehousePage />}
              />
              <Route
                path="maestros-general/almacenes/actualizar/:id"
                element={<UpdateWarehousePage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario"
                element={<UserSeriesAssignmentPage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario/agregar"
                element={<AddUserSeriesAssignmentPage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario/actualizar/:id"
                element={<UpdateUserSeriesAssignmentPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta"
                element={<AssignSalesSeriesPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta/agregar"
                element={<AddAssignSalesSeriesPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta/actualizar/:id"
                element={<UpdateAssignSalesSeriesPage />}
              />
              <Route path="maestros-general/bancos" element={<BankPage />} />
              <Route
                path="maestros-general/chequeras"
                element={<ApBankPage />}
              />
              <Route
                path="maestros-general/chequeras/agregar"
                element={<AddApBankPage />}
              />
              <Route
                path="maestros-general/chequeras/actualizar/:id"
                element={<UpdateApBankPage />}
              />
              <Route
                path="maestros-general/clase-articulo"
                element={<ClassArticlePage />}
              />

              <Route
                path="maestros-general/clase-articulo/agregar"
                element={<AddClassArticlePage />}
              />
              <Route
                path="maestros-general/clase-articulo/actualizar/:id"
                element={<UpdateClassArticlePage />}
              />

              <Route
                path="maestros-general/estado-civil"
                element={<MaritalStatusPage />}
              />
              <Route
                path="maestros-general/origen-cliente"
                element={<ClientOriginPage />}
              />
              <Route
                path="maestros-general/plan-cuenta-contable"
                element={<AccountingAccountPlanPage />}
              />
              <Route
                path="maestros-general/segmentos-persona"
                element={<PersonSegmentPage />}
              />
              <Route
                path="maestros-general/tipos-clase-impuesto"
                element={<TaxClassTypesPage />}
              />
              <Route
                path="maestros-general/tipos-comprobante"
                element={<VoucherTypesPage />}
              />
              <Route
                path="maestros-general/tipos-cuenta-contable"
                element={<AccountingAccountTypePage />}
              />
              <Route
                path="maestros-general/tipos-documento"
                element={<DocumentTypePage />}
              />
              <Route
                path="maestros-general/tipos-moneda"
                element={<CurrencyTypesPage />}
              />
              <Route
                path="maestros-general/tipos-operacion"
                element={<TypesOperationPage />}
              />
              <Route
                path="maestros-general/tipos-persona"
                element={<TypeClientPage />}
              />
              <Route
                path="maestros-general/tipos-sexo"
                element={<TypeGenderPage />}
              />
              <Route
                path="maestros-general/ubigeos"
                element={<DistrictPage />}
              />
              <Route
                path="maestros-general/ubigeos/agregar"
                element={<AddDistrictPage />}
              />
              <Route
                path="maestros-general/ubigeos/actualizar/:id"
                element={<UpdateDistrictPage />}
              />
              <Route
                path="maestros-general/unidad-medida"
                element={<UnitMeasurementPage />}
              />

              {/* Vehículos Configuration */}
              <Route index path="vehiculos" element={<ModulePage />} />

              <Route
                path="vehiculos/categorias"
                element={<VehicleCategoryPage />}
              />
              <Route
                path="vehiculos/categorias-checklist"
                element={<CategoryChecklistPage />}
              />
              <Route
                path="vehiculos/checklist-entrega"
                element={<DeliveryChecklistPage />}
              />
              <Route
                path="vehiculos/checklist-recepcion"
                element={<ReceptionChecklistPage />}
              />
              <Route
                path="vehiculos/colores-vehiculo"
                element={<VehicleColorPage />}
              />
              <Route
                path="vehiculos/estados-vehiculo"
                element={<VehicleStatusPage />}
              />
              <Route
                path="vehiculos/estados-vehiculo/agregar"
                element={<AddVehicleStatusPage />}
              />
              <Route
                path="vehiculos/estados-vehiculo/actualizar/:id"
                element={<UpdateVehicleStatusPage />}
              />
              <Route path="vehiculos/familias" element={<FamiliesPage />} />
              <Route
                path="vehiculos/grupo-marcas"
                element={<BrandGroupPage />}
              />
              <Route path="vehiculos/marcas" element={<BrandsPage />} />
              <Route
                path="vehiculos/marcas/agregar"
                element={<AddBrandsPage />}
              />
              <Route
                path="vehiculos/marcas/actualizar/:id"
                element={<UpdateBrandPage />}
              />
              <Route path="vehiculos/modelos-vn" element={<ModelsVnPage />} />
              <Route
                path="vehiculos/modelos-vn/agregar"
                element={<AddModelsVnPage />}
              />
              <Route
                path="vehiculos/modelos-vn/actualizar/:id"
                element={<UpdateModelsVnPage />}
              />
              <Route
                path="vehiculos/origen-vehiculo"
                element={<TypeVehicleOriginPage />}
              />
              <Route
                path="vehiculos/tipos-carroceria"
                element={<BodyTypePage />}
              />
              <Route
                path="vehiculos/tipos-combustible"
                element={<FuelTypePage />}
              />
              <Route
                path="vehiculos/tipos-motor"
                element={<EngineTypesPage />}
              />
              <Route
                path="vehiculos/tipos-pedido-proveedor"
                element={<SupplierOrderTypePage />}
              />
              <Route
                path="vehiculos/tipos-producto"
                element={<ProductTypePage />}
              />
              <Route
                path="vehiculos/tipos-traccion"
                element={<TractionTypePage />}
              />
              <Route
                path="vehiculos/tipos-vehiculo"
                element={<VehicleTypePage />}
              />
              <Route
                path="vehiculos/transmision-vehiculo"
                element={<GearShiftTypePage />}
              />

              {/* PostVentas Configuration */}
              <Route
                path="postventa/tipos-operacion-cita"
                element={<TypesOperationsAppointmentPage />}
              />
              <Route
                path="postventa/motivos-ajuste"
                element={<ReasonsAdjustmentPage />}
              />
              <Route
                path="postventa/motivos-descarte-repuesto"
                element={<ReasonDiscardingSparePartPage />}
              />
              <Route
                path="postventa/tipos-planificacion"
                element={<TypesPlanningPage />}
              />

              {/* Ventas Configuration */}
              <Route
                path="ventas/asignar-grupo-marca"
                element={<CommercialManagerBrandGroupPage />}
              />
              <Route
                path="ventas/asignar-grupo-marca/agregar"
                element={<AddCommercialManagerBrandGroupPage />}
              />
              <Route
                path="ventas/asignar-grupo-marca/actualizar/:id"
                element={<UpdateCommercialManagerBrandGroupPage />}
              />
              <Route
                path="ventas/asignar-jefe"
                element={<AssignmentLeadershipPage />}
              />
              <Route
                path="ventas/asignar-jefe/agregar"
                element={<AddAssignmentLeadershipPage />}
              />
              <Route
                path="ventas/asignar-jefe/actualizar/:id"
                element={<UpdateAssignmentLeadershipPage />}
              />
              <Route
                path="ventas/asignar-marca"
                element={<AssignBrandConsultantPage />}
              />
              <Route
                path="ventas/asignar-marca/gestionar"
                element={<AddAssignBrandConsultantPage />}
              />
              <Route
                path="ventas/asignar-sede"
                element={<AssignCompanyBranchPage />}
              />
              <Route
                path="ventas/asignar-sede/agregar"
                element={<AddAssignCompanyBranchPage />}
              />
              <Route
                path="ventas/asignar-sede/actualizar/:id"
                element={<UpdateAssignCompanyBranchPage />}
              />
              <Route
                path="ventas/metas-credito-seguro"
                element={<ApSafeCreditGoalPage />}
              />
              <Route
                path="ventas/metas-venta"
                element={<ApGoalSellOutInPage />}
              />
              <Route
                path="ventas/metas-venta/gestionar"
                element={<AddApGoalSellOutInPage />}
              />
              <Route
                path="ventas/metas-venta/resumen"
                element={<ApGoalSellOutInSummaryPage />}
              />
              <Route path="ventas/tiendas" element={<ShopPage />} />
            </Route>

            {/* ======================================================== */}
            {/* AP - CONTABILIDAD */}
            {/* ======================================================== */}
            <Route
              path="/ap/contabilidad"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GPGestionHumanaLayout>
                    <Outlet />
                  </GPGestionHumanaLayout>
                </Suspense>
              }
            >
              {/* Administración de Solicitud de Viaticos */}
              <Route path="viaticos-ap" element={<PerDiemRequestAPPage />} />
              <Route
                path="viaticos-ap/:id"
                element={<PerDiemRequestDetailAdminAPPage />}
              />
              <Route
                path="viaticos-ap/:id/reserva-hotel/agregar"
                element={<AddAdminHotelReservationPage />}
              />
              <Route
                path="viaticos-ap/:id/reserva-hotel/actualizar/:reservationId"
                element={<UpdateAdminAPHotelReservationPage />}
              />
              <Route
                path="viaticos-ap/:id/deposito"
                element={<UploadDepositPage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* AP - POST-VENTA */}
            {/* ======================================================== */}
            <Route
              path="/ap/post-venta"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <APPostVentaLayout>
                    <Outlet />
                  </APPostVentaLayout>
                </Suspense>
              }
            >
              {/* Dashboard Principal */}
              <Route index element={<ModulePage />} />
              {/* Gestión de Almacén */}
              <Route
                path="gestion-de-almacen"
                element={<WarehouseManagementPage />}
              />
              {/* Gestión de Productos */}
              <Route
                path="gestion-de-almacen/categorias-producto"
                element={<ProductCategoryPage />}
              />
              <Route
                path="gestion-de-almacen/marcas-producto"
                element={<BrandsPVPage />}
              />
              <Route
                path="gestion-de-almacen/marcas-producto/agregar"
                element={<AddBrandsPVPage />}
              />
              <Route
                path="gestion-de-almacen/marcas-producto/actualizar/:id"
                element={<UpdateBrandsPVPage />}
              />
              <Route
                path="gestion-de-almacen/productos"
                element={<ProductPVPage />}
              />
              <Route
                path="gestion-de-almacen/productos/agregar"
                element={<AddProductPVPage />}
              />
              <Route
                path="gestion-de-almacen/productos/actualizar/:id"
                element={<UpdateProductPVPage />}
              />
              <Route
                path="gestion-de-almacen/productos/asignar-almacen/:id"
                element={<AssignWarehousePage />}
              />
              {/* Gestion Compra */}
              <Route
                path="gestion-de-almacen/transferencia-producto"
                element={<ProductTransferPage />}
              />
              <Route
                path="gestion-de-almacen/transferencia-producto/agregar"
                element={<AddProductTransferPage />}
              />
              <Route
                path="gestion-de-almacen/transferencia-producto/actualizar/:id"
                element={<UpdateProductTransferPage />}
              />
              <Route
                path="gestion-de-almacen/transferencia-producto/recepcion/:productTransferId"
                element={<TransferReceptionsPage />}
              />
              <Route
                path="gestion-de-almacen/transferencia-producto/recepcion/agregar/:productTransferId"
                element={<CreateTransferReceptionPage />}
              />
              <Route
                path="gestion-de-almacen/ajuste-producto"
                element={<AdjustmentsProductPage />}
              />
              <Route
                path="gestion-de-almacen/ajuste-producto/agregar"
                element={<AddAdjustmentsProductPage />}
              />
              <Route
                path="gestion-de-almacen/ajuste-producto/actualizar/:id"
                element={<UpdateAdjustmentsProductPage />}
              />
              <Route
                path="gestion-de-almacen/inventario"
                element={<InventoryPage />}
              />
              <Route
                path="gestion-de-almacen/inventario/kardex"
                element={<InventoryKardexPage />}
              />
              <Route
                path="gestion-de-almacen/inventario/movimientos/:productId/:warehouseId"
                element={<ProductKardexPage />}
              />
              <Route
                path="gestion-de-almacen/inventario/historico-compras/:productId/:warehouseId"
                element={<PurchaseHistoryPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor"
                element={<SupplierOrderPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor/agregar"
                element={<AddSupplierOrderPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor/actualizar/:id"
                element={<UpdateSupplierOrderPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor/recepcionar/facturar/:receptionId"
                element={<InvoiceReceptionPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor/recepcionar/:supplierOrderId"
                element={<ReceptionsProductsPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor/recepcionar/agregar/:supplierOrderId"
                element={<AddReceptionProductPage />}
              />
              <Route
                path="gestion-de-almacen/pedido-proveedor/recepcionar/actualizar/:supplierOrderId/:id"
                element={<UpdateReceptionProductPage />}
              />
              <Route
                path="gestion-de-almacen/solicitud-compra-almacen"
                element={<WarehousePurchaseRequestPage />}
              />
              <Route
                path="gestion-de-almacen/solicitud-compra-almacen/agregar"
                element={<AddWarehousePurchaseRequestPage />}
              />
              <Route
                path="gestion-de-almacen/solicitud-compra-almacen/actualizar/:id"
                element={<UpdateWarehousePurchaseRequestPage />}
              />
              {/* Repuestos */}
              <Route path="repuestos" element={<SparePartsPage />} />
              <Route
                path="repuestos/accesorios-homologados"
                element={<ApprovedAccesoriesPage />}
              />
              <Route
                path="repuestos/accesorios-homologados/agregar"
                element={<AddApprovedAccesoriesPage />}
              />
              <Route
                path="repuestos/accesorios-homologados/actualizar/:id"
                element={<UpdateApprovedAccesoriesPage />}
              />
              <Route
                path="repuestos/cotizacion-meson"
                element={<OrderQuotationMesonPage />}
              />
              <Route
                path="repuestos/cotizacion-meson/agregar"
                element={<AddOrderQuotationMesonPage />}
              />
              <Route
                path="repuestos/cotizacion-meson/actualizar/:id"
                element={<UpdateOrderQuotationMesonPage />}
              />
              <Route
                path="repuestos/cotizacion-meson/facturar/:id"
                element={<BillOrderQuotationMesonPage />}
              />
              <Route
                path="repuestos/comprobante-venta-repuesto"
                element={<SalesReceiptsRepuestoPage />}
              />
              <Route
                path="repuestos/solicitud-compra-repuesto"
                element={<PurchaseRequestRepuestoPage />}
              />
              <Route
                path="repuestos/solicitud-compra-repuesto/agregar"
                element={<AddPurchaseRequestRepuestoPage />}
              />
              <Route
                path="repuestos/solicitud-compra-repuesto/actualizar/:id"
                element={<UpdatePurchaseRequestRepuestoPage />}
              />
              <Route
                path="repuestos/vehiculos-repuestos"
                element={<VehiclesRepuestosPage />}
              />
              <Route
                path="repuestos/vehiculos-repuestos/agregar"
                element={<AddVehiclesRepuestosPage />}
              />
              <Route
                path="repuestos/vehiculos-repuestos/actualizar/:id"
                element={<UpdateVehiclesRepuestosPage />}
              />
              <Route
                path="repuestos/producto-repuesto"
                element={<ProductRepuestoPage />}
              />
              <Route
                path="repuestos/producto-repuesto/agregar"
                element={<AddProductRepuestoPage />}
              />
              <Route
                path="repuestos/producto-repuesto/actualizar/:id"
                element={<UpdateProductRepuestoPage />}
              />
              <Route
                path="repuestos/inventario-repuesto"
                element={<InventoryRepuestoPage />}
              />
              <Route
                path="repuestos/inventario-repuesto/movimientos/:productId/:warehouseId"
                element={<ProductRepuestoKardexPage />}
              />
              <Route
                path="repuestos/clientes-repuestos"
                element={<CustomersRpPage />}
              />
              <Route
                path="repuestos/clientes-repuestos/agregar"
                element={<AddCustomersRpPage />}
              />
              <Route
                path="repuestos/clientes-repuestos/actualizar/:id"
                element={<UpdateCustomersRpPage />}
              />
              <Route
                path="repuestos/clientes-repuestos/establecimientos/:id"
                element={<CustomerRpEstablishmentsListPage />}
              />
              <Route
                path="repuestos/clientes-repuestos/establecimientos/:id/agregar"
                element={<AddCustomerRpEstablishmentPage />}
              />
              <Route
                path="repuestos/clientes-repuestos/establecimientos/:id/actualizar/:establishmentId"
                element={<UpdateCustomerRpEstablishmentPage />}
              />
              <Route
                path="repuestos/modelos-vn-repuestos"
                element={<ModelsVnRepuestosPage />}
              />
              <Route
                path="repuestos/modelos-vn-repuestos/agregar"
                element={<AddModelsVnRepuestosPage />}
              />
              <Route
                path="repuestos/modelos-vn-repuestos/actualizar/:id"
                element={<UpdateModelsVnRepuestosPage />}
              />
              {/* Taller */}
              <Route path="taller" element={<WorkshopPage />} />
              <Route path="taller/lavado-vehiculo" element={<CardWashPage />} />
              <Route path="taller/modelos-vn-pv" element={<ModelsVnPvPage />} />
              <Route
                path="taller/modelos-vn-pv/agregar"
                element={<AddModelsVnPvPage />}
              />
              <Route
                path="taller/modelos-vn-pv/actualizar/:id"
                element={<UpdateModelsVnPvPage />}
              />
              <Route
                path="taller/citas"
                element={<AppointmentPlanningPage />}
              />
              <Route
                path="taller/citas/agregar"
                element={<AddAppointmentPlanningPage />}
              />
              <Route
                path="taller/citas/actualizar/:id"
                element={<UpdateAppointmentPlanningPage />}
              />
              <Route
                path="taller/cotizacion-taller"
                element={<OrderQuotationPage />}
              />
              <Route
                path="taller/cotizacion-taller/agregar"
                element={<AddOrderQuotationPage />}
              />
              <Route
                path="taller/cotizacion-taller/actualizar/:id"
                element={<UpdateOrderQuotationPage />}
              />
              <Route
                path="taller/cotizacion-taller/gestionar/:id"
                element={<ManageOrderQuotationPage />}
              />
              <Route
                path="taller/cotizacion-taller/aprobar/:id"
                element={<AprobacionProductosPage />}
              />
              <Route
                path="taller/solicitud-compra-taller"
                element={<PurchaseRequestPVPage />}
              />
              <Route
                path="taller/solicitud-compra-taller/agregar"
                element={<AddPurchaseRequestPVPage />}
              />
              <Route
                path="taller/solicitud-compra-taller/actualizar/:id"
                element={<UpdatePurchaseRequestPVPage />}
              />
              <Route
                path="taller/clientes-taller"
                element={<CustomersPvPage />}
              />
              <Route
                path="taller/clientes-taller/agregar"
                element={<AddCustomersPvPage />}
              />
              <Route
                path="taller/clientes-taller/actualizar/:id"
                element={<UpdateCustomersPvPage />}
              />
              <Route
                path="taller/clientes-taller/establecimientos/:id"
                element={<CustomerPvEstablishmentsListPage />}
              />
              <Route
                path="taller/clientes-taller/establecimientos/:id/agregar"
                element={<AddCustomerPvEstablishmentPage />}
              />
              <Route
                path="taller/clientes-taller/establecimientos/:id/actualizar/:establishmentId"
                element={<UpdateCustomerPvEstablishmentPage />}
              />
              <Route
                path="taller/vehiculos-taller"
                element={<VehiclesPostVentaPage />}
              />
              <Route
                path="taller/vehiculos-taller/agregar"
                element={<AddVehiclePVPage />}
              />
              <Route
                path="taller/vehiculos-taller/actualizar/:id"
                element={<UpdateVehiclePVPage />}
              />
              <Route
                path="taller/cotizacion/gestionar/:id"
                element={<OrderQuotationPage />}
              />
              <Route path="taller/orden-trabajo" element={<WorkOrderPage />} />
              <Route
                path="taller/orden-trabajo/agregar"
                element={<AddWorkOrderPage />}
              />
              <Route
                path="taller/orden-trabajo/actualizar/:id"
                element={<UpdateWorkOrderPage />}
              />
              <Route
                path="taller/orden-trabajo/gestionar/:id"
                element={<ManageWorkOrderPage />}
              />
              <Route
                path="taller/orden-trabajo/gestionar/:id/informacion-general"
                element={<GeneralInformationPage />}
              />
              <Route
                path="taller/orden-trabajo/:workOrderId/inspeccion"
                element={<VehicleInspectionPage />}
              />
              <Route
                path="taller/planificacion-orden-trabajo"
                element={<WorkOrderPlanningPage />}
              />
              <Route
                path="taller/planificacion-orden-trabajo/agregar"
                element={<AddWorkOrderPlanningPage />}
              />
              <Route
                path="taller/trabajos-asignados"
                element={<AssignedWorkPage />}
              />
              <Route
                path="taller/comprobante-venta-taller"
                element={<SalesReceiptsTallerPage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* GP - GESTION DEL SISTEMA */}
            {/* ======================================================== */}
            <Route
              path="/gp/gestion-del-sistema"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GPGestionSistemaLayout>
                    <Outlet />
                  </GPGestionSistemaLayout>
                </Suspense>
              }
            >
              {/* Dashboard Principal */}
              <Route index element={<ModulePage />} />

              <Route path="roles" element={<RolePage />} />
              <Route path="roles/permisos/:id" element={<PermissionPage />} />
              <Route path="usuarios" element={<UserPage />} />
              <Route path="usuarios/agregar" element={<AddUserPage />} />
              <Route
                path="usuarios/actualizar/:id"
                element={<UpdateUserPage />}
              />
              <Route path="vistas" element={<ViewPage />} />
              <Route path="vistas/agregar" element={<AddViewPage />} />
              <Route
                path="vistas/actualizar/:id"
                element={<UpdateViewPage />}
              />
              <Route
                path="vistas/permisos/:id"
                element={<ViewPermissionsPage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* GP - GESTION HUMANA */}
            {/* ======================================================== */}
            <Route
              path="/gp/gestion-humana"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GPGestionHumanaLayout>
                    <Outlet />
                  </GPGestionHumanaLayout>
                </Suspense>
              }
            >
              {/* Administración de Personal */}
              <Route
                path="gestion-de-personal/trabajadores"
                element={<WorkersPage />}
              />
              <Route
                path="gestion-de-personal/trabajadores/actualizar/:id"
                element={<UpdateWorkerSignaturePage />}
              />

              <Route
                path="viaticos"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Outlet />
                  </Suspense>
                }
              >
                <Route index element={<ModulePage />} />

                {/* Administración de Categoria Viaticos */}
                <Route
                  path="categoria-viaticos"
                  element={<PerDiemCategoryPage />}
                />

                {/* Administración de Politica Viaticos */}
                <Route
                  path="politica-viaticos"
                  element={<PerDiemPolicyPage />}
                />
                <Route
                  path="politica-viaticos/agregar"
                  element={<AddPerDiemPolicyPage />}
                />
                <Route
                  path="politica-viaticos/actualizar/:id"
                  element={<UpdatePerDiemPolicyPage />}
                />

                {/* Administración de Tipos de Gasto */}
                <Route path="tipo-gasto" element={<ExpenseTypePage />} />

                {/* Administración de Tarifas de Viáticos */}
                <Route path="tarifa" element={<PerDiemRatePage />} />
                <Route path="tarifa/agregar" element={<AddPerDiemRatePage />} />
                <Route
                  path="tarifa/actualizar/:id"
                  element={<UpdatePerDiemRatePage />}
                />

                {/* Administración de Convenios de Hoteles */}
                <Route
                  path="convenios-hoteles"
                  element={<HotelAgreementPage />}
                />
                <Route
                  path="convenios-hoteles/agregar"
                  element={<AddHotelAgreementPage />}
                />
                <Route
                  path="convenios-hoteles/actualizar/:id"
                  element={<UpdateHotelAgreementPage />}
                />

                {/* Asignación de Asistentes */}
                <Route
                  path="asignacion-asistentes"
                  element={<AccountantDistrictAssignmentPage />}
                />

                {/* Administración de Solicitud de Viaticos */}
                <Route
                  path={PER_DIEM_REQUEST_ROUTE}
                  element={<PerDiemRequestPage />}
                />
                <Route
                  path={`${PER_DIEM_REQUEST_ROUTE}/:id`}
                  element={<PerDiemRequestDetailAdminPage />}
                />
                <Route
                  path={`${PER_DIEM_REQUEST_ROUTE}/:id/reserva-hotel/agregar`}
                  element={<AddAdminHotelReservationPage />}
                />
                <Route
                  path={`${PER_DIEM_REQUEST_ROUTE}/:id/reserva-hotel/actualizar/:reservationId`}
                  element={<UpdateAdminHotelReservationPage />}
                />
                <Route
                  path={`${PER_DIEM_REQUEST_ROUTE}/:id/deposito`}
                  element={<UploadDepositPage />}
                />
              </Route>

              {/* Configuraciones */}
              <Route
                path="configuraciones/posiciones"
                element={<PositionsPage />}
              />

              {/* Configuraciones */}
              <Route
                path="configuraciones/posiciones/agregar"
                element={<AddPositionPage />}
              />

              {/* Configuraciones */}
              <Route
                path="configuraciones/posiciones/actualizar/:id"
                element={<UpdatePositionPage />}
              />

              {/* Evaluaciones de Desempeño */}
              <Route
                path="evaluaciones-de-desempeno"
                element={<ModulePerformanceEvaluationPage />}
              />

              {RouterCrud(
                "evaluaciones-de-desempeno/categorias-jerarquicas",
                <HierarchicalCategoryPage />,
                <AddHierarchicalCategoryPage />,
                <UpdateHierarchicalCategoryPage />,
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/ciclos",
                <CyclePage />,
                <AddCyclePage />,
                <UpdateCyclePage />,
                <CyclePersonDetailPage />,
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/competencias",
                <CompetencesPage />,
                <AddCompetencePage />,
                <UpdateCompetencePage />,
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/evaluaciones",
                <EvaluationPage />,
                <AddEvaluationPage />,
                <UpdateEvaluationPage />,
                <EvaluationPersonPage />,
              )}

              <Route
                path="evaluaciones-de-desempeno/evaluaciones/detalles/:id"
                element={<EvaluationDetailPage />}
              />

              <Route
                path="evaluaciones-de-desempeno/evaluaciones/detalles/:id/:person"
                element={<EvaluationDetailPersonPage />}
              />

              <Route
                path="evaluaciones-de-desempeno/excluidos"
                element={<ExcludedPage />}
              />

              {RouterCrud(
                "evaluaciones-de-desempeno/metricas",
                <MetricPage />,
                <AddMetricPage />,
                <UpdateMetricPage />,
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/objetivos",
                <ObjectivePage />,
                <AddObjectivePage />,
                <UpdateObjectivePage />,
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/parametros",
                <ParameterPage />,
                <AddParameterPage />,
                <UpdateParameterPage />,
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/periodos",
                <PeriodPage />,
                <AddPeriodPage />,
                <UpdatePeriodPage />,
              )}

              <Route
                path="evaluaciones-de-desempeno/asignacion-pares"
                element={<EvaluatorParPage />}
              />

              {RouterCrud(
                "evaluaciones-de-desempeno/modelo-evaluacion",
                <EvaluationModelPage />,
                <AddEvaluationModelPage />,
                <UpdateEvaluationModelPage />,
              )}

              {/* Planillas */}
              {/* Conceptos */}
              {RouterCrud(
                "planillas/conceptos",
                <PayrollConceptsPage />,
                <AddPayrollConceptPage />,
                <UpdatePayrollConceptPage />,
              )}
              {/* Dia Trabajo */}
              {RouterCrud(
                "planillas/dia-trabajo",
                <WorkSchedulesPage />,
                <WorkSchedulesPage />,
                <WorkSchedulesPage />,
              )}
              {/* Periodos */}
              {RouterCrud(
                "planillas/periodos",
                <PayrollPeriodsPage />,
                <AddPayrollPeriodPage />,
                <UpdatePayrollPeriodPage />,
              )}
              {/* Tipo de Dia de Trabajo */}
              {RouterCrud(
                "planillas/tipo-dia-trabajo",
                <WorkTypePage />,
                <AddWorkTypePage />,
                <UpdateWorkTypePage />,
              )}
              <Route
                path="planillas/tipo-dia-trabajo/segmentos/:id"
                element={<ManageSegmentsPage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* GP - MAESTRO GENERAL */}
            {/* ======================================================== */}
            <Route
              path="/gp/maestro-general"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GPMaestroGeneralLayout>
                    <Outlet />
                  </GPMaestroGeneralLayout>
                </Suspense>
              }
            >
              {/* Dashboard Principal */}
              <Route index element={<ModulePage />} />

              <Route
                path="maestros-generales"
                element={<GeneralMastersPage />}
              />
              <Route path="sede" element={<SedePage />} />
              <Route path="sede/agregar" element={<AddSedePage />} />
              <Route path="sede/actualizar/:id" element={<UpdateSedePage />} />
            </Route>

            {/* ======================================================== */}
            {/* GP - TICS */}
            {/* ======================================================== */}
            <Route
              path="/gp/tics"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <GPTicsLayout>
                    <Outlet />
                  </GPTicsLayout>
                </Suspense>
              }
            >
              <Route index element={<TICsModulePage />} />
              <Route path="auditoria" element={<AuditLogsPage />} />
              {RouterCrud(
                "equipos",
                <EquipmentPage />,
                <AddEquipmentPage />,
                <UpdateEquipmentPage />,
              )}
              <Route path="tipos-de-equipo" element={<EquipmentTypePage />} />
              {RouterCrud(
                PHONE_LINE.ROUTE,
                <PhoneLinePage />,
                <AddPhoneLinePage />,
                <UpdatePhoneLinePage />,
              )}
            </Route>

            {/* ======================================================== */}
            {/* TP - COMERCIAL */}
            {/* ======================================================== */}

            <Route
              path="/tp/comercial"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <TPComercialLayout>
                    <Outlet />
                  </TPComercialLayout>
                </Suspense>
              }
            >
              <Route path="control-viajes" element={<ControlTravelPage />} />
              <Route path="control-fletes" element={<ControlFreightPage />} />
              <Route path="control-metas" element={<ControlGoalPage />} />
              <Route
                path="control-asignacionVehiculos"
                element={<ControlVehicleAssignmentPage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* DYNAMIC ROUTES (Company/Module/Submodule) */}
            {/* ======================================================== */}
            <Route
              path="/:company/:module"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <DashboardLayout>
                    <Outlet />
                  </DashboardLayout>
                </Suspense>
              }
            >
              <Route index element={<CompanyModulePage />} />
              <Route
                path=":submodule"
                element={<CompanyModuleSubmodulePage />}
              />
            </Route>
          </Route>

          {/* ============================================================ */}
          {/* 404 NOT FOUND */}
          {/* ============================================================ */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
