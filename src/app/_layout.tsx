import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, useColorScheme, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { BottomNav } from "@/components/bottom-nav";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* Splash Screen */}
      <AnimatedSplashOverlay />

      <View style={styles.root}>
        <Slot />
        <View style={styles.navArea}>
          <BottomNav />
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F8F3",
  },
  navArea: {
    backgroundColor: "#F4F8F3",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
