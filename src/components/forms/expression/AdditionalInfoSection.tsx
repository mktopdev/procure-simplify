import { Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface AdditionalInfoSectionProps {
  formData: {
    description: string;
    additional_comments: string;
    attachment_url: string;
  };
  onChange: (field: string, value: string) => void;
  isReadOnly?: boolean;  // Added this prop
}

export const AdditionalInfoSection = ({ formData, onChange, isReadOnly = false }: AdditionalInfoSectionProps) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('expressions-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('expressions-attachments')
        .getPublicUrl(filePath);

      onChange('attachment_url', publicUrl);

      toast({
        title: "Succès",
        description: "Le fichier a été téléchargé avec succès",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du fichier",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Supplémentaires</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          required
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Commentaires Supplémentaires</label>
        <textarea
          value={formData.additional_comments}
          onChange={(e) => onChange('additional_comments', e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="Informations complémentaires optionnelles"
          disabled={isReadOnly}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Pièce Jointe</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-green-500 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                <span>Télécharger un fichier</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileUpload}
                  disabled={isUploading || isReadOnly}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 10MB</p>
            {formData.attachment_url && (
              <p className="text-sm text-green-600">Fichier téléchargé avec succès</p>
            )}
            {isUploading && (
              <p className="text-sm text-gray-600">Téléchargement en cours...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};