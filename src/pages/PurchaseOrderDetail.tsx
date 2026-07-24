import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApprovalRule } from "@/hooks/useApprovalRule";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";
import { GoodsReceiptRecorder } from "@/components/procurement/GoodsReceiptRecorder";

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: po, isLoading } = useQuery({
    queryKey: ["purchase_order", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*, suppliers(name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: items } = useQuery({
    queryKey: ["purchase_order_items", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_order_items")
        .select("*")
        .eq("purchase_order_id", id!);
      if (error) throw error;
      return data;
    },
  });

  const total = (items ?? []).reduce((sum, item) => sum + item.line_total, 0);
  const { requiredRoleName, canApprove } = useApprovalRule("procurement", "purchase_order", total);

  const handleApprove = async () => {
    if (!id) return;
    try {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status: "issued", approved_by: session?.user?.id, approved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      await supabase.rpc("emit_domain_event", {
        p_event_type: "PurchaseOrderApproved",
        p_entity_type: "purchase_order",
        p_entity_id: id,
        p_payload: { total },
      });

      queryClient.invalidateQueries({ queryKey: ["purchase_order", id] });
      toast({ title: "Succès", description: "Bon de commande approuvé et émis" });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  if (isLoading || !po) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/procurement/purchase-orders")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{po.po_number}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{po.status}</Badge>
                <span className="text-sm text-gray-500">{po.suppliers?.name}</span>
              </div>
            </div>
          </div>
          {po.status === "draft" && (
            <Button
              onClick={handleApprove}
              disabled={!canApprove}
              className="bg-green-600 hover:bg-green-700"
              title={!canApprove && requiredRoleName ? `Nécessite le rôle: ${requiredRoleName}` : undefined}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {canApprove ? "Approuver et Émettre" : `Approbation requise: ${requiredRoleName ?? "..."}`}
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix Unit.</TableHead>
                <TableHead>TVA %</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit ?? ""}
                  </TableCell>
                  <TableCell>{item.unit_price.toLocaleString()}</TableCell>
                  <TableCell>{item.tax_rate}%</TableCell>
                  <TableCell className="text-right">{item.line_total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Total ({po.currency_code})
                </TableCell>
                <TableCell className="text-right font-medium">{total.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {po.status !== "draft" && po.status !== "cancelled" && (
          <GoodsReceiptRecorder purchaseOrderId={po.id} />
        )}

        <DocumentsPanel ownerType="purchase_order" ownerId={po.id} />
      </motion.div>
    </div>
  );
};

export default PurchaseOrderDetail;
