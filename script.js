kconst API_BASE = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = localStorage.getItem("adminKey") || "";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function ensureAdminKey() {
  if (!adminKey) {
    adminKey = prompt("Nhập adminKey:");
    if (adminKey) localStorage.setItem("adminKey", adminKey);
  }
  return adminKey;
}

function showMessage(html, type = "light") {
  const box = document.getElementById("output");
  box.className = `alert alert-${type}`;
  box.innerHTML = html;
}

// ====== LOAD PRODUCTS ======
async function loadProducts() {
  try {
    const data = await fetchJSON(`${API_BASE}/products`);
    if (!data.products?.length) throw new Error("Không có GPT nào.");
    let html = `<h5>Danh sách GPT:</h5>
    <table class='table table-striped'><thead><tr><th>#</th><th>ID</th><th>Tên</th><th>Gateway</th></tr></thead><tbody>`;
    data.products.forEach((p, i) => {
      html += `<tr><td>${i + 1}</td><td>${p.id}</td><td>${p.name}</td><td>${p.gateway}</td></tr>`;
    });
    html += "</tbody></table>";
    showMessage(html, "light");
    return data.products;
  } catch (e) {
    showMessage("❌ Lỗi tải danh sách GPT.", "danger");
    return [];
  }
}

// ====== ADD GPT ======
async function addGPT() {
  await ensureAdminKey();
  const id = prompt("Nhập ID (chỉ gồm a-z0-9-):");
  const name = prompt("Nhập tên GPT:");
  const gptUrl = prompt("Nhập URL (bắt đầu bằng https://):");
  const gateway = prompt("Nhập gateway (tùy chọn):") || "";
  if (!id || !name || !gptUrl.startsWith("https://")) return alert("Dữ liệu không hợp lệ.");
  if (!confirm(`Xác nhận thêm GPT:\n${id} — ${name}?`)) return;
  try {
    await fetchJSON(`${API_BASE}/product`, {
      method: "POST",
      body: JSON.stringify({ adminKey, id, name, gptUrl, gateway }),
    });
    alert("✅ Đã thêm GPT thành công.");
    loadProducts();
  } catch (e) {
    alert("❌ Lỗi khi thêm GPT.");
  }
}

// ====== DELETE GPT ======
async function deleteGPT() {
  await ensureAdminKey();
  const list = await loadProducts();
  if (!list.length) return;
  const sel = prompt("Chọn GPT cần xoá (số hoặc id):");
  const target = isNaN(sel) ? sel : list[parseInt(sel) - 1]?.id;
  if (!target) return alert("Không hợp lệ.");
  if (!confirm(`Xoá GPT "${target}"?`)) return;
  try {
    await fetchJSON(`${API_BASE}/product`, {
      method: "DELETE",
      body: JSON.stringify({ adminKey, id: target }),
    });
    alert(`✅ Đã xoá GPT: ${target}`);
    loadProducts();
  } catch (e) {
    alert("❌ Lỗi xoá GPT.");
  }
}

// ====== ADD USER ======
async function addUser() {
  await ensureAdminKey();
  const products = await loadProducts();
  if (!products.length) return;

  const sel = prompt(
    "Chọn GPT (số hoặc id):\n" +
      products.map((p, i) => `${i + 1}) ${p.name} (${p.id})`).join("\n")
  );
  const product = isNaN(sel) ? sel : products[parseInt(sel) - 1]?.id;
  if (!product) return alert("Lựa chọn không hợp lệ.");

  const user = prompt("Nhập tên user:");
  const activationCode = prompt("Nhập mã kích hoạt (tuỳ chọn):") || null;
  if (!user) return alert("Thiếu tên user.");
  if (!confirm(`Thêm user "${user}" cho GPT "${product}"?`)) return;

  try {
    await fetchJSON(`${API_BASE}/user`, {
      method: "POST",
      body: JSON.stringify({ adminKey, product, user, activationCode }),
    });
    const users = await fetchJSON(`${API_BASE}/users?product=${product}`);
    alert(`✅ Đã thêm user "${user}" thành công.\n\nTổng số user hiện có: ${users.users.length}`);
  } catch (e) {
    alert("❌ Lỗi khi thêm user.");
  }
}

// ====== DELETE USER ======
async function deleteUser() {
  await ensureAdminKey();
  const products = await loadProducts();
  if (!products.length) return;

  const sel = prompt(
    "Chọn GPT (số hoặc id):\n" +
      products.map((p, i) => `${i + 1}) ${p.name} (${p.id})`).join("\n")
  );
  const product = isNaN(sel) ? sel : products[parseInt(sel) - 1]?.id;
  if (!product) return alert("Lựa chọn không hợp lệ.");

  const users = await fetchJSON(`${API_BASE}/users?product=${product}`);
  if (!users.users?.length) return alert("Không có user nào.");

  const selUser = prompt(
    "Chọn user cần xoá:\n" +
      users.users.map((u, i) => `${i + 1}) ${u.user}`).join("\n")
  );
  const user = isNaN(selUser) ? selUser : users.users[parseInt(selUser) - 1]?.user;
  if (!user) return alert("Không hợp lệ.");
  if (!confirm(`Xoá user "${user}" khỏi GPT "${product}"?`)) return;

  try {
    await fetchJSON(`${API_BASE}/user`, {
      method: "DELETE",
      body: JSON.stringify({ adminKey, product, user }),
    });
    const refreshed = await fetchJSON(`${API_BASE}/users?product=${product}`);
    alert(`✅ Đã xoá user "${user}".\n\nCòn lại: ${refreshed.users.length} user.`);
  } catch (e) {
    alert("❌ Lỗi xoá user.");
  }
}

// ====== RENEW USER ======
// ====== GIA HẠN USER ======
async function renewUser() {
  await ensureAdminKey();
  const products = await loadProducts();
  if (!products.length) return;

  // 🧩 Chọn GPT cần gia hạn
  const sel = prompt(
    "Chọn GPT cần gia hạn (số hoặc id):\n" +
      products.map((p, i) => `${i + 1}) ${p.name} (${p.id})`).join("\n")
  );
  const product = isNaN(sel) ? sel : products[parseInt(sel) - 1]?.id;
  if (!product) return alert("Lựa chọn không hợp lệ.");

  // 🧩 Lấy danh sách user
  const users = await fetchJSON(`${API_BASE}/users?product=${product}`);
  if (!users.users?.length) return alert("Không có user nào.");

  // 🧩 Chọn user cần gia hạn
  const selUser = prompt(
    "Chọn user cần gia hạn:\n" +
      users.users.map((u, i) => `${i + 1}) ${u.user}`).join("\n")
  );
  const user = isNaN(selUser)
    ? selUser
    : users.users[parseInt(selUser) - 1]?.user;
  if (!user) return alert("Không hợp lệ.");

  // 🕒 Nhập thời hạn & số thiết bị
  const trialDays = parseInt(prompt("⏱️ Nhập thời hạn (ngày):", "15")) || 15;
  const slots = parseInt(prompt("💻 Nhập số thiết bị:", "1")) || 1;

  if (
    !confirm(
      `Gia hạn quyền cho user "${user}" trong GPT "${product}" với thời hạn ${trialDays} ngày, ${slots} thiết bị?`
    )
  )
    return;

  try {
    // 🔗 Gọi API /renew
    const data = await fetchJSON(`${API_BASE}/renew`, {
      method: "POST",
      body: JSON.stringify({ product, user, trialDays, slots }),
    });

    // ✅ Hiển thị kết quả trong giao diện
    const infoText =
      `👤 User: ${data.user}\n` +
      `🔑 Mã mới: ${data.code}\n` +
      `⏱️ Thời hạn: ${data.trialDays} ngày\n` +
      `💻 Thiết bị: ${data.slots}\n` +
      `🌐 Gateway: ${data.gateway}`;

    const html = `
      <div class="alert alert-success">
        <h5>✅ Gia hạn thành công!</h5>
        <p><strong>👤 User:</strong> ${data.user}</p>
        <p><strong>🔑 Mã mới:</strong> ${data.code}</p>
        <p><strong>⏱️ Thời hạn:</strong> ${data.trialDays} ngày</p>
        <p><strong>💻 Thiết bị:</strong> ${data.slots}</p>
        <p><strong>🌐 Gateway:</strong> <a href="${data.gateway}" target="_blank">${data.gateway}</a></p>
        <button id="copyRenewInfo" class="btn btn-outline-primary btn-sm">📋 Sao chép</button>
      </div>
    `;
    showMessage(html, "light");

    // 📋 Nút Sao chép
    setTimeout(() => {
      document
        .getElementById("copyRenewInfo")
        ?.addEventListener("click", () => {
          navigator.clipboard.writeText(infoText).then(() => {
            alert("✅ Đã sao chép thông tin gia hạn!");
          });
        });
    }, 100);
  } catch (e) {
    showMessage("❌ Lỗi khi gia hạn user.", "danger");
  }
}



// ====== THEME TOGGLE ======
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("bg-dark");
  document.body.classList.toggle("text-white");
};

// ====== BIND EVENTS ======
document.getElementById("btnAddGPT").onclick = addGPT;
document.getElementById("btnDeleteGPT").onclick = deleteGPT;
document.getElementById("btnAddUser").onclick = addUser;
document.getElementById("btnDeleteUser").onclick = deleteUser;
document.getElementById("btnRenewUser").onclick = renewUser;

// ====== AUTO LOAD ======
loadProducts(); 


