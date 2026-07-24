import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";

// Suppliers don't have portal access yet (Ch.22 Supplier Portal is a later
// phase), so RFQ responses are recorded internally on a supplier's behalf.
const RFQDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("procurement.manage");

  const [isRecording, setIsRecording] = useState(false);
  const [responseSupplierId, setResponseSupplierId] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");

  const { data: rfq } = useQuery({
    queryKey: ["rfq", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("rfqs").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: invitedSuppliers } = useQuery({
    queryKey: ["rfq_suppliers", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_suppliers")
        .select("*, suppliers(id, name)")
        .eq("rfq_id", id!);
      if (error) throw error;
      return data;
    },
  });

  const { data: responses, refetch: refetchResponses } = useQuery({
    queryKey: ["rfq_responses", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfq_responses")
        .select("*, suppliers(name)")
        .eq("rfq_id", id!);
      if (error) throw error;
      return data;
    },
  });

  const handleRecordResponse = async () => {
    if (!responseSupplierId || !quotedPrice) return;
    try {
      const { error } = await supabase.from("rfq_responses").upsert(
        {
          rfq_id: id,
          supplier_id: responseSupplierId,
          quoted_price: parseFloat(quotedPrice),
          delivery_time_days: deliveryDays ? parseInt(deliveryDays) : null,
        },
        { onConflict: "rfq_id,supplier_id" }
      );
      if (error) throw error;
      refetchResponses();
      setIsRecording(false);
      setResponseSupplierId("");
      setQuotedPrice("");
      setDeliveryDays("");
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleSelect = async (responseId: string) => {
    try {
      await supabase.from("rfq_responses").update({ is_selected: false }).eq("rfq_id", id!);
      const { error } = await supabase.from("rfq_responses").update({ is_selected: true }).eq("id", responseId);
      if (error) throw error;
      await supabase.from("rfqs").update({ status: "awarded" }).eq("id", id!);
      queryClient.invalidateQueries({ queryKey: ["rfq_responses", id] });
      queryClient.invalidateQueries({ queryKey: ["rfq", id] });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleCreatePO = async (response: NonNullable<typeof responses>[number]) => {
    try {
      const { data: po, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          supplier_id: response.supplier_id,
          rfq_id: id,
          currency_code: response.currency_code ?? "GNF",
        })
        .select()
        .single();
      if (poError) throw poError;

      const { error: itemError } = await supabase.from("purchase_order_items").insert({
        purchase_order_id: po.id,
        description: rfq?.title ?? "Article de la RFQ",
        quantity: 1,
        unit_price: response.quoted_price ?? 0,
      });
      if (itemError) throw itemError;

      toast({ title: "Succès", description: `${po.po_number} créé à partir de la RFQ` });
      navigate(`/procurement/purchase-orders/${po.id}`);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  if (!rfq) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/procurement/rfqs")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{rfq.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{rfq.rfq_number}</Badge>
              <Badge variant="outline">{rfq.status}</Badge>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Réponses des Fournisseurs</CardTitle>
            {canManage && !isRecording && (
              <Button variant="outline" size="sm" onClick={() => setIsRecording(true)}>
                Enregistrer une Réponse
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isRecording && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 border-b border-gray-100">
                <Select value={responseSupplierId} onValueChange={setResponseSupplierId}>
                  <SelectTrigger className="col-span-2">
                    <SelectValue placeholder="Fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {(invitedSuppliers ?? []).map((inv) => (
                      <SelectItem key={inv.supplier_id} value={inv.supplier_id}>
                        {inv.suppliers?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Prix"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Délai (jours)"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                />
                <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsRecording(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleRecordResponse}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}

            {responses && responses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Délai</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="flex items-center gap-1">
                        {response.is_selected && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        {response.suppliers?.name}
                      </TableCell>
                      <TableCell>{response.quoted_price?.toLocaleString() ?? "—"}</TableCell>
                      <TableCell>{response.delivery_time_days ?? "—"} j</TableCell>
                      <TableCell className="text-right space-x-2">
                        {canManage && !response.is_selected && (
                          <Button variant="outline" size="sm" onClick={() => handleSelect(response.id)}>
                            Sélectionner
                          </Button>
                        )}
                        {canManage && response.is_selected && (
                          <Button size="sm" onClick={() => handleCreatePO(response)}>
                            Créer le BC
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray-500">Aucune réponse enregistrée</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RFQDetail;
