import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["expressions_of_need"]["Row"];

const styles = StyleSheet.create({
  section: {
    marginBottom: 15,
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

interface PDFMetadataProps {
  submission: Submission;
}

export const PDFMetadata = ({ submission }: PDFMetadataProps) => (
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
);