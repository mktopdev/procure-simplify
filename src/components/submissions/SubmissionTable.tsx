import { Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

interface SubmissionTableProps {
  submissions: Submission[];
  onEdit: (id: string) => void;
  onView: (submission: Submission) => void;
}

export const SubmissionTable = ({ submissions, onEdit, onView }: SubmissionTableProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case "demande":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "en_attente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approbation":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "paiement":
        return "bg-green-100 text-green-800 border-green-200";
      case "livraison":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "termine":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getWorkflowStageDisplay = (stage: string) => {
    const stages: { [key: string]: string } = {
      "demande": "Demande Initiale",
      "en_attente": "En Attente d'Approbation",
      "approbation": "Approuvé",
      "paiement": "En Paiement",
      "livraison": "En Livraison",
      "termine": "Terminé"
    };
    return stages[stage] || stage;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Département</TableHead>
            <TableHead>Pièce</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Urgence</TableHead>
            <TableHead>Étape</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow 
              key={submission.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onView(submission)}
            >
              <TableCell className="font-medium">
                {format(new Date(submission.created_at!), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{submission.department}</TableCell>
              <TableCell>{submission.part_name}</TableCell>
              <TableCell className="max-w-xs truncate">
                {submission.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getPriorityColor(submission.priority)}>
                  {submission.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getWorkflowStageColor(submission.workflow_stage)}>
                  {getWorkflowStageDisplay(submission.workflow_stage)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.workflow_status)}
                  <span className="capitalize">{submission.workflow_status}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(submission);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(submission.id);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};