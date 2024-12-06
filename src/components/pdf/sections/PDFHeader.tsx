import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
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
});

export const PDFHeader = () => (
  <>
    <View style={styles.header}>
      <Text style={styles.companyName}>GUITER S.A.</Text>
      <Text style={styles.department}>
        Direction du Transport et du Matériel
      </Text>
    </View>
    <Text style={styles.documentTitle}>Demande d'Approvisionnement</Text>
  </>
);