import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TransportOrderTable } from "@/components/transport/TransportOrderTable";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

const TransportOrders = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["transport_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transport_orders")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Ordres de Transport</h1>
          {hasPermission("transport.manage") && (
            <Button onClick={() => navigate("/transport/orders/new")} className="bg-green-600 hover:bg-green-700">
              Nouvel Ordre de Transport
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : orders && orders.length > 0 ? (
          <TransportOrderTable orders={orders} onView={(order) => navigate(`/transport/orders/${order.id}`)} />
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            Aucun ordre de transport
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TransportOrders;
