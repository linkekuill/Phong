window.onload = function () {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;
  const timeStr = now.toLocaleTimeString('vi-VN');
  const today = now.toLocaleDateString('vi-VN');

  const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const email = savedUser.email;
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const user = users[email];

  const avatarEl = document.getElementById("qrResultAvatar");
  const nameEl = document.getElementById("qrResultName");
  const shiftEl = document.getElementById("qrResultShift");
  const statusEl = document.getElementById("qrResultStatus");
  const timeEl = document.getElementById("qrResultTime");

  if (!email || !user) {
    avatarEl.style.display = "none";
    nameEl.textContent = "";
    statusEl.innerHTML = "❌ Không xác định được công nhân!";
    statusEl.style.color = "red";
    return;
  }

  document.getElementById("resultBox").style.display = "flex";

  avatarEl.src = savedUser.avatar || "https://em-content.zobj.net/thumbs/240/apple/354/bust-in-silhouette_1f464.png";
  nameEl.textContent = "👤 Tên: " + user.name;

  const key = `attendance_${email}`;
  const data = JSON.parse(localStorage.getItem(key)) || {};
  if (!data[today]) data[today] = { caSang: {}, caChieu: {} };

  const hideKey = `hideStatus_${email}_${today}`;
  if (hour < 7 && localStorage.getItem(hideKey)) {
    statusEl.innerHTML = "✅ Đã chấm công. Hẹn gặp lại sau 7h sáng!";
    statusEl.style.color = "green";
    return;
  }

  function save(ca, loai) {
    data[today][ca][loai] = timeStr;
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(hideKey, "1");
    savedUser.shift = (ca === "caSang") ? "Ca sáng" : "Ca chiều";
    localStorage.setItem("currentUser", JSON.stringify(savedUser));
  }

  if (currentTime < 7) {
    shiftEl.textContent = "Ca sáng";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = "⏰ Chưa tới giờ làm ca sáng!";
    statusEl.style.color = "red";
  } else if (currentTime <= 9) {
    save("caSang", "vao");
    shiftEl.textContent = "Ca sáng";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = `✅ Đã chấm công VÀO ca sáng lúc ${timeStr}`;
    saveToEntries("Vào (QR)", "Sáng", "");
    renderStats();
    statusEl.style.color = "green";
  } else if (currentTime < 11) {
    shiftEl.textContent = "Ca sáng";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = "❌ Đã quá giờ vào ca sáng!";
    statusEl.style.color = "red";
  } else if (currentTime <= 11.5) {
    save("caSang", "ra");
    shiftEl.textContent = "Ca sáng";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = `✅ Đã chấm công TAN ca sáng lúc ${timeStr}`;
    saveToEntries("Ra (QR)", "Sáng", "");
    renderStats();
    statusEl.style.color = "green";
  } else if (currentTime < 13) {
    shiftEl.textContent = "Ca chiều";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = "🕐 Đang trong giờ nghỉ trưa";
    statusEl.style.color = "orange";
  } else if (currentTime <= 14) {
    save("caChieu", "vao");
    shiftEl.textContent = "Ca chiều";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = `✅ Đã chấm công VÀO ca chiều lúc ${timeStr}`;
    saveToEntries("Vào (QR)", "Chiều", "");
    renderStats();
    statusEl.style.color = "green";
  } else if (currentTime < 17) {
    shiftEl.textContent = "Ca chiều";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = "❌ Đã quá giờ vào ca chiều!";
    statusEl.style.color = "red";
  } else if (currentTime <= 20) {
    save("caChieu", "ra");
    shiftEl.textContent = "Ca chiều";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = `✅ Đã chấm công TAN ca chiều lúc ${timeStr}`;
    saveToEntries("Ra (QR)", "Chiều", "");
    renderStats();
    statusEl.style.color = "green";
  } else {
    shiftEl.textContent = "Hết giờ";
    timeEl.textContent = timeStr;
    statusEl.innerHTML = "❌ Hết giờ làm việc!";
    statusEl.style.color = "red";
  }
};

function saveToEntries(typeText, ca) {
  const savedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const { name, email } = savedUser;
  if (!email || !name) return;

  const now = new Date();
  const day = now.toLocaleDateString("vi-VN");
  const time = now.toLocaleTimeString("vi-VN");
  const weekday = now.toLocaleDateString("vi-VN", { weekday: 'long' });
  const monthYear = `${now.getMonth() + 1}/${now.getFullYear()}`;

  const entry = {
    name,
    email,
    type: typeText + " (bằng mã QR)",
    shift: (ca === "Sáng" || ca === "caSang") ? "Sáng" : "Chiều",
    reason: "",
    day,
    time,
    weekday,
    monthYear,
    method: "QR"
  };

  let data = JSON.parse(localStorage.getItem("entries") || "[]");

  // Chống ghi đè 2 lần cùng loại
  const exists = data.find(e => e.email === email && e.day === day && e.type === entry.type);
  if (!exists) {
    data.push(entry);
    localStorage.setItem("entries", JSON.stringify(data));
  }
}