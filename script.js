// =============================================
//  Gateway GPT Dashboard — giống 100% GPT gốc
//  API: https://gpt-gateway.lytobinh61.workers.dev
// =============================================
const API = "https://gpt-gateway.lytobinh61.workers.dev";
let adminKey = null;

// === Khởi động ===
window.onload = () => {
  if (!adminKey) adminKey = prompt("🔐 Nhập adminKey:");
  listProducts();
};

// === Xử lý nút ===
document.getElementById("addGPT").onclick = addGPT;
document.getElementById("delGPT").onclick = deleteGPT;
document.getElementById("addUser").onclick = addUser;
document.getElementById("delUser").onclick = deleteUser;

// === Hiển thị danh sách GPT ===
async function listProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    if (!data.products || !data.products.length)
      return (output.innerHTML = `<div class="alert alert-info">Chưa có GPT nào.</div>`);
    output.innerHTML = `
      <h5>Danh sách GPT:</h5>
      <table class="table table-bordered table-striped">
        <thead><tr><th>#</th><th>ID</th><th>Tên</th><th>Gateway</th></tr></thead>
        <tbody>${data.products
          .map(
            (p, i) =>
              `<tr><td>${i + 1}</td><td>${p.id}</td><td>${p.name}</td><td>${p.gateway || ""}</td></tr>`
          )
          .join("")}</tbody>
      </table>`;
  } catch (e) {
    output.innerHTML = `<div class="alert alert-danger">Lỗi tải danh sách GPT.</div>`;
  }
}

// === Thêm GPT ===
async function addGPT() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const id = prompt("Nhập ID GPT (chỉ gồm a-z0-9-):");
  if (!id || !/^[a-z0-9-]+$/.test(id)) return alert("❌ ID không hợp lệ!");
  const name = prompt("Tên hiển thị:");
  const gptUrl = prompt("Nhập GPT URL (bắt đầu bằng https://):");
  if (!gptUrl.startsWith("https://")) return alert("❌ URL không hợp lệ!");
  const gateway = prompt("Gateway (tùy chọn):");
  if (!confirm(`Xác nhận thêm GPT:\nID: ${id}\nTên: ${name}\nURL: ${gptUrl}`)) return;

  const res = await fetch(`${API}/product`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, id, name, gptUrl, gateway }),
  });

  if (res.status === 401) return (adminKey = null), alert("Sai adminKey!");
  const data = await res.json();
  alert(data.message || "✅ Thêm GPT thành công!");
  listProducts();
}

// === Xoá GPT ===
async function deleteGPT() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const res = await fetch(`${API}/products`);
  const data = await res.json();
  if (!data.products?.length) return alert("Không có GPT để xoá.");

  const list = data.products.map((p, i) => `${i + 1}) ${p.id} — ${p.name}`).join("\n");
  const choice = prompt(`Chọn GPT muốn xoá:\n${list}`);
  const product =
    data.products[(Number(choice) || 0) - 1] || data.products.find((p) => p.id === choice);
  if (!product) return alert("Không tìm thấy GPT.");
  if (!confirm(`Bạn có chắc muốn xoá GPT "${product.id}"?`)) return;

  const del = await fetch(`${API}/product`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, id: product.id }),
  });

  if (del.status === 401) return (adminKey = null), alert("Sai adminKey!");
  const msg = await del.json();
  alert(msg.message || `✅ Đã xoá ${product.id} thành công.`);
  listProducts();
}

// === Thêm User ===
async function addUser() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");

  // 1️⃣ chọn GPT
  const prods = await (await fetch(`${API}/products`)).json();
  const list = prods.products.map((p, i) => `${i + 1}) ${p.id} — ${p.name}`).join("\n");
  const pick = prompt(`Chọn GPT:\n${list}`);
  const product =
    prods.products[(Number(pick) || 0) - 1] || prods.products.find((p) => p.id === pick);
  if (!product) return alert("Không tìm thấy GPT.");

  // 2️⃣ nhập thông tin user
  const user = prompt("Nhập tên user:");
  if (!user) return;
  const activationCode = prompt("Mã kích hoạt (tuỳ chọn):");
  if (!confirm(`Thêm user "${user}" vào GPT "${product.id}"?`)) return;

  // 3️⃣ tạo user
  const res = await fetch(`${API}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, product: product.id, user, activationCode }),
  });
  if (res.status === 409) return alert("⚠️ User đã tồn tại!");
  if (res.status === 401) return (adminKey = null), alert("Sai adminKey!");
  const data = await res.json();
  if (!data.success) return alert("❌ Lỗi khi thêm user!");

  // 4️⃣ renew để tạo mã + hạn dùng
  const renewRes = await fetch(`${API}/renew`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product: product.id, user }),
  });
  const renewData = await renewRes.json();
  if (renewRes.status === 404) return alert("❌ Không tìm thấy user!");
  if (renewRes.status === 200 && renewData.success) {
    alert(
      `✅ Đã tạo user ${user}\nMã kích hoạt: ${renewData.code}\nHạn dùng: ${renewData.trialDays} ngày\nThiết bị: ${renewData.slots}`
    );
  } else {
    alert("⚠️ User đã tạo nhưng chưa có mã kích hoạt.");
  }
}

// === Xoá User ===
async function deleteUser() {
  if (!adminKey) adminKey = prompt("Nhập adminKey:");
  const products = await (await fetch(`${API}/products`)).json();
  const list = products.products.map((p, i) => `${i + 1}) ${p.id}`).join("\n");
  const pick = prompt(`Chọn GPT:\n${list}`);
  const product =
    products.products[(Number(pick) || 0) - 1] || products.products.find((p) => p.id === pick);
  if (!product) return alert("Không tìm thấy GPT.");

  const users = await (await fetch(`${API}/users?product=${product.id}`)).json();
  const ul = users.users.map((u) => `${u.index}) ${u.user}`).join("\n");
  const choice = prompt(`Chọn user muốn xoá:\n${ul}`);
  const user = users.users.find((u) => u.index == choice)?.user || choice;
  if (!confirm(`Xác nhận xoá user "${user}" khỏi GPT "${product.id}"?`)) return;

  const res = await fetch(`${API}/user`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminKey, product: product.id, user }),
  });
  if (res.status === 401) return (adminKey = null), alert("Sai adminKey!");
  if (res.status === 404) return alert("⚠️ Không tìm thấy user!");
  alert("✅ Đã xoá user thành công!");
}
