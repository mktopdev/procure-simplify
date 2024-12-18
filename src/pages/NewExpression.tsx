import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";
import { motion } from "framer-motion";

const NewExpression = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h1 className="text-2xl font-semibold text-gray-900">
            Nouvelle Demande d'Achat
          </h1>
          <ExpressionOfNeedForm />
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NewExpression;