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
import { FC, lazy, Suspense } from "react";

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
// Nota: Los layouts de AP y GP se cargan automáticamente a través de los componentes dinámicos

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
const PerfilNamuPerformancePage = lazy(
  () => import("./app/perfil/namu-performance/page")
);
const PerfilVacacionesPage = lazy(() => import("./app/perfil/vacaciones/page"));



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
            {/* DYNAMIC ROUTES - AP (Automotores Pakatnamú) */}
            {/* Todas las rutas de AP se manejan dinámicamente */}
            {/* a través del diccionario en src/config/routeComponents.ts */}
            {/* ======================================================== */}

            {/* ======================================================== */}
            {/* DYNAMIC ROUTES - GP (Grupo Pakatnamú) */}
            {/* Todas las rutas de GP se manejan dinámicamente */}
            {/* a través del diccionario en src/config/routeComponents.ts */}
            {/* ======================================================== */}

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
