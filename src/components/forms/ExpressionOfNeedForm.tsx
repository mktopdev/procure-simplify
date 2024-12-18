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

export const ExpressionOfNeedForm = () => {
  const { departmentId } = useParams();
  const { formData, handleChange, handleSubmit, isSubmitting, session } = useExpressionForm();

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

  const isAdmin = userProfile?.role === 'admin';
  const isManager = userProfile?.role === 'manager';

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
          isReadOnly={!isAdmin && formData.workflow_status !== 'pending'}
        />
        <OrderDetailsSection 
          formData={formData} 
          onChange={handleChange}
          isReadOnly={!isAdmin && formData.workflow_status !== 'pending'}
        />
      </div>

      {(isAdmin || isManager) && (
        <WorkflowSection 
          formData={formData}
          onChange={handleChange}
        />
      )}

      <AdditionalInfoSection 
        formData={formData} 
        onChange={handleChange}
        isReadOnly={!isAdmin && formData.workflow_status !== 'pending'}
      />

      <button
        type="submit"
        disabled={isSubmitting}
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