import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EditSubmissionFormProps {
  submission: any;
  onSuccess: () => void;
}

export const EditSubmissionForm = ({ submission, onSuccess }: EditSubmissionFormProps) => {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    part_name: submission.part_name,
    description: submission.description || "",
    quantity: submission.quantity,
    priority: submission.priority,
    supplier: submission.supplier || "",
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: typeof formData) => {
      const oldData = submission;
      const changedFields = Object.entries(updates).filter(
        ([key, value]) => oldData[key] !== value
      );

      // Update the expression
      const { error: updateError } = await supabase
        .from('expressions_of_need')
        .update(updates)
        .eq('id', submission.id);

      if (updateError) throw updateError;

      // Create audit logs for each changed field
      for (const [field, newValue] of changedFields) {
        const { error: auditError } = await supabase
          .from('submission_audit_logs')
          .insert({
            submission_id: submission.id,
            field_name: field,
            old_value: String(oldData[field]),
            new_value: String(newValue),
            modified_by: session?.user.id,
          });

        if (auditError) throw auditError;
      }
    },
    onSuccess,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la Soumission</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom de la Pièce
              </label>
              <input
                type="text"
                value={formData.part_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    part_name: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Quantité
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    quantity: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
                min="1"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Urgence
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fournisseur
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    supplier: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="À déterminer si inconnu"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les Modifications"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};