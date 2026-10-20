const form = document.getElementById("signup-form");
const errorBox = document.getElementById("error");
const submitBtn = document.getElementById("submit-btn");
const slugInput = document.getElementById("slug");
const slugPreview = document.getElementById("slug-preview");

slugInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
  slugPreview.textContent = e.target.value || "maryam";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.classList.remove("show");
  submitBtn.disabled = true;
  submitBtn.textContent = "در حال ساخت...";

  const name = document.getElementById("name").value.trim();
  const slug = slugInput.value.trim();
  const password = document.getElementById("password").value;

  if (!name || !slug || !password) {
    showError("همه فیلدها رو پر کن");
    return;
  }
  if (slug.length < 3) {
    showError("آدرس فروشگاه باید حداقل ۳ حرف باشه");
    return;
  }
  if (password.length < 6) {
    showError("رمز باید حداقل ۶ کاراکتر باشه");
    return;
  }

  try {
    const res = await api.signup(slug, name, password);
    setToken(res.access_token, res.shop_slug, res.shop_name);
    window.location.href = "dashboard.html";
  } catch (err) {
    showError(err.message);
    submitBtn.disabled = false;
    submitBtn.textContent = "ساخت فروشگاه";
  }
});

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.add("show");
  submitBtn.disabled = false;
  submitBtn.textContent = "ساخت فروشگاه";
}