import DashboardLayout from "@/src/features/dashboard/components/DashboardLayout";

export default function ModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
