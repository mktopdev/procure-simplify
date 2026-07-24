import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SupplierInvoiceFormProps {
  onCreated: (invoiceId: string) => void;
  onCancel?: () => void;
}

export const SupplierInvoiceForm = ({ onCreated, onCancel }: SupplierInvoiceFormProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");

  const { data: purchaseOrders } = useQuery({
    queryKey: ["purchase_orders", "for_invoice"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("id, po_number, supplier_id, currency_code, suppliers(name)")
        .neq("status", "draft")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: financialSummary } = useQuery({
    queryKey: ["po_financial_summary", purchaseOrderId],
    enabled: !!purchaseOrderId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("po_financial_summary")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const selectedPO = purchaseOrders?.find((po) => po.id === purchaseOrderId);
  const total = (parseFloat(subtotal) || 0) + (parseFloat(taxAmount) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseOrderId || !selectedPO || !invoiceNumber.trim()) {
      toast({ title: "Erreur", description: "Bon de commande et numéro de facture requis", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: invoice, error } = await supabase
        .from("supplier_invoices")
        .insert({
          supplier_id: selectedPO.supplier_id,
          purchase_order_id: purchaseOrderId,
          invoice_number: invoiceNumber,
          invoice_date: invoiceDate,
          due_date: dueDate || null,
          currency_code: selectedPO.currency_code,
          subtotal: parseFloat(subtotal) || 0,
          tax_amount: parseFloat(taxAmount) || 0,
          created_by: session?.user?.id,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.rpc("emit_domain_event", {
        p_event_type: "SupplierInvoiceRecorded",
        p_entity_type: "supplier_invoice",
        p_entity_id: invoice.id,
        p_payload: { purchase_order_id: purchaseOrderId, total_amount: total },
      });

      toast({ title: "Succès", description: `Facture ${invoice.internal_reference} enregistrée` });
      onCreated(invoice.id);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Bon de Commande *</label>
          <Select value={purchaseOrderId} onValueChange={setPurchaseOrderId}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un bon de commande" />
            </SelectTrigger>
            <SelectContent>
              {(purchaseOrders ?? []).map((po) => (
                <SelectItem key={po.id} value={po.id}>
                  {po.po_number} — {po.suppliers?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">N° Facture Fournisseur *</label>
          <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date de Facture</label>
          <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date d'Échéance</label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Sous-Total *</label>
          <Input type="number" min={0} value={subtotal} onChange={(e) => setSubtotal(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">TVA</label>
          <Input type="number" min={0} value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />
        </div>
      </div>

      {financialSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rapprochement à Trois Voies</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Commandé</span>
              <span className="font-medium">{financialSummary.ordered_total.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Reçu</span>
              <span className="font-medium">{financialSummary.received_value.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Cette Facture</span>
              <span className="font-medium">{total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Enregistrement..." : "Enregistrer la Facture"}
        </Button>
      </div>
    </form>
  );
};
