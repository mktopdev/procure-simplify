import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const departments = [
  { id: "carrieres", name: "Carrières" },
  { id: "routes", name: "Routes" },
  { id: "mines", name: "Mines" },
  { id: "agriculture", name: "Agriculture" },
  { id: "siege_social", name: "Siège Social" },
];

const Expressions = () => {
  const navigate = useNavigate();

  const handleDepartmentSelect = (departmentId: string) => {
    navigate(`/expressions/form/${departmentId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-6 text-[#276955]">
            Sélectionnez votre département
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Button
                key={dept.id}
                onClick={() => handleDepartmentSelect(dept.id)}
                className="h-24 text-lg bg-gradient-to-br from-[#276955] to-[#E16C31] hover:opacity-90 transition-opacity"
              >
                {dept.name}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Expressions;