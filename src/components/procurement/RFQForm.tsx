import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface RFQFormProps {
  onCreated: (rfqId: string) => void;
  onCancel?: () => void;
}

export const RFQForm = ({ onCreated, onCancel }: RFQFormProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [technicalSpecifications, setTechnicalSpecifications] = useState("");
  const [evaluationCriteria, setEvaluationCriteria] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

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

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (selectedSuppliers.length === 0) {
      toast({ title: "Erreur", description: "Invitez au moins un fournisseur", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: rfq, error: rfqError } = await supabase
        .from("rfqs")
        .insert({
          title,
          technical_specifications: technicalSpecifications || null,
          evaluation_criteria: evaluationCriteria || null,
          submission_deadline: submissionDeadline || null,
          status: "sent",
          created_by: session?.user?.id,
        })
        .select()
        .single();
      if (rfqError) throw rfqError;

      const { error: inviteError } = await supabase.from("rfq_suppliers").insert(
        selectedSuppliers.map((supplierId) => ({ rfq_id: rfq.id, supplier_id: supplierId }))
      );
      if (inviteError) throw inviteError;

      toast({ title: "Succès", description: `${rfq.rfq_number} envoyé à ${selectedSuppliers.length} fournisseur(s)` });
      onCreated(rfq.id);
    } catch (error) {
      toast({ title: "Erreur", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Titre *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Spécifications Techniques</label>
        <Textarea
          value={technicalSpecifications}
          onChange={(e) => setTechnicalSpecifications(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Critères d'Évaluation</label>
        <Textarea value={evaluationCriteria} onChange={(e) => setEvaluationCriteria(e.target.value)} rows={2} />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Date Limite de Soumission</label>
        <Input
          type="date"
          value={submissionDeadline}
          onChange={(e) => setSubmissionDeadline(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fournisseurs Invités *</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
          {(suppliers ?? []).map((s) => (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedSuppliers.includes(s.id)}
                onCheckedChange={() => toggleSupplier(s.id)}
              />
              {s.name}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
          {isSubmitting ? "Envoi..." : "Envoyer la RFQ"}
        </Button>
      </div>
    </form>
  );
};
