import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApprovalRule } from "@/hooks/useApprovalRule";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";

const SupplierInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bankAccountId, setBankAccountId] = useState("");
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["supplier_invoice", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_invoices")
        .select("*, suppliers(name), purchase_orders(po_number, cost_center_id)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: financialSummary } = useQuery({
    queryKey: ["po_financial_summary", invoice?.purchase_order_id],
    enabled: !!invoice?.purchase_order_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("po_financial_summary")
        .select("*")
        .eq("purchase_order_id", invoice!.purchase_order_id!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: bankAccounts } = useQuery({
    queryKey: ["bank_accounts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bank_accounts").select("*").order("bank_name");
      if (error) throw error;
      return data;
    },
  });

  const { requiredRoleName, canApprove } = useApprovalRule(
    "finance",
    "supplier_invoice",
    invoice?.total_amount ?? null
  );

  const handleApprove = async () => {
    if (!invoice) return;
    try {
      const { error } = await supabase
        .from("supplier_invoices")
        .update({ status: "approved", approved_by: session?.user?.id, approved_at: new Date().toISOString() })
        .eq("id", invoice.id);
      if (error) throw error;

      if (invoice.purchase_order_id) {
        const { error: ledgerError } = await supabase.from("job_ledger_entries").insert({
          entity_type: "purchase_order",
          entity_id: invoice.purchase_order_id,
          entry_type: "expense",
          category: "Procurement",
          amount: invoice.total_amount,
          currency_code: invoice.currency_code,
          cost_center_id: invoice.purchase_orders?.cost_center_id ?? null,
          description: `Facture ${invoice.internal_reference}`,
          created_by: session?.user?.id,
        });
        if (ledgerError) throw ledgerError;
      }

      await supabase.rpc("emit_domain_event", {
        p_event_type: "InvoiceApproved",
        p_entity_type: "supplier_invoice",
        p_entity_id: invoice.id,
        p_payload: { total_amount: invoice.total_amount },
      });

      queryClient.invalidateQueries({ queryKey: ["supplier_invoice", id] });
      toast({ title: "Succès", description: "Facture approuvée et comptabilisée" });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleRecordPayment = async () => {
    if (!invoice) return;
    try {
      const { error: paymentError } = await supabase.from("payments").insert({
        supplier_invoice_id: invoice.id,
        bank_account_id: bankAccountId || null,
        amount: invoice.total_amount,
        currency_code: invoice.currency_code,
        created_by: session?.user?.id,
      });
      if (paymentError) throw paymentError;

      const { error: invoiceError } = await supabase
        .from("supplier_invoices")
        .update({ status: "paid" })
        .eq("id", invoice.id);
      if (invoiceError) throw invoiceError;

      await supabase.rpc("emit_domain_event", {
        p_event_type: "PaymentRecorded",
        p_entity_type: "supplier_invoice",
        p_entity_id: invoice.id,
        p_payload: { amount: invoice.total_amount },
      });

      queryClient.invalidateQueries({ queryKey: ["supplier_invoice", id] });
      setIsRecordingPayment(false);
      toast({ title: "Succès", description: "Paiement enregistré" });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  if (isLoading || !invoice) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/finance/supplier-invoices")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{invoice.internal_reference}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{invoice.status}</Badge>
                <span className="text-sm text-gray-500">
                  {invoice.suppliers?.name} · {invoice.purchase_orders?.po_number}
                </span>
              </div>
            </div>
          </div>
          {invoice.status === "pending_approval" && (
            <Button
              onClick={handleApprove}
              disabled={!canApprove}
              className="bg-green-600 hover:bg-green-700"
              title={!canApprove && requiredRoleName ? `Nécessite le rôle: ${requiredRoleName}` : undefined}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {canApprove ? "Approuver" : `Approbation requise: ${requiredRoleName ?? "..."}`}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Détails</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Sous-Total</span>
              <span className="font-medium">{invoice.subtotal.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">TVA</span>
              <span className="font-medium">{invoice.tax_amount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Total</span>
              <span className="font-medium">
                {invoice.total_amount.toLocaleString()} {invoice.currency_code}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Échéance</span>
              <span className="font-medium">{invoice.due_date ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        {financialSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rapprochement à Trois Voies</CardTitle>
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
                <span className="text-gray-500 block">Facturé</span>
                <span className="font-medium">{financialSummary.invoiced_total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {invoice.status === "approved" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Paiement</CardTitle>
              {!isRecordingPayment && (
                <Button variant="outline" size="sm" onClick={() => setIsRecordingPayment(true)}>
                  Enregistrer le Paiement
                </Button>
              )}
            </CardHeader>
            {isRecordingPayment && (
              <CardContent className="space-y-3">
                <Select value={bankAccountId} onValueChange={setBankAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Compte bancaire (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    {(bankAccounts ?? []).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.bank_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsRecordingPayment(false)}>
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleRecordPayment}>
                    Confirmer le Paiement de {invoice.total_amount.toLocaleString()} {invoice.currency_code}
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        <DocumentsPanel ownerType="supplier_invoice" ownerId={invoice.id} />
      </motion.div>
    </div>
  );
};

export default SupplierInvoiceDetail;
