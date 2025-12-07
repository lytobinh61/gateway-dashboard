// Chạy sau khi DOM load xong
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js khởi động thành công");

  const API_BASE = "https://gpt-gateway.lytobinh61.workers.dev/jit";
  const output = document.getElementById("output");

  const btnAddGPT = document.getElementById("btnAddGPT");
  const btnDeleteGPT = document.getElementById("btnDeleteGPT");
  const btnAddUser = document.getElementById("btnAddUser");
  const btnDeleteUser = document.getElementById("btnDeleteUser");
  const btnRenewUser = document.getElementById("btnRenewUser");
  const themeToggle = document.getElementById("themeToggle");

  // ======= Hiển thị thông báo =======
  function log(msg, type = "info") {
    const color =
      type === "error" ? "danger" : type === "success" ? "success" : "secondary";
    output.className = `alert alert-${color}`;
    output.innerHTML = msg;
  }

  // ======= Gọi API (chung) =======
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

  // ======= Các thao tác quản trị =======
  async function handleAddGPT() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const id = prompt("Nhập ID GPT:");
    const name = prompt("Nhập tên hiển thị:");
    const url = prompt("Nhập link GPT:");

    if (!id || !name || !url) return log("⚠️ Thiếu thông tin.", "error");

    const res = await callAPI("createOrUpdateProduct", {
      adminKey,
      id,
      name,
      gptUrl: url,
    });

    if (res?.success)
      log(`✅ Đã thêm GPT <b>${name}</b> (${id}) thành công!`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  async function handleDeleteGPT() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    const id = prompt("Nhập ID GPT cần xoá:");
    if (!adminKey || !id) return log("⚠️ Thiếu thông tin.", "error");

    const res = await callAPI("deleteProduct", { adminKey, id });
    if (res?.success) log(`🗑️ Đã xoá GPT <b>${id}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  async function handleAddUser() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    const product = prompt("Nhập tên GPT:");
    const user = prompt("Nhập tên user:");
    if (!adminKey || !product || !user)
      return log("⚠️ Thiếu thông tin.", "error");

    const res = await callAPI("createUser", {
      adminKey,
      product,
      user,
    });

    if (res?.success)
      log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  async function handleDeleteUser() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    const product = prompt("Nhập tên GPT chứa user:");
    const user = prompt("Nhập user cần xoá:");
    if (!adminKey || !product || !user)
      return log("⚠️ Thiếu thông tin.", "error");

    const res = await callAPI("deleteUser", { adminKey, product, user });
    if (res?.success)
      log(`🗑️ Đã xoá user <b>${user}</b> khỏi GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  async function handleRenewUser() {
    const user = prompt("Nhập user cần gia hạn:");
    if (!user) return log("⚠️ Bạn chưa nhập user.", "error");

    const res = await callAPI("renewActivationCode", { user });
    if (res?.success)
      log(
        `🔄 Đã cấp mã mới cho <b>${user}</b> trong GPT <b>${res.product}</b>:<br><code>${res.code}</code>`,
        "success"
      );
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  // ======= Gắn sự kiện nút =======
  btnAddGPT.onclick = handleAddGPT;
  btnDeleteGPT.onclick = handleDeleteGPT;
  btnAddUser.onclick = handleAddUser;
  btnDeleteUser.onclick = handleDeleteUser;
  btnRenewUser.onclick = handleRenewUser;

  // ======= Chuyển chế độ sáng / tối =======
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark ? "☀️ Chuyển sang chế độ sáng" : "🌙 Chuyển sang chế độ tối";
    log(`Đã chuyển sang chế độ ${dark ? "🌙 tối" : "☀️ sáng"}`, "info");
  };
});
