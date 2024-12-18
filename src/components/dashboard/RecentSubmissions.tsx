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

  const getWorkflowStageColor = (stage: string) => {
    switch (stage) {
      case "demande":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "da":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "traitement":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "bc":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "controle":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "comptabilite":
        return "bg-green-100 text-green-800 border-green-200";
      case "paiement":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "livraison":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getWorkflowStageDisplay = (stage: string) => {
    const stages: { [key: string]: string } = {
      "demande": "Demande",
      "da": "Demande d'Achat",
      "traitement": "Traitement Logistique",
      "bc": "Bon de Commande",
      "controle": "Contrôle de Gestion",
      "comptabilite": "Comptabilité",
      "paiement": "Paiement",
      "livraison": "Livraison"
    };
    return stages[stage] || stage;
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
              <TableHead>Département</TableHead>
              <TableHead>Pièce</TableHead>
              <TableHead>Étape</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Service Actuel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} className="hover:bg-muted/50 cursor-pointer">
                <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{submission.department}</TableCell>
                <TableCell>{submission.part_name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getWorkflowStageColor(submission.workflow_stage)}>
                    {getWorkflowStageDisplay(submission.workflow_stage)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getWorkflowStatusColor(submission.workflow_status)}>
                    {submission.workflow_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    {submission.current_department}
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