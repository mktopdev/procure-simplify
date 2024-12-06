import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface ExpressionFormData {
  item_type: string;
  quantity: number;
  priority: string;
  description: string;
}

const itemTypes = [
  "Pièces de rechange",
  "Pneus",
  "Matériaux de construction",
  "Fournitures de bureau",
  "Équipement de sécurité",
];

const ExpressionForm = () => {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<ExpressionFormData>();

  const onSubmit = async (data: ExpressionFormData) => {
    try {
      const { error } = await supabase
        .from('expressions_of_need')
        .insert([
          {
            ...data,
            department: departmentId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Votre expression de besoin a été soumise avec succès.",
      });

      navigate('/expressions/submissions');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-6 text-[#276955]">
            Expression de Besoin - {departmentId}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type d'Élément</label>
              <Select {...register("item_type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantité Requise</label>
              <Input
                type="number"
                {...register("quantity", { required: true, min: 1 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Niveau de Priorité</label>
              <Select {...register("priority")}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description/Justification</label>
              <Textarea
                {...register("description")}
                placeholder="Décrivez votre besoin..."
                className="h-32"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/expressions')}
              >
                Annuler
              </Button>
              <Button type="submit">
                Soumettre
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ExpressionForm;