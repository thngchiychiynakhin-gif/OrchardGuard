import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>ORCHARDGUARD</Text>
        <Text style={styles.title}>ตั้งค่า</Text>
        <Text style={styles.subtitle}>ปรับการทำงานของระบบให้เหมาะกับคุณ</Text>
        <Text style={styles.sectionTitle}>ทั่วไป</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text>🔔</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>การแจ้งเตือน</Text>
              <Text style={styles.rowHint}>
                รับการแจ้งเตือนเมื่อความเสี่ยงเปลี่ยนแปลง
              </Text>
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
              <Text style={styles.rowTitle}>หน่วยอุณหภูมิ</Text>
              <Text style={styles.rowHint}>เซลเซียส (°C)</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Text>🏡</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>ข้อมูลสวน</Text>
              <Text style={styles.rowHint}>สวนทุเรียนของฉัน</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>เกี่ยวกับระบบ</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>OrchardGuard</Text>
          <Text style={styles.aboutText}>
            ระบบประเมินความเสี่ยงโรคในต้นทุเรียน
          </Text>
          <Text style={styles.version}>เวอร์ชัน 1.0.0</Text>
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
