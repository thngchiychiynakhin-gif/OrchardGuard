import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Use the native color scheme directly for web too; the hydration-only workaround
 * was causing a React state update inside an effect, which ESLint flags and can
 * trigger cascading re-renders.
 */
export function useColorScheme() {
  return useRNColorScheme() ?? "light";
}
