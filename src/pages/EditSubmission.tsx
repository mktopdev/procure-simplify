import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

const EditSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({
    part_name: "",
    description: "",
    quantity: 0,
    priority: "",
    supplier: "",
  });

  // Fetch submission details
  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expressions_of_need')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Update form data with fetched submission
      setFormData({
        part_name: data.part_name,
        description: data.description || "",
        quantity: data.quantity,
        priority: data.priority,
        supplier: data.supplier || "",
      });
      
      return data;
    },
  });

  // Fetch audit logs
  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submission_audit_logs')
        .select(`
          *,
          modified_by_profile:profiles!submission_audit_logs_modified_by_fkey(
            first_name,
            last_name
          )
        `)
        .eq('submission_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updates: typeof formData) => {
      const oldData = submission;
      const changedFields = Object.entries(updates).filter(
        ([key, value]) => oldData[key] !== value
      );

      // Start a transaction
      const { error: updateError } = await supabase
        .from('expressions_of_need')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Create audit logs for each changed field
      for (const [field, newValue] of changedFields) {
        const { error: auditError } = await supabase
          .from('submission_audit_logs')
          .insert({
            submission_id: id,
            field_name: field,
            old_value: String(oldData[field]),
            new_value: String(newValue),
            modified_by: session?.user.id,
          });

        if (auditError) throw auditError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Les modifications ont été enregistrées avec succès !",
      });
      navigate('/expressions/submissions');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement des modifications. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = () => {
    setShowConfirmDialog(false);
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div>Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              Modifier la Soumission
            </h1>
            <Button
              variant="outline"
              onClick={() => navigate('/expressions/submissions')}
            >
              Retour
            </Button>
          </div>

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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/expressions/submissions')}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#276955] to-[#E16C31] text-white"
                  >
                    Enregistrer les Modifications
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Champ Modifié</TableHead>
                      <TableHead>Ancienne Valeur</TableHead>
                      <TableHead>Nouvelle Valeur</TableHead>
                      <TableHead>Modifié Par</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell>{log.field_name}</TableCell>
                        <TableCell>{log.old_value}</TableCell>
                        <TableCell>{log.new_value}</TableCell>
                        <TableCell>
                          {log.modified_by_profile?.first_name}{" "}
                          {log.modified_by_profile?.last_name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer les modifications</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir enregistrer les modifications ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmUpdate}>
                Confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default EditSubmission;