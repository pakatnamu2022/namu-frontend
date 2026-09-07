import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuthStore } from "./features/auth/lib/auth.store";
import { AuthInitializer } from "./shared/components/AuthInitializer";
import { TitleUpdater } from "./components/TitleUpdater";
import { FC, JSX, Suspense, lazy, useEffect } from "react";
import type { ComponentType } from "react";

// ============================================================================
// LAZY PAGES + PREFETCH
// Cada página es un chunk aparte (arranque rápido). Después del primer render
// se descargan todas en segundo plano, sin bloquear, para que navegar entre
// pantallas sea instantáneo (sin spinner).
// ============================================================================
type Loader = () => Promise<{ default: ComponentType<unknown> }>;
const pageLoaders: Loader[] = [];
const lazyPage = (loader: Loader) => {
  pageLoaders.push(loader);
  return lazy(loader);
};

// Quita el overlay del logo apenas React montó y pintó el shell.
// No espera datos: la app aparece "vacía" y se va llenando sola sin loaders.
function BootScreen() {
  useEffect(() => {
    const el = document.getElementById("app-boot");
    if (!el) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add("app-boot-hide");
        window.setTimeout(() => el.remove(), 250);
      });
    });
  }, []);
  return null;
}

function RoutePrefetcher() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  useEffect(() => {
    // Solo precarga cuando el usuario ya entró (no en el login).
    if (!isAuthenticated) return;
    if (typeof navigator !== "undefined") {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } })
        .connection;
      if (conn?.saveData) return;
    }

    let cancelled = false;
    let idx = 0;
    const CONCURRENCY = 3;
    const GAP_MS = 250;

    const runNext = (): void => {
      if (cancelled) return;
      const i = idx++;
      if (i >= pageLoaders.length) return;
      pageLoaders[i]()
        .catch(() => {})
        .finally(() => {
          if (!cancelled) window.setTimeout(runNext, GAP_MS);
        });
    };

    const kickoff = window.setTimeout(() => {
      for (let k = 0; k < CONCURRENCY; k++) runNext();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearTimeout(kickoff);
    };
  }, [isAuthenticated]);
  return null;
}
const ModulePerformanceEvaluationPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/page"));
const HierarchicalCategoryPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/page"));
const AddHierarchicalCategoryPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/agregar/page"));
const CyclePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/page"));
const AddCyclePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/agregar/page"));
const UpdateCyclePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/actualizar/[id]/page"));
const CyclePersonDetailPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/[id]/page"));
const CompetencesPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/page"));
const AddCompetencePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/agregar/page"));
const UpdateCompetencePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/actualizar/[id]/page"));
const EvaluationPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/page"));
const AddEvaluationPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/agregar/page"));
const UpdateEvaluationPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/actualizar/[id]/page"));
const EvaluationPersonPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/[id]/page"));
const EvaluationDetailPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/page"));
const EvaluationDetailPersonPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/[person]/page"));
const EvaluationCompetenceDetailPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/competencias/page"));
const AgendaPage = lazyPage(() => import("./app/ap/comercial/agenda/page"));
const OpportunitiesKanbanPage = lazyPage(() => import("./app/ap/comercial/agenda/oportunidades/page"));
const AddOpportunityPage = lazyPage(() => import("./app/ap/comercial/agenda/oportunidades/agregar/page"));
const UpdateOpportunityPage = lazyPage(() => import("./app/ap/comercial/agenda/oportunidades/actualizar/[id]/page"));
const OpportunityDetailPage = lazyPage(() => import("./app/ap/comercial/agenda/oportunidades/[id]/page"));
const CustomersPage = lazyPage(() => import("./app/ap/comercial/clientes/page"));
const AddCustomersPage = lazyPage(() => import("./app/ap/comercial/clientes/agregar/page"));
const UpdateCustomersPage = lazyPage(() => import("./app/ap/comercial/clientes/actualizar/[id]/page"));
const CustomerEstablishmentsListPage = lazyPage(() => import("./app/ap/comercial/clientes/establecimientos/[id]/page"));
const AddCustomerEstablishmentPage = lazyPage(() => import("./app/ap/comercial/clientes/establecimientos/[id]/agregar/page"));
const UpdateCustomerEstablishmentPage = lazyPage(() => import("./app/ap/comercial/clientes/establecimientos/[id]/actualizar/[establishmentId]/page"));
const MarketingDashboardPage = lazyPage(() => import("./app/ap/comercial/marketing/page"));
const MarketingPlansPage = lazyPage(() => import("./app/ap/comercial/marketing/planes/page"));
const AddMarketingPlanPage = lazyPage(() => import("./app/ap/comercial/marketing/planes/agregar/page"));
const UpdateMarketingPlanPage = lazyPage(() => import("./app/ap/comercial/marketing/planes/actualizar/[id]/page"));
const MarketingBudgetsPage = lazyPage(() => import("./app/ap/comercial/marketing/presupuestos/page"));
const AddMarketingBudgetPage = lazyPage(() => import("./app/ap/comercial/marketing/presupuestos/agregar/page"));
const UpdateMarketingBudgetPage = lazyPage(() => import("./app/ap/comercial/marketing/presupuestos/actualizar/[id]/page"));
const MarketingActivitiesPage = lazyPage(() => import("./app/ap/comercial/marketing/actividades/page"));
const AddMarketingActivityPage = lazyPage(() => import("./app/ap/comercial/marketing/actividades/agregar/page"));
const UpdateMarketingActivityPage = lazyPage(() => import("./app/ap/comercial/marketing/actividades/actualizar/[id]/page"));
const MarketingProposalsPage = lazyPage(() => import("./app/ap/comercial/marketing/propuestas/page"));
const AddMarketingProposalPage = lazyPage(() => import("./app/ap/comercial/marketing/propuestas/agregar/page"));
const UpdateMarketingProposalPage = lazyPage(() => import("./app/ap/comercial/marketing/propuestas/actualizar/[id]/page"));
const MarketingPurchaseOrdersPage = lazyPage(() => import("./app/ap/comercial/marketing/ordenes-compra/page"));
const AddMarketingPurchaseOrderPage = lazyPage(() => import("./app/ap/comercial/marketing/ordenes-compra/agregar/page"));
const UpdateMarketingPurchaseOrderPage = lazyPage(() => import("./app/ap/comercial/marketing/ordenes-compra/actualizar/[id]/page"));
const MarketingSupportsPage = lazyPage(() => import("./app/ap/comercial/marketing/sustentos/page"));
const AddMarketingSupportPage = lazyPage(() => import("./app/ap/comercial/marketing/sustentos/agregar/page"));
const MarketingKpisPage = lazyPage(() => import("./app/ap/comercial/marketing/kpis/page"));
const AddMarketingKpiPage = lazyPage(() => import("./app/ap/comercial/marketing/kpis/agregar/page"));
const UpdateMarketingKpiPage = lazyPage(() => import("./app/ap/comercial/marketing/kpis/actualizar/[id]/page"));
const SuppliersPage = lazyPage(() => import("./app/ap/comercial/proveedores/page"));
const AddSupplierPage = lazyPage(() => import("./app/ap/comercial/proveedores/agregar/page"));
const UpdateSuppliersPage = lazyPage(() => import("./app/ap/comercial/proveedores/actualizar/[id]/page"));
const SupplierEstablishmentsListPage = lazyPage(() => import("./app/ap/comercial/proveedores/establecimientos/[id]/page"));
const AddSupplierEstablishmentPage = lazyPage(() => import("./app/ap/comercial/proveedores/establecimientos/[id]/agregar/page"));
const UpdateSupplierEstablishmentPage = lazyPage(() => import("./app/ap/comercial/proveedores/establecimientos/[id]/actualizar/[establishmentId]/page"));
const ElectronicDocumentsPage = lazyPage(() => import("./app/ap/comercial/electronic-documents/page"));
const AddElectronicDocumentPage = lazyPage(() => import("./app/ap/comercial/electronic-documents/agregar/page.tsx"));
const UpdateElectronicDocumentPage = lazyPage(() => import("./app/ap/comercial/electronic-documents/actualizar/[id]/page"));
const AddCreditNotePage = lazyPage(() => import("./app/ap/comercial/electronic-documents/[id]/credit-note/page"));
const UpdateCreditNotePage = lazyPage(() => import("./app/ap/comercial/electronic-documents/[id]/credit-note/actualizar/[credit]/page"));
const AddDebitNotePage = lazyPage(() => import("./app/ap/comercial/electronic-documents/[id]/debit-note/page"));
const UpdateDebitNotePage = lazyPage(() => import("./app/ap/comercial/electronic-documents/[id]/debit-note/actualizar/[debit]/page"));
const VehiclesPage = lazyPage(() => import("./app/ap/comercial/vehiculos/page"));
const VehiclePurchaseOrderPage = lazyPage(() => import("./app/ap/comercial/compra-vehiculo-nuevo/page"));
const AddVehiclePurchaseOrderPage = lazyPage(() => import("./app/ap/comercial/compra-vehiculo-nuevo/agregar/page"));
const ResendVehiclePurchaseOrderPage = lazyPage(() => import("./app/ap/comercial/compra-vehiculo-nuevo/reenviar/[id]/page"));
const VehicleDeliveryPage = lazyPage(() => import("./app/ap/comercial/entrega-vehiculo/page"));
const AddVehicleDeliveryPage = lazyPage(() => import("./app/ap/comercial/entrega-vehiculo/agregar/page"));
const ShippingGuidePage = lazyPage(() => import("./app/ap/comercial/entrega-vehiculo/guia-remision/[id]/page"));
const DeliveryChecklistPage = lazyPage(() => import("./app/ap/comercial/entrega-vehiculo/checklist/[id]/page"));
const VehicleDeliveryApprovalPage = lazyPage(() => import("./app/ap/comercial/entrega-vehiculo/[id]/aprobacion/page"));
const ShipmentsReceptionsPage = lazyPage(() => import("./app/ap/comercial/envios-recepciones/page"));
const AddShipmentsReceptionsPage = lazyPage(() => import("./app/ap/comercial/envios-recepciones/agregar/page"));
const UpdateShipmentsReceptionsPage = lazyPage(() => import("./app/ap/comercial/envios-recepciones/actualizar/[id]/page"));
const ReceptionCheckListPage = lazyPage(() => import("./app/ap/comercial/envios-recepciones/checklist/[id]/page"));
const TransfersPage = lazyPage(() => import("./app/ap/comercial/traslados/page"));
const AddTransferPage = lazyPage(() => import("./app/ap/comercial/traslados/agregar/page"));
const AssetsPage = lazyPage(() => import("./app/ap/comercial/activos/page"));
const AddAssetPage = lazyPage(() => import("./app/ap/comercial/activos/agregar/page"));
const StoreVisitsPage = lazyPage(() => import("./app/ap/comercial/visitas-tienda/page"));
const AddStoreVisitsPage = lazyPage(() => import("./app/ap/comercial/visitas-tienda/agregar/page"));
const UpdateStoreVisitsPage = lazyPage(() => import("./app/ap/comercial/visitas-tienda/actualizar/[id]/page"));
const ManageLeadsPage = lazyPage(() => import("./app/ap/comercial/gestionar-leads/page"));
const PurchaseRequestQuotePage = lazyPage(() => import("./app/ap/comercial/solicitudes-cotizaciones/page"));
const AddPurchaseRequestQuotePage = lazyPage(() => import("./app/ap/comercial/solicitudes-cotizaciones/[opportunity_id]/agregar/page"));
const UpdatePurchaseRequestQuotePage = lazyPage(() => import("./app/ap/comercial/solicitudes-cotizaciones/actualizar/[id]/page"));
const AdjustmentRequestInboxPage = lazyPage(() => import("./app/ap/comercial/solicitudes-cotizaciones/ajustes-margen/page"));
const AdjustmentRequestDetailPage = lazyPage(() => import("./app/ap/comercial/solicitudes-cotizaciones/ajustes-margen/[id]/page"));
const RequestAdjustmentPage = lazyPage(() => import("./app/ap/comercial/solicitudes-cotizaciones/ajustes-margen/agregar/[quoteId]/page"));
const DeclaracionJuradaKycPage = lazyPage(() => import("./app/ap/comercial/declaracion-jurada-kyc/page"));
const AddDeclaracionJuradaKycPage = lazyPage(() => import("./app/ap/comercial/declaracion-jurada-kyc/agregar/page"));
const UpdateDeclaracionJuradaKycPage = lazyPage(() => import("./app/ap/comercial/declaracion-jurada-kyc/actualizar/[id]/page"));
const DashboardStoreVisitsPage = lazyPage(() => import("./app/ap/comercial/dashboard-visitas-leads/page"));
const ReasonsRejectionPage = lazyPage(() => import("./app/ap/comercial/motivos-descarte/page"));
const ReportesComercialPage = lazyPage(() => import("./app/ap/comercial/reportes/page"));
import { NotFoundBoundary } from "./shared/components/NotFoundBoundary";
const ExcludedPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/excluidos/page"));
const MetricPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/page"));
const AddMetricPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/agregar/page"));
const UpdateMetricPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/actualizar/[id]/page"));
const ObjectivePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/page"));
const AddObjectivePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/agregar/page"));
const UpdateObjectivePage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/actualizar/[id]/page"));
const ParameterPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/page"));
const AddParameterPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/agregar/page"));
const UpdateParameterPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/actualizar/[id]/page"));
const PeriodPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/page"));
const AddPeriodPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/agregar/page"));
const UpdatePeriodPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/actualizar/[id]/page"));
const EvaluatorParPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/asignacion-pares/page"));
const ReportByPeriodsEvaluationPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/reporte-evaluacion-por-periodos/page"));
const EvaluationModelPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/page"));
const AddEvaluationModelPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/agregar/page"));
const UpdateEvaluationModelPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/actualizar/[id]/page"));
const MyPerformance = lazyPage(() => import("./app/perfil/mi-desempeno/page"));
const VacationPage = lazyPage(() => import("./app/perfil/vacaciones/page"));
import ModulePage from "./components/ModulePage";
const CommercialPage = lazyPage(() => import("./app/ap/comercial/page.tsx"));
const DashboardDeliveryPage = lazyPage(() => import("./app/ap/comercial/dashboard-entregas/page.tsx"));
const TeamLeadsDashboard = lazyPage(() => import("./app/ap/comercial/dashboard-equipo-leads/page.tsx"));
const ExhibitionVehiclesPage = lazyPage(() => import("./app/ap/comercial/vehiculos-exhibicion/page"));
const AddExhibitionVehiclesPage = lazyPage(() => import("./app/ap/comercial/vehiculos-exhibicion/agregar/page"));
const UpdateExhibitionVehiclesPage = lazyPage(() => import("./app/ap/comercial/vehiculos-exhibicion/actualizar/[id]/page"));
const PositionsPage = lazyPage(() => import("./app/gp/gestion-humana/configuraciones/posiciones/page"));
const AddPositionPage = lazyPage(() => import("./app/gp/gestion-humana/configuraciones/posiciones/agregar/page"));

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
import TPConfiguracionesLayout from "./app/tp/configuraciones/layout";
// ============================================================================
// ROOT & PUBLIC PAGES
// ============================================================================
import LoginPage from "./app/page";
import NotFoundPage from "./app/not-found";
const ConfirmacionCotizacionPage = lazyPage(() => import("./app/confirmacion-cotizacion/[token]/page"));
const EntregaExtraordinariaConfirmacionPage = lazyPage(() => import("./app/entregas-extraordinarias/confirmacion/page"));
const ForgotPasswordPage = lazyPage(() => import("./app/forgot-password/page"));
const ResetPasswordPage = lazyPage(() => import("./app/reset-password/page"));
const TwoFactorVerifyPage = lazyPage(() => import("./app/2fa-verify/page"));
const CompaniesPage = lazyPage(() => import("./app/companies/page.tsx"));
const ModulesCompanyPage = lazyPage(() => import("./app/modules/[company]/page.tsx"));
const ModulesCompanyModulePage = lazyPage(() => import("./app/modules/[company]/[module]/page.tsx"));
const FeedRoutePage = lazyPage(() => import("./app/feed/page.tsx"));
const TestPage = lazyPage(() => import("./app/test/page.tsx"));
const TrainingPage = lazyPage(() => import("./app/perfil/capacitaciones/page.tsx"));
const DocumentPage = lazyPage(() => import("./app/perfil/documentos/page.tsx"));
const TeamPage = lazyPage(() => import("./app/perfil/equipo/page.tsx"));
const TeamIndicatorsPage = lazyPage(() => import("./app/perfil/equipo/indicadores/page.tsx"));
const TeamHierarchyPage = lazyPage(() => import("./app/perfil/equipo/jerarquica/page.tsx"));
const NamuPerformancePage = lazyPage(() => import("./app/perfil/equipo/[id]/page.tsx"));
const NamuPerformanceEvaluationPage = lazyPage(() => import("./app/perfil/equipo/[id]/evaluar/page.tsx"));
const NamuPerformanceHistoryPage = lazyPage(() => import("./app/perfil/equipo/[id]/historial/page.tsx"));
const PlanDesarrolloPage = lazyPage(() => import("./app/perfil/equipo/[id]/plan-desarrollo/page.tsx"));
const CrearPlanDesarrolloPage = lazyPage(() => import("./app/perfil/equipo/[id]/plan-desarrollo/agregar/page.tsx"));
const EconomicActivityPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/actividad-economica/page.tsx"));
const WarehousePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/almacenes/page.tsx"));
const AddWarehousePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/almacenes/agregar/page.tsx"));
const UpdateWarehousePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/almacenes/actualizar/[id]/page.tsx"));
const UserSeriesAssignmentPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/asignar-serie-usuario/page.tsx"));
const AddUserSeriesAssignmentPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/asignar-serie-usuario/agregar/page.tsx"));
const UpdateUserSeriesAssignmentPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/asignar-serie-usuario/actualizar/[id]/page.tsx"));
const AssignSalesSeriesPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/series/page.tsx"));
const AddAssignSalesSeriesPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/series/agregar/page.tsx"));
const UpdateAssignSalesSeriesPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/series/actualizar/[id]/page.tsx"));
const BankPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/bancos/page.tsx"));
const CampaignPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/campanas/page.tsx"));
const AddCampaignPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/campanas/agregar/page.tsx"));
const UpdateCampaignPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/campanas/actualizar/[id]/page.tsx"));
const ApBankPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/chequeras/page.tsx"));
const AddApBankPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/chequeras/agregar/page.tsx"));
const UpdateApBankPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/chequeras/actualizar/[id]/page.tsx"));
const ClassArticlePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/clase-articulo/page.tsx"));
const AddClassArticlePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/clase-articulo/agregar/page.tsx"));
const UpdateClassArticlePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/clase-articulo/actualizar/[id]/page.tsx"));
const MaritalStatusPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/estado-civil/page.tsx"));
const ClientOriginPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/origen-cliente/page.tsx"));
const AccountingAccountPlanPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/plan-cuenta-contable/page.tsx"));
const PersonSegmentPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/segmentos-persona/page.tsx"));
const TaxClassTypesPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-clase-impuesto/page.tsx"));
const VoucherTypesPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-comprobante/page.tsx"));
const AccountingAccountTypePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-cuenta-contable/page.tsx"));
const DocumentTypePage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-documento/page.tsx"));
const CurrencyTypesPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-moneda/page.tsx"));
const TypesOperationPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-operacion/page.tsx"));
const TypeClientPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-persona/page.tsx"));
const TypeGenderPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/tipos-sexo/page.tsx"));
const DistrictPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/ubigeos/page.tsx"));
const AddDistrictPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/ubigeos/agregar/page.tsx"));
const UpdateDistrictPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/ubigeos/actualizar/[id]/page.tsx"));
const UnitMeasurementPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/unidad-medida/page.tsx"));
const VehicleCategoryPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/categorias/page.tsx"));
const CategoryChecklistPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/categorias-checklist/page.tsx"));
const ReceptionChecklistPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/checklist-recepcion/page.tsx"));
const VehicleColorPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/colores-vehiculo/page.tsx"));
const VehicleStatusPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/estados-vehiculo/page.tsx"));
const AddVehicleStatusPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/estados-vehiculo/agregar/page.tsx"));
const UpdateVehicleStatusPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/estados-vehiculo/actualizar/[id]/page.tsx"));
const FamiliesPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/familias/page.tsx"));
const BrandGroupPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/grupo-marcas/page.tsx"));
const BrandsPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/marcas/page.tsx"));
const AddBrandsPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/marcas/agregar/page.tsx"));
const UpdateBrandPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/marcas/actualizar/[id]/page.tsx"));
const ModelsVnPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/modelos-vn/page.tsx"));
const AddModelsVnPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/modelos-vn/agregar/page.tsx"));
const UpdateModelsVnPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/modelos-vn/actualizar/[id]/page.tsx"));
const ModelsVnPvPage = lazyPage(() => import("./app/ap/post-venta/taller/modelos-vn-taller/page.tsx"));
const ModelsVnRepuestosPage = lazyPage(() => import("./app/ap/post-venta/repuestos/modelos-vn-repuestos/page.tsx"));
const TypeVehicleOriginPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/origen-vehiculo/page.tsx"));
const BodyTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-carroceria/page.tsx"));
const FuelTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-combustible/page.tsx"));
const EngineTypesPage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-motor/page.tsx"));
const SupplierOrderTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-pedido-proveedor/page.tsx"));
const ProductTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-producto/page.tsx"));
const TractionTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-traccion/page.tsx"));
const VehicleTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/tipos-vehiculo/page.tsx"));
const GearShiftTypePage = lazyPage(() => import("./app/ap/configuraciones/vehiculos/transmision-vehiculo/page.tsx"));
const AfterSalesParameterPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/parametros/page.tsx"));
const ReasonsAdjustmentPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/motivos-ajuste/page.tsx"));
const ReasonDiscardingTallerPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/motivos-descarte-taller/page.tsx"));
const ReasonDiscardingSparePartPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/motivos-descarte-repuesto/page.tsx"));
const TypesOperationsAppointmentPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/tipos-operacion-cita/page.tsx"));
const TypesPlanningPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/tipos-planificacion/page.tsx"));
const ConceptObjectivePvPage = lazyPage(() => import("./app/ap/configuraciones/post-venta/objetivos-taller-meson/page.tsx"));
const CommercialManagerBrandGroupPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-grupo-marca/page.tsx"));
const AddCommercialManagerBrandGroupPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-grupo-marca/agregar/page.tsx"));
const UpdateCommercialManagerBrandGroupPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-grupo-marca/actualizar/[id]/page.tsx"));
const AssignmentLeadershipPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-jefe/page.tsx"));
const AddAssignmentLeadershipPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-jefe/agregar/page.tsx"));
const UpdateAssignmentLeadershipPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-jefe/actualizar/[id]/page.tsx"));
const AssignBrandConsultantPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-marca/page.tsx"));
const AddAssignBrandConsultantPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-marca/gestionar/page.tsx"));
const AssignCompanyBranchPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-sede/page.tsx"));
const AddAssignCompanyBranchPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-sede/agregar/page.tsx"));
const UpdateAssignCompanyBranchPage = lazyPage(() => import("./app/ap/configuraciones/ventas/asignar-sede/actualizar/[id]/page.tsx"));
const ApSafeCreditGoalPage = lazyPage(() => import("./app/ap/configuraciones/ventas/metas-credito-seguro/page.tsx"));
const ApGoalSellOutInPage = lazyPage(() => import("./app/ap/configuraciones/ventas/metas-venta/page.tsx"));
const AddApGoalSellOutInPage = lazyPage(() => import("./app/ap/configuraciones/ventas/metas-venta/gestionar/page.tsx"));
const ApGoalSellOutInSummaryPage = lazyPage(() => import("./app/ap/configuraciones/ventas/metas-venta/resumen/page.tsx"));
const ShopPage = lazyPage(() => import("./app/ap/configuraciones/ventas/tiendas/page.tsx"));
const WarehouseManagementPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/page.tsx"));
const ProductCategoryPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/categorias-producto/page.tsx"));
const BrandsPVPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/marcas-producto/page.tsx"));
const AddBrandsPVPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/marcas-producto/agregar/page.tsx"));
const UpdateBrandsPVPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/marcas-producto/actualizar/[id]/page.tsx"));
const ProductPVPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/productos/page.tsx"));
const AddProductPVPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/productos/agregar/page.tsx"));
const UpdateProductPVPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/productos/actualizar/[id]/page.tsx"));
const AssignWarehousePage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/productos/asignar-almacen/[id]/page.tsx"));
const ProductTransferPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/guia-remision/page.tsx"));
const AddProductTransferPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/guia-remision/agregar/page.tsx"));
const UpdateProductTransferPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/guia-remision/actualizar/[id]/page.tsx"));
const TransferReceptionsPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/guia-remision/recepcion/[productTransferId]/page.tsx"));
const CreateTransferReceptionPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/guia-remision/recepcion/agregar/[productTransferId]/page.tsx"));
const AdjustmentsProductPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/ajuste-producto/page.tsx"));
const AddAdjustmentsProductPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/ajuste-producto/agregar/page.tsx"));
const UpdateAdjustmentsProductPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/ajuste-producto/actualizar/[id]/page.tsx"));
const ProductShelfPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/estantes-almacen/page.tsx"));
const ManageShelfProductsPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/estantes-almacen/gestionar/[id]/page.tsx"));
const InventoryPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/inventario/page.tsx"));
const InventoryKardexPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/inventario/kardex/page.tsx"));
const ProductKardexPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/inventario/movimientos/[productId]/[warehouseId]/page.tsx"));
const PurchaseHistoryPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/inventario/historico-compras/[productId]/[warehouseId]/page.tsx"));
const PriceCalculationPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/inventario/historico-compras/[productId]/[warehouseId]/precio-calculo/page.tsx"));
const ComparativaDynamicsPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/inventario/comparativa-dynamics/page.tsx"));
const ReceptionsProductsPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/compra-proveedor/recepcionar/[supplierOrderId]/page.tsx"));
const UpdateReceptionProductPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/compra-proveedor/recepcionar/actualizar/[supplierOrderId]/[id]/page.tsx"));
const AddReceptionProductPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/compra-proveedor/recepcionar/agregar/[supplierOrderId]/page.tsx"));
const SupplierOrderPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/compra-proveedor/page.tsx"));
const AddSupplierOrderPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/compra-proveedor/agregar/page.tsx"));
const UpdateSupplierOrderPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/compra-proveedor/actualizar/[id]/page.tsx"));
const InvoiceReceptionPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/compra-proveedor/recepcionar/facturar/[receptionId]/page.tsx"));
const PurchaseOrderWarehousePage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/factura-compra/page.tsx"));
const ResendWarehousePurchaseOrderPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/factura-compra/reenviar/[id]/page.tsx"));
const WarehousePurchaseRequestPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/solicitud-compra-almacen/page.tsx"));
const AddWarehousePurchaseRequestPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/solicitud-compra-almacen/agregar/page.tsx"));
const UpdateWarehousePurchaseRequestPage = lazyPage(() => import("@/app/ap/post-venta/gestion-de-almacen/solicitud-compra-almacen/actualizar/[id]/page.tsx"));
const SuppliersStorePage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/proveedor-almacen/page.tsx"));
const AddSupplierStorePage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/proveedor-almacen/agregar/page.tsx"));
const UpdateSuppliersStorePage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/proveedor-almacen/actualizar/[id]/page.tsx"));
const SupplierStoreEstablishmentsListPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/proveedor-almacen/establecimientos/[id]/page.tsx"));
const AddSupplierStoreEstablishmentPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/proveedor-almacen/establecimientos/[id]/agregar/page.tsx"));
const UpdateSupplierStoreEstablishmentPage = lazyPage(() => import("./app/ap/post-venta/gestion-de-almacen/proveedor-almacen/establecimientos/[id]/actualizar/[establishmentId]/page.tsx"));
const SparePartsPage = lazyPage(() => import("./app/ap/post-venta/repuestos/page.tsx"));
const ApprovedAccesoriesPage = lazyPage(() => import("./app/ap/post-venta/repuestos/accesorios-homologados/page.tsx"));
const AddApprovedAccesoriesPage = lazyPage(() => import("./app/ap/post-venta/repuestos/accesorios-homologados/agregar/page.tsx"));
const UpdateApprovedAccesoriesPage = lazyPage(() => import("./app/ap/post-venta/repuestos/accesorios-homologados/actualizar/[id]/page.tsx"));
const OrderQuotationMesonPage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/page.tsx"));
const AddOrderQuotationMesonPage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/agregar/page.tsx"));
const UpdateOrderQuotationMesonPage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/actualizar/[id]/page.tsx"));
const RequestDiscountOrderQuotationMesonPage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/solicitar-descuento/[id]/page.tsx"));
const OrderQuotationMesonDetallePage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/detalle/[id]/page.tsx"));
const OrderQuotationMesonManagePage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/gestionar/[id]/page.tsx"));
const AprobacionProductosMesonPage = lazyPage(() => import("./app/ap/post-venta/repuestos/cotizacion-meson/aprobar/[id]/page.tsx"));
const SalesReceiptsRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/comprobante-venta-repuesto/page.tsx"));
const PurchaseRequestRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/solicitud-compra-repuesto/page.tsx"));
const AddPurchaseRequestRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/solicitud-compra-repuesto/agregar/page.tsx"));
const UpdatePurchaseRequestRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/solicitud-compra-repuesto/actualizar/[id]/page.tsx"));
const VehiclesRepuestosPage = lazyPage(() => import("./app/ap/post-venta/repuestos/vehiculos-repuestos/page.tsx"));
const AddVehiclesRepuestosPage = lazyPage(() => import("./app/ap/post-venta/repuestos/vehiculos-repuestos/agregar/page.tsx"));
const UpdateVehiclesRepuestosPage = lazyPage(() => import("./app/ap/post-venta/repuestos/vehiculos-repuestos/actualizar/[id]/page.tsx"));
const ProductRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/producto-repuesto/page.tsx"));
const AddProductRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/producto-repuesto/agregar/page.tsx"));
const UpdateProductRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/producto-repuesto/actualizar/[id]/page.tsx"));
const AssignWarehouseRepuestoPage = lazyPage(() => import("./app/ap/post-venta/repuestos/producto-repuesto/asignar-almacen/[id]/page.tsx"));
const CustomersRpPage = lazyPage(() => import("./app/ap/post-venta/repuestos/clientes-repuestos/page.tsx"));
const AddCustomersRpPage = lazyPage(() => import("./app/ap/post-venta/repuestos/clientes-repuestos/agregar/page.tsx"));
const UpdateCustomersRpPage = lazyPage(() => import("./app/ap/post-venta/repuestos/clientes-repuestos/actualizar/[id]/page.tsx"));
const CustomerRpEstablishmentsListPage = lazyPage(() => import("./app/ap/post-venta/repuestos/clientes-repuestos/establecimientos/[id]/page.tsx"));
const AddCustomerRpEstablishmentPage = lazyPage(() => import("./app/ap/post-venta/repuestos/clientes-repuestos/establecimientos/[id]/agregar/page.tsx"));
const UpdateCustomerRpEstablishmentPage = lazyPage(() => import("./app/ap/post-venta/repuestos/clientes-repuestos/establecimientos/[id]/actualizar/[establishmentId]/page.tsx"));
const WorkshopPage = lazyPage(() => import("./app/ap/post-venta/taller/page.tsx"));
const CardWashPage = lazyPage(() => import("./app/ap/post-venta/taller/lavado-vehiculo/page.tsx"));
const AppointmentPlanningPage = lazyPage(() => import("./app/ap/post-venta/taller/citas/page.tsx"));
const AddAppointmentPlanningPage = lazyPage(() => import("./app/ap/post-venta/taller/citas/agregar/page.tsx"));
const UpdateAppointmentPlanningPage = lazyPage(() => import("./app/ap/post-venta/taller/citas/actualizar/[id]/page.tsx"));
const OrderQuotationPage = lazyPage(() => import("./app/ap/post-venta/taller/cotizacion-taller/page.tsx"));
const AddOrderQuotationPage = lazyPage(() => import("./app/ap/post-venta/taller/cotizacion-taller/agregar/page.tsx"));
const UpdateOrderQuotationPage = lazyPage(() => import("@/app/ap/post-venta/taller/cotizacion-taller/actualizar/[id]/page.tsx"));
const ManageOrderQuotationPage = lazyPage(() => import("@/app/ap/post-venta/taller/cotizacion-taller/gestionar/[id]/page.tsx"));
const AprobacionProductosPage = lazyPage(() => import("@/app/ap/post-venta/taller/cotizacion-taller/aprobar/[id]/page.tsx"));
const PurchaseRequestPVPage = lazyPage(() => import("./app/ap/post-venta/taller/solicitud-compra-taller/page.tsx"));
const AddPurchaseRequestPVPage = lazyPage(() => import("./app/ap/post-venta/taller/solicitud-compra-taller/agregar/page.tsx"));
const UpdatePurchaseRequestPVPage = lazyPage(() => import("@/app/ap/post-venta/taller/solicitud-compra-taller/actualizar/[id]/page.tsx"));
const CustomersPvPage = lazyPage(() => import("./app/ap/post-venta/taller/clientes-taller/page.tsx"));
const AddCustomersPvPage = lazyPage(() => import("@/app/ap/post-venta/taller/clientes-taller/agregar/page.tsx"));
const UpdateCustomersPvPage = lazyPage(() => import("@/app/ap/post-venta/taller/clientes-taller/actualizar/[id]/page.tsx"));
const CustomerPvEstablishmentsListPage = lazyPage(() => import("./app/ap/post-venta/taller/clientes-taller/establecimientos/[id]/page.tsx"));
const AddCustomerPvEstablishmentPage = lazyPage(() => import("@/app/ap/post-venta/taller/clientes-taller/establecimientos/[id]/agregar/page.tsx"));
const UpdateCustomerPvEstablishmentPage = lazyPage(() => import("@/app/ap/post-venta/taller/clientes-taller/establecimientos/[id]/actualizar/[establishmentId]/page.tsx"));
const VehiclesPostVentaPage = lazyPage(() => import("./app/ap/post-venta/taller/vehiculos-taller/page.tsx"));
const AddVehiclePVPage = lazyPage(() => import("@/app/ap/post-venta/taller/vehiculos-taller/agregar/page.tsx"));
const UpdateVehiclePVPage = lazyPage(() => import("@/app/ap/post-venta/taller/vehiculos-taller/actualizar/[id]/page.tsx"));
const ProductTallerPage = lazyPage(() => import("./app/ap/post-venta/taller/producto-taller/page.tsx"));
const AddProductTallerPage = lazyPage(() => import("./app/ap/post-venta/taller/producto-taller/agregar/page.tsx"));
const UpdateProductTallerPage = lazyPage(() => import("./app/ap/post-venta/taller/producto-taller/actualizar/[id]/page.tsx"));
const AssignWarehouseTallerPage = lazyPage(() => import("./app/ap/post-venta/taller/producto-taller/asignar-almacen/[id]/page.tsx"));
const WorkOrderPage = lazyPage(() => import("./app/ap/post-venta/taller/orden-trabajo/page.tsx"));
const InternalNoteMigrationPage = lazyPage(() => import("./app/ap/post-venta/taller/notas-internas/page.tsx"));
const AddWorkOrderPage = lazyPage(() => import("./app/ap/post-venta/taller/orden-trabajo/agregar/page.tsx"));
const UpdateWorkOrderPage = lazyPage(() => import("./app/ap/post-venta/taller/orden-trabajo/actualizar/[id]/page.tsx"));
const ManageWorkOrderPage = lazyPage(() => import("./app/ap/post-venta/taller/orden-trabajo/gestionar/[id]/page.tsx"));
const WorkOrderReceptionPage = lazyPage(() => import("./app/ap/post-venta/taller/recepcion-orden-trabajo/page.tsx"));
const ManageWorkOrderReceptionPage = lazyPage(() => import("./app/ap/post-venta/taller/recepcion-orden-trabajo/gestionar/[id]/page.tsx"));
const GeneralInformationPage = lazyPage(() => import("./app/ap/post-venta/taller/orden-trabajo/gestionar/[id]/informacion-general/page.tsx"));
const WorkOrderPlanningPage = lazyPage(() => import("./app/ap/post-venta/taller/planificacion-orden-trabajo/page.tsx"));
const AddWorkOrderPlanningPage = lazyPage(() => import("./app/ap/post-venta/taller/planificacion-orden-trabajo/agregar/page.tsx"));
const AssignedWorkPage = lazyPage(() => import("./app/ap/post-venta/taller/trabajos-asignados/page.tsx"));
const TechnicianProductivityPage = lazyPage(() => import("./app/ap/post-venta/taller/trabajos-asignados/productividad/page.tsx"));
const VehicleInspectionPage = lazyPage(() => import("./app/ap/post-venta/taller/orden-trabajo/[workOrderId]/inspeccion/page.tsx"));
const SalesReceiptsTallerPage = lazyPage(() => import("./app/ap/post-venta/taller/comprobante-venta-taller/page.tsx"));
const CampaignSchedulePage = lazyPage(() => import("./app/ap/post-venta/taller/cronograma-campanas/page.tsx"));
const AddCampaignSchedulePage = lazyPage(() => import("./app/ap/post-venta/taller/cronograma-campanas/agregar/page.tsx"));
const BoxPage = lazyPage(() => import("./app/ap/post-venta/caja/page.tsx"));
const SalesReceiptsCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/comprobante-venta-caja/page.tsx"));
const UpdateSalesReceiptsCajaPage = lazyPage(() => import("@/app/ap/post-venta/caja/comprobante-venta-caja/actualizar/[id]/page.tsx"));
const AddGeneralSalesReceiptsCajaPage = lazyPage(() => import("@/app/ap/post-venta/caja/comprobante-venta-caja/agregar-otros/page.tsx"));
const AddHistoricalFinalSaleWithAdvanceCajaPage = lazyPage(() => import("@/app/ap/post-venta/caja/comprobante-venta-caja/agregar-otros-historico/page.tsx"));
const AddRegularizeAdvancePaymentCajaPage = lazyPage(() => import("@/app/ap/post-venta/caja/comprobante-venta-caja/agregar-regularizacion-anticipo/page.tsx"));
const AddCreditNoteCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/comprobante-venta-caja/[id]/credit-note/page.tsx"));
const UpdateCreditNoteCajaPage = lazyPage(() => import("@/app/ap/post-venta/caja/comprobante-venta-caja/[id]/credit-note/actualizar/[credit]/page.tsx"));
const AddDebitNoteCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/comprobante-venta-caja/[id]/debit-note/page.tsx"));
const UpdateDebitNoteCajaPage = lazyPage(() => import("@/app/ap/post-venta/caja/comprobante-venta-caja/[id]/debit-note/actualizar/[debit]/page.tsx"));
const OrderQuotationMesonCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/cotizacion-repuesto-caja/page.tsx"));
const WorkOrderCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/order-trabajo-taller-caja/page.tsx"));
const DirectInvoicePage = lazyPage(() => import("./app/ap/post-venta/caja/order-trabajo-taller-caja/factura-directa/page.tsx"));
const BillWorkOrderCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/order-trabajo-taller-caja/facturar/[id]/page.tsx"));
const BillOrderQuotationMesonCajaPage = lazyPage(() => import("./app/ap/post-venta/caja/cotizacion-repuesto-caja/facturar/[id]/page.tsx"));
const IndicadoresReportesPage = lazyPage(() => import("./app/ap/post-venta/indicadores-y-reportes/page.tsx"));
const ReportesPostVentaPage = lazyPage(() => import("./app/ap/post-venta/indicadores-y-reportes/reportes/page.tsx"));
const ObjectivesDashboardPage = lazyPage(() => import("./app/ap/post-venta/indicadores-y-reportes/dashboard-objetivos/page.tsx"));
const ProductivityDashboardPage = lazyPage(() => import("./app/ap/post-venta/indicadores-y-reportes/dashboard-productividad/page.tsx"));
const AdoptionDashboardPage = lazyPage(() => import("./app/gp/gestion-del-sistema/adoption-dashboard/page"));
const RolePage = lazyPage(() => import("./app/gp/gestion-del-sistema/roles/page.tsx"));
const PermissionPage = lazyPage(() => import("./app/gp/gestion-del-sistema/roles/permisos/[id]/page.tsx"));
const AddUserPage = lazyPage(() => import("./app/gp/gestion-del-sistema/usuarios/agregar/page.tsx"));
const UpdateUserPage = lazyPage(() => import("./app/gp/gestion-del-sistema/usuarios/actualizar/[id]/page.tsx"));
const ViewPage = lazyPage(() => import("./app/gp/gestion-del-sistema/vistas/page.tsx"));
const AddViewPage = lazyPage(() => import("./app/gp/gestion-del-sistema/vistas/agregar/page.tsx"));
const UpdateViewPage = lazyPage(() => import("./app/gp/gestion-del-sistema/vistas/actualizar/[id]/page.tsx"));
const ViewPermissionsPage = lazyPage(() => import("./app/gp/gestion-del-sistema/vistas/permisos/[id]/page.tsx"));
const WorkersPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/trabajadores/page.tsx"));
const UpdateWorkerSignaturePage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/trabajadores/actualizar/[id]/page.tsx"));
const RecruitmentProcessPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/procesos-postulacion/page.tsx"));
const AddRecruitmentProcessPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/procesos-postulacion/agregar/page.tsx"));
const UpdateRecruitmentProcessPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/procesos-postulacion/actualizar/[id]/page.tsx"));
const ProcessApplicantsPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/procesos-postulacion/postulantes/page.tsx"));
const ApplicantPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/postulantes/page.tsx"));
const AddApplicantPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/postulantes/agregar/page.tsx"));
const UpdateApplicantPage = lazyPage(() => import("./app/gp/gestion-humana/gestion-de-personal/postulantes/actualizar/[id]/page.tsx"));
const PerDiemCategoryPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/categoria-viaticos/page.tsx"));
const PerDiemPolicyPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/politica-viaticos/page.tsx"));
const AddPerDiemPolicyPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/politica-viaticos/agregar/page.tsx"));
const UpdatePerDiemPolicyPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/politica-viaticos/actualizar/[id]/page.tsx"));
const HotelAgreementPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/convenios-hoteles/page.tsx"));
const AddHotelAgreementPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/convenios-hoteles/agregar/page.tsx"));
const UpdateHotelAgreementPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/convenios-hoteles/actualizar/[id]/page.tsx"));
const ExpenseTypePage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/tipo-gasto/page.tsx"));
const PerDiemRatePage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/tarifa/page.tsx"));
const AddPerDiemRatePage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/tarifa/agregar/page.tsx"));
const UpdatePerDiemRatePage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/tarifa/actualizar/[id]/page.tsx"));
const PerDiemRequestPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/solicitud-viaticos/page.tsx"));
const PerDiemRequestDetailAdminPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/solicitud-viaticos/[id]/page.tsx"));
const AddAdminHotelReservationPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/solicitud-viaticos/[id]/reserva-hotel/agregar/page.tsx"));
const UpdateAdminHotelReservationPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/solicitud-viaticos/[id]/reserva-hotel/actualizar/[reservationId]/page.tsx"));
const AddPerDiemRequestPage = lazyPage(() => import("./app/perfil/viaticos/agregar/page.tsx"));
const UpdatePerDiemRequestPage = lazyPage(() => import("./app/perfil/viaticos/actualizar/[id]/page.tsx"));
const ApprovePerDiemRequestPage = lazyPage(() => import("./app/perfil/viaticos/aprobar/page.tsx"));
const ApproveSettlementPage = lazyPage(() => import("./app/perfil/viaticos/aprobar-liquidaciones/page.tsx"));
const PerDiemRequestDetailPage = lazyPage(() => import("./app/perfil/viaticos/[id]/page.tsx"));
const AddExpensePage = lazyPage(() => import("./app/perfil/viaticos/[id]/gastos/agregar/page.tsx"));
const UpdateExpensePage = lazyPage(() => import("./app/perfil/viaticos/[id]/gastos/actualizar/[expenseId]/page.tsx"));
const UploadDepositPage = lazyPage(() => import("./app/ap/contabilidad/solicitud-viaticos/[id]/deposito/page.tsx"));
const AccountantDistrictAssignmentPage = lazyPage(() => import("./app/gp/gestion-humana/viaticos/asignacion-asistentes/page.tsx"));
const UpdatePositionPage = lazyPage(() => import("./app/gp/gestion-humana/configuraciones/posiciones/actualizar/[id]/page"));
const UpdateHierarchicalCategoryPage = lazyPage(() => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/actualizar/[id]/page"));
const SedePage = lazyPage(() => import("./app/gp/maestro-general/sede/page.tsx"));
const UpdateSedePage = lazyPage(() => import("./app/gp/maestro-general/sede/actualizar/[id]/page.tsx"));
const AddSedePage = lazyPage(() => import("./app/gp/maestro-general/sede/agregar/page.tsx"));
const CompanyPage = lazyPage(() => import("./app/gp/maestro-general/empresa/page.tsx"));
const UpdateCompanyPage = lazyPage(() => import("./app/gp/maestro-general/empresa/actualizar/[id]/page.tsx"));
const TICsModulePage = lazyPage(() => import("./app/gp/tics/page.tsx"));
const EquipmentPage = lazyPage(() => import("./app/gp/tics/equipos/page.tsx"));
const AddEquipmentPage = lazyPage(() => import("./app/gp/tics/equipos/agregar/page.tsx"));
const UpdateEquipmentPage = lazyPage(() => import("./app/gp/tics/equipos/actualizar/[id]/page.tsx"));
const AuditLogsPage = lazyPage(() => import("./app/gp/tics/auditoria/page.tsx"));
const ActiveSessionsPage = lazyPage(() => import("./app/gp/tics/sesiones-activas/page.tsx"));
const ScrumProjectPage = lazyPage(() => import("./app/gp/tics/pm/proyectos/page.tsx"));
const AddScrumProjectPage = lazyPage(() => import("./app/gp/tics/pm/proyectos/agregar/page.tsx"));
const UpdateScrumProjectPage = lazyPage(() => import("./app/gp/tics/pm/proyectos/actualizar/[id]/page.tsx"));
const ScrumSprintPage = lazyPage(() => import("./app/gp/tics/pm/sprints/page.tsx"));
const AddScrumSprintPage = lazyPage(() => import("./app/gp/tics/pm/sprints/agregar/page.tsx"));
const UpdateScrumSprintPage = lazyPage(() => import("./app/gp/tics/pm/sprints/actualizar/[id]/page.tsx"));
const KanbanPage = lazyPage(() => import("./app/gp/tics/pm/kanban/page.tsx"));
const CompanyModulePage = lazyPage(() => import("./app/[company]/[module]/page.tsx"));
const CompanyModuleSubmodulePage = lazyPage(() => import("./app/[company]/[module]/[submodule]/page.tsx"));
const ProfilePage = lazyPage(() => import("./app/perfil/page.tsx"));
const UserPage = lazyPage(() => import("./app/gp/gestion-del-sistema/usuarios/page.tsx"));
const MyPerDiemPage = lazyPage(() => import("./app/perfil/viaticos/page.tsx"));
const AddGeneralElectronicDocumentPage = lazyPage(() => import("./app/ap/comercial/electronic-documents/agregar-otros/page.tsx"));
const PerDiemRequestAPPage = lazyPage(() => import("./app/ap/contabilidad/solicitud-viaticos/page.tsx"));
const PerDiemRequestDetailAdminAPPage = lazyPage(() => import("./app/ap/contabilidad/solicitud-viaticos/[id]/page.tsx"));
const CommercialMastersPage = lazyPage(() => import("./app/ap/configuraciones/maestros-general/maestros-generales/page.tsx"));
const ControlTravelPage = lazyPage(() => import("./app/tp/comercial-tp/control-viajes/page.tsx"));
const AccountsReceivablePage = lazyPage(() => import("./app/dp/comercial/accounts-receivable/page.tsx"));
const AccountsReceivableDashboardPage = lazyPage(() => import("./app/dp/comercial/accounts-receivable/dashboard/page.tsx"));
const AccountsReceivableApPage = lazyPage(() => import("./app/ap/comercial/accounts-receivable/page.tsx"));
const AccountsReceivableDashboardApPage = lazyPage(() => import("./app/ap/comercial/accounts-receivable/dashboard/page.tsx"));
import DPComercialLayout from "./app/dp/comercial/layout.tsx";
import ManualesPage from "./features/manuales/components/ManualesPage";

const GeneralMastersPage = lazyPage(() => import("./app/gp/maestros-generales/page.tsx"));
import { PER_DIEM_REQUEST } from "./features/profile/viaticos/lib/perDiemRequest.constants.ts";
const ControlFreightPage = lazyPage(() => import("./app/tp/comercial-tp/control-fletes/page.tsx"));
const PayrollPeriodsPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/periodos/page.tsx"));
const AddPayrollPeriodPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/periodos/agregar/page.tsx"));
const UpdatePayrollPeriodPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/periodos/actualizar/[id]/page.tsx"));
const PayrollCalculationPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/periodos/calcular/[id]/page.tsx"));
const AttendanceRulePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/reglas-asistencia/page.tsx"));
const AddAttendanceRulePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/reglas-asistencia/agregar/page.tsx"));
const UpdateAttendanceRulePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/reglas-asistencia/actualizar/[id]/page.tsx"));
const LiquidacionBbssPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/liquidacion-bbss/page.tsx"));
const AddLiquidacionBbssPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/liquidacion-bbss/agregar/page.tsx"));
const UpdateLiquidacionBbssPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/liquidacion-bbss/actualizar/[id]/page.tsx"));
const LoanPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/prestamos/page.tsx"));
const AddLoanPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/prestamos/agregar/page.tsx"));
const UpdateLoanPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/prestamos/actualizar/[id]/page.tsx"));
const LoanAmortizacionesPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/prestamos/[id]/amortizaciones/page.tsx"));
const InsurancePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/seguros/page.tsx"));
const WorkingConditionPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/condiciones-trabajo/page.tsx"));
const InsurerPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/aseguradora/page.tsx"));
const AddInsurerPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/aseguradora/agregar/page.tsx"));
const UpdateInsurerPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/aseguradora/actualizar/[id]/page.tsx"));
const AddInsurancePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/seguros/agregar/page.tsx"));
const UpdateInsurancePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/seguros/actualizar/[id]/page.tsx"));
const BonusPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/bonificaciones/page.tsx"));
const PayrollRegisterPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/registro-planilla/page.tsx"));
const AddBonusPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/bonificaciones/agregar/page.tsx"));
const UpdateBonusPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/bonificaciones/actualizar/[id]/page.tsx"));
const FoodCardPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/tarjeta-de-alimentos/page.tsx"));
const AssignFoodCardPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/tarjeta-de-alimentos/asignar/page.tsx"));
const FamilyAllowancePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/asignacion-familiar/page.tsx"));
const AssignFamilyAllowancePage = lazyPage(() => import("./app/gp/gestion-humana/planillas/asignacion-familiar/asignar/page.tsx"));
const ExclusionPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/exclusiones/page.tsx"));
const WorkSchedulesPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/dia-trabajo/page.tsx"));
const PayrollParameterPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/parametros/page.tsx"));
const PayrollRatesPercentagesPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/tasas-porcentajes/page.tsx"));
const PayrollConceptsPage = lazyPage(() => import("./app/gp/gestion-humana/planillas/conceptos-planilla/page.tsx"));
const AttendancePage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/page.tsx"));
const AttendancePersonPage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/persona/[personId]/page.tsx"));
const AttendanceBulkStoreRoutePage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/marcacion-masiva/page.tsx"));
const SunafilReportPage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/sunafil/page.tsx"));
const InternalReportPage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/interno/page.tsx"));
const WorkSchedulePage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/horarios/page.tsx"));
const AddWorkSchedulePage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/horarios/agregar/page.tsx"));
const UpdateWorkSchedulePage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/horarios/actualizar/[id]/page.tsx"));
const AttendanceExclusionPage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/exclusiones/page.tsx"));
const AttendanceCodeMappingPage = lazyPage(() => import("./app/gp/gestion-humana/asistencias/mapeo-codigos/page.tsx"));
import ProfileLayout from "./features/dashboard/components/ProfileLayout.tsx";
const ControlGoalPage = lazyPage(() => import("./app/tp/comercial-tp/control-metas/page.tsx"));
const EquipmentTypePage = lazyPage(() => import("./app/gp/tics/tipos-de-equipo/page.tsx"));
import { PHONE_LINE } from "./features/gp/tics/phoneLine/lib/phoneLine.constants.ts";
const PhoneLinePage = lazyPage(() => import("./app/gp/tics/lineas-telefonicas/page.tsx"));
const AddPhoneLinePage = lazyPage(() => import("./app/gp/tics/lineas-telefonicas/agregar/page.tsx"));
const UpdatePhoneLinePage = lazyPage(() => import("./app/gp/tics/lineas-telefonicas/actualizar/[id]/page.tsx"));
const TelephoneAccountPage = lazyPage(() => import("./app/gp/tics/cuentas-telefonicas/page.tsx"));
const TelephonePlanPage = lazyPage(() => import("./app/gp/tics/planes-telefonicos/page.tsx"));
const AssignmentsPage = lazyPage(() => import("./app/gp/tics/asignaciones/page.tsx"));
const GestionManualesPage = lazyPage(() => import("./app/gp/tics/gestion-manuales/page.tsx"));
const ControlVehicleAssignmentPage = lazyPage(() => import("./app/tp/comercial-tp/control-asignacionVehiculos/page.tsx"));
const AddControlUnitsPage = lazyPage(() => import("./app/ap/comercial/control-unidades/agregar/page.tsx"));
const UpdateControlUnitsPage = lazyPage(() => import("./app/ap/comercial/control-unidades/actualizar/[id]/page.tsx"));
const ControlUnitCheckListPage = lazyPage(() => import("./app/ap/comercial/control-unidades/checklist/[id]/page.tsx"));
const ControlUnitsPage = lazyPage(() => import("./app/ap/comercial/control-unidades/page.tsx"));
import { CONTROL_UNITS } from "./features/ap/comercial/control-unidades/lib/controlUnits.constants.ts";
const MonitoreoPage = lazyPage(() => import("./app/tp/comercial-tp/monitoreo/page.tsx"));
import { LocationTracker } from "./features/tp/comercial/Monitoreo/LocationTracker.tsx";
import { DeviceInactiveAlert } from "./features/tp/comercial/Monitoreo/components/DeviceInactiveAlert.tsx";
const ExitGuidePage = lazyPage(() => import("./app/ap/comercial/entrega-vehiculo/guia-salida/page.tsx"));
const ControlTipoVehiculoPage = lazyPage(() => import("./app/tp/configuraciones/control-tipo-vehiculo/page.tsx"));
const ControlVehiculoPage = lazyPage(() => import("./app/tp/configuraciones/control-vehiculo/page.tsx"));

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
// Sin loader: mientras el chunk de la página carga se mantiene el shell
// (sidebar + header) y el área de contenido queda vacía un instante.
// Con el prefetch en segundo plano, tras el warm-up la navegación es instantánea.
const LoadingFallback = () => null;

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
      <LocationTracker />
      <DeviceInactiveAlert />
      <BootScreen />
      <RoutePrefetcher />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* ============================================================ */}
          {/* PUBLIC ROUTES */}
          {/* ============================================================ */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/2fa-verify" element={<TwoFactorVerifyPage />} />
          <Route
            path="/confirmacion-cotizacion/:token"
            element={<ConfirmacionCotizacionPage />}
          />
          <Route
            path="/entregas-extraordinarias/confirmacion"
            element={<EntregaExtraordinariaConfirmacionPage />}
          />

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
              <Route
                path="equipo/jerarquica"
                element={<TeamHierarchyPage />}
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

            {/* Marketing */}
            <Route
              path="/ap/marketing"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <APComercialLayout>
                    <Outlet />
                  </APComercialLayout>
                </Suspense>
              }
            >
              <Route index element={<MarketingDashboardPage />} />

              {RouterCrud(
                "planes",
                <MarketingPlansPage />,
                <AddMarketingPlanPage />,
                <UpdateMarketingPlanPage />,
              )}
              {RouterCrud(
                "presupuestos",
                <MarketingBudgetsPage />,
                <AddMarketingBudgetPage />,
                <UpdateMarketingBudgetPage />,
              )}
              {RouterCrud(
                "actividades",
                <MarketingActivitiesPage />,
                <AddMarketingActivityPage />,
                <UpdateMarketingActivityPage />,
              )}
              {RouterCrud(
                "propuestas",
                <MarketingProposalsPage />,
                <AddMarketingProposalPage />,
                <UpdateMarketingProposalPage />,
              )}
              {RouterCrud(
                "ordenes-compra",
                <MarketingPurchaseOrdersPage />,
                <AddMarketingPurchaseOrderPage />,
                <UpdateMarketingPurchaseOrderPage />,
              )}
              <Route path="sustentos" element={<MarketingSupportsPage />} />
              <Route
                path="sustentos/agregar"
                element={<AddMarketingSupportPage />}
              />
              {RouterCrud(
                "kpis",
                <MarketingKpisPage />,
                <AddMarketingKpiPage />,
                <UpdateMarketingKpiPage />,
              )}
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
                path="entrega-vehiculo/guia-salida"
                element={<ExitGuidePage />}
              />
              <Route
                path="entrega-vehiculo/guia-remision/:id"
                element={<ShippingGuidePage />}
              />
              <Route
                path="entrega-vehiculo/checklist/:id"
                element={<DeliveryChecklistPage />}
              />
              <Route
                path="entrega-vehiculo/:id/aprobacion"
                element={<VehicleDeliveryApprovalPage />}
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

              {/* Activos (vehículo VN → activo fijo) */}
              <Route path="activos" element={<AssetsPage />} />
              <Route path="activos/agregar" element={<AddAssetPage />} />

              {/* Traslados Internos */}
              <Route path="traslados" element={<TransfersPage />} />
              <Route path="traslados/agregar" element={<AddTransferPage />} />

              {/* Control de Unidades */}
              {RouterCrud(
                CONTROL_UNITS.ROUTE,
                <ControlUnitsPage />,
                <AddControlUnitsPage />,
                <UpdateControlUnitsPage />,
              )}
              <Route
                path={CONTROL_UNITS.CHECKLIST_ROUTE}
                element={<ControlUnitCheckListPage />}
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
              <Route
                path="solicitudes-cotizaciones/ajustes-margen"
                element={<AdjustmentRequestInboxPage />}
              />
              <Route
                path="solicitudes-cotizaciones/ajustes-margen/agregar/:quoteId"
                element={<RequestAdjustmentPage />}
              />
              <Route
                path="solicitudes-cotizaciones/ajustes-margen/:id"
                element={<AdjustmentRequestDetailPage />}
              />

              {/* Declaración Jurada KYC */}
              <Route
                path="declaraciones-juradas"
                element={<DeclaracionJuradaKycPage />}
              />
              <Route
                path="declaraciones-juradas/agregar"
                element={<AddDeclaracionJuradaKycPage />}
              />
              <Route
                path="declaraciones-juradas/actualizar/:id"
                element={<UpdateDeclaracionJuradaKycPage />}
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
              <Route
                path="reportes-comercial"
                element={<ReportesComercialPage />}
              />

              {/* Cuentas por Cobrar */}
              <Route
                path="cuentas-por-cobrar-ap"
                element={<AccountsReceivableApPage />}
              />
              <Route
                path="cuentas-por-cobrar-ap/dashboard"
                element={<AccountsReceivableDashboardApPage />}
              />
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
                path="maestros-general/series"
                element={<AssignSalesSeriesPage />}
              />
              <Route
                path="maestros-general/series/agregar"
                element={<AddAssignSalesSeriesPage />}
              />
              <Route
                path="maestros-general/series/actualizar/:id"
                element={<UpdateAssignSalesSeriesPage />}
              />
              <Route path="maestros-general/bancos" element={<BankPage />} />
              <Route
                path="maestros-general/campanas"
                element={<CampaignPage />}
              />
              <Route
                path="maestros-general/campanas/agregar"
                element={<AddCampaignPage />}
              />
              <Route
                path="maestros-general/campanas/actualizar/:id"
                element={<UpdateCampaignPage />}
              />
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
                path="vehiculos/tipos-compra-proveedor"
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
              <Route path="post-venta" element={<ModulePage />} />
              <Route
                path="post-venta/parametros-postventa"
                element={<AfterSalesParameterPage />}
              />
              <Route
                path="post-venta/tipos-operacion-cita"
                element={<TypesOperationsAppointmentPage />}
              />
              <Route
                path="post-venta/motivos-ajuste"
                element={<ReasonsAdjustmentPage />}
              />
              <Route
                path="post-venta/motivos-descarte-taller"
                element={<ReasonDiscardingTallerPage />}
              />
              <Route
                path="post-venta/motivos-descarte-repuesto"
                element={<ReasonDiscardingSparePartPage />}
              />
              <Route
                path="post-venta/tipos-planificacion"
                element={<TypesPlanningPage />}
              />
              <Route
                path="post-venta/objetivos-taller-meson"
                element={<ConceptObjectivePvPage />}
              />

              {/* Ventas Configuration */}
              <Route path="ventas" element={<ModulePage />} />
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
                path="gestion-de-almacen/guia-remision"
                element={<ProductTransferPage />}
              />
              <Route
                path="gestion-de-almacen/guia-remision/agregar"
                element={<AddProductTransferPage />}
              />
              <Route
                path="gestion-de-almacen/guia-remision/actualizar/:id"
                element={<UpdateProductTransferPage />}
              />
              <Route
                path="gestion-de-almacen/guia-remision/recepcion/:productTransferId"
                element={<TransferReceptionsPage />}
              />
              <Route
                path="gestion-de-almacen/guia-remision/recepcion/agregar/:productTransferId"
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
                path="gestion-de-almacen/estantes-almacen"
                element={<ProductShelfPage />}
              />
              <Route
                path="gestion-de-almacen/estantes-almacen/gestionar/:id"
                element={<ManageShelfProductsPage />}
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
                path="gestion-de-almacen/inventario/historico-compras/:productId/:warehouseId/precio-calculo"
                element={<PriceCalculationPage />}
              />
              <Route
                path="gestion-de-almacen/inventario/comparativa-dynamics"
                element={<ComparativaDynamicsPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor"
                element={<SupplierOrderPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor/agregar"
                element={<AddSupplierOrderPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor/actualizar/:id"
                element={<UpdateSupplierOrderPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor/recepcionar/facturar/:receptionId"
                element={<InvoiceReceptionPage />}
              />
              <Route
                path="gestion-de-almacen/factura-compra"
                element={<PurchaseOrderWarehousePage />}
              />
              <Route
                path="gestion-de-almacen/factura-compra/reenviar/:id"
                element={<ResendWarehousePurchaseOrderPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor/recepcionar/:supplierOrderId"
                element={<ReceptionsProductsPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor/recepcionar/agregar/:supplierOrderId"
                element={<AddReceptionProductPage />}
              />
              <Route
                path="gestion-de-almacen/compra-proveedor/recepcionar/actualizar/:supplierOrderId/:id"
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
              {/* Proveedor Almacén */}
              <Route
                path="gestion-de-almacen/proveedor-almacen"
                element={<SuppliersStorePage />}
              />
              <Route
                path="gestion-de-almacen/proveedor-almacen/agregar"
                element={<AddSupplierStorePage />}
              />
              <Route
                path="gestion-de-almacen/proveedor-almacen/actualizar/:id"
                element={<UpdateSuppliersStorePage />}
              />
              <Route
                path="gestion-de-almacen/proveedor-almacen/establecimientos/:id"
                element={<SupplierStoreEstablishmentsListPage />}
              />
              <Route
                path="gestion-de-almacen/proveedor-almacen/establecimientos/:id/agregar"
                element={<AddSupplierStoreEstablishmentPage />}
              />
              <Route
                path="gestion-de-almacen/proveedor-almacen/establecimientos/:id/actualizar/:establishmentId"
                element={<UpdateSupplierStoreEstablishmentPage />}
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
                path="repuestos/cotizacion-meson/solicitar-descuento/:id"
                element={<RequestDiscountOrderQuotationMesonPage />}
              />
              <Route
                path="repuestos/cotizacion-meson/detalle/:id"
                element={<OrderQuotationMesonDetallePage />}
              />
              <Route
                path="repuestos/cotizacion-meson/gestionar/:id"
                element={<OrderQuotationMesonManagePage />}
              />
              <Route
                path="repuestos/cotizacion-meson/aprobar/:id"
                element={<AprobacionProductosMesonPage />}
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
                path="repuestos/producto-repuesto/asignar-almacen/:id"
                element={<AssignWarehouseRepuestoPage />}
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
              {/* Taller */}
              <Route path="taller" element={<WorkshopPage />} />
              <Route path="taller/lavado-vehiculo" element={<CardWashPage />} />
              <Route path="taller/modelos-vn-pv" element={<ModelsVnPvPage />} />
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
                path="taller/producto-taller"
                element={<ProductTallerPage />}
              />
              <Route
                path="taller/producto-taller/agregar"
                element={<AddProductTallerPage />}
              />
              <Route
                path="taller/producto-taller/actualizar/:id"
                element={<UpdateProductTallerPage />}
              />
              <Route
                path="taller/producto-taller/asignar-almacen/:id"
                element={<AssignWarehouseTallerPage />}
              />
              <Route
                path="taller/cotizacion/gestionar/:id"
                element={<OrderQuotationPage />}
              />
              <Route path="taller/orden-trabajo" element={<WorkOrderPage />} />
              <Route
                path="taller/notas-internas"
                element={<InternalNoteMigrationPage />}
              />
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
                path="taller/recepcion-orden-trabajo"
                element={<WorkOrderReceptionPage />}
              />
              <Route
                path="taller/recepcion-orden-trabajo/gestionar/:id"
                element={<ManageWorkOrderReceptionPage />}
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
                path="taller/trabajos-asignados/productividad"
                element={<TechnicianProductivityPage />}
              />
              <Route
                path="taller/comprobante-venta-taller"
                element={<SalesReceiptsTallerPage />}
              />
              <Route
                path="taller/cronograma-campanas"
                element={<CampaignSchedulePage />}
              />
              <Route
                path="taller/cronograma-campanas/agregar"
                element={<AddCampaignSchedulePage />}
              />
              {/* CAJA */}
              <Route path="caja" element={<BoxPage />} />
              <Route
                path="caja/comprobante-venta-caja"
                element={<SalesReceiptsCajaPage />}
              />
              <Route
                path="caja/comprobante-venta-caja/actualizar/:id"
                element={<UpdateSalesReceiptsCajaPage />}
              />
              <Route
                path="caja/comprobante-venta-caja/agregar-otros"
                element={<AddGeneralSalesReceiptsCajaPage />}
              />
              <Route
                path="caja/comprobante-venta-caja/agregar-otros-historico"
                element={<AddHistoricalFinalSaleWithAdvanceCajaPage />}
              />
              <Route
                path="caja/comprobante-venta-caja/agregar-regularizacion-anticipo"
                element={<AddRegularizeAdvancePaymentCajaPage />}
              />
              {/* Credit Note */}
              <Route
                path="caja/comprobante-venta-caja/:id/credit-note"
                element={<AddCreditNoteCajaPage />}
              />
              <Route
                path="caja/comprobante-venta-caja/:id/credit-note/actualizar/:credit"
                element={<UpdateCreditNoteCajaPage />}
              />

              {/* Debit Note */}
              <Route
                path="caja/comprobante-venta-caja/:id/debit-note"
                element={<AddDebitNoteCajaPage />}
              />
              <Route
                path="caja/comprobante-venta-caja/:id/debit-note/actualizar/:debit"
                element={<UpdateDebitNoteCajaPage />}
              />
              <Route
                path="caja/cotizacion-repuesto-caja"
                element={<OrderQuotationMesonCajaPage />}
              />
              <Route
                path="caja/cotizacion-repuesto-caja/facturar/:id"
                element={<BillOrderQuotationMesonCajaPage />}
              />
              <Route
                path="caja/orden-trabajo-taller-caja"
                element={<WorkOrderCajaPage />}
              />
              <Route
                path="caja/orden-trabajo-taller-caja/factura-directa"
                element={<DirectInvoicePage />}
              />
              <Route
                path="caja/orden-trabajo-taller-caja/facturar/:id"
                element={<BillWorkOrderCajaPage />}
              />

              {/* Indicadores y Reportes */}
              <Route
                path="indicadores-y-reportes"
                element={<IndicadoresReportesPage />}
              />
              <Route
                path="indicadores-y-reportes/reportes-postventa"
                element={<ReportesPostVentaPage />}
              />
              <Route
                path="indicadores-y-reportes/dashboard-objetivos"
                element={<ObjectivesDashboardPage />}
              />
              <Route
                path="indicadores-y-reportes/dashboard-productividad"
                element={<ProductivityDashboardPage />}
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

              {/* Dashboard Adopción ERP */}
              <Route
                path="dashboard-seguimiento"
                element={<AdoptionDashboardPage />}
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
              {RouterCrud(
                "gestion-de-personal/procesos-postulacion",
                <RecruitmentProcessPage />,
                <AddRecruitmentProcessPage />,
                <UpdateRecruitmentProcessPage />,
              )}
              <Route
                path="gestion-de-personal/procesos-postulacion/postulantes"
                element={<ProcessApplicantsPage />}
              />
              {RouterCrud(
                "gestion-de-personal/postulantes",
                <ApplicantPage />,
                <AddApplicantPage />,
                <UpdateApplicantPage />,
              )}
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
                path="evaluaciones-de-desempeno/evaluaciones/detalles/:id/competencias"
                element={<EvaluationCompetenceDetailPage />}
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
              <Route
                path="evaluaciones-de-desempeno/reportes-evaluaciones"
                element={<ReportByPeriodsEvaluationPage />}
              />
              {RouterCrud(
                "evaluaciones-de-desempeno/modelo-evaluacion",
                <EvaluationModelPage />,
                <AddEvaluationModelPage />,
                <UpdateEvaluationModelPage />,
              )}
              {/* Planillas */}
              {/* Dia Trabajo */}
              <Route path="planillas" element={<WorkshopPage />} />
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
              <Route
                path="planillas/periodos/calcular/:id"
                element={<PayrollCalculationPage />}
              />
              {/* Reglas de Asistencia */}
              {RouterCrud(
                "planillas/reglas-asistencia",
                <AttendanceRulePage />,
                <AddAttendanceRulePage />,
                <UpdateAttendanceRulePage />,
              )}
              {/* Liquidación BBSS */}
              {RouterCrud(
                "planillas/liquidacion-bbss",
                <LiquidacionBbssPage />,
                <AddLiquidacionBbssPage />,
                <UpdateLiquidacionBbssPage />,
              )}
              {/* Préstamos */}
              {RouterCrud(
                "planillas/prestamos",
                <LoanPage />,
                <AddLoanPage />,
                <UpdateLoanPage />,
              )}
              <Route
                path="planillas/prestamos/:id/amortizaciones"
                element={<LoanAmortizacionesPage />}
              />
              {/* Seguros */}
              {RouterCrud(
                "planillas/seguros",
                <InsurancePage />,
                <AddInsurancePage />,
                <UpdateInsurancePage />,
              )}
              {/* Condiciones de Trabajo */}
              <Route
                path="planillas/condiciones-trabajo"
                element={<WorkingConditionPage />}
              />
              {/* Registro de Planilla */}
              <Route
                path="planillas/registro-planilla"
                element={<PayrollRegisterPage />}
              />
              {/* Bonificaciones */}
              {RouterCrud(
                "planillas/bonificaciones",
                <BonusPage />,
                <AddBonusPage />,
                <UpdateBonusPage />,
              )}
              {/* Tarjeta de Alimentos */}
              <Route
                path="planillas/tarjeta-de-alimentos"
                element={<FoodCardPage />}
              />
              <Route
                path="planillas/tarjeta-de-alimentos/asignar"
                element={<AssignFoodCardPage />}
              />
              {/* Asignación Familiar */}
              <Route
                path="planillas/asignacion-familiar"
                element={<FamilyAllowancePage />}
              />
              <Route
                path="planillas/asignacion-familiar/asignar"
                element={<AssignFamilyAllowancePage />}
              />
              {/* Exclusiones */}
              <Route
                path="planillas/exclusiones"
                element={<ExclusionPage />}
              />
              {/* Constantes de Planilla */}
              <Route
                path="planillas/parametros-planilla"
                element={<PayrollParameterPage />}
              />
              {/* Tasas y Porcentajes de Planilla */}
              <Route
                path="planillas/tasas-porcentajes"
                element={<PayrollRatesPercentagesPage />}
              />
              {/* Conceptos de Planilla */}
              <Route
                path="planillas/conceptos-planilla"
                element={<PayrollConceptsPage />}
              />
              {/* Aseguradora */}
              {RouterCrud(
                "planillas/aseguradora",
                <InsurerPage />,
                <AddInsurerPage />,
                <UpdateInsurerPage />,
              )}

              {/* Asistencias */}
              <Route
                path="asistencias/asistencias"
                element={<AttendancePage />}
              />
              <Route
                path="asistencias/asistencias/:personId"
                element={<AttendancePersonPage />}
              />
              <Route
                path="asistencias/marcacion-masiva"
                element={<AttendanceBulkStoreRoutePage />}
              />
              <Route
                path="asistencias/sunafil"
                element={<SunafilReportPage />}
              />
              <Route
                path="asistencias/interno"
                element={<InternalReportPage />}
              />
              <Route
                path="asistencias/horarios"
                element={<WorkSchedulePage />}
              />
              <Route
                path="asistencias/horarios/agregar"
                element={<AddWorkSchedulePage />}
              />
              <Route
                path="asistencias/horarios/actualizar/:id"
                element={<UpdateWorkSchedulePage />}
              />
              <Route
                path="asistencias/exclusiones"
                element={<AttendanceExclusionPage />}
              />
              <Route
                path="asistencias/mapeo-codigos"
                element={<AttendanceCodeMappingPage />}
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
              <Route path="empresa" element={<CompanyPage />} />
              <Route
                path="empresa/actualizar/:id"
                element={<UpdateCompanyPage />}
              />
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
              <Route path="sesiones-activas" element={<ActiveSessionsPage />} />
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
              <Route
                path="cuentas-telefonicas"
                element={<TelephoneAccountPage />}
              />
              <Route
                path="planes-telefonicos"
                element={<TelephonePlanPage />}
              />
              <Route path="asignaciones" element={<AssignmentsPage />} />
              <Route
                path="gestion-manuales"
                element={<GestionManualesPage />}
              />
              {RouterCrud(
                "proyectos",
                <ScrumProjectPage />,
                <AddScrumProjectPage />,
                <UpdateScrumProjectPage />,
              )}
              {RouterCrud(
                "sprints",
                <ScrumSprintPage />,
                <AddScrumSprintPage />,
                <UpdateScrumSprintPage />,
              )}
              <Route path="kanban" element={<KanbanPage />} />
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
              <Route path="monitoreo" element={<MonitoreoPage />} />
            </Route>
            {/* ======================================================== */}
            {/* TP - CONFIGURACIONES */}
            {/* ======================================================== */}
            <Route
              path="/tp/configuraciones"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <TPConfiguracionesLayout>
                    <Outlet />
                  </TPConfiguracionesLayout>
                </Suspense>
              }
            >
              <Route
                path="control-tipo-vehiculo"
                element={<ControlTipoVehiculoPage />}
              />
              <Route
                path="control-vehiculo"
                element={<ControlVehiculoPage />}
              />
            </Route>

            {/* ======================================================== */}
            {/* DP - COMERCIAL */}
            {/* ======================================================== */}
            <Route
              path="/dp/comercial"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <DPComercialLayout>
                    <Outlet />
                  </DPComercialLayout>
                </Suspense>
              }
            >
              <Route
                path="cuentas-por-cobrar"
                element={<AccountsReceivablePage />}
              />
              <Route
                path="cuentas-por-cobrar/dashboard"
                element={<AccountsReceivableDashboardPage />}
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
              <Route path="manuales" element={<ManualesPage />} />
              <Route
                path=":submodule"
                element={<CompanyModuleSubmodulePage />}
              />
              <Route path=":submodule/manuales" element={<ManualesPage />} />
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
