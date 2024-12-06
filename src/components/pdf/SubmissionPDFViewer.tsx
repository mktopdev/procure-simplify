import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { SubmissionPDFDocument } from "./SubmissionPDFDocument";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

interface SubmissionPDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
}

export const SubmissionPDFViewer = ({
  isOpen,
  onClose,
  submission,
}: SubmissionPDFViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="flex justify-end space-x-2 mb-4">
          <PDFDownloadLink
            document={<SubmissionPDFDocument submission={submission} />}
            fileName={`submission-${submission.id}.pdf`}
          >
            {({ loading }) => (
              <Button disabled={loading} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            )}
          </PDFDownloadLink>
          <Button
            onClick={() => window.print()}
            size="sm"
            variant="outline"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
        </div>
        <div className="flex-1 w-full h-full bg-white">
          <PDFViewer
            className="w-full h-full"
            showToolbar={false}
            onLoadSuccess={() => setIsLoading(false)}
          >
            <SubmissionPDFDocument submission={submission} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
};