import { useLanguage } from "@/hooks/language";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>ORCHARDGUARD</Text>
        <Text style={styles.title}>{t("settings")}</Text>
        <Text style={styles.subtitle}>{t("settingsSubtitle")}</Text>
        <Text style={styles.sectionTitle}>{t("general")}</Text>
        <View style={styles.card}>
          <View style={styles.languageSection}>
            <View style={styles.rowIcon}>
              <Text>文</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{t("language")}</Text>
              <Text style={styles.rowHint}>{t("chooseLanguage")}</Text>
            </View>
          </View>
          <View style={styles.languageOptions}>
            {(
              [
                ["th", t("thai")],
                ["en", t("english")],
              ] as const
            ).map(([value, label]) => (
              <Pressable
                key={value}
                onPress={() => setLanguage(value)}
                style={[
                  styles.languageOption,
                  language === value && styles.languageOptionSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: language === value }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    language === value && styles.languageOptionTextSelected,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text>🔔</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{t("alertsSetting")}</Text>
              <Text style={styles.rowHint}>{t("alertHint")}</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#CBD8CE", true: "#8BC79A" }}
              thumbColor={notificationsEnabled ? "#267545" : "#F8FAF8"}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text>🌡</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{t("temperatureUnit")}</Text>
              <Text style={styles.rowHint}>{t("celsius")}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text>🏡</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{t("orchardInfo")}</Text>
              <Text style={styles.rowHint}>{t("myOrchard")}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>{t("about")}</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>OrchardGuard</Text>
          <Text style={styles.aboutText}>{t("systemDescription")}</Text>
          <Text style={styles.version}>{t("version")}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F8F3" },
  content: { padding: 22, paddingBottom: 120 },
  eyebrow: {
    color: "#398255",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: { color: "#164D34", fontSize: 30, fontWeight: "800", marginTop: 8 },
  subtitle: { color: "#6A7C70", fontSize: 14, marginTop: 5 },
  sectionTitle: {
    color: "#263A2D",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    elevation: 2,
  },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  languageSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
  },
  languageOptions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 52,
    marginTop: 12,
    marginBottom: 16,
  },
  languageOption: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE7DE",
    borderRadius: 8,
    paddingVertical: 10,
  },
  languageOptionSelected: {
    backgroundColor: "#267545",
    borderColor: "#267545",
  },
  languageOptionText: { color: "#53675A", fontSize: 13, fontWeight: "700" },
  languageOptionTextSelected: { color: "#FFFFFF" },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDF7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1, marginLeft: 12 },
  rowTitle: { color: "#27392D", fontSize: 14, fontWeight: "800" },
  rowHint: { color: "#7B8A80", fontSize: 11, marginTop: 4 },
  divider: { height: 1, backgroundColor: "#EDF1ED" },
  chevron: { color: "#7B8A80", fontSize: 24 },
  aboutCard: { backgroundColor: "#E6F3E8", borderRadius: 18, padding: 18 },
  aboutTitle: { color: "#267545", fontSize: 18, fontWeight: "800" },
  aboutText: { color: "#55715D", fontSize: 12, marginTop: 5 },
  version: { color: "#78917E", fontSize: 11, marginTop: 14 },
  backButton: {
    alignItems: "center",
    backgroundColor: "#DCEFE0",
    borderRadius: 16,
    padding: 15,
    marginTop: 20,
  },
  backButtonText: { color: "#267545", fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
