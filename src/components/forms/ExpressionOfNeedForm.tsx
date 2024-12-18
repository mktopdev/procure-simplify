import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { PartDetailsSection } from "./expression/PartDetailsSection";
import { OrderDetailsSection } from "./expression/OrderDetailsSection";
import { AdditionalInfoSection } from "./expression/AdditionalInfoSection";
import { WorkflowSection } from "./expression/WorkflowSection";
import { WorkflowProgress } from "./expression/WorkflowProgress";
import { useExpressionForm } from "./expression/hooks/useExpressionForm";
import { getDepartmentName } from "./expression/utils/departmentUtils";
import { useToast } from "@/hooks/use-toast";

export const ExpressionOfNeedForm = () => {
  const { departmentId } = useParams();
  const { toast } = useToast();
  const { 
    formData, 
    handleChange, 
    handleSubmit, 
    handleStatusChange,
    isSubmitting, 
    session 
  } = useExpressionForm();

  // Fetch user profile to determine role
  const { data: userProfile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const handleWorkflowStatusChange = async (newStatus: string, comments?: string) => {
    try {
      await handleStatusChange(newStatus, comments);
      toast({
        title: "Succès",
        description: "Le statut a été mis à jour avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour du statut",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm"
    >
      <div className="text-xl font-semibold text-gray-900 mb-6">
        Expression de Besoin - {getDepartmentName(departmentId)}
      </div>

      <WorkflowProgress currentStage={formData.workflow_stage} />

      <div className="grid gap-6 md:grid-cols-2">
        <PartDetailsSection 
          formData={formData} 
          onChange={handleChange}
          isReadOnly={formData.workflow_status !== 'pending'}
        />
        <OrderDetailsSection 
          formData={formData} 
          onChange={handleChange}
          isReadOnly={formData.workflow_status !== 'pending'}
        />
      </div>

      {userProfile && (
        <WorkflowSection 
          formData={formData}
          userRole={userProfile.role}
          onChange={handleChange}
          onStatusChange={handleWorkflowStatusChange}
        />
      )}

      <AdditionalInfoSection 
        formData={formData} 
        onChange={handleChange}
        isReadOnly={formData.workflow_status !== 'pending'}
      />

      <button
        type="submit"
        disabled={isSubmitting || formData.workflow_status !== 'pending'}
        className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Soumission en cours...
          </>
        ) : (
          "Soumettre l'Expression de Besoin"
        )}
      </button>
    </motion.form>
  );
};