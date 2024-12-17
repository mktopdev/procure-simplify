import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { startOfToday, startOfWeek, startOfMonth, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SubmissionsHeader } from "@/components/submissions/SubmissionsHeader";
import { SubmissionTable } from "@/components/submissions/SubmissionTable";
import { SubmissionPDFViewer } from "@/components/pdf/SubmissionPDFViewer";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

const ExpressionSubmissions = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [dateFilter, setDateFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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

  const getDateFilterStart = () => {
    switch (dateFilter) {
      case 'today':
        return startOfToday();
      case 'week':
        return startOfWeek(new Date());
      case 'month':
        return startOfMonth(new Date());
      default:
        return null;
    }
  };

  const filteredSubmissions = submissions?.filter(submission => {
    // Search filter
    const matchesSearch = 
      submission.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter ? submission.status === statusFilter : true;
    
    // Date filter
    const dateStart = getDateFilterStart();
    const matchesDate = dateStart 
      ? parseISO(submission.created_at!) >= dateStart
      : true;
    
    // Department filter
    const matchesDepartment = departmentFilter === 'all' 
      ? true 
      : submission.department.toLowerCase() === departmentFilter;
    
    // Priority filter
    const matchesPriority = priorityFilter === 'all'
      ? true
      : submission.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesDate && matchesDepartment && matchesPriority;
  });

  const handleEdit = (id: string) => {
    navigate(`/expressions/edit/${id}`);
  };

  const handleView = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setDateFilter('all');
    setDepartmentFilter('all');
    setPriorityFilter('all');
    setSearchTerm('');
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
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            departmentFilter={departmentFilter}
            setDepartmentFilter={setDepartmentFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onClearFilters={clearFilters}
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