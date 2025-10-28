import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { COLORS } from "../src/constants/theme";

export default function Layout() {
  return (
    <LinearGradient colors={[COLORS.background, "#E6F4EA"]} style={{ flex: 1 }}>
      <StatusBar style='dark' />
      <View style={{ flex: 1, paddingTop: 30 }}>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: "transparent" },
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: "700",
              color: COLORS.text,
            },
            headerTintColor: COLORS.text,
            headerBackTitle: " ",
            headerBackTitleStyle: {
              fontSize: 10,
            },
          }}
        >
          <Stack.Screen name='index' options={{ title: "Scanify" }} />
          <Stack.Screen name='scan' options={{ title: "Scan Invoice" }} />
          <Stack.Screen name='review' options={{ title: "Invoice Review" }} />
          <Stack.Screen name='summary' options={{ title: "Today's Summary" }} />
          <Stack.Screen name='history' options={{ title: "Invoice History" }} />
        </Stack>
      </View>
    </LinearGradient>
  );
}
