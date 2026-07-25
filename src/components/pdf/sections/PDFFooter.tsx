import { Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    color: "#666",
    textAlign: "center",
  },
});

export const PDFFooter = () => (
  <View style={styles.footer}>
    <Text>
      Le présent document est la propriété de TRANSXPRESS SARL. Toute reproduction
      ou distribution partielle ou totale sans accord préalable est interdite.
    </Text>
    <Text style={{ marginTop: 5 }}>TRANSXPRESS SARL</Text>
  </View>
);