function scrapeCredits() {
  const creditsMap = {};
  const rows = document.querySelectorAll("tbody tr");

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    if (cells.length >= 4) {
      const code = cells[0].textContent.trim();
      const credits = parseFloat(cells[3].textContent.trim());
      const courseType = cells[6] ? cells[6].textContent.trim() : "";

      if (code && !isNaN(credits) && courseType !== "Non Credit") {
        creditsMap[code] = credits;
      }
    }
  });

  chrome.storage.local.set({ savedCourseCredits: creditsMap });
}

scrapeCredits();