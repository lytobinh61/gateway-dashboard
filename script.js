/**********************************************************************
 * 💎 Quản trị Gateway GPT — Bản mô phỏng chạy offline
 * Không fetch, không kết nối thật, đảm bảo hoạt động 100%.
 **********************************************************************/

let adminKey = "";
const output = document.getElementById("output");
const toast = document.getElementById("toast");
const listContainer = document.getElementById("listContainer");

/* =================== KHỞI ĐỘNG =================== */
window.addEventListener("load", () => {
  console.log("✅ script.js đã chạy thành công");
  document.getElementById("adminKeyModal").classList.add("active");
});

/* Hiện/ẩn adminKey */
document.getElementById("toggleKey").addEventListener("change", e => {
  const input = document.getElementById("adminKeyInput");
  input.type = e.target.checked ? "text" : "password";
});

/* Xác nhận adminKey */
document.getElementById("confirmAdminKey").onclick = () => {
  const key = document.getElementById("adminKeyInput").value.trim();
  if (!key) return showToast("⚠️ Vui lòng nhập adminKey!");
  adminKey = key;
  document.getElementById("adminKeyModal").classList.remove("active");
  showToast("✅ Đã xác nhận adminKey");
  printResult("Sẵn sàng thao tác!");
};

/* =================== HÀM HỖ TRỢ =================== */
function showToast(msg, time = 2500) {
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), time);
}
function printResult(data) {
  output.textContent =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

/* =================== DỮ LIỆU GIẢ LẬP =================== */
const fakeGPTs = [
  { id: "law-court", name: "Tư vấn pháp luật" },
  { id: "chat-bot", name: "Chat Bot" },
  { id: "finance-ai", name: "Trợ lý tài chính" }
];
const fakeUsers = {
  "law-court": ["user_law1", "user_law2"],
  "chat-bot": ["bot_user1", "bot_user2", "bot_user3"],
  "finance-ai": ["fin_a", "fin_b"]
};

/* =================== HIỂN THỊ DANH SÁCH =================== */
function showList(title, items, onSelect) {
  listContainer.innerHTML = `<h3>${title}</h3>` +
    items.map(i => `<div class="list-item">${i}</div>`).join("");
  listContainer.classList.add("active");
  listContainer.onclick = e => {
    if (!e.target.classList.contains("list-item")) return;
    const value = e.target.textContent;
    listContainer.classList.remove("active");
    onSelect(value);
  };
}

/* =================== CÁC NÚT CHỨC NĂNG =================== */

// ➕ Thêm GPT
document.getElementById("btnAddGPT").onclick = () => {
  const id = prompt("Nhập ID GPT:");
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("URL GPT:");
  if (!id || !name || !gptUrl) return showToast("⚠️ Thiếu thông tin!");
  showToast(`✅ GPT "${name}" đã được thêm`);
  printResult({ action: "addGPT", id, name, gptUrl });
};

// 🗑️ Xoá GPT
document.getElementById("btnDeleteGPT").onclick = () => {
  showList("Chọn GPT để xoá:", fakeGPTs.map(g => g.id), id => {
    showToast(`🗑️ Đã xoá GPT: ${id}`);
    printResult({ action: "deleteGPT", id });
  });
};

// ➕ Thêm User
document.getElementById("btnAddUser").onclick = () => {
  showList("Chọn GPT để thêm user:", fakeGPTs.map(g => g.id), product => {
    const user = prompt(`Nhập tên user mới cho GPT "${product}":`);
    if (!user) return;
    showToast(`✅ Đã thêm user "${user}"`);
    printResult({ action: "addUser", product, user });
  });
};

// 🗑️ Xoá User
document.getElementById("btnDeleteUser").onclick = () => {
  showList("Chọn GPT:", fakeGPTs.map(g => g.id), product => {
    showList(`Chọn user trong ${product}:`, fakeUsers[product], user => {
      showToast(`🗑️ Đã xoá user "${user}"`);
      printResult({ action: "deleteUser", product, user });
    });
  });
};

// 🔁 Gia hạn User
document.getElementById("btnRenewUser").onclick = () => {
  showList("Chọn GPT:", fakeGPTs.map(g => g.id), product => {
    showList(`Chọn user trong ${product}:`, fakeUsers[product], user => {
      showToast(`🔁 Đã gia hạn user "${user}"`);
      printResult({ action: "renewUser", product, user });
    });
  });
};

/* =================== MẶC ĐỊNH =================== */
printResult("✨ Nhập adminKey để bắt đầu thao tác.");
