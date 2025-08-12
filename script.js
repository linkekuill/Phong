let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  const btn = document.getElementById("themeToggleBtn");
  if (btn) {
    btn.addEventListener("click", toggleTheme);
  }
});

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
    document.getElementById("managerArea").style.display = "block";
  } else {
    document.getElementById("actionArea").style.display = "block";
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

  // Gán đúng cấu trúc currentUser
  currentUser = {
    email: email,
    name: users[email].name,
    phone: users[email].phone,
    avatar: users[email].avatar || null
  };

  // Lưu currentUser vào localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("notificationSeen", "false");
  // Nếu badge đang có trên trang, hiển thị lại ngay không cần reload
   const badge = document.getElementById("notificationBadge");
if (badge) badge.style.display = "inline-block";

  // Hiển thị avatar nếu có
  if (currentUser.avatar) {
    document.getElementById("avatarPreview").src = currentUser.avatar;
    document.getElementById("popupAvatar").src = currentUser.avatar;
    document.getElementById("personalAvatar").src = currentUser.avatar;
  }

  // Hiển thị thông tin người dùng
  document.getElementById("userName").innerText = currentUser.name;
  document.getElementById("profileUsername").textContent = currentUser.email;
  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profilePhone").textContent = currentUser.phone || "Chưa có";
  document.getElementById("personalUsername").textContent = currentUser.name;

  // Nếu là admin thì hiện các nút quản lý
  if (currentUser.email === "admin@company.com") {
  document.getElementById("managerArea").style.display = "block";
  } else {
  document.getElementById("managerArea").style.display = "none";
}

  const mainTitleText = document.getElementById("mainTitleText");
  mainTitleText.textContent =
    currentUser.email === "admin@company.com"
      ? "Hệ thống quản lý"
      : "Hệ thống công nhân";
      
// ✅ Hiện tiêu đề và menu người dùng
document.getElementById("mainTitle").style.display = "block";
document.getElementById("userMenu").style.display = "flex";
document.getElementById("mainTitleText").style.display = "block";

  showApp();
  renderHistory();
  renderStats();
}

function logout() {
  localStorage.removeItem("currentUser");
  currentUser = null;

  // Ẩn toàn bộ phần ứng dụng
  document.getElementById("app").style.display = "none";
  document.getElementById("managerArea").style.display = "none";
  document.getElementById("monthlySummaryPage").style.display = "none";
  document.getElementById("fullscreenEmployeeListWrapper").style.display = "none";
  document.getElementById("personalPage").style.display = "none";
  document.getElementById("mainTitle").style.display = "none";

  // Hiện lại trang đăng nhập
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("registerScreen").style.display = "none";
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
  const shift = document.getElementById("personalShift").value;
  const reason = document.getElementById("personalReason").value.trim();
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
    e.type === type &&
    e.shift === shift
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
  const { now, day, weekday, monthYear } = getTimeInfo();

  function formatTime(entry) {
    if (!entry) return "-";
    return entry.time + (entry.method === "QR" ? " QR" : "");
  }
  // Reset lúc 7h sáng hôm nay
// Chuỗi ngày đầy đủ: YYYY-MM-DD
  const todayString = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, '0') + "-" +
    String(now.getDate()).padStart(2, '0');

  const lastStatusDate = localStorage.getItem("statusDate");

  if (lastStatusDate !== todayString && now.getHours() >= 7) {
    // Lưu dữ liệu cũ vào lịch sử
    let history = JSON.parse(localStorage.getItem("history") || "[]");
    let entries = JSON.parse(localStorage.getItem("entries") || "[]");
    if (entries.length > 0) {
      history.push(...entries);
      localStorage.setItem("history", JSON.stringify(history));
    }
    // Xóa dữ liệu hôm trước
    localStorage.removeItem("entries");
    localStorage.setItem("statusDate", todayString);
  }

  // Lấy dữ liệu hôm nay của user
  let data = JSON.parse(localStorage.getItem("entries") || "[]");
  const userData = data.filter(e => e.email === currentUser.email && e.day === day);

  // Tách dữ liệu theo ca
  let caSangVao = userData.find(e => e.shift === "Sáng" && e.type === "Vào")?.time || "-";
  let caSangRa  = userData.find(e => e.shift === "Sáng" && e.type === "Ra")?.time || "-";
  let caChieuVao = userData.find(e => e.shift === "Chiều" && e.type === "Vào")?.time || "-";
  let caChieuRa  = userData.find(e => e.shift === "Chiều" && e.type === "Ra")?.time || "-";

  let nghiData = userData.find(e => e.type === "Nghỉ");
  let nghiCa = nghiData?.shift || "";
  let nghiLyDo = nghiData?.reason || "";

  // Hiển thị
  document.getElementById("statusLine1").textContent =
    `Hôm nay | ${weekday} | ${day}`;

  if (nghiData) {
    document.getElementById("statusLine2").style.display = "none";
    document.getElementById("statusLine3").style.display = "none";
    document.getElementById("statusLine4").style.display = "block";
    document.getElementById("statusLine4").textContent =
      `Nghỉ: ca ${nghiCa} | Lý do: ${nghiLyDo}`;
  } else {
    document.getElementById("statusLine2").style.display = caSangVao !== "-" || caSangRa !== "-" ? "block" : "none";
    document.getElementById("statusLine3").style.display = caChieuVao !== "-" || caChieuRa !== "-" ? "block" : "none";
    document.getElementById("statusLine4").style.display = "none";

    document.getElementById("statusLine2").textContent =
      `Ca sáng: vào: ${caSangVao} | ra: ${caSangRa}`;
    document.getElementById("statusLine3").textContent =
      `Ca chiều: vào: ${caChieuVao} | ra: ${caChieuRa}`;
  }
}

function showEmployeeList() {
  const users = JSON.parse(localStorage.getItem("users") || "{}");

  const rows = Object.entries(users).map(([email, u]) =>
    `<tr>
      <td>${u.name}</td>
      <td>${email}</td>
      <td>${u.phone || "Chưa có"}</td>
      <td><button onclick="deleteUser('${email}')">🗑️</button></td>
    </tr>`
  ).join("");

  document.getElementById("employeeTableBody").innerHTML = rows;

  document.getElementById("employeeList").style.display = "block";
  document.getElementById("summaryArea").style.display = "none";
}

function deleteUser(key){
  if (!confirm("Bạn có chắc muốn xoá tài khoản này?")) return;

  const users = JSON.parse(localStorage.getItem("users") || "{}");
  delete users[key];
  localStorage.setItem("users", JSON.stringify(users));

  alert("✅ Đã xoá tài khoản!");
  showEmployeeList(); // Cập nhật lại danh sách
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

  document.getElementById("monthlySummaryTableWrapper").innerHTML = `
   <div style="overflow-x: auto;">
      <table class="employee-table">
        <thead>
          <tr>
            <th>📅 Tháng</th>
            <th>👤 Tên công nhân</th>
            <th>✅ Ngày công</th>
            <th>📌 Ngày nghỉ</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </thead>
    </table>
  </div>
`;

  // Hiển thị trang tổng kết, ẩn trang chính
  document.getElementById("app").style.display = "none";
  document.getElementById("monthlySummaryPage").style.display = "block";
  document.getElementById("mainTitle").style.display = "none";
  document.getElementById("pageHeader").style.display = "none";
}

function goBackToHome() {
  // Ẩn các trang phụ
  document.getElementById("monthlySummaryPage").style.display = "none";
  document.getElementById("fullscreenEmployeeListWrapper").style.display = "none";
  document.getElementById("personalPage").style.display = "none";

  // Nếu chưa đăng nhập thì quay về login
  if (!currentUser || !currentUser.email) {
    document.getElementById("app").style.display = "none";
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("mainTitle").style.display = "none";
    return;
  }

  // Hiển thị lại giao diện chính
  document.getElementById("app").style.display = "block";
  document.getElementById("mainTitle").style.display = "block";
  document.getElementById("mainTitle").style.textAlign = "left";
  document.getElementById("mainTitle").style.margin = "0";
  document.getElementById("mainTitle").style.padding = "0px 0px";
  document.getElementById("pageHeader").style.display = "flex";

  // Nếu là admin thì hiện lại nút quản lý
  if (currentUser.email === "admin@company.com") {
    document.getElementById("managerArea").style.display = "block";
  } else {
    document.getElementById("managerArea").style.display = "none";
  }
}

function checkSession() {
  const saved = localStorage.getItem("currentUser");
  if (saved) {
    currentUser = JSON.parse(saved);
  if (currentUser.avatar) {
  avatarPreview.src = currentUser.avatar;
}
    document.getElementById("userName").innerText = currentUser.name;
    document.getElementById("profileUsername").textContent = currentUser.email;
document.getElementById("profileName").textContent = currentUser.name;
document.getElementById("profilePhone").textContent = currentUser.phone || "Chưa có";

    showApp();
    renderHistory();
    renderStats();
  } else {
    showLogin();
  }
}

const profilePopup = document.getElementById("profilePopup");
const avatarPreview = document.getElementById("avatarPreview");
const profileName = document.getElementById("profileName");
const profilePhone = document.getElementById("profilePhone");
const profileUsername = document.getElementById("profileUsername");
const editBtn = document.getElementById("editBtn");
const overlayBlur = document.getElementById("overlayBlur");

// 👉 Mở/thu popup bằng toggle (giống đăng xuất)
document.getElementById("profileBtn").addEventListener("click", () => {
  profilePopup.classList.add("active");
  overlayBlur.classList.add("active");

  // Gán avatar mỗi lần mở popup
  document.getElementById("popupAvatar").src = currentUser.avatar || "https://em-content.zobj.net/thumbs/240/apple/354/bust-in-silhouette_1f464.png" ;
});

// 👉 Đóng popup (nút X)
document.querySelector("#profilePopup .close-btn").addEventListener("click", () => {
  profilePopup.classList.remove("active");
  overlayBlur.classList.remove("active");
});

// Đổi avatar
function changeAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const avatarURL = e.target.result;

      // Gán ảnh cho cả avatar chính và trong popup
      document.getElementById("avatarPreview").src = avatarURL;
      document.getElementById("popupAvatar").src = avatarURL;

      // Lưu vào currentUser và localStorage
      currentUser.avatar = avatarURL;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    };
    reader.readAsDataURL(file);
  }
}

// Chỉnh sửa thông tin
let isEditing = false;

function toggleEdit() {
  isEditing = !isEditing;

  profileName.contentEditable = isEditing;
  profilePhone.contentEditable = isEditing;

  if (isEditing) {
    editBtn.textContent = "Lưu";
    profileName.style.borderBottom = "1px dashed #999";
    profilePhone.style.borderBottom = "1px dashed #999";
  } else {
    editBtn.textContent = "Chỉnh sửa";
    profileName.style.borderBottom = "none";
    profilePhone.style.borderBottom = "none";

    // Tùy chọn: bạn có thể lưu dữ liệu ở đây nếu muốn
    // localStorage.setItem("name", profileName.textContent);
    // localStorage.setItem("phone", profilePhone.textContent);
  }
}

checkSession();

function showFullScreenEmployee() {
  document.getElementById("app").style.display = "none";
  document.getElementById("pageHeader").style.display = "none";
  document.getElementById("mainTitle").style.display = "none";
  document.getElementById("fullscreenEmployeeListWrapper").style.display = "block";
  renderEmployeeFullScreen();
}

function renderEmployeeFullScreen(filteredList = null) {
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const userArray = Object.entries(users).map(([email, user]) => ({
    email,
    name: user.name,
    phone: user.phone
  }));

  const listToRender = filteredList || userArray;

  const rows = listToRender.map(user => `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone || "Chưa có"}</td>
      <td>
        ${user.email === "admin@company.com"
          ? `<button disabled title="Không thể xoá tài khoản admin" style="opacity: 0.5; cursor: not-allowed;">❌</button>`
          : `<button class="delete-text-btn" onclick="deleteUser('${user.email}')">xoá</button>`}
      </td>
    </tr>
  `).join("");

  // Gắn bảng vào giao diện fullscreen
  document.getElementById("fullscreenTableWrapper").innerHTML = `
    <table class="employee-table">
      <thead style="background-color: var(--thead-bg); color: var(--thead-color);">
        <tr>
          <th>👤 Tên</th>
          <th>📧 Email</th>
          <th>📱 Số điện thoại</th>
          <th>🗑️</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function filterEmployeeTable() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const userArray = Object.entries(users).map(([email, user]) => ({
    email,
    name: user.name,
    phone: user.phone
  }));

  const filtered = userArray.filter(user =>
    user.name.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword) ||
    (user.phone || "").toLowerCase().includes(keyword)
  );

  renderEmployeeFullScreen(filtered);
}

function showPersonalPage() {
  document.getElementById("app").style.display = "none";
  document.getElementById("personalPage").style.display = "block";
  document.getElementById("mainTitle").style.display = "none";
  document.querySelector("#pageHeader").style.display = "none";

  // Hiển thị tên và avatar
  document.getElementById("personalUsername").textContent = currentUser.name;
  const avatarURL = currentUser.avatar || "https://em-content.zobj.net/thumbs/240/apple/354/bust-in-silhouette_1f464.png";
  const personalAvatar = document.querySelector("#personalPage img");
  if (personalAvatar) personalAvatar.src = avatarURL;

  renderPersonalStats();
}

function showMonthlySummary() {
  document.getElementById("app").style.display = "none";
  document.getElementById("managerArea").style.display = "none";
  document.getElementById("personalPage").style.display = "none";
  document.getElementById("fullscreenEmployeeListWrapper").style.display = "none";

  document.getElementById("monthlySummaryPage").style.display = "block";

  summarizeMonth();
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute("data-theme") || "light";
  const next = current === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
}