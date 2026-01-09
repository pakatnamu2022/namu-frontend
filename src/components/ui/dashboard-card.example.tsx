/**
 * DashboardCard Component - Usage Examples
 *
 * This file demonstrates how to use the DashboardCard component with different variants and colors.
 */

import { DashboardCard } from "./dashboard-card";
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react";

export function DashboardCardExamples() {
  return (
    <div className="space-y-8 p-6">
      {/* Outline Variant Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Variant: Outline (Default)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Total Users"
            value={1234}
            description="Active users this month"
            icon={Users}
            variant="outline"
          />

          <DashboardCard
            title="Revenue"
            value="$45,231"
            description="Total revenue"
            icon={DollarSign}
            variant="outline"
            color="green"
            colorIntensity="600"
          />

          <DashboardCard
            title="Growth"
            value="+12.5%"
            description="Compared to last month"
            icon={TrendingUp}
            variant="outline"
            color="blue"
            colorIntensity="500"
          />

          <DashboardCard
            title="Active Sessions"
            value={89}
            description="75% completion rate"
            icon={Activity}
            variant="outline"
            color="purple"
            colorIntensity="600"
            showProgress
            progressValue={75}
            progressMax={100}
          />
        </div>
      </section>

      {/* Default Variant Examples - Colored Backgrounds */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Variant: Default (Colored Backgrounds)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Blue Card"
            value={250}
            description="With blue background"
            icon={Users}
            variant="default"
            color="blue"
            colorIntensity="600"
          />

          <DashboardCard
            title="Green Card"
            value={180}
            description="With green background"
            icon={TrendingUp}
            variant="default"
            color="green"
            colorIntensity="600"
          />

          <DashboardCard
            title="Orange Card"
            value={95}
            description="With orange background"
            icon={Activity}
            variant="default"
            color="orange"
            colorIntensity="500"
          />

          <DashboardCard
            title="Purple Card"
            value={420}
            description="With purple background"
            icon={DollarSign}
            variant="default"
            color="purple"
            colorIntensity="600"
          />
        </div>
      </section>

      {/* Progress Bar Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">With Progress Bars</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="Completed Tasks"
            value={45}
            description="60% of total tasks"
            icon={Activity}
            variant="outline"
            color="green"
            colorIntensity="600"
            showProgress
            progressValue={60}
            progressMax={100}
          />

          <DashboardCard
            title="Storage Used"
            value="850 GB"
            description="85% of 1TB"
            icon={Activity}
            variant="default"
            color="amber"
            colorIntensity="500"
            showProgress
            progressValue={850}
            progressMax={1000}
          />

          <DashboardCard
            title="Goals Achieved"
            value={28}
            description="93% success rate"
            icon={TrendingUp}
            variant="outline"
            color="emerald"
            colorIntensity="600"
            showProgress
            progressValue={93}
            progressMax={100}
          />
        </div>
      </section>

      {/* Color Palette Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Available Colors (Intensity 600)</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {[
            "slate",
            "gray",
            "zinc",
            "neutral",
            "stone",
            "red",
            "orange",
            "amber",
            "yellow",
            "lime",
            "green",
            "emerald",
            "teal",
            "cyan",
            "sky",
            "blue",
            "indigo",
            "violet",
            "purple",
            "fuchsia",
            "pink",
            "rose",
          ].map((color) => (
            <DashboardCard
              key={color}
              title={color.charAt(0).toUpperCase() + color.slice(1)}
              value={100}
              icon={Users}
              variant="default"
              color={color as any}
              colorIntensity="600"
            />
          ))}
        </div>
      </section>

      {/* Light vs Dark Color Intensities */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Color Intensities (Blue)</h2>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map(
            (intensity) => (
              <DashboardCard
                key={intensity}
                title={`Blue ${intensity}`}
                value={intensity}
                icon={Users}
                variant="default"
                color="blue"
                colorIntensity={intensity as any}
              />
            )
          )}
        </div>
      </section>
    </div>
  );
}
