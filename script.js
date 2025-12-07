document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ script.js khởi động thành công");

  const API_BASE = "https://gpt-gateway.lytobinh61.workers.dev/jit";
  const output = document.getElementById("output");

  // Các nút
  const btnAddGPT = document.getElementById("btnAddGPT");
  const btnDeleteGPT = document.getElementById("btnDeleteGPT");
  const btnAddUser = document.getElementById("btnAddUser");
  const btnDeleteUser = document.getElementById("btnDeleteUser");
  const btnRenewUser = document.getElementById("btnRenewUser");
  const themeToggle = document.getElementById("themeToggle");

  // ======= Hàm log =======
  function log(msg, type = "info") {
    const color =
      type === "error" ? "danger" : type === "success" ? "success" : "secondary";
    output.className = `alert alert-${color}`;
    output.innerHTML = msg;
  }

  // ======= Gọi API =======
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

  // ======= Lấy danh sách GPT =======
  async function getGPTList() {
    const res = await callAPI("listProducts", {});
    if (!res || !res.products || !Array.isArray(res.products)) {
      console.error("⚠️ Không lấy được danh sách GPT:", res);
      return [];
    }
    return res.products;
  }

  // ======= Lấy danh sách user theo GPT =======
  async function getUserList(product) {
    const res = await callAPI("listUsers", { product });
    if (!res || !res.users) {
      console.error("⚠️ Không lấy được danh sách user:", res);
      return [];
    }
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
    if (gpts.length === 0)
      return log("⚠️ Không có GPT nào trong hệ thống.", "error");

    const list = gpts.map((g) => `${g.id} - ${g.name}`).join("\n");
    const id = prompt("Nhập ID GPT cần xoá:\n\n" + list);
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

    // Hiển thị danh sách GPT để chọn
    const list = gpts.map((g, i) => `${i + 1}. ${g.name} (${g.id})`).join("\n");
    const idx = prompt("Chọn GPT (nhập số thứ tự):\n\n" + list);
    const product = gpts[parseInt(idx) - 1]?.id;
    if (!product) return log("⚠️ Bạn chưa chọn GPT hợp lệ.", "error");

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

    // Chọn GPT
    const list = gpts.map((g, i) => `${i + 1}. ${g.name} (${g.id})`).join("\n");
    const idx = prompt("Chọn GPT chứa user cần xoá (nhập số thứ tự):\n\n" + list);
    const product = gpts[parseInt(idx) - 1]?.id;
    if (!product) return log("⚠️ Bạn chưa chọn GPT hợp lệ.", "error");

    // Lấy user
    const users = await getUserList(product);
    if (users.length === 0)
      return log(`⚠️ GPT <b>${product}</b> chưa có user nào.`, "error");

    const ulist = users.map((u, i) => `${i + 1}. ${u}`).join("\n");
    const uidx = prompt("Chọn user cần xoá (nhập số thứ tự):\n\n" + ulist);
    const user = users[parseInt(uidx) - 1];
    if (!user) return log("⚠️ Bạn chưa chọn user hợp lệ.", "error");

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

  // ======= Nút sáng / tối =======
  themeToggle.onclick = () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = dark
      ? "☀️ Chuyển sang chế độ sáng"
      : "🌙 Chuyển sang chế độ tối";
    log(`Đã chuyển sang chế độ ${dark ? "🌙 tối" : "☀️ sáng"}`, "info");
  };
});
