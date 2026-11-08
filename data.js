// =====================================================
// data.js - 청소로봇 가상 데이터
// 실제 로봇 대신, 로봇이 보내 준다고 가정한 데이터를 직접 만들었습니다.
// (실제 서비스라면 서버 API에서 받아 오는 부분입니다.)
// =====================================================

// 소모품 교체 기준 (단위: 시간)
const BRUSH_LIMIT = 200;   // 브러시 교체 기준
const BRUSH_WARNING = 180; // 이 시간부터 "교체 임박"
const BATTERY_HEALTH_LIMIT = 80; // 배터리 수명(%)이 이보다 낮으면 점검 필요

// 배터리 그래프의 가로축 (오늘 하루 2시간 간격)
const TIME_LABELS = ["08시", "10시", "12시", "14시", "16시", "18시", "20시"];

// 로봇 목록
// battery: 지금 배터리 잔량(%)
// batteryHistory: 시간대별 배터리 잔량(%)
// batteryHealth: 배터리 수명(처음 용량 대비 %)
// brushHours: 브러시를 사용한 시간
// motorCurrent: 바퀴 모터 전류(A), 2.5A를 넘으면 과부하로 봅니다
// errorCode: 지금 발생 중인 오류 (없으면 null)
const robots = [
  {
    id: "CB-01",
    name: "1호기",
    location: "물류센터 A동",
    battery: 76,
    batteryHistory: [100, 92, 85, 97, 90, 82, 76],
    batteryHealth: 94,
    brushHours: 120,
    motorCurrent: 1.8,
    errorCode: null,
  },
  {
    id: "CB-02",
    name: "2호기",
    location: "물류센터 B동",
    battery: 15,
    batteryHistory: [95, 80, 66, 52, 38, 24, 15],
    batteryHealth: 76,
    brushHours: 165,
    motorCurrent: 2.1,
    errorCode: null,
  },
  {
    id: "CB-03",
    name: "3호기",
    location: "쇼핑몰 1층",
    battery: 58,
    batteryHistory: [100, 88, 79, 70, 66, 61, 58],
    batteryHealth: 90,
    brushHours: 212,
    motorCurrent: 1.9,
    errorCode: null,
  },
  {
    id: "CB-04",
    name: "4호기",
    location: "쇼핑몰 2층",
    battery: 43,
    batteryHistory: [98, 90, 81, 70, 58, 47, 43],
    batteryHealth: 88,
    brushHours: 95,
    motorCurrent: 2.9,
    errorCode: "E-201",
  },
  {
    id: "CB-05",
    name: "5호기",
    location: "공항 출국장",
    battery: 88,
    batteryHistory: [100, 93, 86, 100, 96, 92, 88],
    batteryHealth: 97,
    brushHours: 186,
    motorCurrent: 1.7,
    errorCode: null,
  },
  {
    id: "CB-06",
    name: "6호기",
    location: "공항 입국장",
    battery: 0,
    batteryHistory: [90, 82, 74, 66, 0, 0, 0],
    batteryHealth: 92,
    brushHours: 140,
    motorCurrent: 0,
    errorCode: "E-104",
  },
];

// 오류 코드 설명표
const ERROR_CODES = {
  "E-101": "흡입구 막힘",
  "E-104": "통신 끊김",
  "E-201": "바퀴 모터 과부하",
  "E-305": "배터리 과열",
  "E-402": "센서 오염",
};

// 오류 기록(로그) - 최근 일주일
// resolved: 해결되었으면 true
const errorLogs = [
  { time: "2026-11-08 16:02", robotId: "CB-06", code: "E-104", resolved: false },
  { time: "2026-11-08 14:37", robotId: "CB-04", code: "E-201", resolved: false },
  { time: "2026-11-08 09:15", robotId: "CB-04", code: "E-201", resolved: true },
  { time: "2026-11-07 18:44", robotId: "CB-02", code: "E-305", resolved: true },
  { time: "2026-11-07 11:20", robotId: "CB-03", code: "E-101", resolved: true },
  { time: "2026-11-06 15:08", robotId: "CB-04", code: "E-201", resolved: true },
  { time: "2026-11-06 10:52", robotId: "CB-01", code: "E-402", resolved: true },
  { time: "2026-11-05 17:30", robotId: "CB-06", code: "E-104", resolved: true },
  { time: "2026-11-05 13:05", robotId: "CB-03", code: "E-101", resolved: true },
  { time: "2026-11-04 08:41", robotId: "CB-05", code: "E-402", resolved: true },
  { time: "2026-11-03 19:12", robotId: "CB-03", code: "E-101", resolved: true },
  { time: "2026-11-02 12:26", robotId: "CB-02", code: "E-305", resolved: true },
];
