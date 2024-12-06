import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DepartmentSelection } from "@/components/department/DepartmentSelection";
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
        <DepartmentSelection />
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;