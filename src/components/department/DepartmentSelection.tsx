import { Building2, Construction, Road, Tractor, Pickaxe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const departments = [
  {
    id: "carrieres",
    name: "Carrières",
    icon: Construction,
  },
  {
    id: "routes",
    name: "Routes",
    icon: Road,
  },
  {
    id: "mines",
    name: "Mines",
    icon: Pickaxe,
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: Tractor,
  },
  {
    id: "siege_social",
    name: "Siège Social",
    icon: Building2,
  },
];

export const DepartmentSelection = () => {
  const navigate = useNavigate();

  const handleDepartmentClick = (departmentId: string) => {
    navigate(`/expression-de-besoin?department=${departmentId}`);
  };

  return (
    <div className="w-full max-w-4xl p-6">
      <h1 className="text-3xl font-bold text-white text-center mb-12">
        Sélectionnez votre département
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department, index) => (
          <motion.button
            key={department.id}
            onClick={() => handleDepartmentClick(department.id)}
            className="group relative flex flex-col items-center justify-center p-8 rounded-lg bg-gradient-to-br from-[#276955] via-[#E16C31] to-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <department.icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-lg font-semibold text-white group-hover:underline">
              {department.name}
            </span>
            <div className="absolute inset-0 bg-white/5 rounded-lg backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};