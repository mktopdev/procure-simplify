import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SupplierContactsProps {
  supplierId: string;
  canManage?: boolean;
}

const emptyContact = { name: "", job_title: "", email: "", phone: "" };

export const SupplierContacts = ({ supplierId, canManage = true }: SupplierContactsProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState(emptyContact);

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["supplier_contacts", supplierId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_contacts")
        .select("*")
        .eq("supplier_id", supplierId)
        .order("is_primary", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = async () => {
    if (!newContact.name.trim()) return;
    try {
      const { error } = await supabase.from("supplier_contacts").insert({
        supplier_id: supplierId,
        ...newContact,
        is_primary: (contacts?.length ?? 0) === 0,
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["supplier_contacts", supplierId] });
      setNewContact(emptyContact);
      setIsAdding(false);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("supplier_contacts").delete().eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["supplier_contacts", supplierId] });
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Contacts</CardTitle>
        {canManage && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : contacts && contacts.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {contacts.map((contact) => (
              <li key={contact.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="font-medium flex items-center gap-1">
                    {contact.is_primary && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                    {contact.name}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {[contact.job_title, contact.email, contact.phone].filter(Boolean).join(" · ")}
                  </span>
                </div>
                {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(contact.id)}>
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Aucun contact</p>
        )}

        {isAdding && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
            <Input
              placeholder="Nom"
              value={newContact.name}
              onChange={(e) => setNewContact((p) => ({ ...p, name: e.target.value }))}
            />
            <Input
              placeholder="Fonction"
              value={newContact.job_title}
              onChange={(e) => setNewContact((p) => ({ ...p, job_title: e.target.value }))}
            />
            <Input
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              placeholder="Téléphone"
              value={newContact.phone}
              onChange={(e) => setNewContact((p) => ({ ...p, phone: e.target.value }))}
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
