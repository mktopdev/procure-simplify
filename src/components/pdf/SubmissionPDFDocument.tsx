import {
  Document,
  Page,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Database } from "@/integrations/supabase/types";
import { PDFHeader } from "./sections/PDFHeader";
import { PDFMetadata } from "./sections/PDFMetadata";
import { PDFItemDetails } from "./sections/PDFItemDetails";
import { PDFDescription } from "./sections/PDFDescription";
import { PDFSignatures } from "./sections/PDFSignatures";
import { PDFFooter } from "./sections/PDFFooter";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

// Register fonts
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    position: 'relative',
    height: '100%',
  },
});

interface SubmissionPDFDocumentProps {
  submission: Submission;
}

export const SubmissionPDFDocument = ({ submission }: SubmissionPDFDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <PDFHeader />
      <PDFMetadata submission={submission} />
      <PDFItemDetails submission={submission} />
      <PDFDescription submission={submission} />
      <PDFSignatures />
      <PDFFooter />
    </Page>
  </Document>
);