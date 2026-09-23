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

const API_URL = "http://localhost/orchardguard/get_data.php";

type ApiRow = {
  temperature?: number | string;
  humidity?: number | string;
  soil?: number | string;
  risk_score?: number | string;
  risk_level?: string;
  created_at?: string;
};

type Reading = {
  date: string;
  risk: string;
  temperature: string;
  humidity: string;
  soil: string;
  trend: number[];
};

const defaultReading: Reading = {
  date: "",
  risk: "ความเสี่ยงต่ำ",
  temperature: "28.5 °C",
  humidity: "82%",
  soil: "65%",
  trend: [38, 43, 41, 48, 46, 53, 57],
};

function formatDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getReadingForDate(date: Date): Reading {
  const day = date.getDate();
  const offset = day % 5;
  return {
    ...defaultReading,
    date: formatDate(date),
    temperature: `${(28.1 + offset * 0.2).toFixed(1)} °C`,
    humidity: `${80 + offset}%`,
    soil: `${62 + offset}%`,
    trend: [38 + offset, 43, 41 + offset, 48, 46 + offset, 53, 57 + offset],
  };
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

function numberValue(value: number | string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readingFromRows(date: Date, rows: ApiRow[]) {
  if (rows.length === 0) return getReadingForDate(date);

  const latest = rows[rows.length - 1];
  return {
    date: formatDate(date),
    risk: latest.risk_level ?? "ความเสี่ยงต่ำ",
    temperature: `${numberValue(latest.temperature, 28.5).toFixed(1)} °C`,
    humidity: `${numberValue(latest.humidity, 82)}%`,
    soil: `${numberValue(latest.soil, 65)}%`,
    trend: rows.map((row) => numberValue(row.risk_score, 0)),
  };
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function HistoryScreen() {
  const { width } = useWindowDimensions();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [rows, setRows] = useState<ApiRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [webDate, setWebDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const selectedRows = rows.filter(
    (row) => dateKey(row.created_at) === dateKeyFromDate(selectedDate),
  );
  const selectedReading = readingFromRows(selectedDate, selectedRows);
  const chartWidth = Math.max(260, Math.min(width - 76, 620));

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
    fetch(API_URL)
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`API responded with ${response.status}`);
        const result: { data?: ApiRow[] } = await response.json();
        if (mounted && Array.isArray(result.data)) setRows(result.data);
      })
      .catch(() => {
        if (mounted) setApiError(true);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
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
        <Text style={styles.title}>ข้อมูลย้อนหลัง</Text>
        <Text style={styles.subtitle}>ติดตามแนวโน้มสุขภาพสวนของคุณ</Text>

        <View style={styles.dateSection}>
          <Text style={styles.dateSectionTitle}>เลือกวันที่ดูข้อมูล</Text>
          <View style={styles.quickDateRow}>
            <Pressable
              onPress={() => selectQuickDate(0)}
              style={({ pressed }) => [
                styles.quickDateButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="ดูข้อมูลวันนี้"
            >
              <Text style={styles.quickDateText}>วันนี้</Text>
            </Pressable>
            <Pressable
              onPress={() => selectQuickDate(1)}
              style={({ pressed }) => [
                styles.quickDateButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="ดูข้อมูลเมื่อวาน"
            >
              <Text style={styles.quickDateText}>เมื่อวาน</Text>
            </Pressable>
          </View>
          {Platform.OS === "web" ? (
            <TextInput
              value={webDate}
              onChangeText={handleWebDateChange}
              placeholder="YYYY-MM-DD"
              style={styles.webDateInput}
              accessibilityLabel="เลือกวันที่"
            />
          ) : (
            <Pressable
              onPress={() => setShowDatePicker(true)}
              style={({ pressed }) => [
                styles.dateButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="เปิดปฏิทินเลือกวันที่"
            >
              <Text style={styles.dateButtonText}>
                เลือกวันที่: {selectedReading.date}
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
          <Text style={styles.summaryLabel}>สถานะของวันที่เลือก</Text>
          <Text style={styles.summaryValue}>{selectedReading.risk}</Text>
          <Text style={styles.summaryHint}>
            {isLoading
              ? "กำลังโหลดข้อมูลจากเซิร์ฟเวอร์"
              : selectedRows.length > 0
                ? `ข้อมูลจากเซนเซอร์ ${selectedRows.length} รายการ`
                : apiError
                  ? "เชื่อมต่อไม่ได้ กำลังใช้ข้อมูลสำรอง"
                  : "วันนี้ยังไม่มีข้อมูลสำหรับวันที่เลือก"}
          </Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>แนวโน้มความเสี่ยง</Text>
              <Text style={styles.chartSubtitle}>ข้อมูล 7 ช่วงเวลาล่าสุด</Text>
            </View>
            <View style={styles.legend}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>ระดับความเสี่ยง</Text>
            </View>
          </View>
          <LineChart values={selectedReading.trend} width={chartWidth} />
        </View>

        <Text style={styles.sectionTitle}>ค่าที่ตรวจวัด</Text>
        <View style={styles.readingCard}>
          <View style={styles.readingHeader}>
            <Text style={styles.date}>{selectedReading.date}</Text>
            <Text style={styles.risk}>{selectedReading.risk}</Text>
          </View>
          <View style={styles.metrics}>
            <Metric label="อุณหภูมิ" value={selectedReading.temperature} />
            <Metric label="ความชื้นอากาศ" value={selectedReading.humidity} />
            <Metric label="ความชื้นดิน" value={selectedReading.soil} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LineChart({ values, width }: { values: number[]; width: number }) {
  const height = 190;
  const padding = { top: 14, right: 12, bottom: 30, left: 30 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const min = 20;
  const max = 80;
  const points = values.map((value, index) => ({
    x: padding.left + (plotWidth / (values.length - 1)) * index,
    y: padding.top + ((max - value) / (max - min)) * plotHeight,
  }));
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`)
    .join(" ");

  return (
    <Svg width={width} height={height}>
      {[20, 40, 60, 80].map((value) => {
        const y = padding.top + ((max - value) / (max - min)) * plotHeight;
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
      {[20, 40, 60, 80].map((value) => {
        const y = padding.top + ((max - value) / (max - min)) * plotHeight + 4;
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
          {`${index * 4}:00`}
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
