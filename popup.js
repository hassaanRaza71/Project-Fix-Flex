document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["latestGPAData"], (data) => {
    const container = document.getElementById("content");

    if (!data.latestGPAData) {
      container.innerHTML =
        "<p>No data yet. Open your portal's marks page first.</p>";
      return;
    }

    const result = data.latestGPAData;

    let html = `<h2>GPA Summary</h2>`;
    html += `<p>SGPA: <strong>${result.semesterGPA}</strong></p>`;

    result.courseResults.forEach(c => {
      html += `
        <div>
          ${c.course}: ${c.percentage}% (${c.letter})
          GPA ${c.gpa}
        </div>
      `;
    });

    container.innerHTML = html;
  });
});