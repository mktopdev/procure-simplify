import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermissions } from "@/hooks/usePermissions";

const Budgets = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("finance.manage");
  const [isAdding, setIsAdding] = useState(false);
  const [costCenterId, setCostCenterId] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState(new Date().getFullYear().toString());
  const [budgetAmount, setBudgetAmount] = useState("");

  const { data: costCenters } = useQuery({
    queryKey: ["cost_centers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cost_centers").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budget_actuals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budget_actuals")
        .select("*")
        .order("period", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const costCenterName = (costCenterId: string) =>
    costCenters?.find((cc) => cc.id === costCenterId)?.name ?? costCenterId;

  const handleAdd = async () => {
    if (!costCenterId || !budgetAmount) return;
    try {
      const { error } = await supabase.from("budgets").insert({
        cost_center_id: costCenterId,
        category: category || null,
        period,
        budget_amount: parseFloat(budgetAmount),
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["budget_actuals"] });
      setIsAdding(false);
      setCategory("");
      setBudgetAmount("");
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Budgets</h1>
          {canManage && !isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" /> Nouveau Budget
            </Button>
          )}
        </div>

        {isAdding && (
          <div className="bg-white rounded-lg shadow p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select value={costCenterId} onValueChange={setCostCenterId}>
              <SelectTrigger>
                <SelectValue placeholder="Centre de Coût" />
              </SelectTrigger>
              <SelectContent>
                {(costCenters ?? []).map((cc) => (
                  <SelectItem key={cc.id} value={cc.id}>
                    {cc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Catégorie (optionnel)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input placeholder="Période (ex. 2026)" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <Input
              type="number"
              placeholder="Montant"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
            />
            <div className="col-span-2 sm:col-span-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleAdd}>
                Enregistrer
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : budgets && budgets.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Centre de Coût</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Réel</TableHead>
                  <TableHead>Restant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((b) => (
                  <TableRow key={b.budget_id}>
                    <TableCell>{costCenterName(b.cost_center_id)}</TableCell>
                    <TableCell>{b.category ?? "Tout"}</TableCell>
                    <TableCell>{b.period}</TableCell>
                    <TableCell>{b.budget_amount.toLocaleString()}</TableCell>
                    <TableCell>{b.actual_amount.toLocaleString()}</TableCell>
                    <TableCell
                      className={b.budget_amount - b.actual_amount < 0 ? "text-red-600 font-medium" : ""}
                    >
                      {(b.budget_amount - b.actual_amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">Aucun budget défini</div>
        )}
      </motion.div>
    </div>
  );
};

export default Budgets;
