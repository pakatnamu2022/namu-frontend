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
import { FC, JSX, lazy, Suspense } from "react";
import ModulePerformanceEvaluationPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/page";
import HierarchicalCategoryPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/page";
import AddHierarchicalCategoryPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/agregar/page";
import EditHierarchicalCategoryPage from "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/actualizar/[id]/page";
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
import CommercialDashboardPage from "./app/ap/comercial/page";
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
import AddElectronicDocumentPage from "./app/ap/comercial/electronic-documents/agregar/page";
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
import AddPurchaseRequestQuotePage from "./app/ap/comercial/solicitudes-cotizaciones/agregar/page";
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
const PositionsPage = lazy(
  () => import("./app/gp/gestion-humana/configuraciones/posiciones/page")
);
const AddPositionPage = lazy(
  () =>
    import("./app/gp/gestion-humana/configuraciones/posiciones/agregar/page")
);
const EditPositionPage = lazy(
  () =>
    import(
      "./app/gp/gestion-humana/configuraciones/posiciones/actualizar/[id]/page"
    )
);

// ============================================================================
// LAYOUTS
// ============================================================================
const DashboardLayout = lazy(
  () => import("./features/dashboard/components/DashboardLayout")
);
const MainLayout = lazy(
  () => import("./features/dashboard/components/MainLayout")
);
const ProfileLayout = lazy(() => import("./app/perfil/layout"));
const APComercialLayout = lazy(() => import("./app/ap/comercial/layout"));
const APConfiguracionesLayout = lazy(
  () => import("./app/ap/configuraciones/layout")
);
const APPostVentaLayout = lazy(() => import("./app/ap/post-venta/layout"));
const GPGestionSistemaLayout = lazy(
  () => import("./app/gp/gestion-del-sistema/layout")
);
const GPGestionHumanaLayout = lazy(
  () => import("./app/gp/gestion-humana/layout")
);
const GPMaestroGeneralLayout = lazy(
  () => import("./app/gp/maestro-general/layout")
);
const GPTicsLayout = lazy(() => import("./app/gp/tics/layout"));

// ============================================================================
// ROOT & PUBLIC PAGES
// ============================================================================
const LoginPage = lazy(() => import("./app/page"));
const NotFoundPage = lazy(() => import("./app/not-found"));

// ============================================================================
// MAIN PAGES
// ============================================================================
const CompaniesPage = lazy(() => import("./app/companies/page"));
const FeedPage = lazy(() => import("./app/feed/page"));
const TestPage = lazy(() => import("./app/test/page"));

// Module Selection Pages
const ModulesCompanyPage = lazy(() => import("./app/modules/[company]/page"));
const ModulesCompanyModulePage = lazy(
  () => import("./app/modules/[company]/[module]/page")
);

// Dynamic Routes
const CompanyModulePage = lazy(() => import("./app/[company]/[module]/page"));
const CompanyModuleSubmodulePage = lazy(
  () => import("./app/[company]/[module]/[submodule]/page")
);

// ============================================================================
// PERFIL (PROFILE) PAGES
// ============================================================================
const PerfilPage = lazy(() => import("./app/perfil/page"));
const PerfilCapacitacionesPage = lazy(
  () => import("./app/perfil/capacitaciones/page")
);
const PerfilDesempenoPage = lazy(() => import("./app/perfil/desempeño/page"));
const PerfilDocumentosPage = lazy(() => import("./app/perfil/documentos/page"));
const PerfilEquipoPage = lazy(() => import("./app/perfil/equipo/page"));
const PerfilEquipoIndicadoresPage = lazy(
  () => import("./app/perfil/equipo/indicadores/page")
);
const PerfilEquipoDetailPage = lazy(
  () => import("./app/perfil/equipo/[id]/page")
);
const PerfilEquipoEvaluarPage = lazy(
  () => import("./app/perfil/equipo/[id]/evaluar/page")
);
const PerfilEquipoHistorialPage = lazy(
  () => import("./app/perfil/equipo/[id]/historial/page")
);
const PerfilEquipoPlanDesarrolloPage = lazy(
  () => import("./app/perfil/equipo/[id]/plan-desarrollo/page")
);
const PerfilEquipoPlanDesarrolloCrearPage = lazy(
  () => import("./app/perfil/equipo/[id]/plan-desarrollo/agregar/page")
);

// ============================================================================
// AP - CONFIGURACIONES
// ============================================================================

// Maestros General
const ActividadEconomicaPage = lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/actividad-economica/page")
);
const AlmacenesPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/almacenes/page")
);
const AddAlmacenesPage = lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/almacenes/agregar/page")
);
const EditAlmacenesPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/almacenes/actualizar/[id]/page"
    )
);
const AsignarSerieUsuarioPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/page"
    )
);
const AddAsignarSerieUsuarioPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/agregar/page"
    )
);
const EditAsignarSerieUsuarioPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/actualizar/[id]/page"
    )
);
const AsignarSerieVentaPage = lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/asignar-serie-venta/page")
);
const AddAsignarSerieVentaPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/asignar-serie-venta/agregar/page"
    )
);
const EditAsignarSerieVentaPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/asignar-serie-venta/actualizar/[id]/page"
    )
);
const BancosPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/bancos/page")
);
const ChequerasPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/chequeras/page")
);
const AddChequerasPage = lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/chequeras/agregar/page")
);
const EditChequerasPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/chequeras/actualizar/[id]/page"
    )
);
const EstadoCivilPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/estado-civil/page")
);
const OrigenClientePage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/origen-cliente/page")
);
const ClassArticlePage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/clase-articulo/page")
);
const AddClassArticlePage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/clase-articulo/agregar/page"
    )
);
const EditClassArticlePage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/clase-articulo/actualizar/[id]/page"
    )
);
const PlanCuentaContablePage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/plan-cuenta-contable/page"
    )
);
const SegmentosPersonaPage = lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/segmentos-persona/page")
);
const TiposClaseImpuestoPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/tipos-clase-impuesto/page"
    )
);
const TiposComprobantePage = lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/tipos-comprobante/page")
);
const TiposCuentaContablePage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/tipos-cuenta-contable/page"
    )
);
const TiposDocumentoPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-documento/page")
);
const TiposMonedaPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-moneda/page")
);
const TiposOperacionPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-operacion/page")
);
const TiposPersonaPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-persona/page")
);
const TiposSexoPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-sexo/page")
);
const UbigeosPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/ubigeos/page")
);
const AddUbigeosPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/ubigeos/agregar/page")
);
const EditUbigeosPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/ubigeos/actualizar/[id]/page"
    )
);
const UnidadMedidaPage = lazy(
  () => import("./app/ap/configuraciones/maestros-general/unidad-medida/page")
);

// Vehículos Configuration
const CategoriasVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/categorias/page")
);
const CategoriasChecklistPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/categorias-checklist/page")
);
const ChecklistEntregaPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/checklist-entrega/page")
);
const ChecklistRecepcionPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/checklist-recepcion/page")
);
const ColoresVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/colores-vehiculo/page")
);
const EstadosVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/estados-vehiculo/page")
);
const AddEstadosVehiculoPage = lazy(
  () =>
    import("./app/ap/configuraciones/vehiculos/estados-vehiculo/agregar/page")
);
const EditEstadosVehiculoPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/vehiculos/estados-vehiculo/actualizar/[id]/page"
    )
);
const FamiliasVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/familias/page")
);
const GrupoMarcasPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/grupo-marcas/page")
);
const MarcasVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/marcas/page")
);
const AddMarcasVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/marcas/agregar/page")
);
const EditMarcasVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/marcas/actualizar/[id]/page")
);
const ModelosVNPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/modelos-vn/page")
);
const AddModelosVNPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/modelos-vn/agregar/page")
);
const EditModelosVNPage = lazy(
  () =>
    import("./app/ap/configuraciones/vehiculos/modelos-vn/actualizar/[id]/page")
);
const OrigenVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/origen-vehiculo/page")
);
const TiposCarroceriaPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-carroceria/page")
);
const TiposCombustiblePage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-combustible/page")
);
const TiposMotorPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-motor/page")
);
const TiposPedidoProveedorPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-pedido-proveedor/page")
);
const TiposProductoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-producto/page")
);
const TiposTraccionPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-traccion/page")
);
const TiposVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-vehiculo/page")
);
const TransmisionVehiculoPage = lazy(
  () => import("./app/ap/configuraciones/vehiculos/transmision-vehiculo/page")
);

// Ventas Configuration
const AsignarGrupoMarcaPage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-grupo-marca/page")
);
const AddAsignarGrupoMarcaPage = lazy(
  () =>
    import("./app/ap/configuraciones/ventas/asignar-grupo-marca/agregar/page")
);
const EditAsignarGrupoMarcaPage = lazy(
  () =>
    import(
      "./app/ap/configuraciones/ventas/asignar-grupo-marca/actualizar/[id]/page"
    )
);
const AsignarJefePage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-jefe/page")
);
const AddAsignarJefePage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-jefe/agregar/page")
);
const EditAsignarJefePage = lazy(
  () =>
    import("./app/ap/configuraciones/ventas/asignar-jefe/actualizar/[id]/page")
);
const AsignarMarcaPage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-marca/page")
);
const AsignarMarcaGestionarPage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-marca/gestionar/page")
);
const AsignarSedePage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-sede/page")
);
const AddAsignarSedePage = lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-sede/agregar/page")
);
const EditAsignarSedePage = lazy(
  () =>
    import("./app/ap/configuraciones/ventas/asignar-sede/actualizar/[id]/page")
);
const MetasCreditoSeguroPage = lazy(
  () => import("./app/ap/configuraciones/ventas/metas-credito-seguro/page")
);
const MetasVentaPage = lazy(
  () => import("./app/ap/configuraciones/ventas/metas-venta/page")
);
const MetasVentaGestionarPage = lazy(
  () => import("./app/ap/configuraciones/ventas/metas-venta/gestionar/page")
);
const MetasVentaResumenPage = lazy(
  () => import("./app/ap/configuraciones/ventas/metas-venta/resumen/page")
);
const TiendasPage = lazy(
  () => import("./app/ap/configuraciones/ventas/tiendas/page")
);

// ============================================================================
// AP - POST-VENTA
// ============================================================================

// Accesorios
const AccesoriosHomologadosPage = lazy(
  () => import("./app/ap/post-venta/accesorios-homologados/page")
);

// Gestión de Productos
const CategoriasProductoPage = lazy(
  () =>
    import("./app/ap/post-venta/gestion-de-productos/categorias-producto/page")
);
const MarcasProductoPage = lazy(
  () => import("./app/ap/post-venta/gestion-de-productos/marcas-producto/page")
);
const AddMarcasProductoPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-productos/marcas-producto/agregar/page"
    )
);
const EditMarcasProductoPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-productos/marcas-producto/actualizar/[id]/page"
    )
);
const ProductosPage = lazy(
  () => import("./app/ap/post-venta/gestion-de-productos/productos/page")
);
const AddProductosPage = lazy(
  () =>
    import("./app/ap/post-venta/gestion-de-productos/productos/agregar/page")
);
const EditProductosPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-productos/productos/actualizar/[id]/page"
    )
);
const TiposCategoriaPage = lazy(
  () => import("./app/ap/post-venta/gestion-de-productos/tipos-categoria/page")
);

// Gestión de Compras
const PurchaseOrderProductsPage = lazy(
  () =>
    import("./app/ap/post-venta/gestion-de-compras/orden-compra-producto/page")
);
const AddPurchaseOrderProductsPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-compras/orden-compra-producto/agregar/page"
    )
);
const EditPurchaseOrderProductsPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-compras/orden-compra-producto/actualizar/[id]/page"
    )
);
const ReceptionPurchaseOrderProductsPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/[purchaseOrderId]/page"
    )
);
const AddReceptionPurchaseOrderProductsPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/agregar/[purchaseOrderId]/page"
    )
);
const EditReceptionPurchaseOrderProductsPage = lazy(
  () =>
    import(
      "./app/ap/post-venta/gestion-de-compras/orden-compra-producto/recepcion/actualizar/[purchaseOrderId]/[id]/page"
    )
);

// Taller
const LavadoVehiculoPage = lazy(
  () => import("./app/ap/post-venta/taller/lavado-vehiculo/page")
);

// ============================================================================
// GP - GESTION DEL SISTEMA
// ============================================================================
const GPGestionSistemaPage = lazy(
  () => import("./app/gp/gestion-del-sistema/page")
);
const RolesPage = lazy(() => import("./app/gp/gestion-del-sistema/roles/page"));
const RolesPermisosPage = lazy(
  () => import("./app/gp/gestion-del-sistema/roles/permisos/[id]/page")
);
const UsuariosPage = lazy(
  () => import("./app/gp/gestion-del-sistema/usuarios/page")
);
const UsuariosAgregarPage = lazy(
  () => import("./app/gp/gestion-del-sistema/usuarios/agregar/page")
);
const UsuariosActualizarPage = lazy(
  () => import("./app/gp/gestion-del-sistema/usuarios/actualizar/[id]/page")
);
const VistasPage = lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/page")
);
const AddVistasPage = lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/agregar/page")
);
const EditVistasPage = lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/actualizar/[id]/page")
);
const VistasPermisosPage = lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/permisos/[id]/page")
);

// ============================================================================
// GP - GESTION HUMANA
// ============================================================================

// Administración de Personal
const TrabajadoresPage = lazy(
  () =>
    import(
      "./app/gp/gestion-humana/administracion-de-personal/trabajadores/page"
    )
);

// ============================================================================
// GP - MAESTRO GENERAL
// ============================================================================
const SedePage = lazy(() => import("./app/gp/maestro-general/sede/page"));

// ============================================================================
// GP - TICS
// ============================================================================
const GPTicsPage = lazy(() => import("./app/gp/tics/page"));
const AuditoriaPage = lazy(() => import("./app/gp/tics/auditoria/page"));
const EquiposPage = lazy(() => import("./app/gp/tics/equipos/page"));

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
  detailPage?: JSX.Element
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

// ============================================================================
// APP COMPONENT
// ============================================================================
function App() {
  return (
    <BrowserRouter>
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
            <Route path="/feed" element={<FeedPage />} />

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
              <Route index element={<PerfilPage />} />
              <Route
                path="capacitaciones"
                element={<PerfilCapacitacionesPage />}
              />
              <Route path="desempeño" element={<PerfilDesempenoPage />} />
              <Route path="documentos" element={<PerfilDocumentosPage />} />
              <Route path="equipo" element={<PerfilEquipoPage />} />
              <Route
                path="equipo/indicadores"
                element={<PerfilEquipoIndicadoresPage />}
              />
              <Route path="equipo/:id" element={<PerfilEquipoDetailPage />} />
              <Route
                path="equipo/:id/evaluar"
                element={<PerfilEquipoEvaluarPage />}
              />
              <Route
                path="equipo/:id/historial"
                element={<PerfilEquipoHistorialPage />}
              />
              <Route
                path="equipo/:id/plan-desarrollo"
                element={<PerfilEquipoPlanDesarrolloPage />}
              />
              <Route
                path="equipo/:id/plan-desarrollo/crear"
                element={<PerfilEquipoPlanDesarrolloCrearPage />}
              />
              <Route path="mi-desempeno" element={<MyPerformance />} />
              <Route path="vacaciones" element={<VacationPage />} />
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
              <Route index element={<CommercialDashboardPage />} />

              {/* Agenda */}
              <Route path="agenda" element={<AgendaPage />} />

              {/* Oportunidades */}
              {RouterCrud(
                "agenda/oportunidades",
                <OpportunitiesKanbanPage />,
                <AddOpportunityPage />,
                <UpdateOpportunityPage />,
                <OpportunityDetailPage />
              )}

              {/* Clientes */}
              {RouterCrud(
                "clientes",
                <CustomersPage />,
                <AddCustomersPage />,
                <UpdateCustomersPage />
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
                <UpdateSuppliersPage />
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
                <UpdateElectronicDocumentPage />
              )}

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
                <UpdateShipmentsReceptionsPage />
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
                <UpdateStoreVisitsPage />
              )}

              {/* Gestionar Leads */}
              <Route path="gestionar-leads" element={<ManageLeadsPage />} />

              {/* Solicitudes Cotizaciones */}
              {RouterCrud(
                "solicitudes-cotizaciones",
                <PurchaseRequestQuotePage />,
                <AddPurchaseRequestQuotePage />,
                <UpdatePurchaseRequestQuotePage />
              )}

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
              {/* Maestros General */}
              <Route
                path="maestros-general/actividad-economica"
                element={<ActividadEconomicaPage />}
              />
              <Route
                path="maestros-general/almacenes"
                element={<AlmacenesPage />}
              />
              <Route
                path="maestros-general/almacenes/agregar"
                element={<AddAlmacenesPage />}
              />
              <Route
                path="maestros-general/almacenes/actualizar/:id"
                element={<EditAlmacenesPage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario"
                element={<AsignarSerieUsuarioPage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario/agregar"
                element={<AddAsignarSerieUsuarioPage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario/actualizar/:id"
                element={<EditAsignarSerieUsuarioPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta"
                element={<AsignarSerieVentaPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta/agregar"
                element={<AddAsignarSerieVentaPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta/actualizar/:id"
                element={<EditAsignarSerieVentaPage />}
              />
              <Route path="maestros-general/bancos" element={<BancosPage />} />
              <Route
                path="maestros-general/chequeras"
                element={<ChequerasPage />}
              />
              <Route
                path="maestros-general/chequeras/agregar"
                element={<AddChequerasPage />}
              />
              <Route
                path="maestros-general/chequeras/actualizar/:id"
                element={<EditChequerasPage />}
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
                element={<EditClassArticlePage />}
              />

              <Route
                path="maestros-general/estado-civil"
                element={<EstadoCivilPage />}
              />
              <Route
                path="maestros-general/origen-cliente"
                element={<OrigenClientePage />}
              />
              <Route
                path="maestros-general/plan-cuenta-contable"
                element={<PlanCuentaContablePage />}
              />
              <Route
                path="maestros-general/segmentos-persona"
                element={<SegmentosPersonaPage />}
              />
              <Route
                path="maestros-general/tipos-clase-impuesto"
                element={<TiposClaseImpuestoPage />}
              />
              <Route
                path="maestros-general/tipos-comprobante"
                element={<TiposComprobantePage />}
              />
              <Route
                path="maestros-general/tipos-cuenta-contable"
                element={<TiposCuentaContablePage />}
              />
              <Route
                path="maestros-general/tipos-documento"
                element={<TiposDocumentoPage />}
              />
              <Route
                path="maestros-general/tipos-moneda"
                element={<TiposMonedaPage />}
              />
              <Route
                path="maestros-general/tipos-operacion"
                element={<TiposOperacionPage />}
              />
              <Route
                path="maestros-general/tipos-persona"
                element={<TiposPersonaPage />}
              />
              <Route
                path="maestros-general/tipos-sexo"
                element={<TiposSexoPage />}
              />
              <Route
                path="maestros-general/ubigeos"
                element={<UbigeosPage />}
              />
              <Route
                path="maestros-general/ubigeos/agregar"
                element={<AddUbigeosPage />}
              />
              <Route
                path="maestros-general/ubigeos/actualizar/:id"
                element={<EditUbigeosPage />}
              />
              <Route
                path="maestros-general/unidad-medida"
                element={<UnidadMedidaPage />}
              />

              {/* Vehículos Configuration */}

              <Route
                path="vehiculos/categorias"
                element={<CategoriasVehiculoPage />}
              />
              <Route
                path="vehiculos/categorias-checklist"
                element={<CategoriasChecklistPage />}
              />
              <Route
                path="vehiculos/checklist-entrega"
                element={<ChecklistEntregaPage />}
              />
              <Route
                path="vehiculos/checklist-recepcion"
                element={<ChecklistRecepcionPage />}
              />
              <Route
                path="vehiculos/colores-vehiculo"
                element={<ColoresVehiculoPage />}
              />
              <Route
                path="vehiculos/estados-vehiculo"
                element={<EstadosVehiculoPage />}
              />
              <Route
                path="vehiculos/estados-vehiculo/agregar"
                element={<AddEstadosVehiculoPage />}
              />
              <Route
                path="vehiculos/estados-vehiculo/actualizar/:id"
                element={<EditEstadosVehiculoPage />}
              />
              <Route
                path="vehiculos/familias"
                element={<FamiliasVehiculoPage />}
              />
              <Route
                path="vehiculos/grupo-marcas"
                element={<GrupoMarcasPage />}
              />
              <Route path="vehiculos/marcas" element={<MarcasVehiculoPage />} />
              <Route
                path="vehiculos/marcas/agregar"
                element={<AddMarcasVehiculoPage />}
              />
              <Route
                path="vehiculos/marcas/actualizar/:id"
                element={<EditMarcasVehiculoPage />}
              />
              <Route path="vehiculos/modelos-vn" element={<ModelosVNPage />} />
              <Route
                path="vehiculos/modelos-vn/agregar"
                element={<AddModelosVNPage />}
              />
              <Route
                path="vehiculos/modelos-vn/actualizar/:id"
                element={<EditModelosVNPage />}
              />
              <Route
                path="vehiculos/origen-vehiculo"
                element={<OrigenVehiculoPage />}
              />
              <Route
                path="vehiculos/tipos-carroceria"
                element={<TiposCarroceriaPage />}
              />
              <Route
                path="vehiculos/tipos-combustible"
                element={<TiposCombustiblePage />}
              />
              <Route
                path="vehiculos/tipos-motor"
                element={<TiposMotorPage />}
              />
              <Route
                path="vehiculos/tipos-pedido-proveedor"
                element={<TiposPedidoProveedorPage />}
              />
              <Route
                path="vehiculos/tipos-producto"
                element={<TiposProductoPage />}
              />
              <Route
                path="vehiculos/tipos-traccion"
                element={<TiposTraccionPage />}
              />
              <Route
                path="vehiculos/tipos-vehiculo"
                element={<TiposVehiculoPage />}
              />
              <Route
                path="vehiculos/transmision-vehiculo"
                element={<TransmisionVehiculoPage />}
              />

              {/* Ventas Configuration */}
              <Route
                path="ventas/asignar-grupo-marca"
                element={<AsignarGrupoMarcaPage />}
              />
              <Route
                path="ventas/asignar-grupo-marca/agregar"
                element={<AddAsignarGrupoMarcaPage />}
              />
              <Route
                path="ventas/asignar-grupo-marca/actualizar/:id"
                element={<EditAsignarGrupoMarcaPage />}
              />
              <Route path="ventas/asignar-jefe" element={<AsignarJefePage />} />
              <Route
                path="ventas/asignar-jefe/agregar"
                element={<AddAsignarJefePage />}
              />
              <Route
                path="ventas/asignar-jefe/actualizar/:id"
                element={<EditAsignarJefePage />}
              />
              <Route
                path="ventas/asignar-marca"
                element={<AsignarMarcaPage />}
              />
              <Route
                path="ventas/asignar-marca/gestionar"
                element={<AsignarMarcaGestionarPage />}
              />
              <Route path="ventas/asignar-sede" element={<AsignarSedePage />} />
              <Route
                path="ventas/asignar-sede/agregar"
                element={<AddAsignarSedePage />}
              />
              <Route
                path="ventas/asignar-sede/actualizar/:id"
                element={<EditAsignarSedePage />}
              />
              <Route
                path="ventas/metas-credito-seguro"
                element={<MetasCreditoSeguroPage />}
              />
              <Route path="ventas/metas-venta" element={<MetasVentaPage />} />
              <Route
                path="ventas/metas-venta/gestionar"
                element={<MetasVentaGestionarPage />}
              />
              <Route
                path="ventas/metas-venta/resumen"
                element={<MetasVentaResumenPage />}
              />
              <Route path="ventas/tiendas" element={<TiendasPage />} />
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
              {/* Accesorios */}
              <Route
                path="accesorios-homologados"
                element={<AccesoriosHomologadosPage />}
              />

              {/* Gestión de Productos */}
              <Route
                path="gestion-de-productos/categorias-producto"
                element={<CategoriasProductoPage />}
              />
              <Route
                path="gestion-de-productos/marcas-producto"
                element={<MarcasProductoPage />}
              />
              <Route
                path="gestion-de-productos/marcas-producto/agregar"
                element={<AddMarcasProductoPage />}
              />
              <Route
                path="gestion-de-productos/marcas-producto/actualizar/:id"
                element={<EditMarcasProductoPage />}
              />
              <Route
                path="gestion-de-productos/productos"
                element={<ProductosPage />}
              />
              <Route
                path="gestion-de-productos/productos/agregar"
                element={<AddProductosPage />}
              />
              <Route
                path="gestion-de-productos/productos/actualizar/:id"
                element={<EditProductosPage />}
              />
              <Route
                path="gestion-de-productos/tipos-categoria"
                element={<TiposCategoriaPage />}
              />

              {/* Gestion Compra */}
              <Route
                path="gestion-de-compras/orden-compra-producto"
                element={<PurchaseOrderProductsPage />}
              />
              <Route
                path="gestion-de-compras/orden-compra-producto/agregar"
                element={<AddPurchaseOrderProductsPage />}
              />
              <Route
                path="gestion-de-compras/orden-compra-producto/actualizar/:id"
                element={<EditPurchaseOrderProductsPage />}
              />
              <Route
                path="gestion-de-compras/orden-compra-producto/recepcion/:purchaseOrderId"
                element={<ReceptionPurchaseOrderProductsPage />}
              />
              <Route
                path="gestion-de-compras/orden-compra-producto/recepcion/agregar/:purchaseOrderId"
                element={<AddReceptionPurchaseOrderProductsPage />}
              />
              <Route
                path="gestion-de-compras/orden-compra-producto/recepcion/actualizar/:purchaseOrderId/:id"
                element={<EditReceptionPurchaseOrderProductsPage />}
              />

              {/* Taller */}
              <Route
                path="taller/lavado-vehiculo"
                element={<LavadoVehiculoPage />}
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
              <Route index element={<GPGestionSistemaPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route
                path="roles/permisos/:id"
                element={<RolesPermisosPage />}
              />
              <Route path="usuarios" element={<UsuariosPage />} />
              <Route
                path="usuarios/agregar"
                element={<UsuariosAgregarPage />}
              />
              <Route
                path="usuarios/actualizar/:id"
                element={<UsuariosActualizarPage />}
              />
              <Route path="vistas" element={<VistasPage />} />
              <Route path="vistas/agregar" element={<AddVistasPage />} />
              <Route
                path="vistas/actualizar/:id"
                element={<EditVistasPage />}
              />
              <Route
                path="vistas/permisos/:id"
                element={<VistasPermisosPage />}
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
                path="administracion-de-personal/trabajadores"
                element={<TrabajadoresPage />}
              />

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
                element={<EditPositionPage />}
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
                <EditHierarchicalCategoryPage />
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/ciclos",
                <CyclePage />,
                <AddCyclePage />,
                <UpdateCyclePage />,
                <CyclePersonDetailPage />
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/competencias",
                <CompetencesPage />,
                <AddCompetencePage />,
                <UpdateCompetencePage />
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/evaluaciones",
                <EvaluationPage />,
                <AddEvaluationPage />,
                <UpdateEvaluationPage />,
                <EvaluationPersonPage />
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
                <UpdateMetricPage />
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/objetivos",
                <ObjectivePage />,
                <AddObjectivePage />,
                <UpdateObjectivePage />
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/parametros",
                <ParameterPage />,
                <AddParameterPage />,
                <UpdateParameterPage />
              )}

              {RouterCrud(
                "evaluaciones-de-desempeno/periodos",
                <PeriodPage />,
                <AddPeriodPage />,
                <UpdatePeriodPage />
              )}

              <Route
                path="evaluaciones-de-desempeno/asignacion-pares"
                element={<EvaluatorParPage />}
              />

              {RouterCrud(
                "evaluaciones-de-desempeno/modelo-evaluacion",
                <EvaluationModelPage />,
                <AddEvaluationModelPage />,
                <UpdateEvaluationModelPage />
              )}
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
              <Route path="sede" element={<SedePage />} />
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
              <Route index element={<GPTicsPage />} />
              <Route path="auditoria" element={<AuditoriaPage />} />
              <Route path="equipos" element={<EquiposPage />} />
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
