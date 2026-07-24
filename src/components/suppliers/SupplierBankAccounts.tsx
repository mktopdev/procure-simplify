import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface SupplierBankAccountsProps {
  supplierId: string;
  canManage?: boolean;
}

const emptyAccount = { bank_name: "", account_number: "", iban: "", currency_code: "GNF" };

export const SupplierBankAccounts = ({ supplierId, canManage = true }: SupplierBankAccountsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newAccount, setNewAccount] = useState(emptyAccount);

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("currencies").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["supplier_bank_accounts", supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_bank_accounts")
        .select("*")
        .eq("supplier_id", supplierId);
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = async () => {
    if (!newAccount.bank_name.trim()) return;
    try {
      const { error } = await supabase.from("supplier_bank_accounts").insert({
        supplier_id: supplierId,
        ...newAccount,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["supplier_bank_accounts", supplierId] });
      setNewAccount(emptyAccount);
      setIsAdding(false);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("supplier_bank_accounts").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["supplier_bank_accounts", supplierId] });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Comptes Bancaires</CardTitle>
        {canManage && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : accounts && accounts.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium">{account.bank_name}</span>
                  <span className="block text-xs text-gray-500">
                    {[account.account_number, account.iban, account.currency_code]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(account.id)}>
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Aucun compte bancaire</p>
        )}

        {isAdding && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <Input
              placeholder="Banque"
              value={newAccount.bank_name}
              onChange={(e) => setNewAccount((p) => ({ ...p, bank_name: e.target.value }))}
            />
            <Select
              value={newAccount.currency_code}
              onValueChange={(v) => setNewAccount((p) => ({ ...p, currency_code: v }))}
            >
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
            <Input
              placeholder="Numéro de compte"
              value={newAccount.account_number}
              onChange={(e) => setNewAccount((p) => ({ ...p, account_number: e.target.value }))}
            />
            <Input
              placeholder="IBAN"
              value={newAccount.iban}
              onChange={(e) => setNewAccount((p) => ({ ...p, iban: e.target.value }))}
            />
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleAdd}>
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
