import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageTransition } from "@/components/ui/PageTransition";
import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";
import { motion } from "framer-motion";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { DataVisualizations } from "@/components/dashboard/DataVisualizations";
import { RoleSpecificWidgets } from "@/components/dashboard/RoleSpecificWidgets";

const Index = () => {
  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-8"
          >
            <OverviewCards />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecentSubmissions />
              </div>
              <div>
                <AlertsSection />
              </div>
            </div>
            <DataVisualizations />
            <RoleSpecificWidgets />
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Index;