// =======================
// Cấu hình chung
// =======================
const API_BASE = "https://gpt-gateway.lytobinh61.workers.dev/jit";
const ADMIN_KEY = prompt("🔑 Nhập mã quản trị (adminKey):");

// =======================
// Phần tử HTML
// =======================
const output = document.getElementById("output");
const btnAddGPT = document.getElementById("btnAddGPT");
const btnDeleteGPT = document.getElementById("btnDeleteGPT");
const btnAddUser = document.getElementById("btnAddUser");
const btnDeleteUser = document.getElementById("btnDeleteUser");
const btnRenewUser = document.getElementById("btnRenewUser");

// =======================
// Hàm tiện ích
// =======================
function log(msg, type = "info") {
  const color = type === "error" ? "danger" : type === "success" ? "success" : "secondary";
  output.className = `alert alert-${color}`;
  output.innerHTML = msg;
}

// =======================
// Gọi API
// =======================
async function callAPI(endpoint, data = {}) {
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    log("❌ Lỗi kết nối API: " + err.message, "error");
    return null;
  }
}

// =======================
// 1️⃣ Thêm GPT
// =======================
btnAddGPT.onclick = async () => {
  const id = prompt("Nhập ID GPT (viết liền không dấu):");
  const name = prompt("Nhập tên hiển thị của GPT:");
  const url = prompt("Nhập link GPT (https://...):");
  if (!id || !name || !url) return log("⚠️ Thiếu thông tin cần thiết.", "error");

  const res = await callAPI("createOrUpdateProduct", {
    adminKey: ADMIN_KEY,
    id,
    name,
    gptUrl: url,
  });
  if (res?.success) log(`✅ Đã thêm GPT <b>${name}</b> (${id}) thành công!`, "success");
  else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
};

// =======================
// 2️⃣ Xoá GPT
// =======================
btnDeleteGPT.onclick = async () => {
  const id = prompt("Nhập ID GPT cần xoá:");
  if (!id) return;
  const res = await callAPI("deleteProduct", { adminKey: ADMIN_KEY, id });
  if (res?.success) log(`🗑️ Đã xoá GPT <b>${id}</b>.`, "success");
  else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
};

// =======================
// 3️⃣ Thêm User
// =======================
btnAddUser.onclick = async () => {
  const product = prompt("Nhập tên GPT cần thêm user:");
  const user = prompt("Nhập tên user:");
  const activationCode = prompt("Nhập mã kích hoạt ban đầu (nếu có):");

  if (!product || !user) return log("⚠️ Thiếu thông tin.", "error");

  const res = await callAPI("createUser", {
    adminKey: ADMIN_KEY,
    product,
    user,
    activationCode,
  });
  if (res?.success) log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>.`, "success");
  else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
};

// =======================
// 4️⃣ Xoá User
// =======================
btnDeleteUser.onclick = async () => {
  const product = prompt("Nhập tên GPT chứa user:");
  const user = prompt("Nhập tên user cần xoá:");
  if (!product || !user) return;

  const res = await callAPI("deleteUser", { adminKey: ADMIN_KEY, product, user });
  if (res?.success) log(`🗑️ Đã xoá user <b>${user}</b> khỏi GPT <b>${product}</b>.`, "success");
  else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
};

// =======================
// 5️⃣ Gia hạn user
// =======================
btnRenewUser.onclick = async () => {
  const product = prompt("Nhập tên GPT:");
  const user = prompt("Nhập tên user cần gia hạn:");
  if (!user) return;

  const res = await callAPI("renewActivationCode", { product, user });
  if (res?.success)
    log(
      `🔄 Đã cấp mã mới cho <b>${user}</b> trong GPT <b>${res.product}</b>:<br><code>${res.code}</code>`,
      "success"
    );
  else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
};
