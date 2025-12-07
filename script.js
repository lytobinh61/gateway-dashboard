// script.js — Quản trị Gateway GPT (phiên bản 5 nút màu hoàn chỉnh 2025)

// ===========================
// ⚙️ Cấu hình
// ===========================
const API = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = localStorage.getItem("adminKey") || "";
const output = document.getElementById("output");

// ===========================
// ⚙️ Hàm tiện ích
// ===========================
function log(msg, type = "info") {
  output.innerHTML = `<div class="alert alert-${type}" style="padding:10px">${msg}</div>`;
}

function promptKey() {
  adminKey = prompt("🔑 Nhập adminKey:");
  if (adminKey) localStorage.setItem("adminKey", adminKey);
  else alert("❌ Chưa nhập adminKey!");
  return !!adminKey;
}

async function fetchJSON(url, method = "GET", body = null) {
  const opt = { method, headers: { "Content-Type": "application/json" } };
  if (body) opt.body = JSON.stringify(body);
  const res = await fetch(url, opt);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Lỗi không xác định");
  return data;
}

// ===========================
// 🧩 Hiển thị danh sách GPT
// ===========================
async function listGPTs(show = false) {
  try {
    const data = await fetchJSON(`${API}/products`);
    if (show) {
      let html = `<h4>📦 Danh sách GPT:</h4><ol>`;
      data.products.forEach((p) => (html += `<li><b>${p.name}</b> — ${p.id}</li>`));
      html += `</ol>`;
      log(html, "success");
    }
    return data.products || [];
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
    return [];
  }
}

// ===========================
// ➕ Thêm GPT
// ===========================
async function addGPT() {
  if (!adminKey && !promptKey()) return;
  const id = prompt("Nhập ID GPT (chữ thường, số, gạch ngang):");
  if (!id) return;
  const name = prompt("Tên GPT:");
  const gptUrl = prompt("URL GPT (https://...):");
  if (!gptUrl.startsWith("https")) return alert("❌ URL không hợp lệ.");

  try {
    const body = { adminKey, id, name, gptUrl };
    const res = await fetchJSON(`${API}/product`, "POST", body);
    log(`✅ Thêm GPT thành công: <b>${name}</b>`, "success");
    await listGPTs(true);
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// ===========================
// 🗑️ Xoá GPT
// ===========================
async function deleteGPT() {
  if (!adminKey && !promptKey()) return;
  const list = await listGPTs();
  if (!list.length) return alert("⚠️ Chưa có GPT nào.");
  const id = prompt("Nhập ID GPT cần xoá:");
  if (!id) return;

  if (!confirm(`Bạn chắc chắn muốn xoá GPT ${id}?`)) return;

  try {
    const res = await fetchJSON(`${API}/product`, "DELETE", { adminKey, id });
    log(`🗑️ Đã xoá GPT: <b>${id}</b>`, "warning");
    await listGPTs(true);
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// ===========================
// ➕ Thêm User
// ===========================
async function addUser() {
  if (!adminKey && !promptKey()) return;
  const gpts = await listGPTs();
  if (!gpts.length) return alert("⚠️ Không có GPT nào.");
  const product = prompt("Nhập ID GPT cần thêm user:");
  const user = prompt("Tên user:");
  if (!user) return;

  try {
    const res = await fetchJSON(`${API}/user`, "POST", {
      adminKey,
      product,
      user,
    });
    log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>`, "success");
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// ===========================
// 🗑️ Xoá User
// ===========================
async function deleteUser() {
  if (!adminKey && !promptKey()) return;
  const product = prompt("Nhập ID GPT cần xoá user:");
  const user = prompt("Nhập tên user cần xoá:");
  if (!product || !user) return;

  if (!confirm(`Bạn chắc muốn xoá user "${user}" khỏi GPT "${product}"?`)) return;

  try {
    await fetchJSON(`${API}/user`, "DELETE", { adminKey, product, user });
    log(`🗑️ Đã xoá user <b>${user}</b> khỏi GPT <b>${product}</b>`, "warning");
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// ===========================
// 🔁 Gia hạn User
// ===========================
async function renewUser() {
  if (!adminKey && !promptKey()) return;
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Nhập user cần gia hạn:");
  if (!product || !user) return;

  try {
    const res = await fetchJSON(`${API}/renew`, "POST", { adminKey, product, user });
    log(
      `✅ Đã cấp lại mã kích hoạt mới cho <b>${user}</b> (${res.trialDays} ngày, ${res.slots} thiết bị)`,
      "success"
    );
  } catch (e) {
    log(`❌ ${e.message}`, "danger");
  }
}

// ===========================
// 🌙 Chế độ tối / sáng
// ===========================
const modeBtn = document.getElementById("modeToggle");
modeBtn.onclick = () => {
  document.body.classList.toggle("dark-mode");
  const dark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", dark ? "dark" : "light");
  modeBtn.textContent = dark ? "🌙 Tối" : "☀️ Sáng";
};

window.onload = () => {
  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark-mode");
  listGPTs(true);
};

// ===========================
// 🎯 Gán sự kiện cho các nút
// ===========================
document.getElementById("btnAddGPT").onclick = addGPT;
document.getElementById("btnDelGPT").onclick = deleteGPT;
document.getElementById("btnAddUser").onclick = addUser;
document.getElementById("btnDelUser").onclick = deleteUser;
document.getElementById("btnRenew").onclick = renewUser;
