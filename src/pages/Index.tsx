import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-[80vh] flex items-center justify-center"
      >
        <h1 className="text-4xl font-bold text-white">Welcome to Procurement Dashboard</h1>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;