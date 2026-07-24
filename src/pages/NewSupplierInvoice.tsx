import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SupplierInvoiceForm } from "@/components/finance/SupplierInvoiceForm";

const NewSupplierInvoice = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Nouvelle Facture Fournisseur</h1>
        <SupplierInvoiceForm
          onCreated={(id) => navigate(`/finance/supplier-invoices/${id}`)}
          onCancel={() => navigate("/finance/supplier-invoices")}
        />
      </motion.div>
    </div>
  );
};

export default NewSupplierInvoice;
