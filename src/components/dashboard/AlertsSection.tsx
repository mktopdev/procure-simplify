import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, AlertTriangle } from "lucide-react";

const alerts = [
  {
    type: "overdue",
    message: "3 demandes en attente depuis plus de 5 jours",
    icon: Clock,
    color: "text-orange-500",
  },
  {
    type: "urgent",
    message: "2 demandes urgentes nécessitent une attention immédiate",
    icon: AlertTriangle,
    color: "text-red-500",
  },
];

export const AlertsSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <alert.icon className={`h-5 w-5 mt-0.5 ${alert.color}`} />
              <p className="text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};