import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoodsReceiptRecorderProps {
  purchaseOrderId: string;
  onRecorded?: () => void;
}

// Records a Goods Receipt Note against outstanding quantities on a Purchase
// Order (po_receipt_status view = ordered vs already received). Updates the
// PO's status to partially_delivered/delivered based on what remains.
export const GoodsReceiptRecorder = ({ purchaseOrderId, onRecorded }: GoodsReceiptRecorderProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: outstanding, isLoading } = useQuery({
    queryKey: ["po_receipt_status", purchaseOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("po_receipt_status")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId);
      if (error) throw error;
      return data;
    },
  });

  const pendingItems = (outstanding ?? []).filter((item) => item.quantity_outstanding > 0);

  const handleRecord = async () => {
    const lines = pendingItems
      .map((item) => ({
        purchase_order_item_id: item.purchase_order_item_id,
        quantity_received: quantities[item.purchase_order_item_id] ?? item.quantity_outstanding,
      }))
      .filter((line) => line.quantity_received > 0);

    if (lines.length === 0) return;

    setIsSubmitting(true);
    try {
      const { data: grn, error: grnError } = await supabase
        .from("goods_receipts")
        .insert({ purchase_order_id: purchaseOrderId, received_by: session?.user?.id, status: "completed" })
        .select()
        .single();
      if (grnError) throw grnError;

      const { error: itemsError } = await supabase.from("goods_receipt_items").insert(
        lines.map((line) => ({ goods_receipt_id: grn.id, ...line }))
      );
      if (itemsError) throw itemsError;

      const stillOutstanding = pendingItems.some(
        (item) =>
          item.quantity_outstanding - (quantities[item.purchase_order_item_id] ?? item.quantity_outstanding) > 0
      );
      const { error: poError } = await supabase
        .from("purchase_orders")
        .update({ status: stillOutstanding ? "partially_delivered" : "delivered" })
        .eq("id", purchaseOrderId);
      if (poError) throw poError;

      await supabase.rpc("emit_domain_event", {
        p_event_type: "GoodsReceived",
        p_entity_type: "purchase_order",
        p_entity_id: purchaseOrderId,
        p_payload: { grn_number: grn.grn_number, lines },
      });

      queryClient.invalidateQueries({ queryKey: ["po_receipt_status", purchaseOrderId] });
      queryClient.invalidateQueries({ queryKey: ["purchase_order", purchaseOrderId] });
      queryClient.invalidateQueries({ queryKey: ["goods_receipts", purchaseOrderId] });
      toast({ title: "Succès", description: `Réception ${grn.grn_number} enregistrée` });
      setIsRecording(false);
      setQuantities({});
      onRecorded?.();
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Réception des Marchandises</CardTitle>
        {!isRecording && pendingItems.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setIsRecording(true)}>
            Enregistrer une Réception
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingItems.length === 0 ? (
          <p className="text-sm text-gray-500">Tous les articles ont été reçus</p>
        ) : isRecording ? (
          <div className="space-y-3">
            {pendingItems.map((item) => (
              <div key={item.purchase_order_item_id} className="flex items-center justify-between gap-4">
                <div className="text-sm">
                  <p className="font-medium">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    Commandé: {item.quantity_ordered} · Restant: {item.quantity_outstanding}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={item.quantity_outstanding}
                  className="w-28"
                  placeholder={String(item.quantity_outstanding)}
                  value={quantities[item.purchase_order_item_id] ?? ""}
                  onChange={(e) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [item.purchase_order_item_id]: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => setIsRecording(false)}>
                Annuler
              </Button>
              <Button size="sm" disabled={isSubmitting} onClick={handleRecord}>
                {isSubmitting ? "Enregistrement..." : "Confirmer la Réception"}
              </Button>
            </div>
          </div>
        ) : (
          <ul className="text-sm text-gray-600 space-y-1">
            {pendingItems.map((item) => (
              <li key={item.purchase_order_item_id}>
                {item.description}: {item.quantity_outstanding} restant(s) sur {item.quantity_ordered}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
