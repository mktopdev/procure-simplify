import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, FileText, Package, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const OverviewCards = () => {
  const navigate = useNavigate();
  
  const { data: metrics } = useQuery({
    queryKey: ['submissionMetrics'],
    queryFn: async () => {
      const { data: submissions, error } = await supabase
        .from('expressions_of_need')
        .select('workflow_stage, workflow_status');
      
      if (error) throw error;

      const demande = submissions.filter(s => s.workflow_stage === 'demande').length;
      const da = submissions.filter(s => s.workflow_stage === 'da').length;
      const logistics = submissions.filter(s => s.workflow_stage === 'traitement').length;
      const finance = submissions.filter(s => s.workflow_stage === 'comptabilite').length;
      const delivery = submissions.filter(s => s.workflow_stage === 'livraison').length;
      const total = submissions.length;

      return [
        {
          title: "Nouvelles Demandes",
          value: demande.toString(),
          icon: Clock,
          color: "text-blue-500",
          stage: "demande"
        },
        {
          title: "En Traitement Logistique",
          value: logistics.toString(),
          icon: Package,
          color: "text-yellow-500",
          stage: "traitement"
        },
        {
          title: "En Finance",
          value: finance.toString(),
          icon: CheckCircle,
          color: "text-green-500",
          stage: "comptabilite"
        },
        {
          title: "En Livraison",
          value: delivery.toString(),
          icon: Truck,
          color: "text-purple-500",
          stage: "livraison"
        },
      ];
    },
    initialData: []
  });

  const handleCardClick = (stage: string) => {
    navigate(`/expressions/submissions?stage=${stage}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleCardClick(metric.stage)}
        >
          <Card className="hover:scale-105 transition-transform duration-300 hover:shadow-lg border-t-4 cursor-pointer" 
                style={{ borderTopColor: metric.color.replace('text-', '') }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};