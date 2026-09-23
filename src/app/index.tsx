import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DONUT_SIZE = Math.min(SCREEN_WIDTH * 0.52, 210);
const CENTER = DONUT_SIZE / 2;
const RADIUS = DONUT_SIZE * 0.36;
const STROKE_WIDTH = DONUT_SIZE * 0.18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const API_URL = "http://localhost/orchardguard/get_data.php";

type OrchardRow = {
  temperature?: number | string;
  humidity?: number | string;
  soil?: number | string;
  rain?: number | string;
  risk_score?: number | string;
  risk_level?: string;
  created_at?: string;
};

const fallbackRow: OrchardRow = {
  temperature: 28.5,
  humidity: 82,
  soil: 65,
  rain: 0,
  risk_score: 1,
  risk_level: "LOW",
  created_at: "ข้อมูลตัวอย่าง",
};

function numberValue(value: number | string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function riskBucket(row: OrchardRow) {
  const level = String(row.risk_level ?? "").toLowerCase();
  if (level.includes("high") || level.includes("สูง")) return "สูง";
  if (
    level.includes("medium") ||
    level.includes("กลาง") ||
    level.includes("ปาน")
  )
    return "ปานกลาง";
  if (level.includes("low") || level.includes("ต่ำ")) return "ต่ำ";

  const score = numberValue(row.risk_score, 0);
  return score >= 7 ? "สูง" : score >= 4 ? "ปานกลาง" : "ต่ำ";
}

function displayValue(value: number | string | undefined, fallback: string) {
  return value === undefined || value === null || value === ""
    ? fallback
    : String(value);
}

function dateKey(value: string | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function todayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export default function HomeScreen() {
  const [rows, setRows] = useState<OrchardRow[]>([fallbackRow]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok)
          throw new Error(`API responded with ${response.status}`);
        const result: { data?: OrchardRow[] } = await response.json();
        if (isMounted && Array.isArray(result.data) && result.data.length > 0) {
          setRows(result.data);
          setApiError(false);
        }
      } catch {
        if (isMounted) setApiError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const todayRows = rows.filter(
    (row) => dateKey(row.created_at) === todayKey(),
  );
  const displayRows = todayRows.length > 0 ? todayRows : [fallbackRow];
  const latest = displayRows[displayRows.length - 1] ?? fallbackRow;
  const riskCounts = displayRows.reduce<Record<string, number>>(
    (counts, row) => {
      const bucket = riskBucket(row);
      counts[bucket] = (counts[bucket] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const riskData = [
    {
      name: "ต่ำ",
      value: Math.round(((riskCounts["ต่ำ"] ?? 0) / displayRows.length) * 100),
      color: "#43A95C",
    },
    {
      name: "ปานกลาง",
      value: Math.round(
        ((riskCounts["ปานกลาง"] ?? 0) / displayRows.length) * 100,
      ),
      color: "#FFB52E",
    },
    {
      name: "สูง",
      value: Math.round(((riskCounts["สูง"] ?? 0) / displayRows.length) * 100),
      color: "#F45151",
    },
  ];
  const latestRisk = riskBucket(latest);
  const latestTemperature = numberValue(latest.temperature, 28.5);
  const latestHumidity = numberValue(latest.humidity, 82);
  const latestSoil = numberValue(latest.soil, 65);
  const latestRain = numberValue(latest.rain, 0);
  const riskBadge =
    latestRisk === "สูง"
      ? "HIGH RISK"
      : latestRisk === "ปานกลาง"
        ? "MEDIUM RISK"
        : "LOW RISK";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <View
          style={[styles.header, SCREEN_WIDTH < 380 && styles.headerMobile]}
        >
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🌿</Text>
          </View>

          <View style={styles.headerText}>
            <Text
              style={[styles.title, SCREEN_WIDTH < 380 && styles.titleMobile]}
            >
              OrchardGuard
            </Text>
            <Text style={styles.subtitle}>
              ระบบประเมินความเสี่ยงโรคในต้นทุเรียน
            </Text>
          </View>

          <View style={styles.onlineBox}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>ออนไลน์</Text>
          </View>
        </View>

        <View
          style={[
            styles.riskBanner,
            SCREEN_WIDTH < 380 && styles.riskBannerMobile,
          ]}
        >
          <View style={styles.riskIconBox}>
            <Text style={styles.riskIcon}>🌿</Text>
          </View>

          <View style={styles.riskMain}>
            <Text style={styles.riskSmallTitle}>
              สถานะความเสี่ยงโรคปัจจุบัน
            </Text>
            <Text style={styles.riskLevel}>{latestRisk}</Text>
            <View style={styles.lowBadge}>
              <Text style={styles.lowBadgeText}>{riskBadge}</Text>
            </View>
          </View>

          <View
            style={[
              styles.riskDescription,
              SCREEN_WIDTH < 380 && styles.riskBannerMobileDescription,
            ]}
          >
            <Text style={styles.riskDescriptionTitle}>
              {isLoading
                ? "กำลังโหลดข้อมูล"
                : `ข้อมูลล่าสุด ${displayValue(latest.created_at, "จากเซนเซอร์")}`}
            </Text>
            <Text style={styles.riskDescriptionText}>
              ความเสี่ยงอยู่ในระดับ{latestRisk}
            </Text>
            <Text style={styles.riskDescriptionText}>
              {apiError
                ? "กำลังใช้ข้อมูลสำรอง"
                : todayRows.length > 0
                  ? `ข้อมูลของวันนี้ ${todayRows.length} รายการ`
                  : "วันนี้ยังไม่มีข้อมูล ใช้ข้อมูลตัวอย่าง"}
            </Text>
          </View>
        </View>

        {/* =====================================================
            DONUT CHART
        ====================================================== */}

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleRow}>
              <View style={styles.chartTitleIcon}>
                <Text>◔</Text>
              </View>

              <Text style={styles.chartTitle}>สัดส่วนระดับความเสี่ยง</Text>
            </View>

            <View style={styles.todayButton}>
              <Text style={styles.todayIcon}>▣</Text>

              <Text style={styles.todayText}>วันนี้</Text>
            </View>
          </View>

          <View
            style={[
              styles.chartContent,
              SCREEN_WIDTH < 390 && styles.chartContentMobile,
            ]}
          >
            {/* Donut */}

            <View
              style={[
                styles.donutContainer,
                {
                  width: DONUT_SIZE,
                  height: DONUT_SIZE,
                },
              ]}
            >
              <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
                {/* พื้นหลังวงกลม */}

                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  stroke="#E8F0EA"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                />

                {/* LOW 65% */}

                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  stroke="#43A95C"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE * (riskData[0].value / 100)} ${CIRCUMFERENCE}`}
                  strokeDashoffset={0}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                />

                {/* MEDIUM 25% */}

                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  stroke="#FFB52E"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE * (riskData[1].value / 100)} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-CIRCUMFERENCE * (riskData[0].value / 100)}
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                />

                {/* HIGH 10% */}

                <Circle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  stroke="#F45151"
                  strokeWidth={STROKE_WIDTH}
                  fill="none"
                  strokeDasharray={`${CIRCUMFERENCE * (riskData[2].value / 100)} ${CIRCUMFERENCE}`}
                  strokeDashoffset={
                    -CIRCUMFERENCE *
                    ((riskData[0].value + riskData[1].value) / 100)
                  }
                  strokeLinecap="butt"
                  transform={`rotate(-90 ${CENTER} ${CENTER})`}
                />
              </Svg>

              {/* ข้อความตรงกลาง */}

              <View style={styles.donutCenter}>
                <Text style={styles.donutCenterSmall}>รวมทั้งหมด</Text>

                <Text
                  style={styles.donutCenterValue}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}
                >
                  {displayRows.length} รายการ
                </Text>
                <Text style={styles.donutCenterDate}>วันนี้</Text>
              </View>
            </View>

            {/* Legend */}

            <View
              style={[
                styles.legendContainer,
                SCREEN_WIDTH < 390 && styles.legendContainerMobile,
              ]}
            >
              {riskData.map((item) => (
                <View key={item.name} style={styles.legendRow}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor: item.color,
                      },
                    ]}
                  />

                  <Text style={styles.legendName}>{item.name}</Text>

                  <Text style={styles.legendValue}>{item.value}%</Text>

                  <Text style={styles.legendArrow}>›</Text>
                </View>
              ))}

              <View style={styles.chartNote}>
                <Text style={styles.chartNoteIcon}>↗</Text>

                <Text style={styles.chartNoteText}>
                  สัดส่วนนี้อ้างอิงจากการวิเคราะห์
                  {"\n"}
                  ข้อมูลสภาพแวดล้อมและอัลกอริทึม ML
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            SENSOR DATA
        ====================================================== */}

        <View style={styles.sensorRow}>
          {/* Temperature */}

          <View style={styles.sensorCard}>
            <View style={styles.sensorIconRed}>
              <Text style={styles.sensorIconText}>🌡</Text>
            </View>

            <Text style={styles.sensorLabel}>อุณหภูมิ</Text>

            <Text style={styles.sensorValue}>
              {latestTemperature.toFixed(1)} °C
            </Text>

            <Text style={styles.normalText}>↑ ปกติ</Text>
          </View>

          {/* Humidity */}

          <View style={styles.sensorCard}>
            <View style={styles.sensorIconBlue}>
              <Text style={styles.sensorIconText}>💧</Text>
            </View>

            <Text style={styles.sensorLabel}>ความชื้นอากาศ</Text>

            <Text style={styles.sensorValue}>{latestHumidity} %</Text>

            <Text style={styles.normalText}>↑ ปกติ</Text>
          </View>
        </View>

        {/* =====================================================
            SOIL MOISTURE
        ====================================================== */}

        <View style={styles.longCard}>
          <View style={styles.sensorIconGreen}>
            <Text style={styles.sensorIconText}>🌱</Text>
          </View>

          <View style={styles.longCardInfo}>
            <Text style={styles.longCardLabel}>ความชื้นในดิน</Text>

            <View style={styles.valueRow}>
              <Text style={styles.longCardValue}>{latestSoil} %</Text>

              <Text style={styles.normalText}>↑ ปกติ</Text>
            </View>
          </View>

          {/* Progress */}

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressValue,
                {
                  width: `${Math.min(Math.max(latestSoil, 0), 100)}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* =====================================================
            RAIN
        ====================================================== */}

        <View style={styles.longCardBlue}>
          <View style={styles.sensorIconRain}>
            <Text style={styles.sensorIconText}>☁</Text>
          </View>

          <View style={styles.longCardInfo}>
            <Text style={styles.rainLabel}>สถานะฝน</Text>

            <Text style={styles.rainValue}>
              {latestRain > 0 ? "มีฝน" : "ไม่มีฝน"}
            </Text>
          </View>

          <View style={styles.rainRight}>
            <Text style={styles.rainAmount}>{latestRain} mm</Text>

            <Text style={styles.rainSub}>(24 ชั่วโมงที่ผ่านมา)</Text>
          </View>
        </View>

        {/* =====================================================
            NOTIFICATION
        ====================================================== */}

        <Link href="/notifications" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.notificationCard,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.notificationIcon}>
              <Text>🔔</Text>
            </View>

            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>การแจ้งเตือน</Text>

              <Text style={styles.notificationText}>
                ขณะนี้ยังไม่พบความเสี่ยงในระดับสูง
              </Text>
            </View>

            <Text style={styles.notificationArrow}>›</Text>
          </Pressable>
        </Link>

        {/* =====================================================
            FOOTER
        ====================================================== */}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F3",
  },

  pressed: {
    opacity: 0.72,
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },

  /* ================= HEADER ================= */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  headerMobile: {
    marginBottom: 14,
  },

  logoBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "#3FA65B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  logoIcon: {
    fontSize: 29,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#145C3A",
  },

  titleMobile: {
    fontSize: 23,
  },

  subtitle: {
    fontSize: 13,
    color: "#617067",
    marginTop: 3,
  },

  onlineBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },

  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#43A95C",
    marginRight: 5,
  },

  onlineText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3A7350",
  },

  /* ================= RISK ================= */

  riskBanner: {
    backgroundColor: "#247C48",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },

  riskBannerMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
  },

  riskIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  riskIcon: {
    fontSize: 30,
  },

  riskMain: {
    flex: 1,
  },

  riskSmallTitle: {
    color: "#E7F4E9",
    fontSize: 12,
  },

  riskLevel: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 1,
  },

  lowBadge: {
    backgroundColor: "#66C779",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },

  lowBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  riskDescription: {
    flex: 1,
    paddingLeft: 8,
  },

  riskBannerMobileDescription: {
    marginTop: 12,
    paddingLeft: 0,
    width: "100%",
  },

  riskDescriptionTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },

  riskDescriptionText: {
    color: "#DCEFE1",
    fontSize: 11,
    lineHeight: 17,
  },

  /* ================= CHART ================= */

  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
  },

  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  chartTitleIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E6F4E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  chartTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#202D25",
  },

  todayButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1EAE3",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  todayIcon: {
    color: "#578064",
    marginRight: 5,
  },

  todayText: {
    color: "#405A49",
    fontSize: 12,
    fontWeight: "600",
  },

  chartContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  chartContentMobile: {
    alignItems: "stretch",
    flexDirection: "column",
  },

  donutContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: DONUT_SIZE * 0.78,
  },

  donutCenterSmall: {
    fontSize: 11,
    color: "#718078",
  },

  donutCenterValue: {
    fontSize: 19,
    fontWeight: "800",
    color: "#17231B",
    marginTop: 2,
    maxWidth: "100%",
    textAlign: "center",
  },

  donutCenterDate: {
    fontSize: 11,
    color: "#718078",
    marginTop: 1,
  },

  legendContainer: {
    flex: 1,
    marginLeft: 8,
  },

  legendContainerMobile: {
    marginLeft: 0,
    marginTop: 14,
    width: "100%",
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginBottom: 7,
  },

  legendDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginRight: 9,
  },

  legendName: {
    flex: 1,
    fontSize: 14,
    color: "#29342D",
    fontWeight: "600",
  },

  legendValue: {
    fontSize: 15,
    color: "#17231B",
    fontWeight: "800",
  },

  legendArrow: {
    fontSize: 23,
    color: "#819087",
    marginLeft: 7,
  },

  chartNote: {
    backgroundColor: "#F0F8F1",
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  chartNoteIcon: {
    fontSize: 22,
    color: "#3A9A59",
    marginRight: 7,
  },

  chartNoteText: {
    flex: 1,
    fontSize: 9,
    color: "#66806E",
    lineHeight: 14,
  },

  /* ================= SENSOR ================= */

  sensorRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  sensorCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    elevation: 2,
  },

  sensorIconRed: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFF0ED",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  sensorIconBlue: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EAF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  sensorIconGreen: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E7F5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  sensorIconRain: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F4FF",
    justifyContent: "center",
    alignItems: "center",
  },

  sensorIconText: {
    fontSize: 24,
  },

  sensorLabel: {
    fontSize: 13,
    color: "#66736B",
  },

  sensorValue: {
    fontSize: 23,
    fontWeight: "800",
    color: "#17231B",
    marginTop: 3,
  },

  normalText: {
    fontSize: 11,
    color: "#369652",
    fontWeight: "700",
    marginTop: 4,
  },

  /* ================= SOIL ================= */

  longCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
  },

  longCardInfo: {
    marginLeft: 12,
    minWidth: 100,
  },

  longCardLabel: {
    fontSize: 13,
    color: "#66736B",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  longCardValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#17231B",
    marginRight: 8,
  },

  progressBackground: {
    flex: 1,
    height: 9,
    backgroundColor: "#DDEFE0",
    borderRadius: 10,
    marginLeft: 15,
    overflow: "hidden",
  },

  progressValue: {
    height: "100%",
    backgroundColor: "#4BAE63",
    borderRadius: 10,
  },

  /* ================= RAIN ================= */

  longCardBlue: {
    backgroundColor: "#F5FAFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0F0FC",
  },

  rainLabel: {
    fontSize: 13,
    color: "#54708A",
  },

  rainValue: {
    fontSize: 21,
    fontWeight: "800",
    color: "#172E43",
    marginTop: 2,
  },

  rainRight: {
    marginLeft: "auto",
    alignItems: "flex-end",
  },

  rainAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1761A0",
  },

  rainSub: {
    fontSize: 9,
    color: "#7691A5",
    marginTop: 2,
  },

  /* ================= NOTIFICATION ================= */

  notificationCard: {
    backgroundColor: "#EDF8EF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4CA75F",
    alignItems: "center",
    justifyContent: "center",
  },

  notificationInfo: {
    flex: 1,
    marginLeft: 12,
  },

  notificationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#285B36",
  },

  notificationText: {
    fontSize: 11,
    color: "#62806A",
    marginTop: 3,
  },

  notificationArrow: {
    fontSize: 28,
    color: "#719078",
  },

  /* ================= FOOTER ================= */

  footer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    elevation: 4,
  },

  footerItem: {
    alignItems: "center",
    flex: 1,
  },

  footerItemActive: {
    alignItems: "center",
    flex: 1,
  },

  footerIcon: {
    fontSize: 22,
    color: "#819087",
  },

  footerIconActive: {
    fontSize: 23,
    color: "#187345",
  },

  footerText: {
    fontSize: 9,
    color: "#819087",
    marginTop: 3,
  },

  footerTextActive: {
    fontSize: 9,
    color: "#187345",
    fontWeight: "800",
    marginTop: 3,
  },
});
