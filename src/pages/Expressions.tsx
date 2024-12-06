import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ExpressionOfNeedForm } from "@/components/forms/ExpressionOfNeedForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Expressions = () => {
  const { data: expressions, isLoading } = useQuery({
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
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>New Expression of Need</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpressionOfNeedForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Expressions of Need</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : expressions?.length === 0 ? (
              <p>No expressions of need found.</p>
            ) : (
              <div className="space-y-4">
                {expressions?.map((expression) => (
                  <div
                    key={expression.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{expression.item_type}</h3>
                      <span className="text-sm px-2 py-1 rounded-full bg-muted">
                        {expression.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {expression.description}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Quantity: {expression.quantity}</span>
                      <span>Department: {expression.department}</span>
                      <span>Priority: {expression.priority}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Expressions;