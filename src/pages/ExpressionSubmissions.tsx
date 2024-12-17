import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SubmissionsHeader } from "@/components/submissions/SubmissionsHeader";
import { SubmissionTable } from "@/components/submissions/SubmissionTable";
import { SubmissionPDFViewer } from "@/components/pdf/SubmissionPDFViewer";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

const ExpressionSubmissions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
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

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = 
      submission.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter ? submission.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

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
          <SubmissionsHeader 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
          />

          {isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : filteredSubmissions && (
            <SubmissionTable 
              submissions={filteredSubmissions}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}
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