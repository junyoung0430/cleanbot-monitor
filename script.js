// =====================================================
// script.js - 데이터를 읽어서 화면에 그리는 코드
// =====================================================

// 상태 이름 → CSS 클래스 이름
const STATUS_CLASS = {
  정상: "ok",
  주의: "warn",
  오류: "error",
};

let selectedRobotId = robots[0].id; // 처음에는 1호기를 선택
let batteryChart = null;            // 배터리 그래프 (한 번 만들고 데이터만 바꿔 씁니다)

// -----------------------------------------------------
// 1. 로봇 상태 판단 규칙
//    - 오류 코드가 있으면 "오류"
//    - 배터리 부족, 브러시 교체 시기, 배터리 수명 저하, 모터 과부하 중 하나라도 있으면 "주의"
//    - 그 외에는 "정상"
// -----------------------------------------------------
function getStatus(robot) {
  if (robot.errorCode) {
    return "오류";
  }
  if (
    robot.battery < 20 ||
    robot.brushHours >= BRUSH_LIMIT ||
    robot.batteryHealth < BATTERY_HEALTH_LIMIT ||
    robot.motorCurrent > 2.5
  ) {
    return "주의";
  }
  return "정상";
}

// 배터리 잔량에 따라 막대 색 정하기
function getBatteryColor(battery) {
  if (battery >= 50) return "var(--ok)";
  if (battery >= 20) return "var(--warn)";
  return "var(--error)";
}

// -----------------------------------------------------
// 2. 유지보수 알림 만들기 (간단한 예측 유지보수)
//    소모품 사용 시간과 배터리 상태를 기준값과 비교해서
//    고장이 나기 전에 미리 교체·점검 알림을 띄웁니다.
// -----------------------------------------------------
function getAlerts() {
  const alerts = [];

  robots.forEach(function (robot) {
    const label = robot.name + "(" + robot.id + ")";

    if (robot.errorCode) {
      alerts.push({
        level: "error",
        text: "🚨 " + label + " " + ERROR_CODES[robot.errorCode] + " 오류 발생 [" + robot.errorCode + "] - 현장 확인 필요",
      });
    }

    if (robot.brushHours >= BRUSH_LIMIT) {
      alerts.push({
        level: "warn",
        text: "🔧 " + label + " 브러시 교체 필요 (사용 " + robot.brushHours + "시간 / 기준 " + BRUSH_LIMIT + "시간)",
      });
    } else if (robot.brushHours >= BRUSH_WARNING) {
      const left = BRUSH_LIMIT - robot.brushHours;
      alerts.push({
        level: "warn",
        text: "⏳ " + label + " 브러시 교체 임박 (약 " + left + "시간 남음)",
      });
    }

    // 오류로 꺼진 로봇은 배터리 부족 알림을 따로 띄우지 않습니다
    if (!robot.errorCode && robot.battery < 20) {
      alerts.push({
        level: "warn",
        text: "🔋 " + label + " 배터리 부족 (" + robot.battery + "%) - 충전 필요",
      });
    }

    if (robot.batteryHealth < BATTERY_HEALTH_LIMIT) {
      alerts.push({
        level: "warn",
        text: "🪫 " + label + " 배터리 수명 저하 (" + robot.batteryHealth + "%) - 배터리 점검 권장",
      });
    }
  });

  // 오류 알림이 위로 오도록 정렬
  alerts.sort(function (a, b) {
    if (a.level === b.level) return 0;
    return a.level === "error" ? -1 : 1;
  });

  return alerts;
}

// -----------------------------------------------------
// 3. 화면 그리기 함수들
// -----------------------------------------------------

// 요약 칸 (전체 / 정상 / 주의 / 오류)
function renderSummary() {
  const count = { 정상: 0, 주의: 0, 오류: 0 };
  robots.forEach(function (robot) {
    count[getStatus(robot)]++;
  });

  document.getElementById("summary").innerHTML =
    '<div class="summary-item"><p class="label">전체 로봇</p><p class="value">' + robots.length + "대</p></div>" +
    '<div class="summary-item ok"><p class="label">정상</p><p class="value">' + count["정상"] + "대</p></div>" +
    '<div class="summary-item warn"><p class="label">주의</p><p class="value">' + count["주의"] + "대</p></div>" +
    '<div class="summary-item error"><p class="label">오류</p><p class="value">' + count["오류"] + "대</p></div>";
}

// 유지보수 알림 목록
function renderAlerts() {
  const list = document.getElementById("alert-list");
  const alerts = getAlerts();

  if (alerts.length === 0) {
    list.innerHTML = '<li class="none">✅ 지금은 확인할 알림이 없습니다.</li>';
    return;
  }

  list.innerHTML = alerts
    .map(function (alert) {
      return '<li class="' + alert.level + '">' + alert.text + "</li>";
    })
    .join("");
}

// 로봇 카드 목록 (statusFilter: "all", "정상", "주의", "오류")
function renderRobots(statusFilter) {
  const grid = document.getElementById("robot-grid");

  const filtered = robots.filter(function (robot) {
    return statusFilter === "all" || getStatus(robot) === statusFilter;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="hint">해당 상태의 로봇이 없습니다.</p>';
    return;
  }

  grid.innerHTML = filtered
    .map(function (robot) {
      const status = getStatus(robot);
      const selected = robot.id === selectedRobotId ? " selected" : "";
      const errorText = robot.errorCode
        ? '<p class="card-error">⚠ ' + robot.errorCode + " " + ERROR_CODES[robot.errorCode] + "</p>"
        : "";

      return (
        '<button class="robot-card' + selected + '" data-id="' + robot.id + '">' +
          '<div class="card-top">' +
            '<span class="robot-name">' + robot.name + " · " + robot.id + "</span>" +
            '<span class="badge ' + STATUS_CLASS[status] + '">' + status + "</span>" +
          "</div>" +
          '<p class="robot-location">📍 ' + robot.location + "</p>" +
          '<div class="stat-row"><span class="stat-label">배터리</span><span>' + robot.battery + "%</span></div>" +
          '<div class="battery-bar"><div class="battery-fill" style="width:' + robot.battery + "%; background:" + getBatteryColor(robot.battery) + '"></div></div>' +
          '<div class="stat-row"><span class="stat-label">배터리 수명</span><span>' + robot.batteryHealth + "%</span></div>" +
          '<div class="stat-row"><span class="stat-label">브러시 사용</span><span>' + robot.brushHours + " / " + BRUSH_LIMIT + "시간</span></div>" +
          '<div class="stat-row"><span class="stat-label">모터 전류</span><span>' + robot.motorCurrent + " A</span></div>" +
          errorText +
        "</button>"
      );
    })
    .join("");

  // 카드를 누르면 그 로봇을 선택
  grid.querySelectorAll(".robot-card").forEach(function (card) {
    card.addEventListener("click", function () {
      selectRobot(card.dataset.id);
    });
  });
}

// 로봇 선택 → 카드 강조 + 배터리 그래프 바꾸기
function selectRobot(robotId) {
  selectedRobotId = robotId;

  document.querySelectorAll(".robot-card").forEach(function (card) {
    card.classList.toggle("selected", card.dataset.id === robotId);
  });

  const robot = robots.find(function (r) {
    return r.id === robotId;
  });

  document.getElementById("chart-title").textContent =
    "배터리 변화 - " + robot.name + " (" + robot.location + ")";

  if (batteryChart) {
    batteryChart.data.datasets[0].data = robot.batteryHistory;
    batteryChart.data.datasets[0].label = robot.name + " 배터리(%)";
    batteryChart.update();
  }
}

// 배터리 꺾은선 그래프 처음 만들기
function createBatteryChart() {
  const robot = robots.find(function (r) {
    return r.id === selectedRobotId;
  });

  batteryChart = new Chart(document.getElementById("battery-chart"), {
    type: "line",
    data: {
      labels: TIME_LABELS,
      datasets: [
        {
          label: robot.name + " 배터리(%)",
          data: robot.batteryHistory,
          borderColor: "#1f6feb",
          backgroundColor: "rgba(31, 111, 235, 0.12)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, max: 100, ticks: { callback: function (v) { return v + "%"; } } },
      },
      plugins: { legend: { display: false } },
    },
  });
}

// 오류 코드별 발생 횟수 막대 그래프 (로그 분석)
function createErrorChart() {
  // 오류 코드마다 몇 번 나왔는지 세기
  const count = {};
  errorLogs.forEach(function (log) {
    count[log.code] = (count[log.code] || 0) + 1;
  });

  // 많이 나온 순서로 정렬
  const codes = Object.keys(count).sort(function (a, b) {
    return count[b] - count[a];
  });

  new Chart(document.getElementById("error-chart"), {
    type: "bar",
    data: {
      labels: codes.map(function (code) {
        return code + " " + ERROR_CODES[code];
      }),
      datasets: [
        {
          label: "발생 횟수",
          data: codes.map(function (code) {
            return count[code];
          }),
          backgroundColor: "#d64545",
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y", // 가로 막대
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { ticks: { stepSize: 1 } } },
      plugins: { legend: { display: false } },
    },
  });
}

// 오류 기록 표 (robotFilter: "all" 또는 로봇 id)
function renderLogs(robotFilter) {
  const body = document.getElementById("log-body");

  const filtered = errorLogs.filter(function (log) {
    return robotFilter === "all" || log.robotId === robotFilter;
  });

  if (filtered.length === 0) {
    body.innerHTML = '<tr><td colspan="5">오류 기록이 없습니다.</td></tr>';
    return;
  }

  body.innerHTML = filtered
    .map(function (log) {
      const robot = robots.find(function (r) {
        return r.id === log.robotId;
      });
      const state = log.resolved
        ? '<span class="resolved">해결</span>'
        : '<span class="unresolved">미해결</span>';

      return (
        "<tr>" +
          "<td>" + log.time + "</td>" +
          "<td>" + robot.name + " (" + log.robotId + ")</td>" +
          "<td>" + log.code + "</td>" +
          "<td>" + ERROR_CODES[log.code] + "</td>" +
          "<td>" + state + "</td>" +
        "</tr>"
      );
    })
    .join("");
}

// 오류 기록 필터 선택 상자에 로봇 이름 채우기
function fillLogFilter() {
  const select = document.getElementById("log-filter");
  robots.forEach(function (robot) {
    const option = document.createElement("option");
    option.value = robot.id;
    option.textContent = robot.name + " (" + robot.id + ")";
    select.appendChild(option);
  });

  select.addEventListener("change", function () {
    renderLogs(select.value);
  });
}

// 상태 필터 버튼 연결
function setupStatusFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach(function (b) {
        b.classList.remove("active");
      });
      button.classList.add("active");
      renderRobots(button.dataset.status);
    });
  });
}

// 갱신 시간 표시
function showUpdatedTime() {
  const now = new Date();
  const pad = function (n) {
    return String(n).padStart(2, "0");
  };
  document.getElementById("updated-time").textContent =
    now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) +
    " " + pad(now.getHours()) + ":" + pad(now.getMinutes());
}

// -----------------------------------------------------
// 4. 시작
// -----------------------------------------------------
showUpdatedTime();
renderSummary();
renderAlerts();
renderRobots("all");
fillLogFilter();
renderLogs("all");
setupStatusFilter();

// Chart.js를 못 불러온 경우(인터넷 끊김 등)에도 나머지 화면은 보이게 합니다
if (typeof Chart !== "undefined") {
  createBatteryChart();
  createErrorChart();
  selectRobot(selectedRobotId);
} else {
  document.querySelectorAll(".chart-box").forEach(function (box) {
    box.innerHTML = '<p class="hint">그래프 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.</p>';
  });
}
