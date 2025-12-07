// script.js — Bản hoàn chỉnh (có chọn GPT và User trực quan)

// =======================
// ⚙️ Cấu hình
// =======================
const API = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = localStorage.getItem("adminKey") || "";
const output = document.getElementById("output");
const themeBtn = document.getElementById("themeToggle");

// =======================
// ⚙️ Tiện ích chung
// =======================
function log(msg, type = "light") {
  output.className = `alert alert-${type} border mt-3`;
  output.innerHTML = msg;
}

function promptKey() {
  adminKey = prompt("🔑 Nhập adminKey để xác thực:");
  if (adminKey) localStorage.setItem("adminKey", adminKey);
  return !!adminKey;
}

async function fetchJSON(url, method = "GET", body = null) {
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Lỗi không xác định.");
  return data;
}

// =======================
// 📦 Hiển thị danh sách GPT
// =======================
async function listGPTs(show = false) {
  try {
    const data = await fetchJSON(`${API}/products`);
    if (show) {
      let html = `<h5>📦 Danh sách GPT:</h5><ul>`;
      data.products.forEach((p) => {
        html += `<li><b>${p.name}</b> (${p.id})<br><small>${p.gptUrl}</small></li>`;
      });
      html += "</ul>";
      log(html, "success");
    }
    return data.products || [];
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
    return [];
  }
}

// =======================
// 🧩 Hiển thị danh sách user của GPT
// =======================
async function listUsers(product) {
  try {
    const data = await fetchJSON(`${API}/users?product=${encodeURIComponent(product)}`);
    const users = data.users || [];
    return users.map(u => u.user);
  } catch {
    return [];
  }
}

// =======================
// ➕ Thêm GPT
// =======================
async function addGPT() {
  if (!adminKey && !promptKey()) return;
  const id = prompt("Nhập ID GPT (chữ thường, số, gạch ngang):");
  if (!id) return;
  const name = prompt("Tên hiển thị của GPT:");
  const gptUrl = prompt("URL GPT (https://...):");
  if (!gptUrl.startsWith("https")) return alert("❌ URL không hợp lệ.");
  const gateway = prompt("Gateway tùy chọn (Enter để bỏ trống):") || "";

  try {
    await fetchJSON(`${API}/product`, "POST", { adminKey, id, name, gptUrl, gateway });
    log(`✅ Đã thêm GPT <b>${name}</b> thành công.`, "success");
    await listGPTs(true);
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// =======================
// 🗑️ Xoá GPT
// =======================
async function deleteGPT() {
  if (!adminKey && !promptKey()) return;
  const list = await listGPTs();
  if (!list.length) return alert("⚠️ Không có GPT nào.");

  const options = list.map(p => `${p.name} (${p.id})`).join("\n");
  const id = prompt(`Chọn GPT để xoá:\n${options}\n\n👉 Nhập ID GPT:`);
  if (!id) return;
  if (!confirm(`Xoá GPT "${id}"?`)) return;

  try {
    await fetchJSON(`${API}/product`, "DELETE", { adminKey, id });
    log(`🗑️ Đã xoá GPT <b>${id}</b>.`, "warning");
    await listGPTs(true);
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// =======================
// ➕ Thêm User
// =======================
async function addUser() {
  if (!adminKey && !promptKey()) return;
  const gpts = await listGPTs();
  if (!gpts.length) return alert("⚠️ Không có GPT nào.");

  const gptList = gpts.map(p => `${p.name} (${p.id})`).join("\n");
  const product = prompt(`Chọn GPT để thêm user:\n${gptList}\n\n👉 Nhập ID GPT:`);

  if (!product) return;
  const user = prompt("Tên user cần thêm:");
  if (!user) return;
  const activationCode = prompt("Mã kích hoạt (Enter nếu để trống):") || "";

  try {
    await fetchJSON(`${API}/user`, "POST", { adminKey, product, user, activationCode });
    log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>.`, "success");
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// =======================
// 🗑️ Xoá User
// =======================
async function deleteUser() {
  if (!adminKey && !promptKey()) return;
  const gpts = await listGPTs();
  if (!gpts.length) return alert("⚠️ Không có GPT nào.");

  const gptList = gpts.map(p => `${p.name} (${p.id})`).join("\n");
  const product = prompt(`Chọn GPT chứa user cần xoá:\n${gptList}\n\n👉 Nhập ID GPT:`);

  if (!product) return;
  const users = await listUsers(product);
  if (!users.length) return alert(`⚠️ Không tìm thấy user nào trong GPT "${product}".`);

  const userList = users.join("\n");
  const user = prompt(`Chọn user cần xoá trong GPT "${product}":\n${userList}\n\n👉 Nhập tên user:`);
  if (!user) return;

  if (!confirm(`Xác nhận xoá user "${user}" khỏi GPT "${product}"?`)) return;

  try {
    await fetchJSON(`${API}/user`, "DELETE", { adminKey, product, user });
    log(`🗑️ Đã xoá user <b>${user}</b> khỏi GPT <b>${product}</b>.`, "warning");
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// =======================
// 🔁 Gia hạn User
// =======================
async function renewUser() {
  if (!adminKey && !promptKey()) return;
  const gpts = await listGPTs();
  if (!gpts.length) return alert("⚠️ Không có GPT nào.");

  const gptList = gpts.map(p => `${p.name} (${p.id})`).join("\n");
  const product = prompt(`Chọn GPT cần gia hạn user:\n${gptList}\n\n👉 Nhập ID GPT:`);

  if (!product) return;
  const users = await listUsers(product);
  if (!users.length) return alert(`⚠️ Không tìm thấy user nào trong GPT "${product}".`);

  const userList = users.join("\n");
  const user = prompt(`Chọn user cần gia hạn:\n${userList}\n\n👉 Nhập tên user:`);

  try {
    const res = await fetchJSON(`${API}/renew`, "POST", { adminKey, product, user });
    log(
      `✅ Đã gia hạn cho <b>${user}</b> trong GPT <b>${product}</b> (${res.trialDays || 0} ngày, ${res.slots || 0} thiết bị).`,
      "success"
    );
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// =======================
// 🌗 Giao diện tối / sáng
// =======================
function updateThemeButton(isDark) {
  themeBtn.innerHTML = isDark ? "☀️ Chuyển sang chế độ sáng" : "🌙 Chuyển sang chế độ tối";
}
function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeButton(isDark);
}
themeBtn.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark-mode");
  applyTheme(isDark);
});

// =======================
// 🎯 Gán sự kiện các nút
// =======================
document.getElementById("btnAddGPT").onclick = addGPT;
document.getElementById("btnDeleteGPT").onclick = deleteGPT;
document.getElementById("btnAddUser").onclick = addUser;
document.getElementById("btnDeleteUser").onclick = deleteUser;
document.getElementById("btnRenewUser").onclick = renewUser;

// =======================
// 🚀 Khởi động
// =======================
window.onload = () => {
  const savedTheme = localStorage.getItem("theme") === "dark";
  applyTheme(savedTheme);
  listGPTs(true);
};
