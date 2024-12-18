import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

export interface ExpressionFormData {
  item_type: string;
  part_name: string;
  quantity: number;
  department: string;
  priority: string;
  description: string;
  supplier: string;
  part_reference: string;
  additional_comments: string;
  attachment_url: string;
  business_unit: string;
  location: string;
  workflow_stage: string;
  workflow_status: string;
  current_department: string;
  approval_comments: string;
  rejection_reason: string;
}

export const useExpressionForm = () => {
  const { departmentId } = useParams();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ExpressionFormData>({
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

  return {
    formData,
    handleChange,
    handleSubmit,
    isSubmitting,
    session
  };
};