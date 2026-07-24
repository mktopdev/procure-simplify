import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TransportOrderForm } from "@/components/transport/TransportOrderForm";

const NewTransportOrder = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nouvel Ordre de Transport</h1>
        <TransportOrderForm
          onCreated={(id) => navigate(`/transport/orders/${id}`)}
          onCancel={() => navigate("/transport/orders")}
        />
      </motion.div>
    </div>
  );
};

export default NewTransportOrder;
