import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrderTable } from "@/components/procurement/PurchaseOrderTable";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

const PurchaseOrders = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: purchaseOrders, isLoading } = useQuery({
    queryKey: ["purchase_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
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
          <h1 className="text-2xl font-semibold text-gray-900">Bons de Commande</h1>
          {hasPermission("procurement.manage") && (
            <Button
              onClick={() => navigate("/procurement/purchase-orders/new")}
              className="bg-green-600 hover:bg-green-700"
            >
              Nouveau Bon de Commande
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : purchaseOrders && purchaseOrders.length > 0 ? (
          <PurchaseOrderTable
            purchaseOrders={purchaseOrders}
            onView={(po) => navigate(`/procurement/purchase-orders/${po.id}`)}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            Aucun bon de commande
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PurchaseOrders;
