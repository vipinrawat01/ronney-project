export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8081";
const TOKEN_KEY = "alliraa_admin_token";

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setAdminToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, formData, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let payload = body;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }
  return data;
}

export async function adminLogin(email, password) {
  const data = await request("/api/admin/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setAdminToken(data.token);
  return data;
}

export async function adminMe() {
  return request("/api/admin/me");
}

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  return request("/api/admin/upload", { method: "POST", formData: fd });
}

export async function listCategories(flat = true) {
  return request(`/api/admin/categories${flat ? "?flat=1" : ""}`);
}

export async function createCategory(body) {
  return request("/api/admin/categories", { method: "POST", body });
}

export async function updateCategory(id, body) {
  return request(`/api/admin/categories/${id}`, { method: "PUT", body });
}

export async function deleteCategory(id) {
  return request(`/api/admin/categories/${id}`, { method: "DELETE" });
}

export async function listProducts(params = {}) {
  const q = new URLSearchParams(params).toString();
  return request(`/api/admin/products${q ? `?${q}` : ""}`);
}

export async function getProduct(id) {
  return request(`/api/admin/products/${id}`);
}

export async function createProduct(body) {
  return request("/api/admin/products", { method: "POST", body });
}

export async function updateProduct(id, body) {
  return request(`/api/admin/products/${id}`, { method: "PUT", body });
}

export async function deleteProduct(id) {
  return request(`/api/admin/products/${id}`, { method: "DELETE" });
}

export async function getBranding() {
  return request("/api/admin/branding");
}

export async function updateBranding(body) {
  const data = await request("/api/admin/branding", { method: "PUT", body });
  try {
    localStorage.setItem("alliraa_branding_updated_at", String(Date.now()));
  } catch {
    /* ignore */
  }
  return data;
}
