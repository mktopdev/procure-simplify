import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SupplierForm } from "@/components/suppliers/SupplierForm";

const NewSupplier = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nouveau Fournisseur</h1>
        <SupplierForm
          onSaved={(supplier) => navigate(`/suppliers/${supplier.id}`)}
          onCancel={() => navigate("/suppliers")}
        />
      </motion.div>
    </div>
  );
};

export default NewSupplier;
