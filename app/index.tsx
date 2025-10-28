import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
export const options = {
  title: "Scanify",
};
export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scanify (RTCC)</Text>
      <Text style={styles.subtitle}>
        Snap an invoice → auto-extract → review & save → daily Excel + email.
      </Text>

      <Link href='/scan' asChild>
        <Pressable style={styles.buttonPrimary}>
          <Text style={styles.buttonText}>Scan an Invoice</Text>
        </Pressable>
      </Link>

      <Link href='/history' asChild>
        <Pressable style={styles.buttonSecondary}>
          <Text style={styles.buttonTextDark}>View History</Text>
        </Pressable>
      </Link>

      <Link href='/summary' asChild>
        <Pressable style={styles.buttonPrimary}>
          <Text style={styles.buttonText}>Edit Summary</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 16 },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 15, color: "#555" },
  buttonPrimary: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#e5e7eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonTextDark: { color: "#111827", fontWeight: "700" },
});
