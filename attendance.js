console.log("Attendance Extension Loaded");

const ATT_CREDIT_KEY = "savedCourseCredits";
const ATT_DEFAULT_CREDIT = 3;
const SEMESTER_WEEKS = 16;
const MIN_ATTENDANCE = 0.8; // 80% required to stay eligible

function attIsLabCourse(courseCode) {
  return courseCode.length > 1 && courseCode[1] === "L";
}

function extractCourseCode(text) {
  const match = text.trim().match(/^([A-Z]{2,3}\d{3,4})/);
  return match ? match[1] : null;
}

function runAttendanceTracker() {
  chrome.storage.local.get([ATT_CREDIT_KEY], (storage) => {
    const creditsMap = storage[ATT_CREDIT_KEY] || {};
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabPanes.forEach(pane => {
      const titleEl = pane.querySelector("h5");
      if (!titleEl) return;

      const courseCode = extractCourseCode(titleEl.textContent);
      if (!courseCode) return;

      const percentEl = pane.querySelector(".progress-bar h5");
      if (!percentEl || percentEl.dataset.absenceInfoAdded) return;

      // Sum absent hours from the lecture table (Duration column, rows marked "A")
      let absentHours = 0;
      pane.querySelectorAll("table tbody tr").forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 4) return;
        const duration = parseFloat(cells[2].textContent.trim()) || 0;
        const presence = cells[3].textContent.trim();
        if (presence === "A") absentHours += duration;
      });

      const credit = creditsMap[courseCode] ?? (attIsLabCourse(courseCode) ? 1 : ATT_DEFAULT_CREDIT);
      const totalHours = credit * SEMESTER_WEEKS;
      const allowedAbsentHours = Math.floor(totalHours * (1 - MIN_ATTENDANCE));
      const remaining = allowedAbsentHours - absentHours;

      let bg = "#0f8a3f"; // safe
      if (remaining <= 1 && remaining >= 0) bg = "#c9740a"; // close to limit
      if (remaining < 0) bg = "#c62828"; // over limit

      const badge = document.createElement("span");
      badge.style.cssText = `
        margin-left:10px;
        padding:2px 8px;
        font-size:13px;
        font-weight:700;
        color:#ffffff;
        background:${bg};
        border-radius:10px;
        white-space:nowrap;
      `;
      badge.textContent = `${absentHours}/${allowedAbsentHours} absences`;
      percentEl.appendChild(badge);
      percentEl.dataset.absenceInfoAdded = "true";
    });
  });
}

runAttendanceTracker();
