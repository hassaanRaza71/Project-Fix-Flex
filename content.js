console.log("GPA Extension Loaded");
function percentageToGPA(pct) {
  if (pct >= 85.51) return 4.00;
  if (pct >= 81.51) return 3.67;
  if (pct >= 77.51) return 3.33;
  if (pct >= 73.51) return 3.00;
  if (pct >= 69.51) return 2.67;
  if (pct >= 65.51) return 2.33;
  if (pct >= 61.51) return 2.00;
  if (pct >= 57.51) return 1.67;
  if (pct >= 53.51) return 1.33;
  if (pct >= 49.51) return 1.00;
  return 0.00;
}

const letterGradeBands = [
    { min: 89.51, letter: "A+"  },
  { min: 85.51, letter: "A"  },
  { min: 81.51, letter: "A-" },
  { min: 77.51, letter: "B+" },
  { min: 73.51, letter: "B"  },
  { min: 69.51, letter: "B-" },
  { min: 65.51, letter: "C+" },
  { min: 61.51, letter: "C"  },
  { min: 57.51, letter: "C-" },
  { min: 53.51, letter: "D+" },
  { min: 49.51, letter: "D"  },
  { min: 0,  letter: "F"  }
];

function percentageToLetter(pct) {
  for (const band of letterGradeBands) {
    if (pct >= band.min) return band.letter;
  }
  return "F";
}

const DEFAULT_CREDIT = 3;

function isLabCourse(courseCode) {
  // Check if course code has L as the 2nd character (e.g., CL002)
  return courseCode.length > 1 && courseCode[1] === "L";
}

function scrapeMarks() {
  const results = {};
  const courseTabs = document.querySelectorAll(".tab-pane");

  courseTabs.forEach(tab => {
    const courseCode = tab.id.trim();
    if (!courseCode) return;

    const heading = tab.querySelector("h5");
    const fullName = heading
      ? heading.textContent.trim()
      : courseCode;

    results[courseCode] = {
      course: courseCode,
      fullName,
      obtained: 0,
      total: 0
    };

    // Find all assessment sections in the course
    const assessmentTables = tab.querySelectorAll("tbody");

    assessmentTables.forEach(tbody => {
      // Check if this is a Final assessment
      const collapseParent = tbody.closest(".collapse");
      const isFinal = collapseParent && collapseParent.id && collapseParent.id.includes("Final");

      // FAST already calculates Best-N logic in total rows
      const totalObtCell = tbody.querySelector(".totalColObtMarks");
      const totalWeightCell = tbody.querySelector(".totalColweightage");

      const hasUngradedRows = Array.from(
  tbody.querySelectorAll(".ObtMarks")
).some(cell => cell.textContent.trim() === "-");

// If this is a Final table and it's empty, skip it
if (isFinal && (!totalObtCell || !totalObtCell.textContent.trim())) {
  return;
}

if (
  totalObtCell &&
  totalWeightCell &&
  !hasUngradedRows
) {
  const obtainedText = totalObtCell.textContent.trim();
  const weightageText = totalWeightCell.textContent.trim();

  const obtained = parseFloat(obtainedText);
  const weightage = parseFloat(weightageText);

  if (!isNaN(obtained) && !isNaN(weightage)) {
    results[courseCode].obtained += obtained;
    results[courseCode].total += weightage;
  }

  return;
}

      // Fallback for sections that do not have total rows
      const rows = tbody.querySelectorAll("tr.calculationrow");

      rows.forEach(row => {

        const obtainedCell = row.querySelector(".ObtMarks");
        const grandTotalCell = row.querySelector(".GrandTotal");
        const weightageCell = row.querySelector(".weightage");

        if (!obtainedCell || !grandTotalCell || !weightageCell)
          return;

        const obtainedText =
          obtainedCell.textContent.trim();

        const grandTotalText =
          grandTotalCell.textContent.trim();

        const weightageText =
          weightageCell.textContent.trim();

        if (
          obtainedText === "-" ||
          grandTotalText === "-" ||
          obtainedText === ""
        ) {
          return;
        }

        const obtainedRaw =
          parseFloat(obtainedText) || 0;

        const grandTotalRaw =
          parseFloat(grandTotalText) || 1;

        const weightage =
          parseFloat(weightageText) || 0;

        const weightedObtained =
          (obtainedRaw / grandTotalRaw) *
          weightage;

        results[courseCode].obtained += weightedObtained;
        results[courseCode].total += weightage;
      });
    });
  });

  return results;
}

function calculateGPA(marksData, creditsMap, nonCreditCourses) {
  const courseResults = [];
  let totalWeightedGPA = 0;
  let totalCredits = 0;
  const nonCreditSet = new Set(nonCreditCourses || []);

  for (const [course, data] of Object.entries(marksData)) {
    if (data.total === 0) {
      courseResults.push({
        course,
        fullName: data.fullName,
        noMarks: true
      });
      continue;
    }

    const percentage = (data.obtained / data.total) * 100;
    const gpa = percentageToGPA(percentage);
    const letter = percentageToLetter(percentage);
    const credits = creditsMap[course] ?? (isLabCourse(course) ? 1 : DEFAULT_CREDIT);
    const isNonCredit = nonCreditSet.has(course);

    console.log(`Course: ${course}, isLab: ${isLabCourse(course)}, credits: ${credits}, nonCredit: ${isNonCredit}`);

    courseResults.push({
    course,
    fullName: data.fullName,
      obtained: data.obtained.toFixed(2),
      total: data.total.toFixed(2),
      percentage: percentage.toFixed(2),
      gpa: gpa.toFixed(2),
      letter,
      credits,
      nonCredit: isNonCredit
    });

    // Non-credit courses (e.g. Pass/Fail) never count toward semester GPA,
    // regardless of whether marks happen to be recorded for them.
    if (!isNonCredit) {
      totalWeightedGPA += gpa * credits;
      totalCredits += credits;
    }
  }

  const semesterGPA = totalCredits > 0 ? (totalWeightedGPA / totalCredits).toFixed(2) : "N/A";
  return { courseResults, semesterGPA };
}

const WIDGET_STATE_KEY = "gpaWidgetUI";
const DEFAULT_WIDGET_STATE = { left: null, top: null, collapsed: false, closed: false };

function saveWidgetState(partial) {
  chrome.storage.local.get([WIDGET_STATE_KEY], (storage) => {
    const merged = { ...DEFAULT_WIDGET_STATE, ...(storage[WIDGET_STATE_KEY] || {}), ...partial };
    chrome.storage.local.set({ [WIDGET_STATE_KEY]: merged });
  });
}

function showReopenChip() {
  let chip = document.getElementById("gpa-reopen-chip");
  if (chip) return;

  chip = document.createElement("button");
  chip.id = "gpa-reopen-chip";
  chip.title = "Show Live GPA";
  chip.textContent = "📊";
  document.body.appendChild(chip);

  chip.addEventListener("click", () => {
    chip.remove();
    saveWidgetState({ closed: false });
    const widget = document.getElementById("gpa-extension-widget");
    if (widget) widget.style.display = "block";
  });
}

function renderWidget(data, widgetState) {
  const state = { ...DEFAULT_WIDGET_STATE, ...(widgetState || {}) };

  let widget = document.getElementById("gpa-extension-widget");
  if (!widget) {
    widget = document.createElement("div");
    widget.id = "gpa-extension-widget";
    document.body.appendChild(widget);
  }

  let html = `
    <div class="gpa-header">
      <span>📊 Live GPA</span>
      <div class="gpa-header-actions">
        <button id="gpa-min-btn" title="Minimize">${state.collapsed ? "▢" : "–"}</button>
        <button id="gpa-close-btn" title="Close">✕</button>
      </div>
    </div>
    <div class="gpa-body" style="${state.collapsed ? "display:none;" : ""}">
  `;

  if (data.courseResults.length === 0) {
    html += `<p class="gpa-empty">No marks found yet.</p>`;
  } else {
    data.courseResults.forEach(c => {
      if (c.noMarks) {
        html += `
          <div class="gpa-course gpa-course-empty">
            <div class="gpa-course-name">
  ${c.fullName || c.course}
</div>
            <div class="gpa-course-stats gpa-course-stats-empty">No marks yet</div>
          </div>
        `;
        return;
      }
      html += `
        <div class="gpa-course">
          <div class="gpa-course-name">
  ${c.fullName || c.course}${c.nonCredit ? ' <span class="gpa-noncredit-tag">Non-Credit</span>' : ''}
</div>
          <div class="gpa-course-stats">
            ${c.obtained}/${c.total} marks &middot; ${c.percentage}% &middot; ${c.letter} (GPA ${c.gpa})
          </div>
        </div>
      `;
    });
    html += `
      <div class="gpa-semester">
        Semester GPA: <strong>${data.semesterGPA}</strong>
      </div>
    `;
  }

  html += `</div>`;
  widget.innerHTML = html;

  // Restore saved position, if any
  if (state.left !== null && state.top !== null) {
    widget.style.left = `${state.left}px`;
    widget.style.top = `${state.top}px`;
    widget.style.right = "auto";
    widget.style.bottom = "auto";
  }

  if (state.closed) {
    widget.style.display = "none";
    showReopenChip();
  }

  document.getElementById("gpa-close-btn").addEventListener("click", () => {
    widget.style.display = "none";
    saveWidgetState({ closed: true });
    showReopenChip();
  });

  document.getElementById("gpa-min-btn").addEventListener("click", () => {
    const body = widget.querySelector(".gpa-body");
    const minBtn = document.getElementById("gpa-min-btn");
    const nowCollapsed = body.style.display !== "none";
    body.style.display = nowCollapsed ? "none" : "";
    minBtn.textContent = nowCollapsed ? "▢" : "–";
    saveWidgetState({ collapsed: nowCollapsed });
  });

  if (!widget.dataset.dragInitialized) {
    widget.dataset.dragInitialized = "true";

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const header = widget.querySelector(".gpa-header");

    header.style.cursor = "move";

    header.addEventListener("mousedown", (e) => {
        // Don't start a drag if the press originated on a header button
        if (e.target.closest("#gpa-close-btn") || e.target.closest("#gpa-min-btn")) return;

        isDragging = true;

        const rect = widget.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Pin the widget's current on-screen position with left/top
        // BEFORE clearing right/bottom - otherwise, for one frame, neither
        // is set and the browser snaps it to its default flow position.
        widget.style.left = `${rect.left}px`;
        widget.style.top = `${rect.top}px`;
        widget.style.right = "auto";
        widget.style.bottom = "auto";

        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const maxLeft = window.innerWidth - widget.offsetWidth;
        const maxTop = window.innerHeight - widget.offsetHeight;

        const newLeft = Math.min(Math.max(0, e.clientX - offsetX), maxLeft);
        const newTop = Math.min(Math.max(0, e.clientY - offsetY), maxTop);

        widget.style.left = `${newLeft}px`;
        widget.style.top = `${newTop}px`;
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.style.userSelect = "";
        saveWidgetState({
          left: parseInt(widget.style.left, 10),
          top: parseInt(widget.style.top, 10)
        });
    });
}
}

function injectStatsIntoDOM(data) {
  data.courseResults.forEach(c => {
    const tab = document.getElementById(c.course);
    if (!tab) return;

    const heading = tab.querySelector("h5");
    if (!heading) return;

    let badge = heading.querySelector(".live-gpa-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "live-gpa-badge";
      heading.appendChild(badge);
    }

    badge.innerHTML = ` &mdash; <strong style="color:#1a73e8; background:#e8f0fe; padding:4px 8px; border-radius:12px; font-size:14px; margin-left:10px;">${c.course} · ${c.percentage}% · ${c.letter} · GPA: ${c.gpa}</strong>`;
  });

  let sgpaBanner = document.getElementById("live-sgpa-banner");
  if (!sgpaBanner) {
    sgpaBanner = document.createElement("div");
    sgpaBanner.id = "live-sgpa-banner";
    
    const tabContent = document.querySelector(".tab-content");
    if (tabContent && tabContent.parentNode) {
        tabContent.parentNode.insertBefore(sgpaBanner, tabContent);
    } else {
        document.body.prepend(sgpaBanner);
    }
  }

  sgpaBanner.innerHTML = `
    <div style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); color: white; padding: 16px 24px; border-radius: 10px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <h4 style="margin: 0; font-size: 18px; font-weight: 600;">📊 Live Semester Projection</h4>
        <div style="font-size: 24px; font-weight: 700;">SGPA: ${data.semesterGPA}</div>
    </div>
  `;

  // Populate Grand Total Marks table - only if tfoot is empty (official data doesn't exist)
  // Find all Grand Total tables on the page dynamically
  const grandTotalTables = document.querySelectorAll("div[id*='Grand_Total_Marks'] table");
  
  grandTotalTables.forEach(table => {
    const tbody = table.querySelector("tbody");
    const tfoot = table.querySelector("tfoot");
    
    // If tfoot exists and has rows with data, don't populate tbody
    if (tfoot && tfoot.querySelector("tr td")) {
      // Official data exists in tfoot, skip
      return;
    }
    
    // Only populate tbody if there's no tfoot data and tbody is empty
    if (tbody && tbody.querySelectorAll("tr").length === 0) {
      // Extract course code from the table's parent ID
      const tableContainer = table.closest("div[id*='Grand_Total_Marks']");
      const tableId = tableContainer ? tableContainer.id : "";
      // Extract course code (e.g., "CL1004" from "CL1004-Grand_Total_Marks")
      const courseCode = tableId.split("-")[0];
      
      // Find the course result for this specific course
      const courseResult = data.courseResults.find(c => c.course === courseCode);
      
      if (courseResult) {
        // Use only this course's data
        const total = parseFloat(courseResult.total);
        const obtained = parseFloat(courseResult.obtained);
        
        tbody.innerHTML = `
          <tr>
            <td class="text-center"><strong>${total.toFixed(2)}</strong></td>
            <td class="text-center"><strong>${obtained.toFixed(2)}</strong></td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
            <td class="text-center">-</td>
          </tr>
        `;
      }
    }
  });
}

function preWarmGrandTotals() {
  const buttons = document.querySelectorAll('[onclick^="ftn_calculateMarks"]');
  const semSelect = document.getElementById("SemId");
  const semId = semSelect ? semSelect.value : null;
  if (!semId) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el && !el.textContent.trim() && typeof value === "number" && !isNaN(value)) {
      el.textContent = value.toFixed(2);
    }
  };

  buttons.forEach(btn => {
    const match = btn.getAttribute("onclick").match(/ftn_calculateMarks\('?(\d+)'?\)/);
    if (!match) return;
    const id = match[1];

    // Skip if already populated (e.g. user already expanded it)
    const avgEl = document.getElementById(`GrandtotalClassAvg_${id}`);
    if (avgEl && avgEl.textContent.trim()) return;

    // Sum weightage cells for this course's total column, same as the portal's own script
    let tempGrandTotal = 0;
    document.querySelectorAll(`.totalColumn_${id} .totalColweightage`).forEach(cell => {
      const val = parseFloat(cell.textContent);
      if (!isNaN(val)) tempGrandTotal += val;
    });
    if (tempGrandTotal > 0) {
      setText(`GrandtotalColMarks_${id}`, tempGrandTotal);
    }

    fetch("../Student/GetClassAvg", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `CourseId=${encodeURIComponent(id)}&SemID=${encodeURIComponent(semId)}`
    })
      .then(res => res.json())
      .then(rows => {
        if (!Array.isArray(rows)) return;
        rows.forEach(row => {
          setText(`GrandtotalClassAvg_${id}`, row.CLASS_AVG);
          setText(`GrandtotalClassMax_${id}`, row.CLASS_MAX);
          setText(`GrandtotalClassMin_${id}`, row.CLASS_MIN);
          setText(`GrandtotalClassStdDev_${id}`, row.CLASS_STD);
          setText(`GrandtotalObtMarks_${id}`, row.TOT_WEIGHT);
        });
      })
      .catch(() => {}); // silent - this is a background nicety, not core functionality
  });
}

function run() {
  chrome.storage.local.get(["savedCourseCredits", "nonCreditCourses", WIDGET_STATE_KEY], (storage) => {
    const creditsMap = storage.savedCourseCredits || {};
    const nonCreditCourses = storage.nonCreditCourses || [];
    const widgetState = storage[WIDGET_STATE_KEY] || DEFAULT_WIDGET_STATE;
    const marksData = scrapeMarks();
    const result = calculateGPA(marksData, creditsMap, nonCreditCourses);
    
    renderWidget(result, widgetState);
    injectStatsIntoDOM(result);
    preWarmGrandTotals();

    chrome.storage.local.set({ latestGPAData: result, lastUpdated: new Date().toISOString() });
  });
}

run();

// const observer = new MutationObserver(() => run());
// observer.observe(document.body, { childList: true, subtree: true });