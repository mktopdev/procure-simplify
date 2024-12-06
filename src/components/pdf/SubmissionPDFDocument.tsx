import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { Database } from "@/integrations/supabase/types";
import { PDFHeader } from "./sections/PDFHeader";
import { PDFMetadata } from "./sections/PDFMetadata";
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
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#276955",
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontSize: 10,
    fontWeight: "bold",
  },
  value: {
    width: "70%",
    fontSize: 10,
  },
  signatures: {
    position: 'absolute',
    bottom: 100,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signature: {
    width: "30%",
    borderTop: "1px solid #000",
    paddingTop: 5,
    fontSize: 8,
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

      {/* Item Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détails de la Pièce</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nom de la Pièce:</Text>
          <Text style={styles.value}>{submission.part_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Type d'Article:</Text>
          <Text style={styles.value}>{submission.item_type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Référence:</Text>
          <Text style={styles.value}>{submission.part_reference || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantité:</Text>
          <Text style={styles.value}>{submission.quantity}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Priorité:</Text>
          <Text style={styles.value}>{submission.priority}</Text>
        </View>
      </View>

      {/* Additional Information */}
      {submission.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.value}>{submission.description}</Text>
        </View>
      )}

      {/* Signatures */}
      <View style={styles.signatures}>
        <View style={styles.signature}>
          <Text>Chef d'Atelier</Text>
          <Text>Date: ________________</Text>
        </View>
        <View style={styles.signature}>
          <Text>Responsable du Matériel</Text>
          <Text>Date: ________________</Text>
        </View>
        <View style={styles.signature}>
          <Text>Direction Transport/Matériel</Text>
          <Text>Date: ________________</Text>
        </View>
      </View>

      <PDFFooter />
    </Page>
  </Document>
);