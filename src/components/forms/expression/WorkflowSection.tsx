import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkflowSectionProps {
  formData: {
    workflow_stage: string;
    workflow_status: string;
    current_department: string;
  };
  onChange: (field: string, value: string) => void;
}

export const WorkflowSection = ({ formData, onChange }: WorkflowSectionProps) => {
  const workflowStages = [
    { value: "demande", label: "Demande" },
    { value: "da", label: "Demande d'Achat" },
    { value: "traitement", label: "Traitement Logistique" },
    { value: "bc", label: "Bon de Commande" },
    { value: "controle", label: "Contrôle de Gestion" },
    { value: "comptabilite", label: "Comptabilité" },
    { value: "paiement", label: "Paiement" },
    { value: "livraison", label: "Livraison" },
  ];

  const departments = [
    { value: "initiator", label: "Initiateur" },
    { value: "logistics", label: "Logistique" },
    { value: "finance", label: "Finance" },
    { value: "management", label: "Direction" },
  ];

  const statuses = [
    { value: "pending", label: "En Attente" },
    { value: "in_progress", label: "En Cours" },
    { value: "completed", label: "Terminé" },
    { value: "rejected", label: "Rejeté" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
        <CardDescription>
          Informations sur l'état actuel de la demande dans le workflow
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Étape du Workflow
            </label>
            <Select
              value={formData.workflow_stage}
              onValueChange={(value) => onChange("workflow_stage", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez l'étape" />
              </SelectTrigger>
              <SelectContent>
                {workflowStages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Département Actuel
            </label>
            <Select
              value={formData.current_department}
              onValueChange={(value) => onChange("current_department", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le département" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Statut
            </label>
            <Select
              value={formData.workflow_status}
              onValueChange={(value) => onChange("workflow_status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le statut" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};