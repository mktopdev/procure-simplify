import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
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

const ENTITY_TYPES = ["all", "purchase_order", "transport_order"];

const JobCosting = () => {
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["job_ledger_entries", entityTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from("job_ledger_entries")
        .select("*")
        .order("created_at", { ascending: false });
      if (entityTypeFilter !== "all") {
        query = query.eq("entity_type", entityTypeFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = (entries ?? [])
    .filter((e) => e.entry_type === "revenue")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = (entries ?? [])
    .filter((e) => e.entry_type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Comptabilité Analytique (Job Costing)</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <span className="text-sm text-gray-500">Revenus</span>
            <p className="text-xl font-semibold text-green-700">{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <span className="text-sm text-gray-500">Dépenses</span>
            <p className="text-xl font-semibold text-red-700">{totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <span className="text-sm text-gray-500">Résultat Net</span>
            <p className="text-xl font-semibold text-gray-900">{(totalRevenue - totalExpense).toLocaleString()}</p>
          </div>
        </div>

        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "Toutes les entités" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading ? (
          <div className="text-center py-4">Chargement...</div>
        ) : entries && entries.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Entité</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{format(new Date(entry.created_at), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-xs text-gray-500">{entry.entity_type}</TableCell>
                    <TableCell>{entry.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          entry.entry_type === "revenue"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {entry.entry_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{entry.description ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      {entry.amount.toLocaleString()} {entry.currency_code}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">
            Aucune écriture pour le moment
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default JobCosting;
