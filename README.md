# Fix the Flex — Live GPA & Attendance Tracker for FAST FlexStudent Portal

**v2.0**

A Chrome extension that calculates your real-time GPA directly on the FAST
FlexStudent marks page, using the official grading formula, and now also
tracks your attendance safety margin. It fills in the "Grand Total" table,
which the portal usually leaves blank, and syncs your real credit hours
straight from your Transcript.

## Features

- **Live GPA widget** — floating, draggable panel showing your projected
  percentage, letter grade, and GPA for each course as marks get uploaded.
  Remembers its position across page reloads.
- **Minimize or close** — collapse the widget to just its header, or close
  it entirely. Closing tucks it into a small floating icon in the bottom
  right corner — one tap brings it right back, no reload needed.
- **Semester GPA (SGPA)** — weighted across all your courses using real
  credit hours, shown in a banner at the top of the marks page.
- **"No marks yet" courses** — non-credit or ungraded courses (e.g. Sirat-Un-Nabi)
  are shown clearly instead of silently disappearing from the widget.
- **Grand Total auto-fill** — populates the empty Grand Total table for each
  course with your live obtained/total marks, and pre-fetches the official
  class average/min/max/std-dev in the background so it's ready the moment
  you expand it.
- **Attendance absence tracker** — on the Attendance page, each course now
  shows how many classes (in hours) you can still miss before dropping below
  80% — color-coded green/orange/red based on your real credit hours.
- **Automatic credit hours sync** — silently fetches your Transcript page in
  the background (throttled to once a day) from the Marks or Attendance
  page, so GPA and attendance math uses your real credit hours — no manual
  visit required.
- **Inline course badges** — each course tab heading shows a quick summary
  (percentage, letter grade, GPA).
- **Popup summary** — click the extension icon for a compact overview of all
  courses and your SGPA.

## Installation

1. Download or clone this extension folder onto your computer.
2. Open Chrome (or Edge) and go to `chrome://extensions`.
3. Turn on **Developer mode** (toggle, usually top-right).
4. Click **Load unpacked**.
5. Select the folder containing `manifest.json`.
6. The extension should now appear in your extensions list and toolbar.

## How to Use

### 1. Credit hours sync automatically (no action needed)

The extension keeps your credit hours accurate on its own:

1. Every time you're on the **Marks** or **Attendance** page, it silently
   fetches your **Transcript** page in the background (throttled to once
   per day, so it won't spam requests) and reads your real credit hours per
   course.
2. Nothing to click, nothing to wait for — it just quietly stays in sync.
3. You can still visit **Student → Transcript** directly at any time to
   force an immediate refresh (useful right after a new semester's course
   registration changes).

> Until the first sync completes (e.g. the very first time you use the
> extension), it uses a default guess (1 credit for lab courses, 3 for
> others) so the GPA/attendance numbers are never blank.

### 2. View your live GPA

1. Go to **Student → Student Marks**.
2. Click through each course tab (CL1004, CS1004, etc.) — the extension
   reads the marks table for whichever tab is active.
3. A floating widget appears showing:
   - Each course's obtained/total marks, percentage, letter grade, and GPA
   - "No marks yet" for courses without graded assessments
   - Your overall SGPA at the bottom
4. A blue **SGPA banner** also appears at the top of the page with your
   live semester GPA.
5. Each course heading gets a small badge showing that course's stats.
6. The **Grand Total** table for each course fills in automatically —
   including official class average/min/max/std-dev, pre-fetched in the
   background.

### 3. Move, minimize, or close the widget

- **Drag** the widget by its header to reposition it anywhere on the page —
  it remembers where you left it, even after a refresh.
- Click **–** to minimize it down to just the header.
- Click **✕** to close it. A small floating icon appears in the bottom
  right — tap it anytime to bring the widget back instantly.

### 4. Check your attendance safety margin

1. Go to **Student → Attendance**.
2. Next to each course's attendance percentage, you'll see something like
   `2/9 absences` — how many classes (in hours) you've missed vs. how many
   you're allowed before dropping under 80%.
3. Color coding: green = safe, orange = one or fewer absences of buffer
   left, red = already over the limit.

### 5. Check the popup

Click the extension's icon in the toolbar at any time to see a quick text
summary of all courses scraped so far and your current SGPA.

## Notes

- This tool gives **projections only** based on data currently visible on
  the portal — it is not official and does not replace your university's
  results or attendance records.
- The grading formula matches FAST-NUCES's official percentage-to-GPA scale.
- Marks shown as `-` (ungraded) are excluded from calculations.
- Attendance allowance assumes a standard 16-week semester and the 80%
  minimum-attendance policy; confirm your own department's exact policy if
  unsure.
