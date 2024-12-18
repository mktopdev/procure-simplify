import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { WorkflowProgress } from "./WorkflowProgress";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

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

  const handleAction = async (action: string) => {
    if (action === 'reject') {
      setShowComments(true);
      return;
    }

    let newStatus = '';
    let newStage = formData.workflow_stage;
    
    switch (action) {
      case 'approve':
        newStatus = 'approved';
        newStage = 'approbation';
        break;
      case 'mark_paid':
        newStatus = 'in_progress';
        newStage = 'paiement';
        break;
      case 'mark_shipped':
        newStatus = 'in_progress';
        newStage = 'livraison';
        break;
      case 'mark_delivered':
        newStatus = 'completed';
        newStage = 'termine';
        break;
      default:
        return;
    }

    onChange('workflow_stage', newStage);
    await onStatusChange(newStatus, comments);
    setComments("");
    setShowComments(false);
  };

  const getStatusAlert = () => {
    switch (formData.workflow_status) {
      case 'approved':
        return (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Demande Approuvée</AlertTitle>
            <AlertDescription>
              Cette demande a été approuvée et est en cours de traitement.
            </AlertDescription>
          </Alert>
        );
      case 'rejected':
        return (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle>Demande Rejetée</AlertTitle>
            <AlertDescription>
              Cette demande a été rejetée. Veuillez consulter les commentaires pour plus de détails.
            </AlertDescription>
          </Alert>
        );
      case 'pending':
        return (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle>En Attente d'Approbation</AlertTitle>
            <AlertDescription>
              Cette demande est en attente d'approbation par le service concerné.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    if (!userRole) return null;

    switch (userRole) {
      case 'manager':
      case 'admin':
        if (formData.workflow_stage === 'en_attente' && formData.workflow_status === 'pending') {
          return (
            <div className="flex gap-4">
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleAction('approve')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approuver
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleAction('reject')}
              >
                <XCircle className="mr-2 h-4 w-4" />
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
        <CardDescription className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {formData.workflow_stage}
          </Badge>
          <span>-</span>
          <Badge variant="outline" className="text-sm">
            {formData.workflow_status}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <WorkflowProgress currentStage={formData.workflow_stage} />
        
        {getStatusAlert()}
        
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
                onClick={async () => {
                  if (comments.trim()) {
                    await onStatusChange('rejected', comments);
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