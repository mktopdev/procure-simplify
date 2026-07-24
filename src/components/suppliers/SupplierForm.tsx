import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];

const CATEGORIES = [
  "shipping_line",
  "trucking",
  "fuel",
  "equipment",
  "customs_broker",
  "warehouse",
  "insurance",
  "general",
];

const STATUSES = ["active", "inactive", "blocked", "blacklisted"];
const RISK_RATINGS = ["low", "medium", "high", "critical"];

export interface SupplierFormData {
  name: string;
  trading_name: string;
  category: string;
  tax_number: string;
  status: string;
  risk_rating: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  payment_terms: string;
  notes: string;
}

const emptyForm: SupplierFormData = {
  name: "",
  trading_name: "",
  category: "general",
  tax_number: "",
  status: "active",
  risk_rating: "low",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  payment_terms: "",
  notes: "",
};

interface SupplierFormProps {
  supplier?: Supplier;
  onSaved: (supplier: Supplier) => void;
  onCancel?: () => void;
}

export const SupplierForm = ({ supplier, onSaved, onCancel }: SupplierFormProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>(
    supplier
      ? {
          name: supplier.name,
          trading_name: supplier.trading_name ?? "",
          category: supplier.category ?? "general",
          tax_number: supplier.tax_number ?? "",
          status: supplier.status,
          risk_rating: supplier.risk_rating,
          email: supplier.email ?? "",
          phone: supplier.phone ?? "",
          address: supplier.address ?? "",
          city: supplier.city ?? "",
          country: supplier.country ?? "",
          payment_terms: supplier.payment_terms ?? "",
          notes: supplier.notes ?? "",
        }
      : emptyForm
  );

  const handleChange = (field: keyof SupplierFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (supplier) {
        const { data, error } = await supabase
          .from("suppliers")
          .update(formData)
          .eq("id", supplier.id)
          .select()
          .single();
        if (error) throw error;
        toast({ title: "Succès", description: "Fournisseur mis à jour" });
        onSaved(data);
      } else {
        const { data, error } = await supabase
          .from("suppliers")
          .insert({ ...formData, created_by: session?.user?.id })
          .select()
          .single();
        if (error) throw error;
        toast({ title: "Succès", description: "Fournisseur créé avec succès" });
        onSaved(data);
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Erreur",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nom Légal *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nom Commercial</label>
          <Input
            value={formData.trading_name}
            onChange={(e) => handleChange("trading_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Catégorie</label>
          <Select value={formData.category} onValueChange={(v) => handleChange("category", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Numéro Fiscal</label>
          <Input
            value={formData.tax_number}
            onChange={(e) => handleChange("tax_number", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Statut</label>
          <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Niveau de Risque</label>
          <Select value={formData.risk_rating} onValueChange={(v) => handleChange("risk_rating", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RISK_RATINGS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Téléphone</label>
          <Input
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ville</label>
          <Input
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Pays</label>
          <Input
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium text-gray-700">Adresse</label>
          <Input
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Conditions de Paiement</label>
          <Input
            value={formData.payment_terms}
            onChange={(e) => handleChange("payment_terms", e.target.value)}
            placeholder="Ex. Net 30"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <Textarea
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Enregistrement..." : supplier ? "Mettre à jour" : "Créer le Fournisseur"}
        </Button>
      </div>
    </form>
  );
};
