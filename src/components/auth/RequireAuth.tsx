import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !session) {
      toast({
        title: "Accès restreint",
        description: "Vous devez être connecté pour accéder à cette fonctionnalité.",
        variant: "destructive",
      });
    }
  }, [isLoading, session, toast]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};