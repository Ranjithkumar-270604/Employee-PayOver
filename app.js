// Default users
const users = [
  { username: "admin", password: "admin@123", role: "Admin" },
  { username: "hr", password: "hr@123", role: "HR" }
];

function loginUser() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const msg = document.getElementById("loginMsg");

  const found = users.find(u => u.username === user && u.password === pass);

  if (found) {
    localStorage.setItem("loggedInUser", JSON.stringify(found));
    window.location.href = "index.html";
  } else {
    msg.textContent = "Invalid credentials ❌";
  }
}

window.addEventListener("load", () => {
  const currentPath = window.location.pathname;
  // Check if we're on index page or root path
  if (currentPath.endsWith("index.html") || currentPath.endsWith("/") || currentPath.endsWith("\\")) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) {
      window.location.href = "login.html";
      return;
    }
  }
  // If we're on login page and already logged in, redirect to index
  if (currentPath.includes("login.html")) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (user) {
      window.location.href = "index.html";
    }
  }
});

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "login.html";
}
