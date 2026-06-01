import DashboardLayout from "@/features/dashboard/components/DashboardLayout";

export default function DPComercialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
