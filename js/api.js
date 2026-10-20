const API_BASE = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("sellora_token");
}

function setToken(token, slug, name) {
  localStorage.setItem("sellora_token", token);
  localStorage.setItem("sellora_shop_slug", slug);
  localStorage.setItem("sellora_shop_name", name);
}

function clearToken() {
  localStorage.removeItem("sellora_token");
  localStorage.removeItem("sellora_shop_slug");
  localStorage.removeItem("sellora_shop_name");
}

function isLoggedIn() {
  return !!getToken();
}
async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (options.auth) {
    const token = getToken();
    if (!token) throw new Error("لطفاً وارد شوید");
    headers["Authorization"] = `Bearer ${token}`;
    delete options.auth;
  }

  const res = await fetch(`${API_BASE}${path}`, { headers, ...options });
  if (!res.ok) {
    let detail = "خطا در ارتباط با سرور";
    try {
      const err = await res.json();
      if (typeof err.detail === "string") {
        detail = err.detail;
      } else if (Array.isArray(err.detail)) {
        detail = err.detail.map((e) => e.msg || JSON.stringify(e)).join("؛ ");
      } else if (err.detail) {
        detail = JSON.stringify(err.detail);
      }
    } catch (_) {}
    if (res.status === 401) {
      clearToken();
    }
    throw new Error(detail);
  }
  return res.json();
}

const api = {
  signup: (slug, name, password) =>
    apiRequest("/shops", {
      method: "POST",
      body: JSON.stringify({ slug, name, password }),
    }),

  login: (slug, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ slug, password }),
    }),

  me: () => apiRequest("/auth/me", { auth: true }),

  getShop: (slug) => apiRequest(`/shops/${slug}`),

  listProducts: (slug) => apiRequest(`/shops/${slug}/products`),

  addProduct: (slug, data) =>
    apiRequest(`/shops/${slug}/products`, {
      method: "POST",
      body: JSON.stringify(data),
      auth: true,
    }),

  deleteProduct: (productId) =>
    apiRequest(`/products/${productId}`, { method: "DELETE", auth: true }),

  autoDescription: (slug, productId) =>
    apiRequest(`/shops/${slug}/products/${productId}/description`, {
      method: "POST",
      auth: true,
    }),

  generateFaq: (slug, productName, productDescription) =>
    apiRequest(`/shops/${slug}/generate-faq`, {
      method: "POST",
      body: JSON.stringify({
        product_name: productName,
        product_description: productDescription,
      }),
      auth: true,
    }),

  chat: (slug, message) =>
    apiRequest(`/shops/${slug}/chat`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
};