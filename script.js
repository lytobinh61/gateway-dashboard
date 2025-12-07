let adminKey = "";
const output = document.getElementById("output");
const toast = document.getElementById("toast");

window.addEventListener("load", () => {
  document.getElementById("adminKeyModal").classList.add("active");
});

document.getElementById("confirmAdminKey").onclick = () => {
  const key = document.getElementById("adminKeyInput").value.trim();
  if (!key) return showToast("Vui lòng nhập adminKey!");
  adminKey = key;
  document.getElementById("adminKeyModal").classList.remove("active");
  showToast("✅ Đã xác nhận adminKey");
  output.textContent = "Sẵn sàng thao tác.";
};

function showToast(msg, time = 2500) {
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), time);
}

function printResult(data) {
  output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

async function mockApi(action, data) {
  await new Promise(r => setTimeout(r, 600));
  return { success: true, message: `[Mô phỏng] ${action}`, data };
}

document.getElementById("btnAddGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT:");
  const name = prompt("Tên hiển thị:");
  const res = await mockApi("Thêm GPT", { id, name });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnDeleteGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT cần xoá:");
  const res = await mockApi("Xoá GPT", { id });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnAddUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user:");
  const res = await mockApi("Thêm User", { product, user });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnDeleteUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user cần xoá:");
  const res = await mockApi("Xoá User", { product, user });
  printResult(res);
  showToast(res.message);
};

document.getElementById("btnRenewUser").onclick = async () => {
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Tên user cần gia hạn:");
  const res = await mockApi("Gia hạn User", { product, user });
  printResult(res);
  showToast(res.message);
};
