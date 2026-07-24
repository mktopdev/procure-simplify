import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { RFQTable } from "@/components/procurement/RFQTable";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";

const RFQs = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ["rfqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rfqs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Demandes de Devis (RFQ)</h1>
          {hasPermission("procurement.manage") && (
            <Button onClick={() => navigate("/procurement/rfqs/new")} className="bg-green-600 hover:bg-green-700">
              Nouvelle RFQ
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : rfqs && rfqs.length > 0 ? (
          <RFQTable rfqs={rfqs} onView={(rfq) => navigate(`/procurement/rfqs/${rfq.id}`)} />
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">Aucune RFQ</div>
        )}
      </motion.div>
    </div>
  );
};

export default RFQs;
