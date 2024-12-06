import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageTransition } from "@/components/ui/PageTransition";
import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-semibold"
            >
              Welcome to Procurement Management
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-gray-600"
            >
              Submit a new expression of need or manage existing requests
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-medium">Pending Requests</h3>
              <p className="text-3xl font-semibold mt-2">12</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-medium">Active Orders</h3>
              <p className="text-3xl font-semibold mt-2">8</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-medium">Completed This Month</h3>
              <p className="text-3xl font-semibold mt-2">45</p>
            </motion.div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">New Expression of Need</h2>
            <ExpressionOfNeedForm />
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default Index;