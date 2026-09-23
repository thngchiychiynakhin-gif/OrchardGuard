import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const alerts = [
  {
    icon: "✓",
    title: "ไม่พบความเสี่ยงสูง",
    detail: "ระบบตรวจสอบสวนล่าสุดแล้ว ทุกอย่างอยู่ในเกณฑ์ปกติ",
    time: "วันนี้ 09:00",
    color: "#E4F4E7",
    iconColor: "#32894C",
  },
  {
    icon: "💧",
    title: "ความชื้นอากาศอยู่ในระดับสูง",
    detail: "ควรเฝ้าระวังโรคที่เกิดจากความชื้นในช่วง 24 ชั่วโมงนี้",
    time: "เมื่อวาน 16:30",
    color: "#E7F3FF",
    iconColor: "#3183C7",
  },
  {
    icon: "i",
    title: "ระบบอัปเดตข้อมูลแล้ว",
    detail: "ข้อมูลสภาพแวดล้อมและการประเมินความเสี่ยงเป็นปัจจุบัน",
    time: "12 มิ.ย. 2026",
    color: "#FFF3D9",
    iconColor: "#B5791A",
  },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>ORCHARDGUARD</Text>
        <Text style={styles.title}>การแจ้งเตือน</Text>
        <Text style={styles.subtitle}>ข่าวสารสำคัญเกี่ยวกับสวนของคุณ</Text>
        <View style={styles.unread}>
          <Text style={styles.unreadText}>3 รายการล่าสุด</Text>
        </View>
        {alerts.map((alert) => (
          <View key={alert.title} style={styles.alertCard}>
            <View style={[styles.alertIcon, { backgroundColor: alert.color }]}>
              <Text style={[styles.alertIconText, { color: alert.iconColor }]}>
                {alert.icon}
              </Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDetail}>{alert.detail}</Text>
              <Text style={styles.time}>{alert.time}</Text>
            </View>
          </View>
        ))}
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
  unread: {
    alignSelf: "flex-start",
    backgroundColor: "#DCEFE0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 22,
    marginBottom: 12,
  },
  unreadText: { color: "#267545", fontSize: 12, fontWeight: "800" },
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    marginBottom: 12,
    elevation: 2,
  },
  alertIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  alertIconText: { fontSize: 20, fontWeight: "800" },
  alertBody: { flex: 1, marginLeft: 13 },
  alertTitle: { color: "#27392D", fontSize: 15, fontWeight: "800" },
  alertDetail: { color: "#68796F", fontSize: 12, lineHeight: 18, marginTop: 5 },
  time: { color: "#9AA79F", fontSize: 10, marginTop: 8 },
  backButton: {
    alignItems: "center",
    backgroundColor: "#DCEFE0",
    borderRadius: 16,
    padding: 15,
    marginTop: 12,
  },
  backButtonText: { color: "#267545", fontWeight: "800" },
  pressed: { opacity: 0.7 },
});
