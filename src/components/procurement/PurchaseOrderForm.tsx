import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

const emptyLine: LineItem = { description: "", quantity: 1, unit_price: 0, tax_rate: 0 };

interface PurchaseOrderFormProps {
  onCreated: (purchaseOrderId: string) => void;
  onCancel?: () => void;
}

export const PurchaseOrderForm = ({ onCreated, onCancel }: PurchaseOrderFormProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [currencyCode, setCurrencyCode] = useState("GNF");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ ...emptyLine }]);

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("currencies").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) {
      toast({ title: "Erreur", description: "Sélectionnez un fournisseur", variant: "destructive" });
      return;
    }
    const validItems = items.filter((item) => item.description.trim());
    if (validItems.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins un article", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: po, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          supplier_id: supplierId,
          currency_code: currencyCode,
          payment_terms: paymentTerms || null,
          delivery_address: deliveryAddress || null,
          expected_delivery: expectedDelivery || null,
          notes: notes || null,
          created_by: session?.user?.id,
        })
        .select()
        .single();
      if (poError) throw poError;

      const { error: itemsError } = await supabase.from("purchase_order_items").insert(
        validItems.map((item) => ({
          purchase_order_id: po.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate,
        }))
      );
      if (itemsError) throw itemsError;

      await supabase.rpc("emit_domain_event", {
        p_event_type: "PurchaseOrderCreated",
        p_entity_type: "purchase_order",
        p_entity_id: po.id,
        p_payload: { po_number: po.po_number, supplier_id: supplierId },
      });

      toast({ title: "Succès", description: `Bon de commande ${po.po_number} créé` });
      onCreated(po.id);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fournisseur *</label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un fournisseur" />
            </SelectTrigger>
            <SelectContent>
              {(suppliers ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Devise</label>
          <Select value={currencyCode} onValueChange={setCurrencyCode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(currencies ?? []).map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Conditions de Paiement</label>
          <Input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} placeholder="Ex. Net 30" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Livraison Prévue</label>
          <Input type="date" value={expectedDelivery} onChange={(e) => setExpectedDelivery(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Adresse de Livraison</label>
          <Input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Articles</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setItems((prev) => [...prev, { ...emptyLine }])}
          >
            <Plus className="h-4 w-4 mr-1" /> Ajouter une Ligne
          </Button>
        </div>
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <Input
              className="col-span-5"
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
            />
            <Input
              type="number"
              min={1}
              className="col-span-2"
              placeholder="Qté"
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 1)}
            />
            <Input
              type="number"
              min={0}
              className="col-span-2"
              placeholder="Prix Unit."
              value={item.unit_price}
              onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
            />
            <Input
              type="number"
              min={0}
              className="col-span-2"
              placeholder="TVA %"
              value={item.tax_rate}
              onChange={(e) => updateItem(index, "tax_rate", parseFloat(e.target.value) || 0)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="col-span-1"
              disabled={items.length === 1}
              onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
            </Button>
          </div>
        ))}
        <div className="text-right text-sm font-medium text-gray-700">
          Total: {total.toLocaleString()} {currencyCode}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Création..." : "Créer le Bon de Commande"}
        </Button>
      </div>
    </form>
  );
};
