window.onload = function () {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour + minute / 60;
  const timeStr = now.toLocaleTimeString('vi-VN');
  const today = now.toLocaleDateString('vi-VN');

  const email = localStorage.getItem("currentUserEmail");
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email);

  const avatarEl = document.getElementById("qrResultAvatar");
  const nameEl = document.getElementById("qrResultName");
  const shiftEl = document.getElementById("qrResultShift");
  const statusEl = document.getElementById("qrResultStatus");

  if (!email || !user) {
    avatarEl.style.display = "none";
    nameEl.textContent = "";
    statusEl.innerHTML = "❌ Không xác định được công nhân!";
    statusEl.style.color = "red";
    return;
  }

  avatarEl.src = user.avatar || "avatar.png";
  nameEl.textContent = user.name;
  shiftEl.textContent = user.shift || "Chưa chọn ca";
  statusEl.style.color = "green";

  const key = `attendance_${email}`;
  const data = JSON.parse(localStorage.getItem(key)) || {};
  if (!data[today]) data[today] = { caSang: {}, caChieu: {} };

  const hideKey = `hideStatus_${email}_${today}`;
  if (hour < 7 && localStorage.getItem(hideKey)) {
    statusEl.innerHTML = "✅ Đã chấm công. Hẹn gặp lại sau 7h sáng!";
    return;
  }

  function save(ca, loai) {
    data[today][ca][loai] = timeStr;
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(hideKey, "1");
  }

  if (currentTime < 7) {
    statusEl.innerHTML = "⏰ Chưa tới giờ làm ca sáng!";
    statusEl.style.color = "red";
  } else if (currentTime <= 9) {
    save("caSang", "vao");
    statusEl.innerHTML = `✅ Đã chấm công VÀO ca sáng lúc ${timeStr}`;
  } else if (currentTime < 11) {
    statusEl.innerHTML = "❌ Đã quá giờ vào ca sáng!";
    statusEl.style.color = "red";
  } else if (currentTime <= 11.5) {
    save("caSang", "ra");
    statusEl.innerHTML = `✅ Đã chấm công TAN ca sáng lúc ${timeStr}`;
  } else if (currentTime < 13) {
    statusEl.innerHTML = "🕐 Đang trong giờ nghỉ trưa";
    statusEl.style.color = "orange";
  } else if (currentTime <= 14) {
    save("caChieu", "vao");
    statusEl.innerHTML = `✅ Đã chấm công VÀO ca chiều lúc ${timeStr}`;
  } else if (currentTime < 17) {
    statusEl.innerHTML = "❌ Đã quá giờ vào ca chiều!";
    statusEl.style.color = "red";
  } else if (currentTime <= 20) {
    save("caChieu", "ra");
    statusEl.innerHTML = `✅ Đã chấm công TAN ca chiều lúc ${timeStr}`;
  } else {
    statusEl.innerHTML = "❌ Hết giờ làm việc!";
    statusEl.style.color = "red";
  }
};