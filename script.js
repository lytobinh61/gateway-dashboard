let adminKey = "";
const output = document.getElementById("output");
const toast = document.getElementById("toast");
const listContainer = document.getElementById("listContainer");

// ===== Admin key modal =====
window.addEventListener("load", () => {
  document.getElementById("adminKeyModal").classList.add("active");
});
document.getElementById("toggleKey").addEventListener("change", e => {
  const input = document.getElementById("adminKeyInput");
  input.type = e.target.checked ? "text" : "password";
});
document.getElementById("confirmAdminKey").onclick = () => {
  const key = document.getElementById("adminKeyInput").value.trim();
  if (!key) return showToast("Vui lòng nhập adminKey!");
  adminKey = key;
  document.getElementById("adminKeyModal").classList.remove("active");
  showToast("✅ Đã xác nhận adminKey");
};

// ===== Helper =====
function showToast(msg, time = 2500) {
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), time);
}

function printResult(data) {
  output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

// ===== API mô phỏng =====
async function mockApi(endpoint, method, body) {
  await new Promise(r => setTimeout(r, 600));
  return { success: true, endpoint, method, body, time: new Date().toLocaleTimeString() };
}

// ===== TODO: chèn fetch thật tại đây =====
// Ví dụ:
// async function callApi(endpoint, method, body) {
//   const res = await fetch(`https://gpt-gateway.lytobinh61.workers.dev/${endpoint}`, {
//     method,
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body)
//   });
//   return res.json();
// }

async function callApi(endpoint, method, body) {
  const res = await fetch(`https://gpt-gateway.lytobinh61.workers.dev/${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "GET" ? null : JSON.stringify(body)
  });
  return await res.json();
}

//const callApi = mockApi; // <- tạm dùng mô phỏng

// ===== Hiển thị danh sách =====
async function showList(type) {
  listContainer.innerHTML = "";
  listContainer.classList.add("active");

  if (type === "gpt") {
    // TODO: thay bằng await callApi("products","GET");
    const res = await mockApi("products","GET");
    const list = ["law-court", "chat-bot", "finance-ai"]; // demo
    listContainer.innerHTML = `<h3>Chọn GPT:</h3>` + list.map(i => `<div class="list-item">${i}</div>`).join("");
  } else if (type === "user") {
    // TODO: thay bằng await callApi(`users?product=${selectedGpt}`,"GET");
    const list = ["user1", "user2", "user3"];
    listContainer.innerHTML = `<h3>Chọn User:</h3>` + list.map(i => `<div class="list-item">${i}</div>`).join("");
  }
}

// ===== Nút thao tác =====
document.getElementById("btnAddGPT").onclick = async () => {
  const id = prompt("Nhập ID GPT:");
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("URL GPT:");
  if (!id || !name || !gptUrl) return showToast("Thiếu thông tin!");
  const res = await callApi("product","POST",{ adminKey, id, name, gptUrl });
  showToast("✅ Thêm GPT thành công");
  printResult(res);
};

document.getElementById("btnDeleteGPT").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT cần xoá trong danh sách");
  listContainer.onclick = async e => {
    if (e.target.classList.contains("list-item")) {
      const id = e.target.textContent;
      const res = await callApi("product","DELETE",{ adminKey, id });
      showToast(`🗑️ Đã xoá ${id}`);
      printResult(res);
      listContainer.classList.remove("active");
    }
  };
};

document.getElementById("btnAddUser").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT để thêm user");
  listContainer.onclick = async e => {
    if (e.target.classList.contains("list-item")) {
      const product = e.target.textContent;
      const user = prompt(`Nhập tên user cho GPT "${product}":`);
      const res = await callApi("user","POST",{ adminKey, product, user });
      showToast(`✅ Đã thêm user "${user}"`);
      printResult(res);
      listContainer.classList.remove("active");
    }
  };
};

document.getElementById("btnDeleteUser").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT để xem user");
  listContainer.onclick = async e => {
    if (e.target.classList.contains("list-item")) {
      const product = e.target.textContent;
      await showList("user");
      showToast("Chọn user cần xoá");
      listContainer.onclick = async ev => {
        if (ev.target.classList.contains("list-item")) {
          const user = ev.target.textContent;
          const res = await callApi("user","DELETE",{ adminKey, product, user });
          showToast(`🗑️ Đã xoá user "${user}"`);
          printResult(res);
          listContainer.classList.remove("active");
        }
      };
    }
  };
};

document.getElementById("btnRenewUser").onclick = async () => {
  await showList("gpt");
  showToast("Chọn GPT để gia hạn user");
  listContainer.onclick = async e => {
    if (e.target.classList.contains("list-item")) {
      const product = e.target.textContent;
      await showList("user");
      showToast("Chọn user để gia hạn");
      listContainer.onclick = async ev => {
        if (ev.target.classList.contains("list-item")) {
          const user = ev.target.textContent;
          const res = await callApi("renew","POST",{ product, user });
          showToast(`🔁 Đã gia hạn user "${user}"`);
          printResult(res);
          listContainer.classList.remove("active");
        }
      };
    }
  };
};

// ===== Mặc định =====
printResult("✨ Sẵn sàng. Nhập adminKey để bắt đầu thao tác.");
