let currentUser = null;

function showLogin() {
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("registerScreen").style.display = "none";
  document.getElementById("app").style.display = "none";
  document.getElementById("employeeList").style.display = "none";
  document.getElementById("summaryArea").style.display = "none";
}

function showRegister() {
  document.getElementById("registerScreen").style.display = "block";
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "none";
}

function showApp() {
  document.getElementById("registerScreen").style.display = "none";
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (currentUser.email === "admin@company.com") {
    document.getElementById("actionArea").style.display = "none";
    document.getElementById("historyArea").style.display = "none";
    document.getElementById("managerArea").style.display = "block";
  } else {
    document.getElementById("actionArea").style.display = "block";
    document.getElementById("historyArea").style.display = "block";
    document.getElementById("managerArea").style.display = "none";
  }
}

function register() {
  const email = document.getElementById("regEmail").value.trim();
  const name = document.getElementById("regName").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  if (!email || !name || !password) return alert("Vui lòng nhập đầy đủ thông tin!");

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[email]) return alert("Email đã tồn tại!");

  users[email] = { name, phone, password };
  localStorage.setItem("users", JSON.stringify(users));
  alert("Đăng ký thành công, mời bạn đăng nhập!");
  showLogin();
}

function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  if (!users[email] || users[email].password !== password) {
    alert("Sai email hoặc mật khẩu!");
    return;
  }

  currentUser = { email, name: users[email].name };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  document.getElementById("userName").innerText = currentUser.name;
  showApp();
  renderHistory();
  renderStats();
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  showLogin();
}

function getTimeInfo() {
  const now = new Date();
  const day = now.toLocaleDateString("vi-VN");
  const time = now.toLocaleTimeString("vi-VN");
  const weekday = now.toLocaleDateString("vi-VN", { weekday: 'long' });
  const monthYear = `${now.getMonth() + 1}/${now.getFullYear()}`;
  return { now, day, time, weekday, monthYear };
}

function saveEntry(type) {
  const shift = document.getElementById("shift").value;
  const reason = document.getElementById("reason").value.trim();
  const { now, day, time, weekday, monthYear } = getTimeInfo();

  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = hour * 60 + minute;

  if (totalMinutes >= 690 && totalMinutes < 780) {
    alert("⛔ Nghỉ trưa (11:30 - 13:00), không thể chấm công!");
    return;
  }

  if (shift === "Sáng" && hour >= 12) {
    alert("⛔ Không thể chấm công ca SÁNG sau 12:00 trưa!");
    return;
  }

  if (hour >= 20 || hour < 6) {
    alert("⛔ Hết giờ làm việc, vui lòng quay lại vào ngày mai!");
    return;
  }

  if (shift === "Chiều") {
    if (type === "Vào" && hour < 12) {
      alert("⛔ Chưa tới giờ vào ca chiều!");
      return;
    }
    if (type === "Ra" && hour < 17) {
      alert("⛔ Chưa tới giờ tan ca chiều!");
      return;
    }
  }

  if (shift === "Sáng" && type === "Ra" && hour < 11) {
    alert("⛔ Chưa tới giờ tan ca sáng!");
    return;
  }

  let data = JSON.parse(localStorage.getItem("entries") || "[]");
  const existing = data.find(e =>
    e.email === currentUser.email &&
    e.day === day &&
    e.type === type
  );

  if (existing) {
    alert(`🚫 Bạn đã chấm công "${type}" hôm nay, không thể chấm công lại!`);
    return;
  }

  const entry = {
    name: currentUser.name,
    email: currentUser.email,
    type,
    shift,
    reason,
    day,
    time,
    weekday,
    monthYear
  };

  data.push(entry);
  localStorage.setItem("entries", JSON.stringify(data));
  renderHistory();
  renderStats();
}

function checkIn() { saveEntry("Vào"); }
function checkOut() { saveEntry("Ra"); }
function takeLeave() { saveEntry("Nghỉ"); }

function clearHistory() {
  if (!confirm("Bạn có chắc muốn xoá toàn bộ lịch sử?")) return;
  let data = JSON.parse(localStorage.getItem("entries") || "[]");
  data = data.filter(e => e.email !== currentUser.email);
  localStorage.setItem("entries", JSON.stringify(data));
  renderHistory();
  renderStats();
}

function renderHistory() {
  const list = document.getElementById("history");
  let data = JSON.parse(localStorage.getItem("entries") || "[]");
  const userData = data.filter(e => e.email === currentUser.email).reverse();

  list.innerHTML = userData.map(e =>
    `<div class="entry">
      🗓️ <b>${e.weekday}</b> | 📅 ${e.day} | 🕒 ${e.time}<br>
      👉 ${e.type} | ${e.shift} ${e.reason ? "📌 " + e.reason : ""}
    </div>`
  ).join("") || "<p>Chưa có dữ liệu</p>";
}

function renderStats() {
  const list = document.getElementById("stats");
  let data = JSON.parse(localStorage.getItem("entries") || "[]");
  const userData = data.filter(e => e.email === currentUser.email);

  const grouped = {};
  for (let e of userData) {
    const key = `${e.day} (${e.shift})`;
    if (!grouped[key]) grouped[key] = { Vào: 0, Ra: 0, Nghỉ: 0 };
    grouped[key][e.type]++;
  }

  list.innerHTML = Object.entries(grouped).map(([dateShift, stats]) =>
    `<div class="stat">
      📅 <b>${dateShift}</b><br>
      ✅ Vào: ${stats.Vào} | ⏰ Ra: ${stats.Ra} | 📌 Nghỉ: ${stats.Nghỉ}
    </div>`
  ).join("") || "<p>Chưa có thống kê</p>";
}

function showEmployeeList() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const list = Object.entries(users).map(([email, u]) =>
    `<tr>
      <td>${u.name}</td>
      <td>${email}</td>
      <td>${u.phone || "Chưa có"}</td>
    </tr>`
  ).join("");

  document.getElementById("employeeData").innerHTML = `
    <h3>📋 Danh sách công nhân</h3>
    <table>
      <tr>
        <th>👤 Tên</th>
        <th>📧 E-mail</th>
        <th>📱 Số điện thoại</th>
      </tr>
      ${list}
    </table>`;
  document.getElementById("employeeList").style.display = "block";
  document.getElementById("summaryArea").style.display = "none";
}

function summarizeMonth() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const entries = JSON.parse(localStorage.getItem("entries") || "[]");

  const now = new Date();
  const currentMonthYear = `${now.getMonth() + 1}/${now.getFullYear()}`;

  const summary = {};
  for (const email in users) {
    summary[email] = {
      name: users[email].name,
      email,
      month: currentMonthYear,
      workDays: new Set(),
      offDays: new Set()
    };
  }

  for (const entry of entries) {
    if (entry.monthYear === currentMonthYear && summary[entry.email]) {
      if (entry.type === "Vào" || entry.type === "Ra") {
        summary[entry.email].workDays.add(entry.day);
      }
      if (entry.type === "Nghỉ") {
        summary[entry.email].offDays.add(entry.day);
      }
    }
  }

  const rows = Object.values(summary).map(stat => `
    <tr>
      <td>${stat.month}</td>
      <td>${stat.name}</td>
      <td>${stat.workDays.size}</td>
      <td>${stat.offDays.size}</td>
    </tr>
  `).join("");

  document.getElementById("summaryData").innerHTML = `
    <table>
      <tr>
        <th>📅 Tháng</th>
        <th>👤 Tên công nhân</th>
        <th>✅ Ngày công</th>
        <th>📌 Ngày nghỉ</th>
      </tr>
      ${rows}
    </table>
  `;

  document.getElementById("summaryArea").style.display = "block";
  document.getElementById("employeeList").style.display = "none";
}

function checkSession() {
  const saved = localStorage.getItem("currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
    document.getElementById("userName").innerText = currentUser.name;
    showApp();
    renderHistory();
    renderStats();
  } else {
    showLogin();
  }
}

checkSession();