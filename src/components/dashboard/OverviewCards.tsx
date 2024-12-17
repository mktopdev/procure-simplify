import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
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
        .select('status');
      
      if (error) throw error;

      const pending = submissions.filter(s => s.status === 'pending').length;
      const approved = submissions.filter(s => s.status === 'approved').length;
      const rejected = submissions.filter(s => s.status === 'rejected').length;
      const total = submissions.length;

      return [
        {
          title: "Demandes en Attente",
          value: pending.toString(),
          icon: Clock,
          color: "text-orange-500",
          status: "pending"
        },
        {
          title: "Demandes Approuvées",
          value: approved.toString(),
          icon: CheckCircle,
          color: "text-green-500",
          status: "approved"
        },
        {
          title: "Demandes Rejetées",
          value: rejected.toString(),
          icon: XCircle,
          color: "text-red-500",
          status: "rejected"
        },
        {
          title: "Total ce Mois",
          value: total.toString(),
          icon: FileText,
          color: "text-blue-500",
          status: null
        },
      ];
    },
    initialData: []
  });

  const handleCardClick = (status: string | null) => {
    if (status) {
      navigate(`/expressions/submissions?status=${status}`);
    } else {
      navigate('/expressions/submissions');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => handleCardClick(metric.status)}
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