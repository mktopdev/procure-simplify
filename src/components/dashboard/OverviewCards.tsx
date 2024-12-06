import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const metrics = [
  {
    title: "Demandes en Attente",
    value: "12",
    icon: Clock,
    color: "text-orange-500",
  },
  {
    title: "Demandes Approuvées",
    value: "45",
    icon: CheckCircle,
    color: "text-green-500",
  },
  {
    title: "Demandes Rejetées",
    value: "3",
    icon: XCircle,
    color: "text-red-500",
  },
  {
    title: "Total ce Mois",
    value: "60",
    icon: FileText,
    color: "text-blue-500",
  },
];

export const OverviewCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:scale-105 transition-transform duration-300 hover:shadow-lg border-t-4" style={{ borderTopColor: metric.color.replace('text-', '') }}>
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