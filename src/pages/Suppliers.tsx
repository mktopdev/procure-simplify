import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { SupplierTable } from "@/components/suppliers/SupplierTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/usePermissions";
import type { Database } from "@/integrations/supabase/types";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

const Suppliers = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredSuppliers = suppliers?.filter((supplier: Supplier) =>
    [supplier.name, supplier.trading_name, supplier.category]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Fournisseurs</h1>
          {hasPermission("suppliers.manage") && (
            <Button
              onClick={() => navigate("/suppliers/new")}
              className="bg-green-600 hover:bg-green-700"
            >
              Nouveau Fournisseur
            </Button>
          )}
        </div>

        <Input
          placeholder="Rechercher un fournisseur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : filteredSuppliers && filteredSuppliers.length > 0 ? (
          <SupplierTable suppliers={filteredSuppliers} onView={(s) => navigate(`/suppliers/${s.id}`)} />
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            Aucun fournisseur trouvé
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Suppliers;
