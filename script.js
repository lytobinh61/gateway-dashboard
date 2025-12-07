// script.js — Quản trị Gateway GPT (Bản hoàn chỉnh 2025)

// =====================
// CẤU HÌNH
// =====================
const API = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = localStorage.getItem("adminKey") || "";

// =====================
// TIỆN ÍCH
// =====================
function showMsg(html, type = "info") {
  const box = document.getElementById("output");
  box.innerHTML = `<div class="alert alert-${type}">${html}</div>`;
}

function confirmAction(text) {
  return confirm(text);
}

function promptKey() {
  adminKey = prompt("🔑 Nhập adminKey:");
  if (adminKey) localStorage.setItem("adminKey", adminKey);
}

// =====================
// HIỂN THỊ DANH SÁCH GPT
// =====================
async function listGPTs() {
  const res = await fetch(`${API}/products`);
  const data = await res.json();
  if (!data.products?.length) {
    showMsg("⚠️ Chưa có GPT nào được đăng ký.");
    return [];
  }

  let html = `<h5>📦 Danh sách GPT:</h5><ol>`;
  data.products.forEach((p, i) => {
    html += `<li><b>${p.id}</b> — ${p.name} <br><small>${p.gptUrl}</small></li>`;
  });
  html += `</ol>`;
  showMsg(html, "success");
  return data.products;
}

// =====================
// ➕ THÊM GPT
// =====================
async function addGPT() {
  if (!adminKey) promptKey();
  if (!adminKey) return;

  const id = prompt("Nhập ID GPT (chỉ chữ thường, số, gạch ngang):");
  if (!/^[a-z0-9-]+$/.test(id)) return alert("❌ ID không hợp lệ.");

  const name = prompt("Tên hiển thị của GPT:");
  const gptUrl = prompt("URL GPT (bắt đầu bằng https://):");
  if (!/^https:\/\//.test(gptUrl)) return alert("❌ URL không hợp lệ.");

  const gateway = prompt("Gateway tùy chọn (Enter nếu để trống):") || "";

  if (!confirmAction(`Xác nhận thêm GPT: ${name}?`)) return;

  const body = { adminKey, id, name, gptUrl, gateway };
  const res = await fetch(`${API}/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (res.ok) {
    showMsg(`✅ Thêm GPT thành công: <b>${name}</b>`);
    await listGPTs();
  } else {
    showMsg(`❌ Lỗi: ${data.error || data.message}`, "danger");
  }
}

// =====================
// 🗑️ XOÁ GPT
// =====================
async function deleteGPT() {
  if (!adminKey) promptKey();
  if (!adminKey) return;

  const list = await listGPTs();
  if (!list.length) return;

  const choice = prompt("Nhập số thứ tự hoặc ID GPT cần xoá:");
  const gpt =
    isNaN(choice) ? list.find((p) => p.id === choice) : list[choice - 1];
  if (!gpt) return alert("❌ Không tìm thấy GPT.");

  if (!confirmAction(`Bạn có chắc muốn xoá GPT: ${gpt.name}?`)) return;

  const res = await fetch(`${API}/product`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, id: gpt.id }),
  });
  const data = await res.json();

  if (res.ok) {
    showMsg(`🗑️ Đã xoá GPT <b>${gpt.name}</b> thành công.`);
    await listGPTs();
  } else {
    showMsg(`❌ Lỗi: ${data.error || data.message}`, "danger");
  }
}

// =====================
// ➕ THÊM USER
// =====================
async function addUser() {
  if (!adminKey) promptKey();
  if (!adminKey) return;

  const list = await listGPTs();
  if (!list.length) return;

  const choice = prompt("Chọn GPT (nhập số thứ tự hoặc ID):");
  const product =
    isNaN(choice) ? list.find((p) => p.id === choice) : list[choice - 1];
  if (!product) return alert("❌ Không tìm thấy GPT.");

  const user = prompt("Nhập tên người dùng:");
  if (!user) return alert("❌ Chưa nhập tên user.");

  const activationCode = prompt("Nhập mã kích hoạt (Enter để bỏ trống):") || "";

  if (!confirmAction(`Xác nhận thêm user "${user}" cho GPT "${product.name}"?`))
    return;

  const res = await fetch(`${API}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, product: product.id, user, activationCode }),
  });
  const data = await res.json();

  if (res.ok) {
    showMsg(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product.name}</b>.`);
    await listUsers(product.id);
  } else {
    if (res.status === 409)
      showMsg(`⚠️ User đã tồn tại. Vui lòng nhập tên khác.`, "warning");
    else if (res.status === 401)
      showMsg(`🔒 Sai adminKey. Nhập lại để tiếp tục.`, "danger");
    else showMsg(`❌ Lỗi: ${data.error || data.message}`, "danger");
  }
}

// =====================
// 🗑️ XOÁ USER
// =====================
async function deleteUser() {
  if (!adminKey) promptKey();
  if (!adminKey) return;

  const list = await listGPTs();
  if (!list.length) return;

  const choice = prompt("Chọn GPT (nhập số thứ tự hoặc ID):");
  const product =
    isNaN(choice) ? list.find((p) => p.id === choice) : list[choice - 1];
  if (!product) return alert("❌ Không tìm thấy GPT.");

  const users = await listUsers(product.id);
  if (!users.length) return;

  const uChoice = prompt("Chọn user cần xoá (nhập số hoặc tên):");
  const target =
    isNaN(uChoice)
      ? users.find((u) => u.user === uChoice)
      : users[uChoice - 1];
  if (!target) return alert("❌ Không tìm thấy user.");

  if (!confirmAction(`Xoá user "${target.user}" khỏi GPT "${product.name}"?`))
    return;

  const res = await fetch(`${API}/user`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, product: product.id, user: target.user }),
  });
  const data = await res.json();

  if (res.ok) {
    showMsg(`🗑️ Đã xoá user <b>${target.user}</b> khỏi GPT <b>${product.name}</b>.`);
    await listUsers(product.id);
  } else {
    showMsg(`❌ Lỗi: ${data.error || data.message}`, "danger");
  }
}

// =====================
// 🔍 DANH SÁCH USER THEO GPT
// =====================
async function listUsers(productId) {
  const res = await fetch(`${API}/users?product=${productId}`);
  const data = await res.json();

  if (!data.users?.length) {
    showMsg("⚠️ Chưa có user nào.");
    return [];
  }

  let html = `<h5>👥 Danh sách user cho GPT <b>${data.product}</b>:</h5><ol>`;
  data.users.forEach((u) => {
    html += `<li>${u.user}</li>`;
  });
  html += `</ol>`;
  showMsg(html, "success");
  return data.users;
}

// =====================
// GẮN SỰ KIỆN CHO NÚT GIAO DIỆN
// =====================
document.getElementById("btn-add-gpt").onclick = addGPT;
document.getElementById("btn-del-gpt").onclick = deleteGPT;
document.getElementById("btn-add-user").onclick = addUser;
document.getElementById("btn-del-user").onclick = deleteUser;

// =====================
// KHỞI ĐỘNG TRANG
// =====================
window.onload = () => {
  showMsg(`<b>Chào mừng đến trang Quản trị Gateway GPT</b><br>
  Hãy chọn thao tác ở trên để bắt đầu.`, "info");
  listGPTs();
};
