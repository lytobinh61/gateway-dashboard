// script.js — Quản trị Gateway GPT (chuẩn giao diện 5 nút màu + chế độ tối/sáng)

// =======================
// ⚙️ Cấu hình
// =======================
const API = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = localStorage.getItem("adminKey") || "";
const output = document.getElementById("output");

// =======================
// ⚙️ Hàm tiện ích
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
// ➕ Thêm GPT
// =======================
async function addGPT() {
  if (!adminKey && !promptKey()) return;

  const id = prompt("Nhập ID GPT (chỉ chữ thường, số, gạch ngang):");
  if (!id) return alert("❌ ID không hợp lệ.");
  const name = prompt("Tên hiển thị của GPT:");
  if (!name) return;
  const gptUrl = prompt("URL GPT (https://...):");
  if (!gptUrl.startsWith("https")) return alert("❌ URL không hợp lệ.");
  const gateway = prompt("Gateway tùy chọn (Enter nếu để trống):") || "";

  try {
    const res = await fetchJSON(`${API}/product`, "POST", { adminKey, id, name, gptUrl, gateway });
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

  const id = prompt("Nhập ID GPT cần xoá:");
  if (!id) return;

  if (!confirm(`Bạn chắc chắn muốn xoá GPT "${id}"?`)) return;

  try {
    const res = await fetchJSON(`${API}/product`, "DELETE", { adminKey, id });
    log(`🗑️ Đã xoá GPT <b>${id}</b> thành công.`, "warning");
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
  const products = await listGPTs();
  if (!products.length) return alert("⚠️ Không có GPT nào.");

  const product = prompt("Nhập ID GPT để thêm user:");
  const user = prompt("Tên user cần thêm:");
  if (!product || !user) return;
  const activationCode = prompt("Mã kích hoạt (Enter nếu để trống):") || "";

  try {
    const res = await fetchJSON(`${API}/user`, "POST", { adminKey, product, user, activationCode });
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
  const product = prompt("Nhập ID GPT chứa user cần xoá:");
  const user = prompt("Nhập tên user cần xoá:");
  if (!product || !user) return;

  if (!confirm(`Xác nhận xoá user "${user}" khỏi GPT "${product}"?`)) return;

  try {
    const res = await fetchJSON(`${API}/user`, "DELETE", { adminKey, product, user });
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
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Nhập user cần gia hạn:");
  if (!product || !user) return;

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
// 🌙 Chuyển chế độ sáng/tối
// =======================
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const dark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", dark ? "dark" : "light");
  document.getElementById("themeToggle").textContent = dark ? "☀️ Chế độ sáng" : "🌙 Chế độ tối";
});

// =======================
// 🧠 Gán sự kiện cho các nút
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
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeToggle").textContent = "☀️ Chế độ sáng";
  }
  listGPTs(true);
};
