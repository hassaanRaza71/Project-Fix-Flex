function scrapeCredits() {
  const creditsMap = {};
  const nonCreditCourses = [];
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 4) {
      const code = cells[0].textContent.trim();
      const credits = parseFloat(cells[3].textContent.trim());
      const courseType = cells[6] ? cells[6].textContent.trim() : "";

      if (code && !isNaN(credits)) {
        creditsMap[code] = credits;
        if (courseType === "Non Credit") {
          nonCreditCourses.push(code);
        }
      }
    }
  });

  chrome.storage.local.set({ savedCourseCredits: creditsMap, nonCreditCourses });
}

scrapeCredits();