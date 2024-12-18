import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface WorkflowSectionProps {
  formData: {
    workflow_stage: string;
    workflow_status: string;
    current_department: string;
  };
  userRole: string;
  onChange: (field: string, value: string) => void;
  onStatusChange: (newStatus: string, comments?: string) => void;
}

export const WorkflowSection = ({ 
  formData, 
  userRole, 
  onChange, 
  onStatusChange 
}: WorkflowSectionProps) => {
  const [comments, setComments] = useState("");
  const [showComments, setShowComments] = useState(false);

  const handleAction = (action: string) => {
    if (action === 'reject') {
      setShowComments(true);
      return;
    }

    let newStatus = '';
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'mark_paid':
        newStatus = 'in_progress';
        onChange('workflow_stage', 'paiement');
        break;
      case 'mark_shipped':
        newStatus = 'in_progress';
        onChange('workflow_stage', 'livraison');
        break;
      case 'mark_delivered':
        newStatus = 'completed';
        onChange('workflow_stage', 'termine');
        break;
      default:
        return;
    }

    onStatusChange(newStatus, comments);
    setComments("");
    setShowComments(false);
  };

  const renderActionButtons = () => {
    switch (userRole) {
      case 'manager':
      case 'admin':
        if (formData.workflow_stage === 'en_attente' && formData.workflow_status === 'pending') {
          return (
            <div className="flex gap-4">
              <Button 
                variant="default" 
                onClick={() => handleAction('approve')}
              >
                Approuver
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleAction('reject')}
              >
                Rejeter
              </Button>
            </div>
          );
        }
        break;
      case 'finance':
        if (formData.workflow_stage === 'approbation' && formData.workflow_status === 'approved') {
          return (
            <Button 
              variant="default" 
              onClick={() => handleAction('mark_paid')}
            >
              Marquer comme Payé
            </Button>
          );
        }
        break;
      case 'logistics':
        if (formData.workflow_stage === 'paiement' && formData.workflow_status === 'in_progress') {
          return (
            <Button 
              variant="default" 
              onClick={() => handleAction('mark_shipped')}
            >
              Marquer comme Expédié
            </Button>
          );
        } else if (formData.workflow_stage === 'livraison' && formData.workflow_status === 'in_progress') {
          return (
            <Button 
              variant="default" 
              onClick={() => handleAction('mark_delivered')}
            >
              Confirmer la Livraison
            </Button>
          );
        }
        break;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflow</CardTitle>
        <CardDescription>
          État actuel: {formData.workflow_stage} - {formData.workflow_status}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderActionButtons()}
        
        {showComments && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Commentaires de Rejet (Requis)
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="min-h-[100px]"
              placeholder="Veuillez expliquer la raison du rejet..."
              required
            />
            <div className="flex gap-4">
              <Button 
                variant="default" 
                onClick={() => {
                  if (comments.trim()) {
                    onStatusChange('rejected', comments);
                    setComments("");
                    setShowComments(false);
                  }
                }}
                disabled={!comments.trim()}
              >
                Confirmer le Rejet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setComments("");
                  setShowComments(false);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};