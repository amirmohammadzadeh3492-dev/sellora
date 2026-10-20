const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");

if (!slug) {
  document.getElementById("products-grid").innerHTML =
    '<div class="empty" style="grid-column: 1 / -1;">فروشگاهی پیدا نشد</div>';
} else {
  init();
}

async function init() {
  try {
    const shop = await api.getShop(slug);
    document.getElementById("shop-name").textContent = shop.name;
    document.getElementById("shop-url").textContent = `sellora.ir/${shop.slug}`;
    document.title = `${shop.name} — Sellora`;

    const products = await api.listProducts(slug);
    renderProducts(products);
  } catch (err) {
    document.getElementById("products-grid").innerHTML =
      `<div class="empty" style="grid-column: 1 / -1;">${err.message}</div>`;
  }
}

function renderProducts(products) {
  const grid = document.getElementById("products-grid");

  if (products.length === 0) {
    grid.innerHTML = '<div class="empty" style="grid-column: 1 / -1;">هنوز محصولی اضافه نشده</div>';
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <div class="product-card">
      <img src="${p.image_url || "https://via.placeholder.com/400"}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400?text=?'">
      <div class="body">
        <h3>${escapeHtml(p.name)}</h3>
        <div class="desc">${escapeHtml(p.description || "")}</div>
        <div class="price">${formatPrice(p.price)} تومان</div>
      </div>
    </div>
  `
    )
    .join("");
}

function formatPrice(n) {
  return n.toLocaleString("fa-IR");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}