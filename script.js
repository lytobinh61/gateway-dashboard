let adminKey = "";
const output = document.getElementById("output");
const toast = document.getElementById("toast");

function showToast(msg, time = 2500) {
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), time);
}

function printResult(data) {
  output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// ==== Nhập adminKey ====
document.getElementById("confirmAdminKey").onclick = () => {
  const val = document.getElementById("adminKeyInput").value.trim();
  if (!val) return showToast("Vui lòng nhập adminKey!");
  adminKey = val;
  document.getElementById("adminKeyModal").classList.remove("active");
  showToast("Đã xác nhận adminKey");
};

// ==== Hàm mô phỏng API ====
async function callAPI(url, method = "GET", body = null) {
  // TODO: thay bằng fetch thật
  // const res = await fetch(url, {
  //   method,
  //   headers: { "Content-Type": "application/json" },
  //   body: body ? JSON.stringify(body) : null
  // });
  // return await res.json();

  await new Promise(r => setTimeout(r, 500));
  return { success: true, message: `[Fake API] ${method} ${url}`, body };
}

// ==== Các hành động chính ====
document.getElementById("btnAddGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT (chỉ [a-z0-9-]):");
  if (!id) return;
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("Đường dẫn GPT (bắt đầu https://):");
  const gateway = prompt("Gateway (tuỳ chọn):") || undefined;

  if (!/^https:\/\/.+/.test(gptUrl)) return showToast("URL phải bắt đầu bằng https://");
  if (!confirm(`Xác nhận thêm GPT:\nID: ${id}\nTên: ${name}\nURL: ${gptUrl}`)) return;

  const data = { adminKey, id, name, gptUrl, gateway };
  const res = await callAPI("https://gpt-gateway.lytobinh61.workers.dev/product", "POST", data);
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnDeleteGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT cần xoá:");
  if (!id) return;
  if (!confirm(`Xác nhận xoá GPT: ${id}?`)) return;

  const res = await callAPI("https://gpt-gateway.lytobinh61.workers.dev/product", "DELETE", { adminKey, id });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnAddUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  if (!product) return;
  const user = prompt("Tên người dùng:");
  const activationCode = prompt("Mã kích hoạt (bỏ trống nếu auto):") || undefined;
  if (!user) return;
  if (!confirm(`Xác nhận thêm user:\nGPT: ${product}\nUser: ${user}`)) return;

  const res = await callAPI("https://gpt-gateway.lytobinh61.workers.dev/user", "POST", { adminKey, product, user, activationCode });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnDeleteUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user cần xoá:");
  if (!user) return;
  if (!confirm(`Xác nhận xoá user: ${user}?`)) return;

  const res = await callAPI("https://gpt-gateway.lytobinh61.workers.dev/user", "DELETE", { adminKey, product, user });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnRenewUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user cần gia hạn:");
  if (!user) return;
  if (!confirm(`Gia hạn quyền truy cập cho user: ${user}?`)) return;

  const res = await callAPI("https://gpt-gateway.lytobinh61.workers.dev/renew", "POST", { product, user });
  printResult(res);
  showToast(res.message);
};

// ==== Mô phỏng danh sách ====
printResult("✨ Chào mừng đến giao diện quản trị Gateway GPT.\n\nHãy chọn thao tác bên trên để bắt đầu.");
