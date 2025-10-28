import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function Scan() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission is required.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  // ---------- CAPTURE PHOTO ----------
  const capture = async () => {
    try {
      setBusy(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
      });

      const manipulated = await ImageManipulator.manipulateAsync(photo.uri, [], {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const previous = params.images && typeof params.images === "string" ? JSON.parse(params.images) : [];

      const newImages = [...previous, manipulated.uri];

      // ✅ Send back all form data + updated images
      const reviewParams: Record<string, any> = {
        images: JSON.stringify(newImages),
        id: params.id || "",
        vendor: params.vendor || "",
        date: params.date || new Date().toLocaleDateString("en-CA"),
        total: params.total || "",
        invoiceNumber: params.invoiceNumber || "",
        itemCount: params.itemCount || "",
        addMode: params.addMode || "false",
      };

      router.push({
        pathname: "/review",
        params: reviewParams,
      });
    } catch (e: any) {
      console.error("Camera error:", e);
      Alert.alert("Error", e.message || "Could not capture image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing='back' />

      <View style={styles.captureContainer}>
        <Pressable onPress={capture} disabled={busy} style={[styles.captureBtn, { opacity: busy ? 0.6 : 1 }]}>
          {busy ? (
            <ActivityIndicator color='#fff' />
          ) : (
            <Text style={styles.captureText}>{params.addMode === "true" ? "Add Page" : "Scan Invoice"}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.back()} style={[styles.captureBtn, styles.cancelBtn]}>
          <Text style={styles.captureText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  text: { fontSize: 18, marginBottom: 12, textAlign: "center" },
  btn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  captureContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  captureBtn: {
    backgroundColor: "#16A34A",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    width: "70%",
  },
  cancelBtn: {
    backgroundColor: "#DC2626",
  },
  captureText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
});
