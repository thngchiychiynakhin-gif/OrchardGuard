import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "th" | "en";

type TranslationKey = keyof typeof translations.en;

const LANGUAGE_STORAGE_KEY = "orchardguard.language";

const translations = {
  en: {
    home: "Home",
    history: "History",
    notifications: "Alerts",
    settings: "Settings",
    appDescription: "Durian tree disease risk assessment",
    online: "Online",
    riskStatus: "Current disease risk",
    riskLow: "Low",
    riskMedium: "Medium",
    riskHigh: "High",
    lowRiskBadge: "LOW RISK",
    mediumRiskBadge: "MEDIUM RISK",
    highRiskBadge: "HIGH RISK",
    loading: "Loading...",
    loadingData: "Loading data",
    latestData: "Latest data: {{value}}",
    sensor: "sensor",
    riskAtLevel: "Risk level: {{risk}}",
    usingFallback: "Using fallback data",
    todaysRecords: "Today's data: {{count}} records",
    noDataSample: "No data for today. Showing sample data",
    sampleData: "Sample data",
    riskDistribution: "Risk level distribution",
    today: "Today",
    total: "Total",
    records: "records",
    analysisNote: "Based on environmental data analysis and ML algorithms",
    temperature: "Temperature",
    airHumidity: "Air humidity",
    soilMoisture: "Soil moisture",
    normal: "Normal",
    rainStatus: "Rain status",
    raining: "Raining",
    noRain: "No rain",
    last24Hours: "(Last 24 hours)",
    notificationTitle: "Alerts",
    noHighRisk: "No high risk detected at this time",
    historyTitle: "History",
    historySubtitle: "Track your orchard's health trends",
    chooseDate: "Choose a date",
    yesterday: "Yesterday",
    viewToday: "View today's data",
    viewYesterday: "View yesterday's data",
    selectDate: "Select date",
    openCalendar: "Open date picker",
    chooseDateLabel: "Date: {{date}}",
    selectedDateStatus: "Selected date status",
    loadingServer: "Loading data from server",
    sensorRecords: "Sensor data: {{count}} records",
    connectionFallback: "Connection unavailable. Using fallback data",
    noDateData: "No data for the selected date",
    riskTrend: "Risk trend",
    dateFromApi: "{{date}} from API ({{count}} records)",
    riskLevel: "Risk level",
    measurements: "Measurements",
    humidity: "Humidity",
    rainfall: "Rainfall",
    unspecifiedRisk: "Risk level unavailable",
    noData: "No data",
    settingsSubtitle: "Make the system work for you",
    general: "General",
    language: "Language",
    chooseLanguage: "Choose your preferred language",
    thai: "ไทย",
    english: "English",
    languageThai: "Thai",
    languageEnglish: "English",
    alertsSetting: "Notifications",
    alertHint: "Get notified when the risk level changes",
    temperatureUnit: "Temperature unit",
    celsius: "Celsius (°C)",
    orchardInfo: "Orchard information",
    myOrchard: "My durian orchard",
    about: "About",
    systemDescription: "Durian tree disease risk assessment system",
    version: "Version 1.0.0",
    alertSubtitle: "Orchard status and sensor readings",
    connectionError: "Unable to connect to data source",
    trackingLatest: "Tracking the latest data",
    waitingForSensor: "Waiting for sensor data",
    latestAt: "Latest data {{date}}",
    currentRisk: "Current risk: {{risk}}",
    highRiskDetail: "High risk detected. Please inspect the orchard",
    mediumRiskDetail: "Please monitor orchard conditions",
    lowRiskDetail: "The latest assessment is within the normal range",
    sensorReadings: "Sensor readings",
    noSensorConnection: "No sensor data yet. Please check the connection",
    noSensorData: "No sensor data yet",
  },
  th: {
    home: "หน้าหลัก",
    history: "ย้อนหลัง",
    notifications: "แจ้งเตือน",
    settings: "ตั้งค่า",
    appDescription: "ระบบประเมินความเสี่ยงโรคในต้นทุเรียน",
    online: "ออนไลน์",
    riskStatus: "สถานะความเสี่ยงโรคปัจจุบัน",
    riskLow: "ต่ำ",
    riskMedium: "ปานกลาง",
    riskHigh: "สูง",
    lowRiskBadge: "ความเสี่ยงต่ำ",
    mediumRiskBadge: "ความเสี่ยงปานกลาง",
    highRiskBadge: "ความเสี่ยงสูง",
    loading: "กำลังโหลด...",
    loadingData: "กำลังโหลดข้อมูล",
    latestData: "ข้อมูลล่าสุด {{value}}",
    sensor: "เซนเซอร์",
    riskAtLevel: "ความเสี่ยงอยู่ในระดับ{{risk}}",
    usingFallback: "กำลังใช้ข้อมูลสำรอง",
    todaysRecords: "ข้อมูลของวันนี้ {{count}} รายการ",
    noDataSample: "วันนี้ยังไม่มีข้อมูล ใช้ข้อมูลตัวอย่าง",
    sampleData: "ข้อมูลตัวอย่าง",
    riskDistribution: "สัดส่วนระดับความเสี่ยง",
    today: "วันนี้",
    total: "รวมทั้งหมด",
    records: "รายการ",
    analysisNote:
      "สัดส่วนนี้อ้างอิงจากการวิเคราะห์ข้อมูลสภาพแวดล้อมและอัลกอริทึม ML",
    temperature: "อุณหภูมิ",
    airHumidity: "ความชื้นอากาศ",
    soilMoisture: "ความชื้นในดิน",
    normal: "ปกติ",
    rainStatus: "สถานะฝน",
    raining: "มีฝน",
    noRain: "ไม่มีฝน",
    last24Hours: "(24 ชั่วโมงที่ผ่านมา)",
    notificationTitle: "การแจ้งเตือน",
    noHighRisk: "ขณะนี้ยังไม่พบความเสี่ยงในระดับสูง",
    historyTitle: "ข้อมูลย้อนหลัง",
    historySubtitle: "ติดตามแนวโน้มสุขภาพสวนของคุณ",
    chooseDate: "เลือกวันที่ดูข้อมูล",
    yesterday: "เมื่อวาน",
    viewToday: "ดูข้อมูลวันนี้",
    viewYesterday: "ดูข้อมูลเมื่อวาน",
    selectDate: "เลือกวันที่",
    openCalendar: "เปิดปฏิทินเลือกวันที่",
    chooseDateLabel: "เลือกวันที่: {{date}}",
    selectedDateStatus: "สถานะของวันที่เลือก",
    loadingServer: "กำลังโหลดข้อมูลจากเซิร์ฟเวอร์",
    sensorRecords: "ข้อมูลจากเซนเซอร์ {{count}} รายการ",
    connectionFallback: "เชื่อมต่อไม่ได้ กำลังใช้ข้อมูลสำรอง",
    noDateData: "วันนี้ยังไม่มีข้อมูลสำหรับวันที่เลือก",
    riskTrend: "แนวโน้มความเสี่ยง",
    dateFromApi: "วันที่ {{date}} จาก API ({{count}} รายการ)",
    riskLevel: "ระดับความเสี่ยง",
    measurements: "ค่าที่ตรวจวัด",
    humidity: "ความชื้นอากาศ",
    rainfall: "ปริมาณฝน",
    unspecifiedRisk: "ไม่ระบุระดับความเสี่ยง",
    noData: "ไม่มีข้อมูล",
    settingsSubtitle: "ปรับการทำงานของระบบให้เหมาะกับคุณ",
    general: "ทั่วไป",
    language: "ภาษา",
    chooseLanguage: "เลือกภาษาที่ต้องการใช้งาน",
    thai: "ไทย",
    english: "English",
    languageThai: "ไทย",
    languageEnglish: "อังกฤษ",
    alertsSetting: "การแจ้งเตือน",
    alertHint: "รับการแจ้งเตือนเมื่อความเสี่ยงเปลี่ยนแปลง",
    temperatureUnit: "หน่วยอุณหภูมิ",
    celsius: "เซลเซียส (°C)",
    orchardInfo: "ข้อมูลสวน",
    myOrchard: "สวนทุเรียนของฉัน",
    about: "เกี่ยวกับระบบ",
    systemDescription: "ระบบประเมินความเสี่ยงโรคในต้นทุเรียน",
    version: "เวอร์ชัน 1.0.0",
    alertSubtitle: "สถานะสวนและข้อมูลจากเซนเซอร์",
    connectionError: "ไม่สามารถเชื่อมต่อข้อมูล",
    trackingLatest: "กำลังติดตามข้อมูลล่าสุด",
    waitingForSensor: "กำลังรอข้อมูลจากเซนเซอร์",
    latestAt: "ข้อมูลล่าสุด {{date}}",
    currentRisk: "ความเสี่ยงปัจจุบัน: {{risk}}",
    highRiskDetail: "ระบบประเมินพบความเสี่ยงสูง ควรตรวจสอบสวน",
    mediumRiskDetail: "ควรเฝ้าระวังสภาพแวดล้อมในสวน",
    lowRiskDetail: "ผลประเมินล่าสุดอยู่ในเกณฑ์ปกติ",
    sensorReadings: "ค่าจากเซนเซอร์",
    noSensorConnection: "ยังไม่มีข้อมูลจากเซนเซอร์ โปรดตรวจสอบการเชื่อมต่อ",
    noSensorData: "ยังไม่มีข้อมูลจากเซนเซอร์",
  },
} as const;

type LanguageContextValue = {
  language: Language;
  isReady: boolean;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("th");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((storedLanguage) => {
        if (mounted && (storedLanguage === "th" || storedLanguage === "en")) {
          setLanguageState(storedLanguage);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage).catch(() => {});
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isReady,
      setLanguage,
      t: (key, values = {}) =>
        Object.entries(values).reduce<string>(
          (text, [name, replacement]) =>
            text.replaceAll(`{{${name}}}`, String(replacement)),
          translations[language][key],
        ),
    }),
    [language, isReady],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
