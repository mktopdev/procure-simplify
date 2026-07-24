import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SupplierInvoiceTable } from "@/components/finance/SupplierInvoiceTable";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

const SupplierInvoices = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["supplier_invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_invoices")
        .select("*, suppliers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Factures Fournisseurs</h1>
          {hasPermission("finance.manage") && (
            <Button
              onClick={() => navigate("/finance/supplier-invoices/new")}
              className="bg-green-600 hover:bg-green-700"
            >
              Nouvelle Facture
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : invoices && invoices.length > 0 ? (
          <SupplierInvoiceTable
            invoices={invoices}
            onView={(invoice) => navigate(`/finance/supplier-invoices/${invoice.id}`)}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">Aucune facture</div>
        )}
      </motion.div>
    </div>
  );
};

export default SupplierInvoices;
