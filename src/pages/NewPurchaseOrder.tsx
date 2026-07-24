import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PurchaseOrderForm } from "@/components/procurement/PurchaseOrderForm";

const NewPurchaseOrder = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nouveau Bon de Commande</h1>
        <PurchaseOrderForm
          onCreated={(id) => navigate(`/procurement/purchase-orders/${id}`)}
          onCancel={() => navigate("/procurement/purchase-orders")}
        />
      </motion.div>
    </div>
  );
};

export default NewPurchaseOrder;
