import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const DataVisualizations = () => {
  const { data: departmentStats } = useQuery({
    queryKey: ['departmentStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expressions_of_need')
        .select('department')
        .not('department', 'is', null);
      
      if (error) throw error;

      // Count submissions by department
      const counts = data.reduce((acc: Record<string, number>, curr) => {
        acc[curr.department] = (acc[curr.department] || 0) + 1;
        return acc;
      }, {});

      // Transform to chart format
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value
      }));
    },
    initialData: []
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Soumissions par Département</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentStats}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#276955" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};