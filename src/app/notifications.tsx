import { API_BASE_URL } from "@/constants/api";
import { useLanguage } from "@/hooks/language";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = `${API_BASE_URL}/get_data.php`;
const REFRESH_INTERVAL_MS = 5000;

type OrchardRow = {
  temperature?: number | string;
  humidity?: number | string;
  soil?: number | string;
  rain?: number | string;
  "WH-SP-RG"?: number | string;
  risk_score?: number | string;
  risk_level?: string;
  created_at?: string;
};

function normalizeRows(payload: unknown): OrchardRow[] {
  if (Array.isArray(payload)) return payload as OrchardRow[];

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as OrchardRow[];
    if (Array.isArray(record.rows)) return record.rows as OrchardRow[];
    if (Array.isArray(record.items)) return record.items as OrchardRow[];
  }

  return [];
}

function numberValue(value: number | string | undefined) {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function riskLabel(row: OrchardRow) {
  const level = String(row.risk_level ?? "").toLowerCase();
  if (level.includes("high") || level.includes("สูง")) return "สูง";
  if (level.includes("medium") || level.includes("กลาง")) return "ปานกลาง";
  if (level.includes("low") || level.includes("ต่ำ")) return "ต่ำ";

  const score = numberValue(row.risk_score) ?? 0;
  return score >= 7 ? "สูง" : score >= 4 ? "ปานกลาง" : "ต่ำ";
}

function sensorValue(value: number | string | undefined, suffix: string) {
  const parsed = numberValue(value);
  return parsed === undefined ? "-" : `${parsed} ${suffix}`;
}

function soilValue(value: number | string | undefined) {
  const parsed = numberValue(value);
  if (parsed === undefined) return "-";
  const percentage =
    parsed > 100 && parsed <= 4095 ? (parsed / 4095) * 100 : parsed;
  return `${percentage.toFixed(1)}%`;
}

function updatedLabel(
  value: string | undefined,
  fetchedAt: Date | null,
  language: "th" | "en",
  t: ReturnType<typeof useLanguage>["t"],
) {
  const date = value ? new Date(value) : fetchedAt;
  if (!date || Number.isNaN(date.getTime())) return t("waitingForSensor");
  return t("latestAt", {
    date: date.toLocaleString(language === "th" ? "th-TH" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  });
}

export default function NotificationsScreen() {
  const { language, t } = useLanguage();
  const [latest, setLatest] = useState<OrchardRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const loadData = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok)
          throw new Error(`API responded with ${response.status}`);

        const rows = normalizeRows(await response.json());
        const latestRow =
          [...rows]
            .sort((a, b) => {
              const aTime = new Date(String(a.created_at ?? 0)).getTime();
              const bTime = new Date(String(b.created_at ?? 0)).getTime();
              return aTime - bTime;
            })
            .at(-1) ?? null;

        if (isMounted) {
          setLatest(latestRow);
          setFetchedAt(new Date());
          setApiError(rows.length === 0);
        }
      } catch {
        if (isMounted) setApiError(true);
      } finally {
        isFetching = false;
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    const refreshId = setInterval(loadData, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      clearInterval(refreshId);
    };
  }, []);

  const risk = latest ? riskLabel(latest) : null;
  const localizedRisk =
    risk === "สูง"
      ? t("riskHigh")
      : risk === "ปานกลาง"
        ? t("riskMedium")
        : risk === "ต่ำ"
          ? t("riskLow")
          : null;
  const riskStyle =
    risk === "สูง"
      ? styles.highRisk
      : risk === "ปานกลาง"
        ? styles.mediumRisk
        : styles.lowRisk;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>ORCHARDGUARD</Text>
        <Text style={styles.title}>{t("notificationTitle")}</Text>
        <Text style={styles.subtitle}>{t("alertSubtitle")}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, apiError && styles.statusOffline]} />
          <Text style={styles.statusText}>
            {apiError ? t("connectionError") : t("trackingLatest")}
          </Text>
        </View>
        <Text style={styles.updatedAt}>
          {updatedLabel(latest?.created_at, fetchedAt, language, t)}
        </Text>

        {isLoading && !latest ? (
          <Text style={styles.emptyMessage}>{t("loadingData")}</Text>
        ) : latest && risk ? (
          <>
            <View style={styles.alertCard}>
              <View style={[styles.alertIcon, riskStyle]}>
                <Text style={styles.alertIconText}>
                  {risk === "สูง" ? "!" : risk === "ปานกลาง" ? "△" : "✓"}
                </Text>
              </View>
              <View style={styles.alertBody}>
                <Text style={styles.alertTitle}>
                  {t("currentRisk", { risk: localizedRisk ?? "" })}
                </Text>
                <Text style={styles.alertDetail}>
                  {risk === "สูง"
                    ? t("highRiskDetail")
                    : risk === "ปานกลาง"
                      ? t("mediumRiskDetail")
                      : t("lowRiskDetail")}
                </Text>
              </View>
            </View>

            <View style={styles.readings}>
              <Text style={styles.sectionTitle}>{t("sensorReadings")}</Text>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>{t("temperature")}</Text>
                <Text style={styles.readingValue}>
                  {sensorValue(latest.temperature, "°C")}
                </Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>{t("airHumidity")}</Text>
                <Text style={styles.readingValue}>
                  {sensorValue(latest.humidity, "%")}
                </Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>{t("soilMoisture")}</Text>
                <Text style={styles.readingValue}>
                  {soilValue(latest.soil)}
                </Text>
              </View>
              <View style={styles.readingRow}>
                <Text style={styles.readingLabel}>{t("rainfall")}</Text>
                <Text style={styles.readingValue}>
                  {sensorValue(latest.rain ?? latest["WH-SP-RG"], "mm")}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.emptyMessage}>
            {apiError ? t("noSensorConnection") : t("noSensorData")}
          </Text>
        )}
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
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 22 },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#32894C",
    marginRight: 8,
  },
  statusOffline: { backgroundColor: "#C84141" },
  statusText: { color: "#53675A", fontSize: 12, fontWeight: "700" },
  updatedAt: { color: "#89968D", fontSize: 11, marginTop: 6, marginBottom: 14 },
  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
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
  alertIconText: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  highRisk: { backgroundColor: "#D84A43" },
  mediumRisk: { backgroundColor: "#E6A62E" },
  lowRisk: { backgroundColor: "#32894C" },
  alertBody: { flex: 1, marginLeft: 13 },
  alertTitle: { color: "#27392D", fontSize: 15, fontWeight: "800" },
  alertDetail: { color: "#68796F", fontSize: 12, lineHeight: 18, marginTop: 5 },
  readings: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: "#27392D",
    fontSize: 14,
    fontWeight: "800",
    paddingVertical: 10,
  },
  readingRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E7ECE8",
  },
  readingLabel: { color: "#68796F", fontSize: 13 },
  readingValue: { color: "#27392D", fontSize: 13, fontWeight: "700" },
  emptyMessage: {
    color: "#68796F",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },
});
