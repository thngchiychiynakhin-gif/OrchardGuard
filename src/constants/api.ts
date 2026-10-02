import Constants from "expo-constants";
import { Platform } from "react-native";

function developmentHost() {
  if (!__DEV__ || Platform.OS === "web") return undefined;

  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return undefined;

  try {
    const hostname = new URL(`http://${hostUri}`).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1"
      ? undefined
      : hostname;
  } catch {
    return undefined;
  }
}

const fallbackHost =
  developmentHost() ?? (Platform.OS === "android" ? "10.0.2.2" : "localhost");

export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL || `http://${fallbackHost}/orchardguard`
).replace(/\/$/, "");
