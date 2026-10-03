import { useLanguage } from "@/hooks/language";
import { Link, usePathname } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const items = [
  {
    href: "/" as const,
    icon: require("../../assets/images/nav/home.png"),
    labelKey: "home" as const,
  },
  {
    href: "/history" as const,
    icon: require("../../assets/images/nav/calendar.png"),
    labelKey: "history" as const,
  },
  {
    href: "/notifications" as const,
    icon: require("../../assets/images/nav/bell.png"),
    labelKey: "notifications" as const,
  },
  {
    href: "/settings" as const,
    icon: require("../../assets/images/nav/settings.png"),
    labelKey: "settings" as const,
  },
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
              <Image
                source={item.icon}
                style={[
                  styles.icon,
                  { tintColor: isActive ? "#187345" : "#819087" },
                ]}
                resizeMode="contain"
                accessible={false}
              />
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
  icon: { width: 23, height: 23 },
  label: { color: "#819087", fontSize: 10, marginTop: 3 },
  activeLabel: { color: "#187345", fontWeight: "800" },
  pressed: { opacity: 0.65 },
});
