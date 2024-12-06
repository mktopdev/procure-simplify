import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

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
  },
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #276955",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#276955",
    textTransform: "uppercase",
  },
  department: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#E16C31",
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
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#276955",
    color: "#fff",
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #eee",
    padding: 5,
    fontSize: 10,
  },
  col1: { width: "10%" },
  col2: { width: "30%" },
  col3: { width: "20%" },
  col4: { width: "10%" },
  col5: { width: "15%" },
  col6: { width: "15%" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
  signatures: {
    marginTop: 30,
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>GUITER S.A.</Text>
        <Text style={styles.department}>
          Direction du Transport et du Matériel
        </Text>
      </View>

      <Text style={styles.documentTitle}>Demande d'Approvisionnement</Text>

      {/* Metadata Section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>N° de Soumission:</Text>
          <Text style={styles.value}>{submission.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date d'Établissement:</Text>
          <Text style={styles.value}>
            {format(new Date(submission.created_at || new Date()), "dd/MM/yyyy")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Département:</Text>
          <Text style={styles.value}>{submission.department}</Text>
        </View>
      </View>

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

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Le présent document est la propriété de GUITER S.A. Toute reproduction
          ou distribution partielle ou totale sans accord préalable est interdite.
        </Text>
        <Text style={{ marginTop: 5 }}>
          GUITER S.A. - Direction du Transport et du Matériel
        </Text>
      </View>
    </Page>
  </Document>
);