import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { PartDetailsSection } from "./expression/PartDetailsSection";
import { OrderDetailsSection } from "./expression/OrderDetailsSection";
import { AdditionalInfoSection } from "./expression/AdditionalInfoSection";
import { WorkflowSection } from "./expression/WorkflowSection";
import { WorkflowProgress } from "./expression/WorkflowProgress";
import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export const ExpressionOfNeedForm = () => {
  const { departmentId } = useParams();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [formData, setFormData] = useState({
    item_type: "",
    part_name: "",
    quantity: 1,
    department: departmentId || "carrieres",
    priority: "",
    description: "",
    supplier: "",
    part_reference: "",
    additional_comments: "",
    attachment_url: "",
    business_unit: departmentId || "carrieres",
    location: "conakry",
    workflow_stage: "demande",
    workflow_status: "pending",
    current_department: "initiator",
    approval_comments: "",
    rejection_reason: "",
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour soumettre une expression de besoin.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert the expression of need
      const { data: expressionData, error: expressionError } = await supabase
        .from('expressions_of_need')
        .insert({
          ...formData,
          user_id: session.user.id,
          approval_status: 'submitted',
        })
        .select()
        .single();

      if (expressionError) throw expressionError;

      // Create initial workflow history entry
      const { error: historyError } = await supabase
        .from('workflow_history')
        .insert({
          expression_id: expressionData.id,
          previous_stage: 'initial',
          new_stage: 'demande',
          previous_status: 'initial',
          new_status: 'pending',
          previous_department: 'none',
          new_department: 'initiator',
          modified_by: session.user.id,
          comments: 'Expression de besoin créée'
        });

      if (historyError) throw historyError;

      toast({
        title: "Succès",
        description: "Votre expression de besoin a été soumise avec succès!",
      });

      navigate('/expressions');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la soumission.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get department display name
  const getDepartmentName = () => {
    switch (departmentId) {
      case "carrieres":
        return "Carrières";
      case "routes":
        return "Routes";
      case "mines":
        return "Mines";
      case "agriculture":
        return "Agriculture";
      case "siege_social":
        return "Siège Social";
      default:
        return "Département";
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
        Expression de Besoin - {getDepartmentName()}
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