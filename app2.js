let employees = JSON.parse(localStorage.getItem("employees")) || [];
let editIndex = null;
let roleChart;

document.getElementById("addBtn").addEventListener("click", addEmployee);

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function saveToLocal() {
  localStorage.setItem("employees", JSON.stringify(employees));
}

function addEmployee() {
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value;
  const base = parseFloat(document.getElementById("baseSalary").value) || 0;
  const bonus = parseFloat(document.getElementById("bonus").value) || 0;
  const deductions = parseFloat(document.getElementById("deductions").value) || 0;
  const total = base + bonus - deductions;

  if (!name) return alert("Please enter employee name!");

  if (editIndex !== null) {
    employees[editIndex] = { name, role, base, bonus, deductions, total };
    editIndex = null;
    document.getElementById("addBtn").innerHTML = "<i class='bx bx-plus-circle'></i> Add Employee";
    showToast("Employee updated ✅");
  } else {
    employees.push({ name, role, base, bonus, deductions, total });
    showToast("Employee added ✅");
  }

  saveToLocal();
  displayEmployees(employees);
  clearFields();
}

function displayEmployees(list) {
  const tbody = document.querySelector("#employeeTable tbody");
  tbody.innerHTML = "";

  list.forEach((e, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${e.name}</td>
        <td>${e.role}</td>
        <td>${e.base}</td>
        <td>${e.bonus}</td>
        <td>${e.deductions}</td>
        <td>${e.total}</td>
        <td>
          <button onclick="editEmployee(${i})"><i class='bx bx-edit'></i></button>
          <button onclick="deleteEmployee(${i})" style="background:#dc3545"><i class='bx bx-trash'></i></button>
        </td>
      </tr>
    `;
  });

  updateTotal();
  updateRoleChart();
}

function clearFields() {
  document.getElementById("name").value = "";
  document.getElementById("baseSalary").value = "";
  document.getElementById("bonus").value = "";
  document.getElementById("deductions").value = "";
}

function editEmployee(i) {
  const e = employees[i];
  document.getElementById("name").value = e.name;
  document.getElementById("role").value = e.role;
  document.getElementById("baseSalary").value = e.base;
  document.getElementById("bonus").value = e.bonus;
  document.getElementById("deductions").value = e.deductions;
  document.getElementById("addBtn").innerHTML = "<i class='bx bx-save'></i> Update Employee";
  editIndex = i;
}

function deleteEmployee(i) {
  if (confirm(`Delete ${employees[i].name}?`)) {
    employees.splice(i, 1);
    saveToLocal();
    displayEmployees(employees);
    showToast("Employee deleted 🗑️");
  }
}

function updateTotal() {
  const total = employees.reduce((sum, e) => sum + e.total, 0);
  document.getElementById("totalSalary").textContent = `Total Salary Expense: ₹${total.toFixed(2)}`;
}

function updateRoleChart() {
  const ctx = document.getElementById("roleChart").getContext("2d");
  const chartType = document.getElementById("chartType").value;

  const roleStats = employees.reduce((acc, e) => {
    if (!acc[e.role]) acc[e.role] = { count: 0, salary: 0 };
    acc[e.role].count++;
    acc[e.role].salary += e.total;
    return acc;
  }, {});

  const roles = Object.keys(roleStats);
  const counts = roles.map(r => roleStats[r].count);
  const salaries = roles.map(r => roleStats[r].salary);

  const labels = roles.length ? roles : ["No Data"];
  const data = chartType === "count" ? counts : salaries;
  const labelName = chartType === "count" ? "Employee Count" : "Total Salary (₹)";

  if (roleChart) roleChart.destroy();

  roleChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: labelName,
        data,
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: ctx => chartType === "salary"
              ? `${ctx.label}: ₹${ctx.formattedValue}`
              : `${ctx.label}: ${ctx.formattedValue} Employees`
          }
        }
      }
    }
  });

  const totalEmp = employees.length;
  const totalSal = employees.reduce((s, e) => s + e.total, 0);
  document.getElementById("summaryBar").textContent = `Total Employees: ${totalEmp} | Total Salary: ₹${totalSal.toFixed(2)}`;
}

function downloadExcel() {
  if (!employees.length) return alert("No data to export!");
  const ws = XLSX.utils.json_to_sheet(employees);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "Employee_Payover.xlsx");
}

function downloadPDF() {
  if (!employees.length) return alert("No data to export!");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Employee Payover Report", 70, 10);
  const tableData = employees.map(e => [e.name, e.role, e.base, e.bonus, e.deductions, e.total]);
  doc.autoTable({ head: [["Name", "Role", "Base", "Bonus", "Deductions", "Total"]], body: tableData, startY: 20 });
  const total = employees.reduce((s, e) => s + e.total, 0);
  
  // Set font size and style for total
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  
  // Position text on the left side
  const text = `Total Salary Expense: ₹${total.toFixed(2)}`;
  doc.text(text, 20, doc.lastAutoTable.finalY + 10);
  
  doc.save("Employee_Payover_Report.pdf");
}

function clearData() {
  if (confirm("Clear all employee data?")) {
    employees = [];
    saveToLocal();
    displayEmployees(employees);
    showToast("All data cleared 🗑️");
  }
}

window.onload = () => {
  displayEmployees(employees);
  updateRoleChart();
};
