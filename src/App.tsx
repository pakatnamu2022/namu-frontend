import React, { Suspense } from "react";
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

// ============================================================================
// LAYOUTS
// ============================================================================
const DashboardLayout = React.lazy(
  () => import("./features/dashboard/components/DashboardLayout")
);
const MainLayout = React.lazy(
  () => import("./features/dashboard/components/MainLayout")
);
const ProfileLayout = React.lazy(() => import("./app/perfil/layout"));
const APComercialLayout = React.lazy(() => import("./app/ap/comercial/layout"));
const APConfiguracionesLayout = React.lazy(
  () => import("./app/ap/configuraciones/layout")
);
const APPostVentaLayout = React.lazy(
  () => import("./app/ap/post-venta/layout")
);
const GPGestionSistemaLayout = React.lazy(
  () => import("./app/gp/gestion-del-sistema/layout")
);
const GPGestionHumanaLayout = React.lazy(
  () => import("./app/gp/gestion-humana/layout")
);
const GPMaestroGeneralLayout = React.lazy(
  () => import("./app/gp/maestro-general/layout")
);
const GPTicsLayout = React.lazy(() => import("./app/gp/tics/layout"));

// ============================================================================
// ROOT & PUBLIC PAGES
// ============================================================================
const LoginPage = React.lazy(() => import("./app/page"));
const NotFoundPage = React.lazy(() => import("./app/not-found"));

// ============================================================================
// MAIN PAGES
// ============================================================================
const CompaniesPage = React.lazy(() => import("./app/companies/page"));
const FeedPage = React.lazy(() => import("./app/feed/page"));
const TestPage = React.lazy(() => import("./app/test/page"));

// Module Selection Pages
const ModulesCompanyPage = React.lazy(
  () => import("./app/modules/[company]/page")
);
const ModulesCompanyModulePage = React.lazy(
  () => import("./app/modules/[company]/[module]/page")
);

// Dynamic Routes
const CompanyModulePage = React.lazy(
  () => import("./app/[company]/[module]/page")
);
const CompanyModuleSubmodulePage = React.lazy(
  () => import("./app/[company]/[module]/[submodule]/page")
);

// ============================================================================
// PERFIL (PROFILE) PAGES
// ============================================================================
const PerfilPage = React.lazy(() => import("./app/perfil/page"));
const PerfilCapacitacionesPage = React.lazy(
  () => import("./app/perfil/capacitaciones/page")
);
const PerfilDesempenoPage = React.lazy(
  () => import("./app/perfil/desempeño/page")
);
const PerfilDocumentosPage = React.lazy(
  () => import("./app/perfil/documentos/page")
);
const PerfilEquipoPage = React.lazy(() => import("./app/perfil/equipo/page"));
const PerfilEquipoIndicadoresPage = React.lazy(
  () => import("./app/perfil/equipo/indicadores/page")
);
const PerfilEquipoDetailPage = React.lazy(
  () => import("./app/perfil/equipo/[id]/page")
);
const PerfilEquipoEvaluarPage = React.lazy(
  () => import("./app/perfil/equipo/[id]/evaluar/page")
);
const PerfilEquipoHistorialPage = React.lazy(
  () => import("./app/perfil/equipo/[id]/historial/page")
);
const PerfilNamuPerformancePage = React.lazy(
  () => import("./app/perfil/namu-performance/page")
);
const PerfilVacacionesPage = React.lazy(
  () => import("./app/perfil/vacaciones/page")
);

// ============================================================================
// AP - COMERCIAL
// ============================================================================

// Agenda
const AgendaPage = React.lazy(() => import("./app/ap/comercial/agenda/page"));
const AgendaOportunidadesPage = React.lazy(
  () => import("./app/ap/comercial/agenda/oportunidades/page")
);
const AgendaOportunidadesAgregarPage = React.lazy(
  () => import("./app/ap/comercial/agenda/oportunidades/agregar/page")
);
const AgendaOportunidadesActualizarPage = React.lazy(
  () => import("./app/ap/comercial/agenda/oportunidades/actualizar/[id]/page")
);
const AgendaOportunidadesDetailPage = React.lazy(
  () => import("./app/ap/comercial/agenda/oportunidades/[id]/page")
);

// Clientes
const ClientesPage = React.lazy(
  () => import("./app/ap/comercial/clientes/page")
);
const ClientesAgregarPage = React.lazy(
  () => import("./app/ap/comercial/clientes/agregar/page")
);
const ClientesActualizarPage = React.lazy(
  () => import("./app/ap/comercial/clientes/actualizar/[id]/page")
);
const ClientesEstablecimientosPage = React.lazy(
  () => import("./app/ap/comercial/clientes/establecimientos/[id]/page")
);
const ClientesEstablecimientosAgregarPage = React.lazy(
  () => import("./app/ap/comercial/clientes/establecimientos/[id]/agregar/page")
);
const ClientesEstablecimientosActualizarPage = React.lazy(
  () =>
    import(
      "./app/ap/comercial/clientes/establecimientos/[id]/actualizar/[establishmentId]/page"
    )
);

// Proveedores
const ProveedoresPage = React.lazy(
  () => import("./app/ap/comercial/proveedores/page")
);
const ProveedoresAgregarPage = React.lazy(
  () => import("./app/ap/comercial/proveedores/agregar/page")
);
const ProveedoresActualizarPage = React.lazy(
  () => import("./app/ap/comercial/proveedores/actualizar/[id]/page")
);
const ProveedoresEstablecimientosPage = React.lazy(
  () => import("./app/ap/comercial/proveedores/establecimientos/[id]/page")
);
const ProveedoresEstablecimientosAgregarPage = React.lazy(
  () =>
    import("./app/ap/comercial/proveedores/establecimientos/[id]/agregar/page")
);
const ProveedoresEstablecimientosActualizarPage = React.lazy(
  () =>
    import(
      "./app/ap/comercial/proveedores/establecimientos/[id]/actualizar/[establishmentId]/page"
    )
);

// Electronic Documents
const ElectronicDocumentsPage = React.lazy(
  () => import("./app/ap/comercial/electronic-documents/page")
);
const ElectronicDocumentsAgregarPage = React.lazy(
  () => import("./app/ap/comercial/electronic-documents/agregar/page")
);
const ElectronicDocumentsActualizarPage = React.lazy(
  () => import("./app/ap/comercial/electronic-documents/actualizar/[id]/page")
);
const ElectronicDocumentsCreditNotePage = React.lazy(
  () => import("./app/ap/comercial/electronic-documents/[id]/credit-note/page")
);
const ElectronicDocumentsCreditNoteActualizarPage = React.lazy(
  () =>
    import(
      "./app/ap/comercial/electronic-documents/[id]/credit-note/actualizar/[credit]/page"
    )
);
const ElectronicDocumentsDebitNotePage = React.lazy(
  () => import("./app/ap/comercial/electronic-documents/[id]/debit-note/page")
);
const ElectronicDocumentsDebitNoteActualizarPage = React.lazy(
  () =>
    import(
      "./app/ap/comercial/electronic-documents/[id]/debit-note/actualizar/[debit]/page"
    )
);

// Vehículos
const VehiculosPage = React.lazy(
  () => import("./app/ap/comercial/vehiculos/page")
);
const CompraVehiculoNuevoPage = React.lazy(
  () => import("./app/ap/comercial/compra-vehiculo-nuevo/page")
);
const CompraVehiculoNuevoAgregarPage = React.lazy(
  () => import("./app/ap/comercial/compra-vehiculo-nuevo/agregar/page")
);
const CompraVehiculoNuevoReenviarPage = React.lazy(
  () => import("./app/ap/comercial/compra-vehiculo-nuevo/reenviar/[id]/page")
);
const EntregaVehiculoPage = React.lazy(
  () => import("./app/ap/comercial/entrega-vehiculo/page")
);
const EntregaVehiculoAgregarPage = React.lazy(
  () => import("./app/ap/comercial/entrega-vehiculo/agregar/page")
);
const EntregaVehiculoGuiaRemisionPage = React.lazy(
  () => import("./app/ap/comercial/entrega-vehiculo/guia-remision/[id]/page")
);
const EnviosRecepcionesPage = React.lazy(
  () => import("./app/ap/comercial/envios-recepciones/page")
);
const EnviosRecepcionesAgregarPage = React.lazy(
  () => import("./app/ap/comercial/envios-recepciones/agregar/page")
);
const EnviosRecepcionesActualizarPage = React.lazy(
  () => import("./app/ap/comercial/envios-recepciones/actualizar/[id]/page")
);
const EnviosRecepcionesChecklistPage = React.lazy(
  () => import("./app/ap/comercial/envios-recepciones/checklist/[id]/page")
);

// Ventas & Leads
const VisitasTiendaPage = React.lazy(
  () => import("./app/ap/comercial/visitas-tienda/page")
);
const VisitasTiendaAgregarPage = React.lazy(
  () => import("./app/ap/comercial/visitas-tienda/agregar/page")
);
const VisitasTiendaActualizarPage = React.lazy(
  () => import("./app/ap/comercial/visitas-tienda/actualizar/[id]/page")
);
const GestionarLeadsPage = React.lazy(
  () => import("./app/ap/comercial/gestionar-leads/page")
);
const SolicitudesCotizacionesPage = React.lazy(
  () => import("./app/ap/comercial/solicitudes-cotizaciones/page")
);
const SolicitudesCotizacionesAgregarPage = React.lazy(
  () => import("./app/ap/comercial/solicitudes-cotizaciones/agregar/page")
);
const SolicitudesCotizacionesActualizarPage = React.lazy(
  () =>
    import("./app/ap/comercial/solicitudes-cotizaciones/actualizar/[id]/page")
);
const DashboardVisitasLeadsPage = React.lazy(
  () => import("./app/ap/comercial/dashboard-visitas-leads/page")
);
const MotivosDescartePage = React.lazy(
  () => import("./app/ap/comercial/motivos-descarte/page")
);

// ============================================================================
// AP - CONFIGURACIONES
// ============================================================================

// Maestros General
const ActividadEconomicaPage = React.lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/actividad-economica/page")
);
const AlmacenesPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/almacenes/page")
);
const AlmacenesAgregarPage = React.lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/almacenes/agregar/page")
);
const AlmacenesActualizarPage = React.lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/almacenes/actualizar/[id]/page"
    )
);
const AsignarSerieUsuarioPage = React.lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/asignar-serie-usuario/page"
    )
);
const AsignarSerieVentaPage = React.lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/asignar-serie-venta/page")
);
const BancosPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/bancos/page")
);
const ChequerasPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/chequeras/page")
);
const ClaseArticuloPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/clase-articulo/page")
);
const EstadoCivilPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/estado-civil/page")
);
const OrigenClientePage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/origen-cliente/page")
);
const PlanCuentaContablePage = React.lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/plan-cuenta-contable/page"
    )
);
const SegmentosPersonaPage = React.lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/segmentos-persona/page")
);
const TiposClaseImpuestoPage = React.lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/tipos-clase-impuesto/page"
    )
);
const TiposComprobantePage = React.lazy(
  () =>
    import("./app/ap/configuraciones/maestros-general/tipos-comprobante/page")
);
const TiposCuentaContablePage = React.lazy(
  () =>
    import(
      "./app/ap/configuraciones/maestros-general/tipos-cuenta-contable/page"
    )
);
const TiposDocumentoPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-documento/page")
);
const TiposMonedaPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-moneda/page")
);
const TiposOperacionPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-operacion/page")
);
const TiposPersonaPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-persona/page")
);
const TiposSexoPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/tipos-sexo/page")
);
const UbigeosPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/ubigeos/page")
);
const UnidadMedidaPage = React.lazy(
  () => import("./app/ap/configuraciones/maestros-general/unidad-medida/page")
);

// Vehículos Configuration
const CategoriasVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/categorias/page")
);
const CategoriasChecklistPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/categorias-checklist/page")
);
const ChecklistEntregaPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/checklist-entrega/page")
);
const ChecklistRecepcionPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/checklist-recepcion/page")
);
const ColoresVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/colores-vehiculo/page")
);
const EstadosVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/estados-vehiculo/page")
);
const FamiliasVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/familias/page")
);
const GrupoMarcasPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/grupo-marcas/page")
);
const MarcasVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/marcas/page")
);
const ModelosVNPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/modelos-vn/page")
);
const OrigenVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/origen-vehiculo/page")
);
const TiposCarroceriaPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-carroceria/page")
);
const TiposCombustiblePage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-combustible/page")
);
const TiposMotorPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-motor/page")
);
const TiposPedidoProveedorPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-pedido-proveedor/page")
);
const TiposProductoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-producto/page")
);
const TiposTraccionPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-traccion/page")
);
const TiposVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/tipos-vehiculo/page")
);
const TransmisionVehiculoPage = React.lazy(
  () => import("./app/ap/configuraciones/vehiculos/transmision-vehiculo/page")
);

// Ventas Configuration
const AsignarGrupoMarcaPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-grupo-marca/page")
);
const AsignarJefePage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-jefe/page")
);
const AsignarMarcaPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-marca/page")
);
const AsignarMarcaGestionarPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-marca/gestionar/page")
);
const AsignarSedePage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/asignar-sede/page")
);
const MetasCreditoSeguroPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/metas-credito-seguro/page")
);
const MetasVentaPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/metas-venta/page")
);
const MetasVentaGestionarPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/metas-venta/gestionar/page")
);
const MetasVentaResumenPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/metas-venta/resumen/page")
);
const TiendasPage = React.lazy(
  () => import("./app/ap/configuraciones/ventas/tiendas/page")
);

// ============================================================================
// AP - POST-VENTA
// ============================================================================

// Accesorios
const AccesoriosHomologadosPage = React.lazy(
  () => import("./app/ap/post-venta/accesorios-homologados/page")
);

// Gestión de Productos
const CategoriasProductoPage = React.lazy(
  () =>
    import("./app/ap/post-venta/gestion-de-productos/categorias-producto/page")
);
const MarcasProductoPage = React.lazy(
  () => import("./app/ap/post-venta/gestion-de-productos/marcas-producto/page")
);
const ProductosPage = React.lazy(
  () => import("./app/ap/post-venta/gestion-de-productos/productos/page")
);
const TiposCategoriaPage = React.lazy(
  () => import("./app/ap/post-venta/gestion-de-productos/tipos-categoria/page")
);

// Taller
const LavadoVehiculoPage = React.lazy(
  () => import("./app/ap/post-venta/taller/lavado-vehiculo/page")
);

// ============================================================================
// GP - GESTION DEL SISTEMA
// ============================================================================
const GPGestionSistemaPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/page")
);
const RolesPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/roles/page")
);
const RolesPermisosPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/roles/permisos/[id]/page")
);
const UsuariosPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/usuarios/page")
);
const UsuariosAgregarPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/usuarios/agregar/page")
);
const UsuariosActualizarPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/usuarios/actualizar/[id]/page")
);
const VistasPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/page")
);
const VistasAgregarPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/agregar/page")
);
const VistasActualizarPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/actualizar/[id]/page")
);
const VistasPermisosPage = React.lazy(
  () => import("./app/gp/gestion-del-sistema/vistas/permisos/[id]/page")
);

// ============================================================================
// GP - GESTION HUMANA
// ============================================================================

// Administración de Personal
const TrabajadoresPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/administracion-de-personal/trabajadores/page"
    )
);

// Configuraciones
const PosicionesPage = React.lazy(
  () => import("./app/gp/gestion-humana/configuraciones/posiciones/page")
);

// Evaluaciones de Desempeño
const EvaluacionesDesempenoPage = React.lazy(
  () => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/page")
);
const CategoriasJerarquicasPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/page"
    )
);
const CiclosPage = React.lazy(
  () => import("./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/page")
);
const CiclosDetailPage = React.lazy(
  () =>
    import("./app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/[id]/page")
);
const CompetenciasPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/page"
    )
);
const EvaluacionesPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/page"
    )
);
const EvaluacionesDetailPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/[id]/page"
    )
);
const EvaluacionesDetallesPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/page"
    )
);
const EvaluacionesDetallesPersonPage = React.lazy(
  () =>
    import(
      "./app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/[person]/page"
    )
);
const ExcluidosPage = React.lazy(
  () =>
    import("./app/gp/gestion-humana/evaluaciones-de-desempeno/excluidos/page")
);
const MetricasPage = React.lazy(
  () =>
    import("./app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/page")
);
const ObjetivosPage = React.lazy(
  () =>
    import("./app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/page")
);
const ParametrosPage = React.lazy(
  () =>
    import("./app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/page")
);
const PeriodosPage = React.lazy(
  () =>
    import("./app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/page")
);

// ============================================================================
// GP - MAESTRO GENERAL
// ============================================================================
const SedePage = React.lazy(() => import("./app/gp/maestro-general/sede/page"));

// ============================================================================
// GP - TICS
// ============================================================================
const GPTicsPage = React.lazy(() => import("./app/gp/tics/page"));
const AuditoriaPage = React.lazy(() => import("./app/gp/tics/auditoria/page"));
const EquiposPage = React.lazy(() => import("./app/gp/tics/equipos/page"));

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
                <Outlet />
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
                path="namu-performance"
                element={<PerfilNamuPerformancePage />}
              />
              <Route path="vacaciones" element={<PerfilVacacionesPage />} />
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
              {/* Agenda */}
              <Route path="agenda" element={<AgendaPage />} />
              <Route
                path="agenda/oportunidades"
                element={<AgendaOportunidadesPage />}
              />
              <Route
                path="agenda/oportunidades/agregar"
                element={<AgendaOportunidadesAgregarPage />}
              />
              <Route
                path="agenda/oportunidades/actualizar/:id"
                element={<AgendaOportunidadesActualizarPage />}
              />
              <Route
                path="agenda/oportunidades/:id"
                element={<AgendaOportunidadesDetailPage />}
              />

              {/* Clientes */}
              <Route path="clientes" element={<ClientesPage />} />
              <Route
                path="clientes/agregar"
                element={<ClientesAgregarPage />}
              />
              <Route
                path="clientes/actualizar/:id"
                element={<ClientesActualizarPage />}
              />
              <Route
                path="clientes/establecimientos/:id"
                element={<ClientesEstablecimientosPage />}
              />
              <Route
                path="clientes/establecimientos/:id/agregar"
                element={<ClientesEstablecimientosAgregarPage />}
              />
              <Route
                path="clientes/establecimientos/:id/actualizar/:establishmentId"
                element={<ClientesEstablecimientosActualizarPage />}
              />

              {/* Proveedores */}
              <Route path="proveedores" element={<ProveedoresPage />} />
              <Route
                path="proveedores/agregar"
                element={<ProveedoresAgregarPage />}
              />
              <Route
                path="proveedores/actualizar/:id"
                element={<ProveedoresActualizarPage />}
              />
              <Route
                path="proveedores/establecimientos/:id"
                element={<ProveedoresEstablecimientosPage />}
              />
              <Route
                path="proveedores/establecimientos/:id/agregar"
                element={<ProveedoresEstablecimientosAgregarPage />}
              />
              <Route
                path="proveedores/establecimientos/:id/actualizar/:establishmentId"
                element={<ProveedoresEstablecimientosActualizarPage />}
              />

              {/* Electronic Documents */}
              <Route
                path="electronic-documents"
                element={<ElectronicDocumentsPage />}
              />
              <Route
                path="electronic-documents/agregar"
                element={<ElectronicDocumentsAgregarPage />}
              />
              <Route
                path="electronic-documents/actualizar/:id"
                element={<ElectronicDocumentsActualizarPage />}
              />
              <Route
                path="electronic-documents/:id/credit-note"
                element={<ElectronicDocumentsCreditNotePage />}
              />
              <Route
                path="electronic-documents/:id/credit-note/actualizar/:credit"
                element={<ElectronicDocumentsCreditNoteActualizarPage />}
              />
              <Route
                path="electronic-documents/:id/debit-note"
                element={<ElectronicDocumentsDebitNotePage />}
              />
              <Route
                path="electronic-documents/:id/debit-note/actualizar/:debit"
                element={<ElectronicDocumentsDebitNoteActualizarPage />}
              />

              {/* Vehículos */}
              <Route path="vehiculos" element={<VehiculosPage />} />
              <Route
                path="compra-vehiculo-nuevo"
                element={<CompraVehiculoNuevoPage />}
              />
              <Route
                path="compra-vehiculo-nuevo/agregar"
                element={<CompraVehiculoNuevoAgregarPage />}
              />
              <Route
                path="compra-vehiculo-nuevo/reenviar/:id"
                element={<CompraVehiculoNuevoReenviarPage />}
              />
              <Route
                path="entrega-vehiculo"
                element={<EntregaVehiculoPage />}
              />
              <Route
                path="entrega-vehiculo/agregar"
                element={<EntregaVehiculoAgregarPage />}
              />
              <Route
                path="entrega-vehiculo/guia-remision/:id"
                element={<EntregaVehiculoGuiaRemisionPage />}
              />
              <Route
                path="envios-recepciones"
                element={<EnviosRecepcionesPage />}
              />
              <Route
                path="envios-recepciones/agregar"
                element={<EnviosRecepcionesAgregarPage />}
              />
              <Route
                path="envios-recepciones/actualizar/:id"
                element={<EnviosRecepcionesActualizarPage />}
              />
              <Route
                path="envios-recepciones/checklist/:id"
                element={<EnviosRecepcionesChecklistPage />}
              />

              {/* Ventas & Leads */}
              <Route path="visitas-tienda" element={<VisitasTiendaPage />} />
              <Route
                path="visitas-tienda/agregar"
                element={<VisitasTiendaAgregarPage />}
              />
              <Route
                path="visitas-tienda/actualizar/:id"
                element={<VisitasTiendaActualizarPage />}
              />
              <Route path="gestionar-leads" element={<GestionarLeadsPage />} />
              <Route
                path="solicitudes-cotizaciones"
                element={<SolicitudesCotizacionesPage />}
              />
              <Route
                path="solicitudes-cotizaciones/agregar"
                element={<SolicitudesCotizacionesAgregarPage />}
              />
              <Route
                path="solicitudes-cotizaciones/actualizar/:id"
                element={<SolicitudesCotizacionesActualizarPage />}
              />
              <Route
                path="dashboard-visitas-leads"
                element={<DashboardVisitasLeadsPage />}
              />
              <Route
                path="motivos-descarte"
                element={<MotivosDescartePage />}
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
                element={<AlmacenesAgregarPage />}
              />
              <Route
                path="maestros-general/almacenes/actualizar/:id"
                element={<AlmacenesActualizarPage />}
              />
              <Route
                path="maestros-general/asignar-serie-usuario"
                element={<AsignarSerieUsuarioPage />}
              />
              <Route
                path="maestros-general/asignar-serie-venta"
                element={<AsignarSerieVentaPage />}
              />
              <Route path="maestros-general/bancos" element={<BancosPage />} />
              <Route
                path="maestros-general/chequeras"
                element={<ChequerasPage />}
              />
              <Route
                path="maestros-general/clase-articulo"
                element={<ClaseArticuloPage />}
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
                path="vehiculos/familias"
                element={<FamiliasVehiculoPage />}
              />
              <Route
                path="vehiculos/grupo-marcas"
                element={<GrupoMarcasPage />}
              />
              <Route path="vehiculos/marcas" element={<MarcasVehiculoPage />} />
              <Route path="vehiculos/modelos-vn" element={<ModelosVNPage />} />
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
              <Route path="ventas/asignar-jefe" element={<AsignarJefePage />} />
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
                path="gestion-de-productos/productos"
                element={<ProductosPage />}
              />
              <Route
                path="gestion-de-productos/tipos-categoria"
                element={<TiposCategoriaPage />}
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
              <Route path="vistas/agregar" element={<VistasAgregarPage />} />
              <Route
                path="vistas/actualizar/:id"
                element={<VistasActualizarPage />}
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
                element={<PosicionesPage />}
              />

              {/* Evaluaciones de Desempeño */}
              <Route
                path="evaluaciones-de-desempeno"
                element={<EvaluacionesDesempenoPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/categorias-jerarquicas"
                element={<CategoriasJerarquicasPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/ciclos"
                element={<CiclosPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/ciclos/:id"
                element={<CiclosDetailPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/competencias"
                element={<CompetenciasPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/evaluaciones"
                element={<EvaluacionesPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/evaluaciones/:id"
                element={<EvaluacionesDetailPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/evaluaciones/detalles/:id"
                element={<EvaluacionesDetallesPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/evaluaciones/detalles/:id/:person"
                element={<EvaluacionesDetallesPersonPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/excluidos"
                element={<ExcluidosPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/metricas"
                element={<MetricasPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/objetivos"
                element={<ObjetivosPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/parametros"
                element={<ParametrosPage />}
              />
              <Route
                path="evaluaciones-de-desempeno/periodos"
                element={<PeriodosPage />}
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
