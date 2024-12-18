import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const RecentSubmissions = () => {
  const { data: submissions = [] } = useQuery({
    queryKey: ['recentSubmissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expressions_of_need')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    }
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "submitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Soumissions Récentes</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/expressions/submissions">
            Voir Tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Pièce</TableHead>
              <TableHead>Quantité</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{submission.business_unit}</TableCell>
                <TableCell>{submission.part_name}</TableCell>
                <TableCell>{submission.quantity}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getUrgencyColor(submission.priority)}>
                    {submission.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(submission.approval_status)}>
                    {submission.approval_status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};