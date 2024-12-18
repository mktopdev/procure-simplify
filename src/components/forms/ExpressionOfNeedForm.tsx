import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { PartDetailsSection } from "./expression/PartDetailsSection";
import { OrderDetailsSection } from "./expression/OrderDetailsSection";
import { AdditionalInfoSection } from "./expression/AdditionalInfoSection";
import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";

export const ExpressionOfNeedForm = () => {
  const { departmentId } = useParams();
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const { error } = await supabase
        .from('expressions_of_need')
        .insert({
          ...formData,
          user_id: session.user.id,
          approval_status: 'submitted',
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre expression de besoin a été soumise avec succès!",
      });

      // Navigate back to expressions list after successful submission
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

      <div className="grid gap-6 md:grid-cols-2">
        <PartDetailsSection 
          formData={formData} 
          onChange={handleChange} 
        />
        <OrderDetailsSection 
          formData={formData} 
          onChange={handleChange} 
        />
      </div>

      <AdditionalInfoSection 
        formData={formData} 
        onChange={handleChange} 
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