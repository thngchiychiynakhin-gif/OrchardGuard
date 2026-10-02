import { API_BASE_URL } from "@/constants/api";
import { useLanguage, type Language } from "@/hooks/language";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import {
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";

const API_URL = `${API_BASE_URL}/get_data.php`;
const REFRESH_INTERVAL_MS = 5000;

type ApiRow = {
  temperature?: number | string;
  humidity?: number | string;
  soil?: number | string;
  rain?: number | string;
  "WH-SP-RG"?: number | string;
  risk_score?: number | string;
  risk_level?: string;
  created_at?: string;
};

function formatDate(date: Date, language: Language) {
  return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function dateKey(value: string | undefined) {
  return value?.slice(0, 10) ?? "";
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localizedDateLabel(date: Date, language: Language) {
  return date.toLocaleDateString(language === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function numberValue(value: number | string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function soilPercentage(value: number | string | undefined) {
  const parsed = numberValue(value);
  if (parsed === undefined) return undefined;
  return parsed > 100 && parsed <= 4095 ? (parsed / 4095) * 100 : parsed;
}

function rainValue(row: ApiRow) {
  return numberValue(row.rain ?? row["WH-SP-RG"]);
}

function normalizeRows(payload: unknown): ApiRow[] {
  if (Array.isArray(payload)) return payload as ApiRow[];

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const maybeData = record.data;
    if (Array.isArray(maybeData)) return maybeData as ApiRow[];

    if (Array.isArray(record.rows)) return record.rows as ApiRow[];
    if (Array.isArray(record.items)) return record.items as ApiRow[];
  }

  return [];
}

function readingFromRow(
  row: ApiRow,
  date: Date,
  language: Language,
  t: ReturnType<typeof useLanguage>["t"],
) {
  const temperature = numberValue(row.temperature);
  const humidity = numberValue(row.humidity);
  const soil = soilPercentage(row.soil);
  const rain = rainValue(row);

  return {
    date: row.created_at
      ? new Date(row.created_at).toLocaleString(
          language === "th" ? "th-TH" : "en-US",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : formatDate(date, language),
    risk: localizedRisk(row.risk_level, t),
    temperature:
      temperature === undefined ? "-" : `${temperature.toFixed(1)} °C`,
    humidity: humidity === undefined ? "-" : `${humidity}%`,
    soil: soil === undefined ? "-" : `${soil.toFixed(1)}%`,
    rain: rain === undefined ? "-" : `${rain} mm`,
  };
}

function localizedRisk(
  value: string | undefined,
  t: ReturnType<typeof useLanguage>["t"],
) {
  const level = String(value ?? "").toLowerCase();
  if (level.includes("high") || level.includes("สูง")) return t("riskHigh");
  if (level.includes("medium") || level.includes("กลาง"))
    return t("riskMedium");
  if (level.includes("low") || level.includes("ต่ำ")) return t("riskLow");
  return value || t("unspecifiedRisk");
}

function readingFromRows(
  date: Date,
  rows: ApiRow[],
  language: Language,
  t: ReturnType<typeof useLanguage>["t"],
) {
  if (rows.length === 0) {
    return {
      date: formatDate(date, language),
      risk: t("noData"),
      temperature: "-",
      humidity: "-",
      soil: "-",
      rain: "-",
      trend: [],
    };
  }

  const orderedRows = [...rows].sort((a, b) => {
    const aTime = new Date(String(a.created_at ?? 0)).getTime();
    const bTime = new Date(String(b.created_at ?? 0)).getTime();
    return aTime - bTime;
  });

  const latest = orderedRows[orderedRows.length - 1];
  const latestReading = readingFromRow(latest, date, language, t);
  return {
    ...latestReading,
    trend: orderedRows
      .map((row) => numberValue(row.risk_score))
      .filter((value): value is number => value !== undefined),
  };
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function HistoryScreen() {
  const { language, t } = useLanguage();
  const { width } = useWindowDimensions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [webDate, setWebDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const selectedRows = [...rows]
    .filter((row) => dateKey(row.created_at) === dateKeyFromDate(selectedDate))
    .sort((a, b) => {
      const aTime = new Date(String(a.created_at ?? 0)).getTime();
      const bTime = new Date(String(b.created_at ?? 0)).getTime();
      return aTime - bTime;
    });
  const selectedReading = readingFromRows(
    selectedDate,
    selectedRows,
    language,
    t,
  );
  const selectedTrend = [...selectedRows]
    .sort((a, b) => {
      const aTime = new Date(String(a.created_at ?? 0)).getTime();
      const bTime = new Date(String(b.created_at ?? 0)).getTime();
      return aTime - bTime;
    })
    .map((row) => {
      const value = numberValue(row.risk_score);
      if (value === undefined) return undefined;

      const time = row.created_at ? new Date(row.created_at) : undefined;
      return {
        value,
        label:
          time && !Number.isNaN(time.getTime())
            ? time.toLocaleTimeString(language === "th" ? "th-TH" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
      };
    })
    .filter((point): point is { value: number; label: string } =>
      Boolean(point),
    );
  const chartWidth = Math.max(260, width - 76);

  const handleDateChange = (_event: unknown, date: Date) => {
    setShowDatePicker(false);
    setSelectedDate(date);
  };

  const handleWebDateChange = (value: string) => {
    setWebDate(value);
    const parsedDate = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) setSelectedDate(parsedDate);
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const response = await fetch(API_URL, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`API responded with ${response.status}`);
        }

        const result = await response.json();
        const normalizedRows = normalizeRows(result);

        if (mounted) {
          setRows(normalizedRows);
          setApiError(normalizedRows.length === 0);
        }
      } catch {
        if (mounted) {
          setApiError(true);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();
    const refreshId = setInterval(loadData, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(refreshId);
    };
  }, []);

  const selectQuickDate = (offset: number) => {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    setSelectedDate(date);
    setWebDate(toDateInputValue(date));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>ORCHARDGUARD</Text>
        <Text style={styles.title}>{t("historyTitle")}</Text>
        <Text style={styles.subtitle}>{t("historySubtitle")}</Text>

        <View style={styles.dateSection}>
          <Text style={styles.dateSectionTitle}>{t("chooseDate")}</Text>
          <View style={styles.quickDateRow}>
            <Pressable
              onPress={() => selectQuickDate(0)}
              style={({ pressed }) => [
                styles.quickDateButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("viewToday")}
            >
              <Text style={styles.quickDateText}>{t("today")}</Text>
            </Pressable>
            <Pressable
              onPress={() => selectQuickDate(1)}
              style={({ pressed }) => [
                styles.quickDateButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("viewYesterday")}
            >
              <Text style={styles.quickDateText}>{t("yesterday")}</Text>
            </Pressable>
          </View>
          {Platform.OS === "web" ? (
            <TextInput
              value={webDate}
              onChangeText={handleWebDateChange}
              placeholder="YYYY-MM-DD"
              style={styles.webDateInput}
              accessibilityLabel={t("selectDate")}
            />
          ) : (
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [
                styles.dateButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("openCalendar")}
            >
              <Text style={styles.dateButtonText}>
                {t("chooseDateLabel", { date: selectedReading.date })}
              </Text>
            </Pressable>
          )}
          {showDatePicker && Platform.OS !== "web" && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              maximumDate={new Date()}
              onValueChange={handleDateChange}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{t("selectedDateStatus")}</Text>
          <Text style={styles.summaryValue}>{selectedReading.risk}</Text>
          <Text style={styles.summaryHint}>
            {isLoading
              ? t("loadingServer")
              : selectedRows.length > 0
                ? t("sensorRecords", { count: selectedRows.length })
                : apiError
                  ? t("connectionFallback")
                  : t("noDateData")}
          </Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>{t("riskTrend")}</Text>
              <Text style={styles.chartSubtitle}>
                {t("dateFromApi", {
                  date: localizedDateLabel(selectedDate, language),
                  count: selectedTrend.length,
                })}
              </Text>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>{t("riskLevel")}</Text>
            </View>
          </View>
          <LineChart values={selectedTrend} width={chartWidth} />
        </View>

        <Text style={styles.sectionTitle}>{t("measurements")}</Text>
        {selectedRows.length > 0 ? (
          selectedRows
            .slice()
            .reverse()
            .map((row, index) => (
              <ReadingCard
                key={`${row.created_at ?? "reading"}-${index}`}
                row={row}
                date={selectedDate}
                language={language}
                t={t}
              />
            ))
        ) : (
          <View style={styles.readingCard}>
            <View style={styles.readingHeader}>
              <Text style={styles.date}>{selectedReading.date}</Text>
              <Text style={styles.risk}>{selectedReading.risk}</Text>
            </View>
            <View style={styles.metrics}>
              <Metric
                label={t("temperature")}
                value={selectedReading.temperature}
              />
              <Metric
                label={t("airHumidity")}
                value={selectedReading.humidity}
              />
              <Metric label={t("soilMoisture")} value={selectedReading.soil} />
              <Metric label={t("rainfall")} value={selectedReading.rain} />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LineChart({
  values,
  width,
}: {
  values: { value: number; label: string }[];
  width: number;
}) {
  const height = 190;
  const padding = { top: 14, right: 12, bottom: 30, left: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const safeValues = values
    .map((point) => point.value)
    .filter((value) => Number.isFinite(value));
  const numericValues = safeValues.length > 0 ? safeValues : [0];
  const min = 0;
  const max = Math.max(10, Math.ceil(Math.max(...numericValues)));
  const range = max - min || 1;

  const points = numericValues.map((value, index) => {
    const x =
      numericValues.length === 1
        ? padding.left + plotWidth / 2
        : padding.left + (plotWidth / (numericValues.length - 1)) * index;
    const y = padding.top + ((max - value) / range) * plotHeight;

    return {
      x: Number.isFinite(x) ? x : padding.left,
      y: Number.isFinite(y) ? y : padding.top,
    };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  return (
    <Svg width={width} height={height}>
      {[0, 2, 4, 6, 8, 10].map((value) => {
        const y = padding.top + ((max - value) / range) * plotHeight;
        return (
          <Line
            key={value}
            x1={padding.left}
            x2={width - padding.right}
            y1={y}
            y2={y}
            stroke="#E8F0EA"
            strokeWidth={1}
          />
        );
      })}
      {[0, 2, 4, 6, 8, 10].map((value) => {
        const y = padding.top + ((max - value) / range) * plotHeight + 4;
        return (
          <SvgText key={value} x={2} y={y} fill="#91A097" fontSize={10}>
            {value}
          </SvgText>
        );
      })}
      <Path
        d={path}
        fill="none"
        stroke="#328B4E"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {points.map((point, index) => (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={5}
          fill="#FFFFFF"
          stroke="#328B4E"
          strokeWidth={3}
        />
      ))}
      {points.map((point, index) => (
        <SvgText
          key={`label-${index}`}
          x={point.x}
          y={height - 8}
          fill="#91A097"
          fontSize={9}
          textAnchor="middle"
        >
          {values[index]?.label ?? "-"}
        </SvgText>
      ))}
    </Svg>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function ReadingCard({
  row,
  date,
  language,
  t,
}: {
  row: ApiRow;
  date: Date;
  language: Language;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  const reading = readingFromRow(row, date, language, t);

  return (
    <View style={styles.readingCard}>
      <View style={styles.readingHeader}>
        <Text style={styles.date}>{reading.date}</Text>
        <Text style={styles.risk}>{reading.risk}</Text>
      </View>
      <View style={styles.metrics}>
        <Metric label={t("temperature")} value={reading.temperature} />
        <Metric label={t("airHumidity")} value={reading.humidity} />
        <Metric label={t("soilMoisture")} value={reading.soil} />
        <Metric label={t("rainfall")} value={reading.rain} />
      </View>
    </View>
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
  dateSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 22,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dateSectionTitle: { color: "#263A2D", fontSize: 15, fontWeight: "800" },
  selectedDate: {
    color: "#6B8173",
    fontSize: 11,
    flexShrink: 1,
    textAlign: "right",
  },
  dateButton: {
    backgroundColor: "#F1F6F2",
    borderRadius: 12,
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E5EEE7",
  },
  dateButtonText: { color: "#287C48", fontSize: 12, fontWeight: "700" },
  quickDateRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  quickDateButton: {
    backgroundColor: "#E7F4E9",
    borderRadius: 12,
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
  },
  quickDateText: { color: "#287C48", fontSize: 12, fontWeight: "800" },
  webDateInput: {
    borderWidth: 1,
    borderColor: "#E5EEE7",
    borderRadius: 12,
    color: "#287C48",
    fontSize: 13,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  summaryCard: {
    backgroundColor: "#227847",
    borderRadius: 22,
    padding: 20,
    marginTop: 16,
  },
  summaryLabel: { color: "#CDEAD4", fontSize: 13 },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 8,
  },
  summaryHint: { color: "#D9F0DE", fontSize: 12, marginTop: 10 },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chartTitle: { color: "#263A2D", fontSize: 17, fontWeight: "800" },
  chartSubtitle: { color: "#89988E", fontSize: 11, marginTop: 4 },
  legend: { flexDirection: "row", alignItems: "center" },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#328B4E",
    marginRight: 5,
  },
  legendText: { color: "#6F8175", fontSize: 10 },
  sectionTitle: {
    color: "#263A2D",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 12,
  },
  readingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  readingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { color: "#52665A", fontSize: 13, fontWeight: "700" },
  risk: { color: "#328B4E", fontSize: 12, fontWeight: "800" },
  metrics: { flexDirection: "row", marginTop: 16 },
  metric: { flex: 1 },
  metricLabel: { color: "#839087", fontSize: 10 },
  metricValue: {
    color: "#1E3025",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 4,
  },
  pressed: { opacity: 0.7 },
});
