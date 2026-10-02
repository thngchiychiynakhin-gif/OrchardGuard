import { useLanguage } from "@/hooks/language";
import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const items = [
  { href: "/" as const, icon: "⌂", labelKey: "home" as const },
  { href: "/history" as const, icon: "↗", labelKey: "history" as const },
  {
    href: "/notifications" as const,
    icon: "♧",
    labelKey: "notifications" as const,
  },
  { href: "/settings" as const, icon: "⚙", labelKey: "settings" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
            >
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {item.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingVertical: 10,
    elevation: 5,
    boxShadow: "0px 4px 12px rgba(36, 94, 58, 0.1)",
  },
  item: {
    alignItems: "center",
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  icon: { color: "#819087", fontSize: 21, lineHeight: 23 },
  label: { color: "#819087", fontSize: 10, marginTop: 3 },
  activeIcon: { color: "#187345" },
  activeLabel: { color: "#187345", fontWeight: "800" },
  pressed: { opacity: 0.65 },
});
