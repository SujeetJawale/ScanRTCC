import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";

export default function Scan() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission]);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required.</Text>
        <Pressable style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const capture = async () => {
    try {
      setBusy(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      const manipulated = await ImageManipulator.manipulateAsync(photo.uri, [], {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      router.push({ pathname: "/review", params: { imageUri: manipulated.uri } });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not capture image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing='back' />
      <View style={styles.captureContainer}>
        <Pressable onPress={capture} disabled={busy} style={styles.captureBtn}>
          {busy ? <ActivityIndicator color='#fff' /> : <Text style={styles.captureText}>Scan</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  text: { fontSize: 18, marginBottom: 12 },
  btn: { backgroundColor: "#111827", padding: 12, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "600" },
  captureContainer: { position: "absolute", bottom: 40, width: "100%", alignItems: "center" },
  captureBtn: {
    backgroundColor: "#111827",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  captureText: { color: "#fff", fontWeight: "700", fontSize: 18 },
});
