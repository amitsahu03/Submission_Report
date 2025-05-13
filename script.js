const form = document.getElementById('submissionForm');
const tableBody = document.querySelector('#submissionTable tbody');
const downloadBtn = document.getElementById('downloadBtn');
const dateInput = document.getElementById('submissionDate');

const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

let submissions = [];
let currentPage = 0;
const itemsPerPage = 10;
const maxItems = 100;

form.addEventListener('submit', function (event) {
  event.preventDefault();

  const recruiter = document.getElementById('recruiter').value;
  const consultantEmail = document.getElementById('consultantEmail').value;
  const salesperson = document.getElementById('salesperson').value;
  const submissionDate = dateInput.value || today;

  if (submissions.length >= maxItems) {
    alert("Maximum 100 submissions reached.");
    return;
  }

  submissions.push({
    Date: submissionDate,
    Recruiter: recruiter,
    'Consultant Email': consultantEmail,
    Salesperson: salesperson,
    Feedback: "Didn't get any feedback from salesperson."
  });

  form.reset();
  dateInput.value = today;
  renderTable();
});

function renderTable() {
  tableBody.innerHTML = '';

  const filterRecruiter = document.getElementById('filterRecruiter')?.value || "";
  const filterSalesperson = document.getElementById('filterSalesperson')?.value || "";

  let filtered = submissions.slice();

  if (filterRecruiter) {
    filtered = filtered.filter(entry => entry.Recruiter === filterRecruiter);
  }

  if (filterSalesperson) {
    filtered = filtered.filter(entry => entry.Salesperson === filterSalesperson);
  }

  const start = currentPage * itemsPerPage;
  const paged = filtered.slice().reverse().slice(start, start + itemsPerPage);

  for (let i = 0; i < paged.length; i++) {
    const fullIndex = submissions.findIndex(entry =>
      entry.Date === paged[i].Date &&
      entry.Recruiter === paged[i].Recruiter &&
      entry['Consultant Email'] === paged[i]['Consultant Email']
    );

    const entry = paged[i];
    const feedback = entry.Feedback || "Didn't get any feedback from salesperson.";
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.Date}</td>
      <td>${entry.Recruiter}</td>
      <td>${entry['Consultant Email']}</td>
      <td>${entry.Salesperson}</td>
      <td>${feedback}</td>
      <td><button class="feedback-btn" onclick="updateFeedback(${fullIndex})">Update</button></td>
    `;
    tableBody.appendChild(row);
  }
}

function updateFeedback(index) {
  const feedback = prompt("Enter/update feedback:", submissions[index].Feedback || '');
  submissions[index].Feedback = feedback || "Didn't get any feedback from salesperson.";
  renderTable();
}

function nextPage() {
  currentPage++;
  renderTable();
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    renderTable();
  }
}

downloadBtn.addEventListener('click', () => {
  if (submissions.length === 0) {
    alert("No data to download.");
    return;
  }
  const worksheet = XLSX.utils.json_to_sheet(submissions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Submissions");
  XLSX.writeFile(workbook, "submissions.xlsx");
});

renderTable();
