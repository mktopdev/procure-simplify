import { Eye, Edit } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
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
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Nom de la Pièce</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm">
                  {submission.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {format(new Date(submission.created_at!), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>{submission.department}</TableCell>
                <TableCell>{submission.part_name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {submission.description}
                </TableCell>
                <TableCell>{submission.quantity}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-sm ${getPriorityColor(submission.priority)}`}>
                    {submission.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#276955] h-2.5 rounded-full"
                      style={{ width: `${submission.status_progress || 0}%` }}
                    ></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(submission)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(submission.id)}
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
    </div>
  );
};