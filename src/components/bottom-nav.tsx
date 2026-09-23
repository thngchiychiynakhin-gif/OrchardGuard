import { Link, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

const items = [
  { href: "/" as const, icon: "⌂", label: "หน้าหลัก" },
  { href: "/history" as const, icon: "↗", label: "ย้อนหลัง" },
  { href: "/notifications" as const, icon: "♧", label: "แจ้งเตือน" },
  { href: "/settings" as const, icon: "⚙", label: "ตั้งค่า" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              style={({ pressed }) => [styles.item, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Text style={[styles.icon, isActive && styles.activeIcon]}>
                {item.icon}
              </Text>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.label}
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
    shadowColor: "#245E3A",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
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
