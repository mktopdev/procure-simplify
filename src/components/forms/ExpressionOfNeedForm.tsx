import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { PartDetailsSection } from "./expression/PartDetailsSection";
import { OrderDetailsSection } from "./expression/OrderDetailsSection";
import { AdditionalInfoSection } from "./expression/AdditionalInfoSection";
import { useAuth } from "@/components/auth/AuthProvider";

export const ExpressionOfNeedForm = () => {
  const { departmentId } = useParams();
  const { toast } = useToast();
  const { session } = useAuth();
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
    // Add new required fields
    business_unit: departmentId || "carrieres",
    location: "conakry", // Default to conakry as per schema
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
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une expression de besoin.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('expressions_of_need')
        .insert({
          ...formData,
          user_id: session.user.id,
          approval_status: 'submitted', // Add default approval status
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre expression de besoin a été soumise avec succès!",
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission.",
        variant: "destructive",
      });
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
        className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Soumettre l'Expression de Besoin
      </button>
    </motion.form>
  );
};