document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Quản trị Gateway GPT khởi động...");

  // === CẤU HÌNH API ===
  // ⚠️ Đây là endpoint JSON của Worker. Nếu bạn đổi Worker khác, chỉ cần đổi dòng này.
  const API_BASE = "https://gpt-gateway.lytobinh61.workers.dev/api";
  const output = document.getElementById("output");

  // === CÁC NÚT TRÊN GIAO DIỆN ===
  const btnAddGPT = document.getElementById("btnAddGPT");
  const btnDeleteGPT = document.getElementById("btnDeleteGPT");
  const btnAddUser = document.getElementById("btnAddUser");
  const btnDeleteUser = document.getElementById("btnDeleteUser");
  const btnRenewUser = document.getElementById("btnRenewUser");
  const themeToggle = document.getElementById("themeToggle");

  // === HÀM HIỂN THỊ THÔNG BÁO ===
  function log(msg, type = "info") {
    const color =
      type === "error" ? "danger" : type === "success" ? "success" : "secondary";
    output.className = `alert alert-${color}`;
    output.innerHTML = msg;
  }

  // === HÀM GỌI API CHUNG ===
  async function callAPI(endpoint, data = {}) {
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      console.log(`📡 [${endpoint}]`, json);
      return json;
    } catch (err) {
      log("❌ Lỗi kết nối API: " + err.message, "error");
      return null;
    }
  }

  // === LẤY DANH SÁCH GPT ===
  async function getGPTList(adminKey) {
    const res = await callAPI("listProducts", { adminKey });
    if (!res || !res.products) {
      log("❌ Không thể lấy danh sách GPT.", "error");
      return [];
    }
    return res.products;
  }

  // === LẤY DANH SÁCH USER CỦA MỘT GPT ===
  async function getUserList(product) {
    const res = await callAPI("listUsers", { product });
    if (!res || !res.users) return [];
    return res.users.map((u) => u.user);
  }

  // === THÊM GPT ===
  async function handleAddGPT() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const id = prompt("Nhập ID GPT (vd: law-court):");
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

  // === XOÁ GPT ===
  async function handleDeleteGPT() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const gpts = await getGPTList(adminKey);
    if (gpts.length === 0)
      return log("⚠️ Không có GPT nào để xoá.", "error");

    const list = gpts.map((g, i) => `${i + 1}. ${g.name} (${g.id})`).join("\n");
    const idx = prompt("Chọn GPT cần xoá (nhập số):\n\n" + list);
    const id = gpts[parseInt(idx) - 1]?.id;
    if (!id) return log("⚠️ GPT không hợp lệ.", "error");

    if (!confirm(`Xác nhận xoá GPT "${id}"?`)) return;

    const res = await callAPI("deleteProduct", { adminKey, id });
    if (res?.success) log(`🗑️ Đã xoá GPT <b>${id}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  // === THÊM USER ===
  async function handleAddUser() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const gpts = await getGPTList(adminKey);
    if (gpts.length === 0)
      return log("⚠️ Không có GPT nào để thêm user.", "error");

    const list = gpts.map((g, i) => `${i + 1}. ${g.name} (${g.id})`).join("\n");
    const idx = prompt("Chọn GPT để thêm user:\n\n" + list);
    const product = gpts[parseInt(idx) - 1]?.id;
    if (!product) return log("⚠️ GPT không hợp lệ.", "error");

    const user = prompt("Nhập tên user cần thêm:");
    if (!user) return log("⚠️ Bạn chưa nhập tên user.", "error");

    const res = await callAPI("createUser", { adminKey, product, user });
    if (res?.success)
      log(`✅ Đã thêm user <b>${user}</b> vào GPT <b>${product}</b>.`, "success");
    else log(`❌ Lỗi: ${res?.message || "Không xác định"}`, "error");
  }

  // === XOÁ USER ===
  async function handleDeleteUser() {
    const adminKey = prompt("🔑 Nhập adminKey:");
    if (!adminKey) return log("⚠️ Bạn chưa nhập adminKey.", "error");

    const gpts = await getGPTList(adminKey);
    if (gpts.length === 0)
      return log("⚠️ Không có GPT nào để chọn.", "error");

    const list = gpts.map((g, i) => `${i + 1}. ${g.name} (${g.id})`).join("\n");
    const idx = prompt("Chọn GPT chứa user cần xoá:\n\n" + list);
    const product = gpts[parseInt(idx) - 1]?.id;
    if (!product) return log("⚠️ GPT không hợp lệ.", "error");

    const users = await getUserList(product);
    if (users.length === 0)
      return log(`⚠️ GPT <b>${product}</b> chưa có user nào.`, "error");

    const ulist = users.map((u, i) => `${i + 1}. ${u}`).join("\n"
