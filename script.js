const API = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = null;
const output = document.getElementById("output");

window.onload = () => {
  if (!adminKey) adminKey = prompt("🔐 Nhập adminKey của bạn:");
  listProducts();
};

document.getElementById("addGPT").onclick = addGPT;
document.getElementById("delGPT").onclick = delGPT;
document.getElementById("addUser").onclick = addUser;
document.getElementById("delUser").onclick = delUser;

// === HIỂN THỊ DANH SÁCH GPT ===
async function listProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    if (!data.products || !data.products.length) {
      output.innerHTML = `<div class="alert alert-info">Chưa có GPT nào.</div>`;
      return;
    }
    let html = `<h5>Danh sách GPT hiện tại:</h5><table class="table table-striped">
      <thead><tr><th>#</th><th>ID</th><th>Tên</th><th>Gateway</th></tr></thead><tbody>`;
    data.products.forEach((p, i) => {
      html += `<tr><td>${i + 1}</td><td>${p.id}</td><td>${p.name}</td><td>${p.gateway || ""}</td></tr>`;
    });
    html += "</tbody></table>";
    output.innerHTML = html;
  } catch (err) {
    output.innerHTML = `<div class="alert alert-danger">Lỗi tải danh sách.</div>`;
  }
}

// === THÊM GPT ===
async function addGPT() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const id = prompt("Nhập ID GPT (chỉ gồm a-z0-9-):");
  if (!id || !/^[a-z0-9-]+$/.test(id)) return alert("❌ ID không hợp lệ.");
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("GPT URL (bắt đầu bằng https://):");
  if (!gptUrl.startsWith("https://")) return alert("❌ URL phải bắt đầu bằng https://");
  const gateway = prompt("Gateway (tuỳ chọn):");

  if (!confirm(`Xác nhận thêm GPT:\nID: ${id}\nTên: ${name}\nURL: ${gptUrl}`)) return;

  try {
    const res = await fetch(`${API}/createOrUpdateProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey, id, name, gptUrl, gateway })
    });
    const data = await res.json();
    if (res.status === 401) return alert("❌ adminKey sai, nhập lại."), adminKey = null;
    alert(data.message || "✅ Thêm GPT thành công!");
    listProducts();
  } catch (err) {
    alert("❌ Lỗi khi thêm GPT.");
  }
}

// === XOÁ GPT ===
async function delGPT() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const id = prompt("Nhập ID GPT cần xoá:");
  if (!id) return;
  if (!confirm(`Bạn có chắc muốn xoá GPT "${id}"?`)) return;

  try {
    const res = await fetch(`${API}/deleteProduct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey, id })
    });
    const data = await res.json();
    if (res.status === 401) return alert("❌ adminKey sai, nhập lại."), adminKey = null;
    if (res.status === 404) return alert("⚠️ Không tìm thấy GPT này.");
    alert(data.message || "✅ Đã xoá GPT thành công!");
    listProducts();
  } catch {
    alert("❌ Lỗi khi xoá GPT.");
  }
}

// === THÊM USER ===
async function addUser() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const product = prompt("Nhập ID GPT muốn thêm user vào:");
  const user = prompt("Nhập tên user:");
  if (!user) return;
  const activationCode = prompt("Mã kích hoạt (tuỳ chọn):");
  if (!confirm(`Xác nhận thêm user "${user}" vào GPT "${product}"?`)) return;

  try {
    const res = await fetch(`${API}/createUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey, product, user, activationCode })
    });
    const data = await res.json();
    if (res.status === 409) return alert("⚠️ User đã tồn tại, nhập tên khác.");
    if (res.status === 401) return alert("❌ adminKey sai, nhập lại."), adminKey = null;
    alert(data.message || "✅ Đã thêm user!");
  } catch {
    alert("❌ Lỗi khi thêm user.");
  }
}

// === XOÁ USER ===
async function delUser() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const product = prompt("Nhập ID GPT:");
  const user = prompt("Nhập tên user cần xoá:");
  if (!user) return;
  if (!confirm(`Bạn chắc chắn muốn xoá user "${user}" khỏi GPT "${product}"?`)) return;

  try {
    const res = await fetch(`${API}/deleteUser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey, product, user })
    });
    const data = await res.json();
    if (res.status === 404) return alert("⚠️ Không tìm thấy user hoặc GPT.");
    if (res.status === 401) return alert("❌ adminKey sai, nhập lại."), adminKey = null;
    alert(data.message || "✅ Đã xoá user!");
  } catch {
    alert("❌ Lỗi khi xoá user.");
  }
}

