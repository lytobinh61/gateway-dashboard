const API_BASE = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = localStorage.getItem("adminKey") || "";

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
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
  const sel = prompt("Chọn GPT (số hoặc id):");
  const product = isNaN(sel) ? sel : products[parseInt(sel) - 1]?.id;
  const user = prompt("Nhập tên user:");
  const activationCode = prompt("Nhập mã kích hoạt (tuỳ chọn):") || null;
  if (!product || !user) return;
  if (!confirm(`Thêm user "${user}" cho GPT "${product}"?`)) return;
  try {
    await fetchJSON(`${API_BASE}/user`, {
      method: "POST",
      body: JSON.stringify({ adminKey, product, user, activationCode }),
    });
    alert(`✅ Đã thêm user: ${user}`);
  } catch (e) {
    alert("❌ Lỗi khi thêm user.");
  }
}

// ====== DELETE USER ======
async function deleteUser() {
  await ensureAdminKey();
  const products = await loadProducts();
  if (!products.length) return;
  const sel = prompt("Chọn GPT (số hoặc id):");
  const product = isNaN(sel) ? sel : products[parseInt(sel) - 1]?.id;
  if (!product) return;
  const users = await fetchJSON(`${API_BASE}/users?product=${product}`);
  if (!users.users?.length) return alert("Không có user nào.");
  const selUser = prompt(
    "Chọn user cần xoá:\n" +
      users.users.map((u, i) => `${i + 1}) ${u.user}`).join("\n")
  );
  const user = isNaN(selUser) ? selUser : users.users[parseInt(selUser) - 1]?.user;
  if (!user) return;
  if (!confirm(`Xoá user "${user}" khỏi GPT "${product}"?`)) return;
  try {
    await fetchJSON(`${API_BASE}/user`, {
      method: "DELETE",
      body: JSON.stringify({ adminKey, product, user }),
    });
    alert(`✅ Đã xoá user: ${user}`);
  } catch (e) {
    alert("❌ Lỗi xoá user.");
  }
}

// ====== RENEW USER ======
async function renewUser() {
  await ensureAdminKey();
  const products = await loadProducts();
  if (!products.length) return;
  const sel = prompt("Chọn GPT (số hoặc id):");
  const product = isNaN(sel) ? sel : products[parseInt(sel) - 1]?.id;
  if (!product) return;
  const users = await fetchJSON(`${API_BASE}/users?product=${product}`);
  if (!users.users?.length) return alert("Không có user nào.");
  const selUser = prompt(
    "Chọn user cần gia hạn:\n" +
      users.users.map((u, i) => `${i + 1}) ${u.user}`).join("\n")
  );
  const user = isNaN(selUser) ? selUser : users.users[parseInt(selUser) - 1]?.user;
  if (!user) return;
  if (!confirm(`Gia hạn cho user "${user}" trong GPT "${product}"?`)) return;
  try {
    const data = await fetchJSON(`${API_BASE}/renew`, {
      method: "POST",
      body: JSON.stringify({ product, user }),
    });
    alert(`✅ Gia hạn thành công cho ${user}\n\nMã: ${data.code}\nThời hạn: ${data.trialDays} ngày\nThiết bị: ${data.slots}\nGateway: ${data.gateway}`);
  } catch (e) {
    alert("❌ Lỗi khi gia hạn user.");
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
