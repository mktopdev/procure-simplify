import { Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #276955",
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 180,
    height: 120,
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
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
      <View style={styles.logoContainer}>
        <Image 
          src="/lovable-uploads/52995933-69cf-4d4e-a3b0-1d5fea816533.png"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.companyName}>GUITER S.A.</Text>
        <Text style={styles.department}>
          Direction du Transport et du Matériel
        </Text>
      </View>
    </View>
    <Text style={styles.documentTitle}>Demande d'Approvisionnement</Text>
  </>
);