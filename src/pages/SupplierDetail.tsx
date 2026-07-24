import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { SupplierContacts } from "@/components/suppliers/SupplierContacts";
import { SupplierBankAccounts } from "@/components/suppliers/SupplierBankAccounts";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";
import { usePermissions } from "@/hooks/usePermissions";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);

  const { data: supplier, isLoading, refetch } = useQuery({
    queryKey: ["supplier", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !supplier) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  const canManage = hasPermission("suppliers.manage");

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/suppliers")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{supplier.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{supplier.category || "général"}</Badge>
                <Badge variant="outline">{supplier.status}</Badge>
              </div>
            </div>
          </div>
          {canManage && !isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" /> Modifier
            </Button>
          )}
        </div>

        {isEditing ? (
          <SupplierForm
            supplier={supplier}
            onSaved={() => {
              setIsEditing(false);
              refetch();
            }}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nom Commercial</span>
              <p className="font-medium">{supplier.trading_name || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Numéro Fiscal</span>
              <p className="font-medium">{supplier.tax_number || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Email</span>
              <p className="font-medium">{supplier.email || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Téléphone</span>
              <p className="font-medium">{supplier.phone || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Adresse</span>
              <p className="font-medium">
                {[supplier.address, supplier.city, supplier.country].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Conditions de Paiement</span>
              <p className="font-medium">{supplier.payment_terms || "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Niveau de Risque</span>
              <p className="font-medium capitalize">{supplier.risk_rating}</p>
            </div>
            {supplier.notes && (
              <div className="sm:col-span-2">
                <span className="text-gray-500">Notes</span>
                <p className="font-medium">{supplier.notes}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SupplierContacts supplierId={supplier.id} canManage={canManage} />
          <SupplierBankAccounts supplierId={supplier.id} canManage={canManage} />
        </div>

        <DocumentsPanel ownerType="supplier" ownerId={supplier.id} canManage={canManage} />
      </motion.div>
    </div>
  );
};

export default SupplierDetail;
