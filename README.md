# Fix the Flex — Live GPA Calculator for FAST FlexStudent Portal

A Chrome extension that calculates your real-time GPA directly on the FAST
FlexStudent marks page, using the official grading formula. It also fills in
the "Grand Total" table, which the portal usually leaves blank.

## Features

- **Live GPA widget** — floating, draggable panel showing your projected
  percentage, letter grade, and GPA for each course as marks get uploaded.
- **Semester GPA (SGPA)** — weighted across all your courses using credit
  hours, shown in a banner at the top of the marks page.
- **Grand Total auto-fill** — populates the empty Grand Total table for each
  course with your live obtained/total marks.
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

### 1. Sync your credit hours (do this once per semester)

1. Log into [flexstudent.nu.edu.pk](https://flexstudent.nu.edu.pk).
2. Navigate to **Student → Transcript**.
3. Wait for the page to fully load. The extension automatically reads your
   course list and credit hours in the background and saves them.
4. You only need to repeat this if your course registration changes (e.g.,
   at the start of a new semester).

> If a course's credit hours haven't been synced yet, the extension uses a
> default (1 credit for lab courses, 3 for others) until you visit the
> Transcript page.

### 2. View your live GPA

1. Go to **Student → Student Marks**.
2. Click through each course tab (CL1004, CS1004, etc.) — the extension
   reads the marks table for whichever tab is active.
3. A floating widget appears showing:
   - Each course's obtained/total marks, percentage, letter grade, and GPA
   - Your overall SGPA at the bottom
4. A blue **SGPA banner** also appears at the top of the page with your
   live semester GPA.
5. Each course heading gets a small badge showing that course's stats.
6. The **Grand Total** table for each course is automatically filled in
   (only if the official table is empty).

### 3. Move or close the widget

- **Drag** the widget by its blue header to reposition it anywhere on the
  page.
- Click the **✕** button to hide it for the current page session.

### 4. Check the popup

Click the extension's icon in the toolbar at any time to see a quick text
summary of all courses scraped so far and your current SGPA.

## Notes

- This tool gives **projections only** based on marks currently visible on
  the portal — it is not an official grade and does not replace your
  university's results.
- The grading formula matches FAST-NUCES's official percentage-to-GPA scale.
- Marks shown as `-` (ungraded) are excluded from calculations.
