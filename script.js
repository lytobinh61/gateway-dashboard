let adminKey = "";
const output = document.getElementById("output");
const toast = document.getElementById("toast");

// Hiển thị popup nhập key khi mở trang
window.addEventListener("load", () => {
  document.getElementById("adminKeyModal").classList.add("active");
});

// Khi người dùng xác nhận adminKey
document.getElementById("confirmAdminKey").onclick = () => {
  const val = document.getElementById("adminKeyInput").value.trim();
  if (!val) return showToast("Vui lòng nhập adminKey!");
  adminKey = val;
  document.getElementById("adminKeyModal").classList.remove("active");
  showToast("✅ Đã xác nhận adminKey, sẵn sàng thao tác.");
  printResult("✨ Sẵn sàng. Chọn chức năng bạn muốn sử dụng ở trên.");
};

// Hiển thị thông báo
function showToast(msg, time = 2500) {
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), time);
}

// In kết quả ra màn hình
function printResult(data) {
  output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// Mô phỏng API (fake)
async function mockApiCall(action, data) {
  await new Promise(r => setTimeout(r, 600));
  return {
    success: true,
    action,
    data,
    message: `Đã mô phỏng hành động "${action}" thành công!`,
    time: new Date().toLocaleString()
  };
}

// Xử lý các nút thao tác
document.getElementById("btnAddGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT:");
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("Đường dẫn GPT (https://...):");
  if (!id || !name || !gptUrl) return showToast("Thiếu thông tin!");
  if (!confirm(`Xác nhận thêm GPT "${name}"?`)) return;

  const res = await mockApiCall("Thêm GPT", { id, name, gptUrl });
  showToast(res.message);
  printResult(res);
};

document.getElementById("btnDeleteGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT cần xoá:");
  if (!id) return;
  if (!confirm(`Xác nhận xoá GPT "${id}"?`)) return;

  const res = await mockApiCall("Xoá GPT", { id });
  showToast(res.message);
  printResult(res);
};

document.getElementById("btnAddUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên người dùng:");
  if (!product || !user) return showToast("Thiếu thông tin!");
  if (!confirm(`Thêm user "${user}" vào GPT "${product}"?`)) return;

  const res = await mockApiCall("Thêm User", { product, user });
  showToast(res.message);
  printResult(res);
};

document.getElementById("btnDeleteUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user cần xoá:");
  if (!product || !user) return showToast("Thiếu thông tin!");
  if (!confirm(`Xác nhận xoá user "${user}" khỏi GPT "${product}"?`)) return;

  const res = await mockApiCall("Xoá User", { product, user });
  showToast(res.message);
  printResult(res);
};

document.getElementById("btnRenewUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user cần gia hạn:");
  if (!product || !user) return showToast("Thiếu thông tin!");
  if (!confirm(`Gia hạn quyền truy cập cho "${user}"?`)) return;

  const res = await mockApiCall("Gia hạn User", { product, user });
  showToast(res.message);
  printResult(res);
};

// Lời chào mặc định
printResult("✨ Chào mừng đến giao diện quản trị Gateway GPT.\n\nHãy nhập adminKey để bắt đầu.");
