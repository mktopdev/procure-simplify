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
  value: {
    fontSize: 10,
  },
});

interface PDFDescriptionProps {
  submission: Submission;
}

export const PDFDescription = ({ submission }: PDFDescriptionProps) => {
  if (!submission.description) return null;
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.value}>{submission.description}</Text>
    </View>
  );
};