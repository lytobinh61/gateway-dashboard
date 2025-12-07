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

  // ======= Gọi API chung =======
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

  // ======= Danh sách GPT =======
  async function getGPTList() {
    const res = await callAPI("listProducts");
    if (!res?.products) return [];
    return res.products;
  }

  // ======= Danh sách User theo GPT =======
  async function getUserList(product) {
    const res = await callAPI("listUsers", { product });
    if (!res?.users) return [];
    return res.users.map((u) => u.user);
  }

  // ======= THÊM GPT =======
  async function handleAddGPT() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const id = prompt("Nhập ID GPT (ví dụ: law-court):");
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

  // ======= XOÁ GPT =======
  async function handleDeleteGPT() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    const gpts = await getGPTList();
    if (gpts.length === 0) return log("⚠️ Không có GPT nào.", "error");

    const names = gpts.map((g) => g.name + " (" + g.id + ")").join("\n");
    const id = prompt("Nhập ID GPT cần xoá:\n\n" + names);
    if (!id) return;

    const res = await callAPI("deleteProduct", { adminKey, id });
    if (res?.success) log(`🗑️ Đã xoá GPT <b>${id}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  // ======= THÊM USER =======
  async function handleAddUser() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const gpts = await getGPTList();
    if (gpts.length === 0)
      return log("⚠️ Không có GPT nào để thêm user.", "error");

    const names = gpts.map((g) => g.name + " (" + g.id + ")").join("\n");
    const product = prompt("Chọn GPT cần thêm user:\n\n" + names);
    if (!product) return log("⚠️ Bạn chưa chọn GPT.", "error");

    const user = prompt("Nhập tên user:");
    if (!user) return log("⚠️ Bạn chưa nhập user.", "error");

    const res = await callAPI("createUser", { adminKey, product, user });

    if (res?.success)
      log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  // ======= XOÁ USER =======
  async function handleDeleteUser() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const gpts = await getGPTList();
    if (gpts.length === 0)
      return log("⚠️ Không có GPT nào để xoá user.", "error");

    const names = gpts.map((g) => g.name + " (" + g.id + ")").join("\n");
    const product = prompt("Chọn GPT chứa user cần xoá:\n\n" + names);
    if (!product) return log("⚠️ Bạn chưa chọn GPT.", "error");

    const users = await getUserList(product);
    if (users.length === 0)
      return log(`⚠️ GPT <b>${product}</b> chưa có user nào.`, "error");

    const user = prompt("Chọn user cần xoá:\n\n" + users.join("\n"));
    if (!user) return log("⚠️ Bạn chưa chọn user.", "error");

    if (!confirm(`Xác nhận xoá user "${user}" khỏi GPT "${product}"?`))
      return log("❎ Đã huỷ thao tác xoá.", "info");

    const res = await callAPI("deleteUser", { adminKey, product, user });
    if (res?.success)
      log(`🗑️ Đã xoá user <b>${user}</b> khỏi GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  // ======= GIA HẠN USER =======
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

  // ======= GẮN SỰ KIỆN =======
  btnAddGPT.onclick = handleAddGPT;
  btnDeleteGPT.onclick = handleDeleteGPT;
  btnAddUser.onclick = handleAddUser;
  btnDeleteUser.onclick = handleDeleteUser;
  btnRenewUser.onclick = handleRenewUser;

  // ======= SÁNG / TỐI =======
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark
      ? "☀️ Chuyển sang chế độ sáng"
      : "🌙 Chuyển sang chế độ tối";
    log(`Đã chuyển sang chế độ ${dark ? "🌙 tối" : "☀️ sáng"}`, "info");
  };
});
