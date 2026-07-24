import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Generic document attachment panel backed by the shared `documents` table
// and the `erp-documents` storage bucket. Reused across every module
// (Suppliers, Purchase Orders, Goods Receipts, Trips, ...) instead of each
// one building its own bespoke attachment UI.
interface DocumentsPanelProps {
  ownerType: string;
  ownerId: string;
  canManage?: boolean;
}

export const DocumentsPanel = ({ ownerType, ownerId, canManage = true }: DocumentsPanelProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", ownerType, ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("owner_type", ownerType)
        .eq("owner_id", ownerId)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${ownerType}/${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("erp-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("erp-documents")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("documents").insert({
        owner_type: ownerType,
        owner_id: ownerId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: session?.user?.id,
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["documents", ownerType, ownerId] });
      toast({ title: "Succès", description: "Document téléchargé avec succès" });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", documentId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["documents", ownerType, ownerId] });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du document",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && (
          <label className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 cursor-pointer hover:border-green-500 transition-colors">
            <Upload className="h-4 w-4" />
            {isUploading ? "Téléchargement en cours..." : "Ajouter un document"}
            <input type="file" className="sr-only" onChange={handleUpload} disabled={isUploading} />
          </label>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : documents && documents.length > 0 ? (
          <ul className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-700 hover:text-green-700 truncate"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{doc.file_name}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {doc.uploaded_at ? format(new Date(doc.uploaded_at), "dd/MM/yyyy") : ""}
                  </span>
                </a>
                {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">Aucun document</p>
        )}
      </CardContent>
    </Card>
  );
};
