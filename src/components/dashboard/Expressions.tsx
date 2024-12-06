import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, Mountain, TreePine, Building, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";

const departments = [
  { id: "carrieres", name: "Carrières", icon: Mountain },
  { id: "routes", name: "Routes", icon: Navigation },
  { id: "mines", name: "Mines", icon: Building2 },
  { id: "agriculture", name: "Agriculture", icon: TreePine },
  { id: "siege_social", name: "Siège Social", icon: Building },
];

const Expressions = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();

  const handleDepartmentSelect = (departmentId: string) => {
    navigate(`/expressions/form/${departmentId}`);
  };

  // If we have a departmentId, show the form, otherwise show department selection
  if (departmentId) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate('/expressions')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              ← Retour à la sélection du département
            </button>
          </motion.div>
          <ExpressionOfNeedForm />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg"
        >
          <h2 className="text-2xl font-semibold mb-8 text-gray-800 text-center">
            Sélectionnez votre département
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <motion.button
                  key={dept.id}
                  onClick={() => handleDepartmentSelect(dept.id)}
                  className="group relative flex items-center w-full p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#276955] to-[#E16C31] opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  
                  <div className="mr-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-[#276955] to-[#E16C31] text-white">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  <span className="text-lg font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                    {dept.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Expressions;