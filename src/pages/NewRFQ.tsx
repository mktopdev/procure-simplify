import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RFQForm } from "@/components/procurement/RFQForm";

const NewRFQ = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nouvelle Demande de Devis</h1>
        <RFQForm
          onCreated={(id) => navigate(`/procurement/rfqs/${id}`)}
          onCancel={() => navigate("/procurement/rfqs")}
        />
      </motion.div>
    </div>
  );
};

export default NewRFQ;
