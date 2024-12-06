import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { SubmissionPDFViewer } from "@/components/pdf/SubmissionPDFViewer";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

const ExpressionSubmissions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['expressions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expressions_of_need')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredSubmissions = submissions?.filter(submission =>
    submission.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleEdit = (id: string) => {
    navigate(`/expressions/edit/${id}`);
  };

  const handleView = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Suivi des Soumissions</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#276955] focus:border-transparent"
              />
            </div>
          </div>

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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : filteredSubmissions?.map((submission) => (
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
                            onClick={() => handleView(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(submission.id)}
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
        </motion.div>
      </div>

      {selectedSubmission && (
        <SubmissionPDFViewer
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
        />
      )}
    </DashboardLayout>
  );
};

export default ExpressionSubmissions;