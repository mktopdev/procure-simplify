import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// A Purchase Request (Expression of Need) originally holds a single item
// (part_name/quantity, mirrored automatically into the first line item by
// a DB trigger). This panel lets a request carry additional line items,
// matching the Procurement module's multi-line Purchase Request model,
// without changing the original single-item creation form/list/PDF.
interface PurchaseRequestItemsProps {
  expressionId: string;
  canManage?: boolean;
}

const emptyItem = { description: "", category: "", quantity: 1, unit: "" };

export const PurchaseRequestItems = ({ expressionId, canManage = true }: PurchaseRequestItemsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState(emptyItem);

  const { data: items, isLoading } = useQuery({
    queryKey: ["purchase_request_items", expressionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_request_items")
        .select("*")
        .eq("expression_id", expressionId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = async () => {
    if (!newItem.description.trim()) return;
    try {
      const { error } = await supabase.from("purchase_request_items").insert({
        expression_id: expressionId,
        ...newItem,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["purchase_request_items", expressionId] });
      setNewItem(emptyItem);
      setIsAdding(false);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("purchase_request_items").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["purchase_request_items", expressionId] });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Articles de la Demande</CardTitle>
        {canManage && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter un Article
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : items && items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Unité</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.category || "—"}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit || "—"}</TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      {index > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray-500">Aucun article</p>
        )}

        {isAdding && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100">
            <Input
              placeholder="Description"
              className="sm:col-span-2"
              value={newItem.description}
              onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
            />
            <Input
              placeholder="Catégorie"
              value={newItem.category}
              onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))}
            />
            <Input
              type="number"
              min={1}
              placeholder="Quantité"
              value={newItem.quantity}
              onChange={(e) => setNewItem((p) => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
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
      </CardContent>
    </Card>
  );
};
