import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
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

export const PDFSignatures = () => (
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
);