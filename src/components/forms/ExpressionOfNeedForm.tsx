import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";

export const ExpressionOfNeedForm = () => {
  const { departmentId } = useParams();
  const { toast } = useToast();
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('expressions_of_need')
        .insert(formData);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre expression de besoin a été soumise avec succès!",
      });
    } catch (error) {
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
        {/* Part Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Pièce</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nom de la Pièce</label>
            <input
              type="text"
              value={formData.part_name}
              onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Type d'Article</label>
            <select
              value={formData.item_type}
              onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              required
            >
              <option value="">Sélectionner le type</option>
              <option value="spare_parts">Pièces de rechange</option>
              <option value="tires">Pneus</option>
              <option value="construction">Matériaux de construction</option>
              <option value="office">Fournitures de bureau</option>
              <option value="safety">Équipement de sécurité</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Référence Pièce</label>
            <input
              type="text"
              value={formData.part_reference}
              onChange={(e) => setFormData({ ...formData, part_reference: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              placeholder="Si connue"
            />
          </div>
        </div>

        {/* Order Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Détails de la Commande</h3>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quantité</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Fournisseur Recommandé</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              placeholder="À déterminer si inconnu"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Niveau d'Urgence</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              required
            >
              <option value="">Sélectionner l'urgence</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Élevée</option>
            </select>
          </div>
        </div>
      </div>

      {/* Description and Additional Comments Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Supplémentaires</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Commentaires Supplémentaires</label>
          <textarea
            value={formData.additional_comments}
            onChange={(e) => setFormData({ ...formData, additional_comments: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
            placeholder="Informations complémentaires optionnelles"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
      >
        Soumettre l'Expression de Besoin
      </button>
    </motion.form>
  );
};