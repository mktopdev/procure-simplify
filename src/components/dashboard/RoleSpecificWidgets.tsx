import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const RoleSpecificWidgets = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" asChild>
            <Link to="/expressions">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Expression de Besoin
            </Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/expressions/submissions">
              <FileText className="mr-2 h-4 w-4" />
              Voir Mes Soumissions
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Statistiques Personnelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Soumissions ce mois</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">En attente</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Approuvées</span>
              <span className="font-medium">5</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};