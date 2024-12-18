import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { EditSubmissionForm } from "@/components/submissions/EditSubmissionForm";
import { AuditLogTable } from "@/components/submissions/AuditLogTable";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const EditSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { session } = useAuth();

  // Fetch submission details
  const { data: submission, isLoading } = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expressions_of_need')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Fetch audit logs with proper typing
  const { data: auditLogs } = useQuery({
    queryKey: ['audit-logs', id],
    queryFn: async () => {
      // First get the audit logs
      const { data: logs, error } = await supabase
        .from('submission_audit_logs')
        .select(`
          id,
          field_name,
          old_value,
          new_value,
          created_at,
          modified_by,
          submission_id
        `)
        .eq('submission_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Then fetch the user profiles for each modified_by
      const logsWithProfiles = await Promise.all(
        logs.map(async (log) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', log.modified_by)
            .single();
          
          return {
            ...log,
            modified_by_profile: profile
          };
        })
      );

      return logsWithProfiles;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">
            Modifier la Soumission
          </h1>
          <button
            onClick={() => navigate('/expressions')}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Retour
          </button>
        </div>

        {submission && (
          <EditSubmissionForm 
            submission={submission}
            onSuccess={() => {
              toast({
                title: "Succès",
                description: "Les modifications ont été enregistrées avec succès !",
              });
              navigate('/expressions');
            }}
          />
        )}

        {auditLogs && auditLogs.length > 0 && (
          <AuditLogTable auditLogs={auditLogs} />
        )}
      </motion.div>
    </div>
  );
};

export default EditSubmission;