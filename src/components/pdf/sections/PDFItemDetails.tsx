import { Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

const styles = StyleSheet.create({
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
});

interface PDFItemDetailsProps {
  submission: Submission;
}

export const PDFItemDetails = ({ submission }: PDFItemDetailsProps) => (
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
);