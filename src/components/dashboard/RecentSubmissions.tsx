import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const recentSubmissions = [
  {
    date: "2024-03-15",
    department: "Production",
    partName: "Bearing Assembly",
    quantity: 50,
    urgency: "high",
    status: "pending",
  },
  // Add more mock data as needed
];

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
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const RecentSubmissions = () => {
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
              <TableHead>Quantité</TableHead>
              <TableHead>Urgence</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSubmissions.map((submission, index) => (
              <TableRow key={index} className="hover:bg-muted/50 cursor-pointer">
                <TableCell>{submission.date}</TableCell>
                <TableCell>{submission.department}</TableCell>
                <TableCell>{submission.partName}</TableCell>
                <TableCell>{submission.quantity}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getUrgencyColor(submission.urgency)}>
                    {submission.urgency}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(submission.status)}>
                    {submission.status}
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