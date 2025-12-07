window.addEventListener("load", () => {
  console.log("✅ script.js đã tải sau khi DOM load xong");

  const API_BASE = "https://gpt-gateway.lytobinh61.workers.dev/jit";
  const ADMIN_KEY = prompt("🔑 Nhập mã quản trị (adminKey):");

  // === Lấy phần tử HTML ===
  const output = document.getElementById("output");
  const btnAddGPT = document.getElementById("btnAddGPT");
  const btnDeleteGPT = document.getElementById("btnDeleteGPT");
  const btnAddUser = document.getElementById("btnAddUser");
  const btnDeleteUser = document.getElementById("btnDeleteUser");
  const btnRenewUser = document.getElementById("btnRenewUser");

  if (!btnAddGPT || !btnDeleteGPT || !btnAddUser || !btnDeleteUser || !btnRenewUser) {
    console.error("❌ Không tìm thấy một hoặc nhiều nút trong DOM.");
    return;
  }

  // === Hàm hiển thị kết quả ===
  function log(msg, type = "info") {
    const color =
      type === "error" ? "danger" : type === "success" ? "success" : "secondary";
    output.className = `alert alert-${color}`;
    output.innerHTML = msg;
  }

  // === Hàm gọi API ===
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

  // === Các nút chức năng ===
  btnAddGPT.onclick = async () => {
    const id = prompt("Nhập ID GPT:");
    const name = prompt("Nhập tên hiển thị:");
    const url = prompt("Nhập link GPT:");
    if (!id || !name || !url) return log("⚠️ Thiếu thông tin cần thiết.", "error");

    const res = await callAPI("createOrUpdateProduct", {
      adminKey: ADMIN_KEY,
      id,
      name,
      gptUrl: url,
    });
    if (res?.success)
      log(`✅ Đã thêm GPT <b>${name}</b> (${id}) thành công!`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  };

  btnDeleteGPT.onclick = async () => {
    const id = prompt("Nhập ID GPT cần xoá:");
    if (!id) return;
    const res = await callAPI("deleteProduct", { adminKey: ADMIN_KEY, id });
    if (res?.success) log(`🗑️ Đã xoá GPT <b>${id}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  };

  btnAddUser.onclick = async () => {
    const product = prompt("Nhập tên GPT cần thêm user:");
    const user = prompt("Nhập tên user:");
    const activationCode = prompt("Nhập mã kích hoạt (nếu có):");
    if (!product || !user) return log("⚠️ Thiếu thông tin.", "error");

    const res = await callAPI("createUser", {
      adminKey: ADMIN_KEY,
      product,
      user,
      activationCode,
    });
    if (res?.success)
      log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  };

  btnDeleteUser.onclick = async () => {
    const product = prompt("Nhập tên GPT chứa user:");
    const user = prompt("Nhập user cần xoá:");
    if (!product || !user) return;

    const res = await callAPI("deleteUser", { adminKey: ADMIN_KEY, product, user });
    if (res?.success)
      log(`🗑️ Đã xoá user <b>${user}</b> khỏi GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  };

  btnRenewUser.onclick = async () => {
    const product = prompt("Nhập tên GPT:");
    const user = prompt("Nhập user cần gia hạn:");
    if (!user) return;
    const res = await callAPI("renewActivationCode", { product, user });
    if (res?.success)
      log(
        `🔄 Đã cấp mã mới cho <b>${user}</b> trong GPT <b>${res.product}</b>:<br><code>${res.code}</code>`,
        "success"
      );
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  };
});
