const form = document.getElementById('submissionForm');
const tableBody = document.querySelector('#submissionTable tbody');
const dateInput = document.getElementById('submissionDate');

const today = new Date().toISOString().split('T')[0];
dateInput.value = today;

let allSubmissions = [];
let currentPage = 0;
const itemsPerPage = 10;

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const recruiter = document.getElementById('recruiter').value;
  const consultantEmail = document.getElementById('consultantEmail').value;
  const salesperson = document.getElementById('salesperson').value;
  const submissionDate = dateInput.value || today;

  await db.collection("submissions").add({
    date: submissionDate,
    recruiter,
    consultantEmail,
    salesperson,
    feedback: "Didn't get any feedback from salesperson."
  });

  form.reset();
  dateInput.value = today;
  fetchSubmissions(); // Refresh
});

async function fetchSubmissions() {
  const snapshot = await db.collection("submissions").orderBy("date", "desc").limit(100).get();
  allSubmissions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  renderTable();
}

function renderTable() {
  tableBody.innerHTML = '';
  const paged = allSubmissions.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  paged.forEach(entry => {
    const feedback = entry.feedback || "Didn't get any feedback from salesperson.";
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.date}</td>
      <td>${entry.recruiter}</td>
      <td>${entry.consultantEmail}</td>
      <td>${entry.salesperson}</td>
      <td>${feedback}</td>
      <td><button onclick="updateFeedback('${entry.id}')">Update</button></td>
    `;
    tableBody.appendChild(row);
  });
}

async function updateFeedback(id) {
  const doc = allSubmissions.find(item => item.id === id);
  const feedback = prompt("Enter feedback:", doc.feedback || '');
  if (feedback !== null) {
    await db.collection("submissions").doc(id).update({ feedback });
    fetchSubmissions();
  }
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

fetchSubmissions(); // Load initial data
