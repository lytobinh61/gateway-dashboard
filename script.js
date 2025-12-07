/**********************************************************************
 * ✨ Quản trị Gateway GPT — Mô phỏng đầy đủ
 * Không có fetch thật. Bạn có thể chèn fetch vào chỗ // TODO: ...
 *********************************************************************/

// --- Biến toàn cục ---
let adminKey = "";
const output = document.getElementById("output");
const toast = document.getElementById("toast");
const listContainer = document.getElementById("listContainer");

// --- Khởi tạo modal nhập adminKey ---
window.addEventListener("load", () => {
  document.getElementById("adminKeyModal").classList.add("active");
});

// Hiển thị/ẩn adminKey
document.getElementById("toggleKey").addEventListener("change", e => {
  const input = document.getElementById("adminKeyInput");
  input.type = e.target.checked ? "text" : "password";
});

// Xác nhận adminKey
document.getElementById("confirmAdminKey").onclick = () => {
  const key = document.getElementById("adminKeyInput").value.trim();
  if (!key) return showToast("Vui lòng nhập adminKey!");
  adminKey = key;
  document.getElementById("adminKeyModal").classList.remove("active");
  showToast("✅ Đã xác nhận adminKey");
  printResult("Sẵn sàng thao tác.");
};

// --- Hiển thị thông báo nhỏ ---
function showToast(msg, time = 2500) {
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), time);
}

// --- In kết quả ---
function printResult(data) {
  output.textContent =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// --- API mô phỏng ---
async function mockApi(endpoint, method, body) {
  await new Promise(r => setTimeout(r, 600));
  // Dữ liệu mô phỏng
  const fakeProducts = [
    { id: "law-court", name: "Tư vấn pháp luật" },
    { id: "chat-bot", name: "Chat Bot" },
    { id: "finance-ai", name: "Trợ lý tài chính" }
  ];
  const fakeUsers = {
    "law-court": ["user_law1", "user_law2"],
    "chat-bot": ["bot_user1", "bot_user2", "bot_user3"],
    "finance-ai": ["fin_a", "fin_b"]
  };

  if (endpoint === "products" && method === "GET") return { products: fakeProducts };
  if (endpoint.startsWith("users") && method === "GET") {
    const product = body?.product || endpoint.split("=")[1] || "law-court";
    return { users: fakeUsers[product]?.map(u => ({ user: u })) || [] };
  }
  return {
    success: true,
    endpoint,
    method,
    body,
    message: `Đã mô phỏng ${method} ${endpoint}`,
    time: new Date().toLocaleString()
  };
}

// === Hàm dùng chung để gọi API ===
// (hiện tại dùng mô phỏng, muốn gọi thật → thay phần trong TODO)
async function callApi(endpoint, method, body) {
  const url = `https://gpt-gateway.lytobinh61.workers.dev/${endpoint}`;
  const options = { method, headers: { "Content-Type": "application/json" } };
  if (method !== "GET") options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  return await res.json();
}


// --- Hiển thị danh sách GPT / User ---
async function showList(type, selectedGpt = "") {
  listContainer.innerHTML = "";
  listContainer.classList.add("active");

  if (type === "gpt") {
    const res = await callApi("products", "GET");
    const list = res.products.map(p => p.id);
    listContainer.innerHTML =
      `<h3>Chọn GPT:</h3>` +
      list.map(i => `<div class="list-item">${i}</div>`).join("");
  } else if (type === "user") {
    const res = await callApi(`users?product=${selectedGpt}`, "GET", { product: selectedGpt });
    const list = res.users.map(u => u.user);
    listContainer.innerHTML =
      `<h3>Chọn User (${selectedGpt}):</h3>` +
      list.map(i => `<div class="list-item">${i}</div>`).join("");
  }
}

// ================== CÁC NÚT THAO TÁC ==================

// ➕ Thêm GPT
document.getElementById("btnAddGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT:");
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("URL GPT:");
  if (!id || !name || !gptUrl) return showToast("Thiếu thông tin!");
  const res = await callApi("product", "POST", { adminKey, id, name, gptUrl });
  showToast("✅ Đã thêm GPT");
  printResult(res);
};

// 🗑️ Xoá GPT
document.getElementById("btnDeleteGPT").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT cần xoá");
  listContainer.onclick = async e => {
    if (!e.target.classList.contains("list-item")) return;
    const id = e.target.textContent;
    const res = await callApi("product", "DELETE", { adminKey, id });
    showToast(`🗑️ Đã xoá GPT: ${id}`);
    printResult(res);
    listContainer.classList.remove("active");
  };
};

// ➕ Thêm User
document.getElementById("btnAddUser").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT để thêm user");
  listContainer.onclick = async e => {
    if (!e.target.classList.contains("list-item")) return;
    const product = e.target.textContent;
    const user = prompt(`Nhập tên user cho GPT "${product}":`);
    if (!user) return;
    const res = await callApi("user", "POST", { adminKey, product, user });
    showToast(`✅ Đã thêm user "${user}"`);
    printResult(res);
    listContainer.classList.remove("active");
  };
};

// 🗑️ Xoá User
document.getElementById("btnDeleteUser").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT để xem user");
  listContainer.onclick = async e => {
    if (!e.target.classList.contains("list-item")) return;
    const product = e.target.textContent;
    await showList("user", product);
    showToast("Chọn user cần xoá");
    listContainer.onclick = async ev => {
      if (!ev.target.classList.contains("list-item")) return;
      const user = ev.target.textContent;
      const res = await callApi("user", "DELETE", { adminKey, product, user });
      showToast(`🗑️ Đã xoá user "${user}"`);
      printResult(res);
      listContainer.classList.remove("active");
    };
  };
};

// 🔁 Gia hạn User
document.getElementById("btnRenewUser").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT để gia hạn user");
  listContainer.onclick = async e => {
    if (!e.target.classList.contains("list-item")) return;
    const product = e.target.textContent;
    await showList("user", product);
    showToast("Chọn user để gia hạn");
    listContainer.onclick = async ev => {
      if (!ev.target.classList.contains("list-item")) return;
      const user = ev.target.textContent;
      const res = await callApi("renew", "POST", { product, user });
      showToast(`🔁 Đã gia hạn user "${user}"`);
      printResult(res);
      listContainer.classList.remove("active");
    };
  };
};

// --- Nội dung mặc định ---
printResult("✨ Nhập adminKey để bắt đầu thao tác.");
