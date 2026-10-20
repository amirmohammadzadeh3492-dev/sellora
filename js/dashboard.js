if (!isLoggedIn()) {
  window.location.href = "login.html";
}

const shopTitle = document.getElementById("shop-title");
const shopUrl = document.getElementById("shop-url");
const viewShopLink = document.getElementById("view-shop-link");
const productsList = document.getElementById("products-list");
const productsCount = document.getElementById("products-count");
const form = document.getElementById("product-form");
const errorBox = document.getElementById("error");
const addBtn = document.getElementById("add-btn");

let currentSlug = localStorage.getItem("sellora_shop_slug");

async function init() {
  try {
    const shop = await api.me();
    currentSlug = shop.slug;
    shopTitle.textContent = shop.name;
    shopUrl.textContent = `sellora.ir/${shop.slug}`;
    viewShopLink.href = `shop.html?slug=${shop.slug}`;
    await loadProducts();
  } catch (err) {
    clearToken();
    window.location.href = "login.html";
  }
}

async function loadProducts() {
  try {
    const products = await api.listProducts(currentSlug);
    renderProducts(products);
  } catch (err) {
    showError(err.message);
  }
}

function renderProducts(products) {
  productsCount.textContent = products.length;
  if (products.length === 0) {
    productsList.innerHTML = '<div class="empty">هنوز محصولی اضافه نکردی</div>';
    return;
  }
  productsList.innerHTML = products
    .map(
      (p) => `
    <div class="product-item">
      <img src="${p.image_url || "https://via.placeholder.com/64"}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/64?text=?'">
      <div class="info">
        <h4>${escapeHtml(p.name)}</h4>
        <div class="price">${formatPrice(p.price)} تومان</div>
        ${p.description ? `<div style="font-size:12px;color:var(--gray-500);margin-top:4px;">${escapeHtml(p.description.substring(0, 60))}${p.description.length > 60 ? "..." : ""}</div>` : ""}
      </div>
      <button class="btn btn-outline" style="padding:6px 12px;font-size:13px;" onclick="removeProduct(${p.id})">حذف</button>
    </div>
  `
    )
    .join("");
}

async function removeProduct(id) {
  if (!confirm("مطمئنی؟")) return;
  try {
    await api.deleteProduct(id);
    await loadProducts();
  } catch (err) {
    showError(err.message);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");
  addBtn.disabled = true;
  addBtn.textContent = "در حال ساخت عکس AI...";

  const name = document.getElementById("product-name").value.trim();
  const price = parseInt(document.getElementById("product-price").value, 10);
  const description = document.getElementById("product-desc").value.trim();

  if (!name || !price) {
    showError("اسم و قیمت رو پر کن");
    addBtn.disabled = false;
    addBtn.textContent = "افزودن محصول + عکس AI";
    return;
  }

  try {
    const product = await api.addProduct(currentSlug, {
      name,
      price,
      description,
    });
    if (!description) {
      api.autoDescription(currentSlug, product.id).then(() => loadProducts()).catch(() => {});
    }
    form.reset();
    await loadProducts();
  } catch (err) {
    showError(err.message);
  } finally {
    addBtn.disabled = false;
    addBtn.textContent = "افزودن محصول + عکس AI";
  }
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add("show");
}
function formatPrice(n) {
  return n.toLocaleString("fa-IR");
}
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

init();