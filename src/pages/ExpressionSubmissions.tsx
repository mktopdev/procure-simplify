import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const ExpressionSubmissions = () => {
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-6 text-[#276955]">
            Soumissions d'Expression de Besoin
          </h2>
          
          {isLoading ? (
            <div>Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Type d'Élément</th>
                    <th className="text-left p-4">Quantité</th>
                    <th className="text-left p-4">Département</th>
                    <th className="text-left p-4">Priorité</th>
                    <th className="text-left p-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions?.map((submission) => (
                    <tr key={submission.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{submission.item_type}</td>
                      <td className="p-4">{submission.quantity}</td>
                      <td className="p-4">{submission.department}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          submission.priority === 'high' ? 'bg-red-100 text-red-800' :
                          submission.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {submission.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                          {submission.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default ExpressionSubmissions;