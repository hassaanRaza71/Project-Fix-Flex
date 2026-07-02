// Silently keeps savedCourseCredits fresh by fetching the Transcript page
// in the background, using the session-scoped link already present in the
// page's own sidebar nav. Throttled to once per day to avoid extra requests
// on every page load.

function parseCreditsFromHTML(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const creditsMap = {};
  const nonCreditCourses = [];

  doc.querySelectorAll("tbody tr").forEach(row => {
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

  return { creditsMap, nonCreditCourses };
}

function syncCreditsInBackground() {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  chrome.storage.local.get(["creditsLastSynced"], (storage) => {
    const last = storage.creditsLastSynced;
    if (last && Date.now() - last < ONE_DAY_MS) return; // synced recently, skip

    const transcriptLink = document.querySelector('a[href*="/Student/Transcript"]');
    if (!transcriptLink) return;

    const url = transcriptLink.getAttribute("href");
    if (!url) return;

    fetch(url)
      .then(res => res.text())
      .then(html => {
        const { creditsMap, nonCreditCourses } = parseCreditsFromHTML(html);
        if (Object.keys(creditsMap).length > 0) {
          chrome.storage.local.set({
            savedCourseCredits: creditsMap,
            nonCreditCourses,
            creditsLastSynced: Date.now()
          });
        }
      })
      .catch(() => {}); // silent - background nicety, not core functionality
  });
}

syncCreditsInBackground();
