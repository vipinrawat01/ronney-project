const API = "";
const TOKEN_KEY = "alliraa_admin_token";

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  categories: [],
  products: [],
  gallery: [],
  variants: [],
  fabrics: [],
  prints: [],
  branding: null,
  promoBanners: [],
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(`${API}${path}`, { ...options, headers });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const data = await api("/api/admin/upload", { method: "POST", body: fd });
  return data.url;
}

// --- Deferred upload helpers -------------------------------------------
// File inputs never upload on selection. Instead they attach a local
// object-URL preview and stash the raw File on the holder object under
// `_pendingFile`. Only when the enclosing form is actually submitted do we
// walk the collected state and upload any pending files to Cloudinary,
// replacing `_pendingFile` with the real hosted URL. If the user cancels
// the dialog, the File is simply discarded and nothing ever touches
// Cloudinary.

function setPendingFile(holder, file) {
  if (holder._previewUrl) URL.revokeObjectURL(holder._previewUrl);
  holder._pendingFile = file;
  holder._previewUrl = URL.createObjectURL(file);
  holder.image = holder._previewUrl;
}

function revokePreview(holder) {
  if (holder?._previewUrl) URL.revokeObjectURL(holder._previewUrl);
}

// Uploads any `_pendingFile` on the given item, replacing image/url field
// with the resulting Cloudinary URL. `field` is the property name holding
// the URL (default "image").
async function resolvePendingFile(item, field = "image") {
  if (!item?._pendingFile) return;
  const url = await uploadFile(item._pendingFile);
  revokePreview(item);
  item[field] = url;
  delete item._pendingFile;
  delete item._previewUrl;
}

// Resolves every pending file inside an array of items (fabrics, prints,
// gallery-style objects, etc).
async function resolvePendingFilesIn(items, field = "image") {
  for (const item of items) {
    await resolvePendingFile(item, field);
  }
}

function showLogin() {
  $("#login-view").classList.remove("hidden");
  $("#dashboard").classList.add("hidden");
}

function showDashboard() {
  $("#login-view").classList.add("hidden");
  $("#dashboard").classList.remove("hidden");
}

function setView(name) {
  $$(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === name));
  $("#view-categories").classList.toggle("hidden", name !== "categories");
  $("#view-products").classList.toggle("hidden", name !== "products");
  $("#view-branding").classList.toggle("hidden", name !== "branding");
  if (name === "branding") loadBranding().catch((err) => {
    $("#branding-status").textContent = err.message || "Failed to load branding";
  });
}

function money(cents, currency = "usd") {
  const n = (Number(cents) || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: (currency || "usd").toUpperCase() }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function syncColorPair(colorId, hexId) {
  const colorEl = $(colorId);
  const hexEl = $(hexId);
  if (!colorEl || !hexEl) return;
  colorEl.addEventListener("input", () => { hexEl.value = colorEl.value.toUpperCase(); });
  hexEl.addEventListener("input", () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hexEl.value)) colorEl.value = hexEl.value;
  });
}

function setColorPair(colorId, hexId, value) {
  const colorEl = $(colorId);
  const hexEl = $(hexId);
  if (!colorEl || !hexEl) return;
  const hex = (value || "#000000").toUpperCase();
  colorEl.value = hex;
  hexEl.value = hex;
}

function setPreview(imgId, url) {
  const img = imgId.startsWith("#") ? $(imgId) : $(`#${imgId}`);
  if (!img) return;
  if (url) {
    img.src = url;
    img.classList.remove("hidden");
  } else {
    img.removeAttribute("src");
    img.classList.add("hidden");
  }
}

function escapeAttr(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderPromoBanners() {
  const root = $("#promo-banners-editor");
  root.innerHTML = "";
  state.promoBanners.forEach((b, i) => {
    root.insertAdjacentHTML("beforeend", `
      <div class="promo-card" data-promo-index="${i}">
        <div class="promo-card-header">
          <strong>Banner ${i + 1}</strong>
          <button type="button" class="danger" data-remove-promo="${i}">Remove</button>
        </div>
        <div class="grid-2">
          <label>Badge<input data-promo-field="badge" data-i="${i}" value="${escapeAttr(b.badge)}" /></label>
          <label>Title<input data-promo-field="title" data-i="${i}" value="${escapeAttr(b.title)}" /></label>
          <label>Subtitle<input data-promo-field="sub" data-i="${i}" value="${escapeAttr(b.sub)}" /></label>
          <label>CTA text<input data-promo-field="cta" data-i="${i}" value="${escapeAttr(b.cta)}" /></label>
          <label>Link<input data-promo-field="link" data-i="${i}" value="${escapeAttr(b.link)}" /></label>
        </div>
        <div class="image-field">
          <label>Image URL<input data-promo-field="image" data-i="${i}" value="${escapeAttr(b.image)}" placeholder="https://…" /></label>
          <div class="image-row">
            ${b.image ? `<img src="${escapeAttr(b.image)}" class="thumb-lg" alt="" />` : ""}
            <input type="file" accept="image/*" data-promo-file="${i}" />
          </div>
        </div>
      </div>
    `);
  });
}

function collectPromoFromDOM() {
  $$("[data-promo-field]").forEach((el) => {
    const i = Number(el.dataset.i);
    const field = el.dataset.promoField;
    if (!state.promoBanners[i]) return;
    // Keep the local preview URL while a file is pending upload; the manual
    // "Image URL" text input only takes effect once no file is pending.
    if (field === "image" && state.promoBanners[i]._pendingFile) return;
    state.promoBanners[i][field] = el.value;
  });
}

function setVal(id, value) {
  const el = $(id);
  if (!el) return;
  el.value = value ?? "";
}

function fillBrandingForm(b) {
  const data = b || {};
  const colors = data.colors || {};
  const fonts = data.fonts || {};
  const hero = data.hero || {};
  const story = data.brand_story || {};

  state.branding = data;
  state.promoBanners = Array.isArray(data.promo_banners) ? data.promo_banners.map((x) => ({ ...x })) : [];

  setVal("#brand-store-name", data.store_name || "Alliraa Textile");
  setVal("#brand-logo-url", data.logo_url || "");
  setPreview("#brand-logo-preview", data.logo_url);

  setColorPair("#brand-color-primary", "#brand-color-primary-hex", colors.primary || "#B89043");
  setColorPair("#brand-color-secondary", "#brand-color-secondary-hex", colors.secondary || "#1A1A1A");
  setColorPair("#brand-color-background", "#brand-color-background-hex", colors.background || "#FAF8F5");
  setColorPair("#brand-color-foreground", "#brand-color-foreground-hex", colors.foreground || "#1F1F1F");

  setVal("#brand-font-heading", fonts.heading || "Playfair Display");
  setVal("#brand-font-body", fonts.body || "Manrope");
  setVal("#brand-font-accent", fonts.accent || "Cormorant Garamond");

  setVal("#brand-hero-image", hero.image_url || "");
  setVal("#brand-hero-image-url", hero.image_url || "");
  setPreview("#brand-hero-preview", hero.image_url);
  setVal("#brand-hero-badge", hero.badge || "");
  setVal("#brand-hero-title", hero.title || "");
  setVal("#brand-hero-subtitle", hero.subtitle || "");

  setVal("#brand-story-image", story.image_url || "");
  setVal("#brand-story-image-url", story.image_url || "");
  setPreview("#brand-story-preview", story.image_url);
  setVal("#brand-story-title", story.title || "");
  setVal("#brand-story-p1", story.paragraph_1 || "");
  setVal("#brand-story-p2", story.paragraph_2 || "");
  setVal("#brand-manifesto", data.manifesto || "");
  const showPromo = $("#brand-show-promo");
  const showStory = $("#brand-show-story");
  const showManifesto = $("#brand-show-manifesto");
  if (showPromo) showPromo.checked = data.show_promo_banners !== false;
  if (showStory) showStory.checked = data.show_brand_story !== false;
  if (showManifesto) showManifesto.checked = data.show_manifesto !== false;

  renderPromoBanners();
}

async function loadBranding() {
  const status = $("#branding-status");
  if (status) status.textContent = "Loading current branding…";
  const data = await api("/api/admin/branding");
  fillBrandingForm(data.branding || {});
  if (status) status.textContent = "";
}

function showBrandingToast(message, isError = false) {
  let toast = $("#branding-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "branding-toast";
    toast.className = "branding-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle("error", !!isError);
  toast.classList.add("show");
  clearTimeout(showBrandingToast._timer);
  showBrandingToast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function collectBrandingPayload() {
  collectPromoFromDOM();
  const heroUrlEl = $("#brand-hero-image-url");
  const heroHiddenEl = $("#brand-hero-image");
  const storyUrlEl = $("#brand-story-image-url");
  const storyHiddenEl = $("#brand-story-image");
  const heroImage = (heroUrlEl?.value || "").trim() || (heroHiddenEl?.value || "").trim();
  const storyImage = (storyUrlEl?.value || "").trim() || (storyHiddenEl?.value || "").trim();
  return {
    store_name: ($("#brand-store-name")?.value || "").trim(),
    logo_url: ($("#brand-logo-url")?.value || "").trim(),
    colors: {
      primary: ($("#brand-color-primary-hex")?.value || "").trim() || "#B89043",
      secondary: ($("#brand-color-secondary-hex")?.value || "").trim() || "#1A1A1A",
      background: ($("#brand-color-background-hex")?.value || "").trim() || "#FAF8F5",
      foreground: ($("#brand-color-foreground-hex")?.value || "").trim() || "#1F1F1F",
    },
    fonts: {
      heading: $("#brand-font-heading")?.value || "Playfair Display",
      body: $("#brand-font-body")?.value || "Manrope",
      accent: $("#brand-font-accent")?.value || "Cormorant Garamond",
    },
    hero: {
      image_url: heroImage,
      badge: ($("#brand-hero-badge")?.value || "").trim(),
      title: ($("#brand-hero-title")?.value || "").trim(),
      subtitle: ($("#brand-hero-subtitle")?.value || "").trim(),
    },
    promo_banners: state.promoBanners.map(({ _pendingFile, _previewUrl, ...b }) => b),
    brand_story: {
      image_url: storyImage,
      title: ($("#brand-story-title")?.value || "").trim(),
      paragraph_1: ($("#brand-story-p1")?.value || "").trim(),
      paragraph_2: ($("#brand-story-p2")?.value || "").trim(),
    },
    manifesto: ($("#brand-manifesto")?.value || "").trim(),
    show_promo_banners: !!$("#brand-show-promo")?.checked,
    show_brand_story: !!$("#brand-show-story")?.checked,
    show_manifesto: !!$("#brand-show-manifesto")?.checked,
  };
}

async function saveBranding() {
  const status = $("#branding-status");
  const btn = $("#save-branding-btn");
  if (btn) btn.disabled = true;
  try {
    if (status) status.textContent = "Uploading images…";
    if (state.brandLogoPending) {
      const url = await uploadFile(state.brandLogoPending);
      if (state.brandLogoPreviewUrl) URL.revokeObjectURL(state.brandLogoPreviewUrl);
      state.brandLogoPending = null;
      state.brandLogoPreviewUrl = null;
      $("#brand-logo-url").value = url;
    }
    if (state.brandHeroPending) {
      const url = await uploadFile(state.brandHeroPending);
      if (state.brandHeroPreviewUrl) URL.revokeObjectURL(state.brandHeroPreviewUrl);
      state.brandHeroPending = null;
      state.brandHeroPreviewUrl = null;
      $("#brand-hero-image").value = url;
      $("#brand-hero-image-url").value = url;
    }
    if (state.brandStoryPending) {
      const url = await uploadFile(state.brandStoryPending);
      if (state.brandStoryPreviewUrl) URL.revokeObjectURL(state.brandStoryPreviewUrl);
      state.brandStoryPending = null;
      state.brandStoryPreviewUrl = null;
      $("#brand-story-image").value = url;
      $("#brand-story-image-url").value = url;
    }
    await resolvePendingFilesIn(state.promoBanners);

    if (status) status.textContent = "Saving…";
    const data = await api("/api/admin/branding", { method: "PUT", body: collectBrandingPayload() });
    fillBrandingForm(data.branding || {});
    try {
      localStorage.setItem("alliraa_branding_updated_at", String(Date.now()));
    } catch {}
    if (status) status.textContent = "";
    showBrandingToast("Branding saved successfully");
  } catch (err) {
    if (status) status.textContent = err.message || "Save failed";
    showBrandingToast(err.message || "Save failed", true);
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function loadCategories() {
  const data = await api("/api/admin/categories?flat=1");
  state.categories = data.categories || [];
  renderCategories();
  fillCategorySelects();
}

async function loadProducts() {
  const data = await api("/api/admin/products?limit=100");
  state.products = data.products || [];
  renderProducts();
}

function fillCategorySelects() {
  const parentSel = $("#cat-parent");
  const prodSel = $("#prod-category");
  const currentParent = parentSel.value;
  const currentProd = prodSel.value;
  parentSel.innerHTML = `<option value="">None (top-level)</option>`;
  prodSel.innerHTML = `<option value="">Select…</option>`;
  for (const c of state.categories) {
    const label = c.parent_id
      ? `${c.type} / ${state.categories.find((p) => p.id === c.parent_id)?.name || "…"} / ${c.name}`
      : `${c.type} / ${c.name}`;
    parentSel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${label}</option>`);
    prodSel.insertAdjacentHTML("beforeend", `<option value="${c.id}">${label}</option>`);
  }
  parentSel.value = currentParent;
  prodSel.value = currentProd;
}

function renderCategories() {
  const roots = state.categories.filter((c) => !c.parent_id);
  const childrenOf = (id) => state.categories.filter((c) => c.parent_id === id);
  const list = $("#categories-list");
  if (!roots.length) {
    list.innerHTML = `<p class="muted">No categories yet. Add Men/Women and their subcategories.</p>`;
    return;
  }
  list.innerHTML = roots.map((c) => {
    const kids = childrenOf(c.id);
    return `
      <article class="cat-card">
        <img src="${c.image_url || placeholder()}" alt="" />
        <div>
          <h4>${escapeHtml(c.name)}</h4>
          <div class="cat-meta">${escapeHtml(c.type)} · /${escapeHtml(c.slug)} · ${c.is_active ? "active" : "inactive"}</div>
        </div>
        <div class="actions">
          <button class="ghost" data-edit-cat="${c.id}">Edit</button>
          <button class="danger" data-del-cat="${c.id}">Delete</button>
        </div>
        <div class="child-list">
          ${kids.map((k) => `
            <div class="child-card">
              <img src="${k.image_url || placeholder()}" alt="" />
              <div>
                <strong>${escapeHtml(k.name)}</strong>
                <div class="cat-meta">/${escapeHtml(k.slug)}</div>
              </div>
              <div class="actions">
                <button class="ghost" data-edit-cat="${k.id}">Edit</button>
                <button class="danger" data-del-cat="${k.id}">Delete</button>
              </div>
            </div>`).join("") || `<p class="muted">No subcategories</p>`}
        </div>
      </article>`;
  }).join("");
}

function renderProducts() {
  const wrap = $("#products-list");
  if (!state.products.length) {
    wrap.innerHTML = `<p class="muted" style="padding:24px">No products yet.</p>`;
    return;
  }
  wrap.innerHTML = `
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Product</th>
          <th>Category</th>
          <th>Variants</th>
          <th>Price</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${state.products.map((p) => `
          <tr>
            <td><img class="prod-thumb" src="${p.thumbnail || p.image || placeholder()}" alt="" /></td>
            <td>
              <strong>${escapeHtml(p.title || p.name || "")}</strong>
              <div class="cat-meta">${escapeHtml(p.status)} · /${escapeHtml(p.slug || "")}</div>
            </td>
            <td>${escapeHtml(p.category?.name || "—")}</td>
            <td>${(p.variants || []).length}</td>
            <td>${money(p.price_in_cents || 0, p.currency || "usd")}</td>
            <td class="actions">
              <button class="ghost" data-edit-prod="${p.id}">Edit</button>
              <button class="danger" data-del-prod="${p.id}">Delete</button>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}

function placeholder() {
  return "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="100%" height="100%" fill="#ebe4d8"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8b5a2b" font-family="sans-serif" font-size="12">Alliraa</text></svg>`);
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function openCategoryDialog(cat = null) {
  fillCategorySelects();
  $("#category-dialog-title").textContent = cat ? "Edit category" : "Add category";
  $("#cat-id").value = cat?.id || "";
  $("#cat-name").value = cat?.name || "";
  $("#cat-slug").value = cat?.slug || "";
  $("#cat-type").value = cat?.type || "women";
  $("#cat-parent").value = cat?.parent_id || "";
  $("#cat-description").value = cat?.description || "";
  $("#cat-sort").value = cat?.sort_order ?? 0;
  $("#cat-image-url").value = cat?.image_url || "";
  state.catImagePending = null;
  state.catImagePreviewUrl = null;
  const preview = $("#cat-image-preview");
  if (cat?.image_url) {
    preview.src = cat.image_url;
    preview.classList.remove("hidden");
  } else {
    preview.classList.add("hidden");
  }
  state.fabrics = Array.isArray(cat?.fabrics)
    ? cat.fabrics.map((f) => ({ id: f.id || "", name: f.name || "", image: f.image || "" }))
    : [];
  state.prints = Array.isArray(cat?.prints)
    ? cat.prints.map((p) => ({ id: p.id || "", name: p.name || "", image: p.image || "" }))
    : [];
  renderFabricsEditor();
  renderPrintsEditor();
  $("#category-dialog").showModal();
}

function slugifyLocal(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function renderFabricsEditor() {
  const root = $("#fabrics-editor");
  if (!root) return;
  if (!state.fabrics.length) {
    root.innerHTML = `<p class="muted">No fabrics yet. Add canvas, cotton, silk, etc. for this category.</p>`;
    return;
  }
  root.innerHTML = state.fabrics.map((f, i) => `
    <div class="fabric-card" data-fabric-index="${i}">
      <div class="fabric-preview">
        ${f.image ? `<img src="${escapeHtml(f.image)}" alt="" />` : `<div class="fabric-placeholder"></div>`}
        <input type="file" data-fabric-file="${i}" accept="image/*" />
      </div>
      <div class="fabric-fields">
        <label>Name<input data-f="name" value="${escapeHtml(f.name || "")}" placeholder="e.g. Canvas" /></label>
        <label>Image URL<input data-f="image" value="${escapeHtml(f.image || "")}" placeholder="https://…" /></label>
      </div>
      <button type="button" class="danger" data-remove-fabric="${i}">Remove</button>
    </div>`).join("");
}

function collectFabricsFromDOM() {
  $$("#fabrics-editor .fabric-card").forEach((card) => {
    const i = Number(card.dataset.fabricIndex);
    const get = (name) => card.querySelector(`[data-f="${name}"]`)?.value || "";
    const existing = state.fabrics[i] || {};
    const imageField = get("image").trim();
    state.fabrics[i] = {
      ...existing,
      name: get("name").trim(),
      // Keep the local preview URL while a file is pending upload; only the
      // manual "Image URL" text input can override it once no file is pending.
      image: existing._pendingFile ? existing.image : imageField,
      id: existing.id || "",
    };
  });
}

function renderPrintsEditor() {
  const root = $("#prints-editor");
  if (!root) return;
  if (!state.prints.length) {
    root.innerHTML = `<p class="muted">No prints yet. Add Solid, Floral, Geo, Stripe, etc.</p>`;
    return;
  }
  root.innerHTML = state.prints.map((p, i) => `
    <div class="fabric-card print-card" data-print-index="${i}">
      <div class="fabric-preview print-preview">
        ${p.image ? `<img src="${escapeHtml(p.image)}" alt="" />` : `<div class="fabric-placeholder print-placeholder">${escapeHtml(p.name || "Print")}</div>`}
        <input type="file" data-print-file="${i}" accept="image/*" />
      </div>
      <div class="fabric-fields">
        <label>Name<input data-p="name" value="${escapeHtml(p.name || "")}" placeholder="e.g. Solid" /></label>
        <label>Image URL<input data-p="image" value="${escapeHtml(p.image || "")}" placeholder="optional" /></label>
      </div>
      <button type="button" class="danger" data-remove-print="${i}">Remove</button>
    </div>`).join("");
}

function collectPrintsFromDOM() {
  $$("#prints-editor .print-card").forEach((card) => {
    const i = Number(card.dataset.printIndex);
    const get = (name) => card.querySelector(`[data-p="${name}"]`)?.value || "";
    const existing = state.prints[i] || {};
    const imageField = get("image").trim();
    state.prints[i] = {
      ...existing,
      name: get("name").trim(),
      image: existing._pendingFile ? existing.image : imageField,
      id: existing.id || "",
    };
  });
}

function renderGallery() {
  $("#prod-gallery").innerHTML = state.gallery.map((item, i) => `
    <div class="gallery-item">
      <img src="${item.image}" alt="" />
      <button type="button" data-remove-gallery="${i}">×</button>
    </div>`).join("");
}

function renderVariantsEditor() {
  const root = $("#variants-editor");
  if (!state.variants.length) {
    root.innerHTML = `<p class="muted">Add at least one variant (size/color/SKU) with its own image(s).</p>`;
    return;
  }
  root.innerHTML = state.variants.map((v, i) => `
    <div class="variant-card" data-variant-index="${i}">
      <div class="grid-3">
        <label>Title<input data-v="title" value="${escapeHtml(v.title || "")}" required /></label>
        <label>SKU<input data-v="sku" value="${escapeHtml(v.sku || "")}" /></label>
        <label>Currency<input data-v="currency" value="${escapeHtml(v.currency || "usd")}" /></label>
      </div>
      <div class="grid-3">
        <label>Price (cents)<input data-v="price_cents" type="number" value="${v.price_cents ?? 0}" /></label>
        <label>Sale price (cents)<input data-v="sale_price_cents" type="number" value="${v.sale_price_cents ?? ""}" /></label>
        <label>Stock<input data-v="inventory_quantity" type="number" value="${v.inventory_quantity ?? 0}" /></label>
      </div>
      <div class="image-field">
        <label>Variant images</label>
        <div class="gallery">
          ${(v.images || []).map((item, j) => `
            <div class="gallery-item">
              <img src="${item.image}" alt="" />
              <button type="button" data-remove-vimg="${i}:${j}">×</button>
            </div>`).join("")}
        </div>
        <input type="file" data-vimg-file="${i}" accept="image/*" multiple />
      </div>
      <div class="actions">
        <button type="button" class="danger" data-remove-variant="${i}">Remove variant</button>
      </div>
    </div>`).join("");
}

function collectVariantsFromDOM() {
  $$("#variants-editor .variant-card").forEach((card) => {
    const i = Number(card.dataset.variantIndex);
    const get = (name) => card.querySelector(`[data-v="${name}"]`)?.value;
    const sale = get("sale_price_cents");
    state.variants[i] = {
      ...state.variants[i],
      title: get("title") || "",
      sku: get("sku") || null,
      currency: get("currency") || "usd",
      price_cents: Number(get("price_cents") || 0),
      sale_price_cents: sale === "" || sale == null ? null : Number(sale),
      inventory_quantity: Number(get("inventory_quantity") || 0),
      manage_inventory: true,
      images: state.variants[i]?.images || [],
      image_url: (state.variants[i]?.images || [])[0] || null,
    };
  });
}

function openProductDialog(product = null) {
  fillCategorySelects();
  $("#product-dialog-title").textContent = product ? "Edit product" : "Add product";
  $("#prod-id").value = product?.id || "";
  $("#prod-title").value = product?.title || "";
  $("#prod-slug").value = product?.slug || "";
  $("#prod-subtitle").value = product?.subtitle || "";
  $("#prod-description").value = product?.description || "";
  $("#prod-category").value = product?.category_id || "";
  $("#prod-status").value = product?.status || "active";
  $("#prod-ribbon").value = product?.ribbon_text || "";
  $("#prod-thumbnail").value = product?.thumbnail || "";
  state.prodThumbPending = null;
  state.prodThumbPreviewUrl = null;
  const preview = $("#prod-thumb-preview");
  if (product?.thumbnail) {
    preview.src = product.thumbnail;
    preview.classList.remove("hidden");
  } else {
    preview.classList.add("hidden");
  }
  state.gallery = (product?.images || [])
    .map((img) => img.url || img)
    .filter(Boolean)
    .map((url) => ({ image: url }));
  state.variants = (product?.variants || []).map((v) => {
    const imgs = (v.images || []).map((img) => img.url || img).filter(Boolean);
    return {
      title: v.title,
      sku: v.sku,
      currency: v.currency || "usd",
      price_cents: v.price_cents ?? v.price_in_cents ?? 0,
      sale_price_cents: v.sale_price_cents ?? v.sale_price_in_cents ?? null,
      inventory_quantity: v.inventory_quantity ?? 0,
      manage_inventory: v.manage_inventory !== false,
      images: (imgs.length ? imgs : (v.image_url ? [v.image_url] : [])).map((url) => ({ image: url })),
      image_url: v.image_url || null,
    };
  });
  if (!state.variants.length) {
    state.variants = [{ title: "Default", sku: "", currency: "usd", price_cents: 0, sale_price_cents: null, inventory_quantity: 10, manage_inventory: true, images: [] }];
  }
  renderGallery();
  renderVariantsEditor();
  $("#product-dialog").showModal();
}

function bindEvents() {
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("#login-error").textContent = "";
    try {
      const data = await api("/api/admin/login", {
        method: "POST",
        body: { email: $("#login-email").value, password: $("#login-password").value },
      });
      state.token = data.token;
      localStorage.setItem(TOKEN_KEY, state.token);
      showDashboard();
      await Promise.all([loadCategories(), loadProducts(), loadBranding()]);
    } catch (err) {
      $("#login-error").textContent = err.message;
    }
  });

  $("#logout-btn").addEventListener("click", () => {
    state.token = "";
    localStorage.removeItem(TOKEN_KEY);
    showLogin();
  });

  $$(".nav-btn").forEach((btn) => btn.addEventListener("click", () => setView(btn.dataset.view)));

  syncColorPair("#brand-color-primary", "#brand-color-primary-hex");
  syncColorPair("#brand-color-secondary", "#brand-color-secondary-hex");
  syncColorPair("#brand-color-background", "#brand-color-background-hex");
  syncColorPair("#brand-color-foreground", "#brand-color-foreground-hex");

  $("#save-branding-btn").addEventListener("click", () => saveBranding());
  $("#add-promo-btn").addEventListener("click", () => {
    collectPromoFromDOM();
    state.promoBanners.push({ badge: "", title: "", sub: "", cta: "Shop Now", link: "/shop", image: "" });
    renderPromoBanners();
  });
  $("#promo-banners-editor").addEventListener("click", (e) => {
    if (e.target.dataset.removePromo != null) {
      collectPromoFromDOM();
      const idx = Number(e.target.dataset.removePromo);
      revokePreview(state.promoBanners[idx]);
      state.promoBanners.splice(idx, 1);
      renderPromoBanners();
    }
  });
  $("#promo-banners-editor").addEventListener("change", (e) => {
    if (e.target.dataset.promoFile != null) {
      const i = Number(e.target.dataset.promoFile);
      const file = e.target.files?.[0];
      if (!file) return;
      collectPromoFromDOM();
      setPendingFile(state.promoBanners[i], file);
      renderPromoBanners();
    }
  });
  $("#brand-logo-file").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.brandLogoPending = file;
    if (state.brandLogoPreviewUrl) URL.revokeObjectURL(state.brandLogoPreviewUrl);
    state.brandLogoPreviewUrl = URL.createObjectURL(file);
    $("#brand-logo-url").value = state.brandLogoPreviewUrl;
    setPreview("#brand-logo-preview", state.brandLogoPreviewUrl);
  });
  $("#brand-hero-file").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.brandHeroPending = file;
    if (state.brandHeroPreviewUrl) URL.revokeObjectURL(state.brandHeroPreviewUrl);
    state.brandHeroPreviewUrl = URL.createObjectURL(file);
    $("#brand-hero-image").value = state.brandHeroPreviewUrl;
    $("#brand-hero-image-url").value = state.brandHeroPreviewUrl;
    setPreview("#brand-hero-preview", state.brandHeroPreviewUrl);
  });
  $("#brand-story-file").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.brandStoryPending = file;
    if (state.brandStoryPreviewUrl) URL.revokeObjectURL(state.brandStoryPreviewUrl);
    state.brandStoryPreviewUrl = URL.createObjectURL(file);
    $("#brand-story-image").value = state.brandStoryPreviewUrl;
    $("#brand-story-image-url").value = state.brandStoryPreviewUrl;
    setPreview("#brand-story-preview", state.brandStoryPreviewUrl);
  });
  $("#brand-hero-image-url").addEventListener("input", (e) => {
    if (state.brandHeroPreviewUrl) URL.revokeObjectURL(state.brandHeroPreviewUrl);
    state.brandHeroPending = null;
    state.brandHeroPreviewUrl = null;
    $("#brand-hero-image").value = e.target.value;
    setPreview("#brand-hero-preview", e.target.value);
  });
  $("#brand-story-image-url").addEventListener("input", (e) => {
    if (state.brandStoryPreviewUrl) URL.revokeObjectURL(state.brandStoryPreviewUrl);
    state.brandStoryPending = null;
    state.brandStoryPreviewUrl = null;
    $("#brand-story-image").value = e.target.value;
    setPreview("#brand-story-preview", e.target.value);
  });
  $("#brand-logo-url").addEventListener("input", (e) => {
    if (state.brandLogoPreviewUrl) URL.revokeObjectURL(state.brandLogoPreviewUrl);
    state.brandLogoPending = null;
    state.brandLogoPreviewUrl = null;
    setPreview("#brand-logo-preview", e.target.value);
  });

  $("#add-category-btn").addEventListener("click", () => openCategoryDialog());
  $("#add-product-btn").addEventListener("click", () => openProductDialog());
  $("#cat-cancel").addEventListener("click", () => $("#category-dialog").close());
  $("#prod-cancel").addEventListener("click", () => $("#product-dialog").close());

  function discardCategoryPendingUploads() {
    if (state.catImagePreviewUrl) URL.revokeObjectURL(state.catImagePreviewUrl);
    state.catImagePending = null;
    state.catImagePreviewUrl = null;
    state.fabrics.forEach(revokePreview);
    state.prints.forEach(revokePreview);
  }
  $("#category-dialog").addEventListener("close", discardCategoryPendingUploads);

  function discardProductPendingUploads() {
    if (state.prodThumbPreviewUrl) URL.revokeObjectURL(state.prodThumbPreviewUrl);
    state.prodThumbPending = null;
    state.prodThumbPreviewUrl = null;
    state.gallery.forEach(revokePreview);
    state.variants.forEach((v) => (v.images || []).forEach(revokePreview));
  }
  $("#product-dialog").addEventListener("close", discardProductPendingUploads);

  $("#cat-image-file").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.catImagePending = file;
    const preview = $("#cat-image-preview");
    if (state.catImagePreviewUrl) URL.revokeObjectURL(state.catImagePreviewUrl);
    state.catImagePreviewUrl = URL.createObjectURL(file);
    $("#cat-image-url").value = state.catImagePreviewUrl;
    preview.src = state.catImagePreviewUrl;
    preview.classList.remove("hidden");
  });

  $("#category-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    collectFabricsFromDOM();
    collectPrintsFromDOM();
    const submitBtn = $("#category-form button[type=submit]");
    const status = $("#category-dialog-status");
    if (submitBtn) submitBtn.disabled = true;
    if (status) status.textContent = "Uploading images…";
    try {
      let categoryImageUrl = $("#cat-image-url").value || null;
      if (state.catImagePending) {
        categoryImageUrl = await uploadFile(state.catImagePending);
        if (state.catImagePreviewUrl) URL.revokeObjectURL(state.catImagePreviewUrl);
        state.catImagePending = null;
        state.catImagePreviewUrl = null;
      }
      await resolvePendingFilesIn(state.fabrics);
      await resolvePendingFilesIn(state.prints);

      const id = $("#cat-id").value;
      const fabrics = state.fabrics
        .map((f) => ({
          id: (f.id || slugifyLocal(f.name)).trim(),
          name: (f.name || "").trim(),
          image: (f.image || "").trim(),
        }))
        .filter((f) => f.name);
      const prints = state.prints
        .map((p) => ({
          id: (p.id || slugifyLocal(p.name)).trim(),
          name: (p.name || "").trim(),
          image: (p.image || "").trim(),
        }))
        .filter((p) => p.name);
      const body = {
        name: $("#cat-name").value.trim(),
        slug: $("#cat-slug").value.trim(),
        type: $("#cat-type").value,
        parent_id: $("#cat-parent").value ? Number($("#cat-parent").value) : null,
        description: $("#cat-description").value || null,
        sort_order: Number($("#cat-sort").value || 0),
        image_url: categoryImageUrl,
        fabrics,
        prints,
        is_active: true,
      };
      if (status) status.textContent = "Saving…";
      if (id) await api(`/api/admin/categories/${id}`, { method: "PUT", body });
      else await api("/api/admin/categories", { method: "POST", body });
      if (status) status.textContent = "";
      $("#category-dialog").close();
      await loadCategories();
    } catch (err) {
      if (status) status.textContent = err.message || "Save failed";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  $("#add-fabric-btn")?.addEventListener("click", () => {
    collectFabricsFromDOM();
    state.fabrics.push({ id: "", name: "", image: "" });
    renderFabricsEditor();
  });

  $("#add-print-btn")?.addEventListener("click", () => {
    collectPrintsFromDOM();
    state.prints.push({ id: "", name: "", image: "" });
    renderPrintsEditor();
  });

  $("#fabrics-editor")?.addEventListener("click", (e) => {
    const removeIdx = e.target.dataset.removeFabric;
    if (removeIdx == null) return;
    collectFabricsFromDOM();
    revokePreview(state.fabrics[Number(removeIdx)]);
    state.fabrics.splice(Number(removeIdx), 1);
    renderFabricsEditor();
  });

  $("#prints-editor")?.addEventListener("click", (e) => {
    const removeIdx = e.target.dataset.removePrint;
    if (removeIdx == null) return;
    collectPrintsFromDOM();
    revokePreview(state.prints[Number(removeIdx)]);
    state.prints.splice(Number(removeIdx), 1);
    renderPrintsEditor();
  });

  $("#fabrics-editor")?.addEventListener("change", (e) => {
    const fileInput = e.target.closest("[data-fabric-file]");
    if (!fileInput) return;
    const file = fileInput.files?.[0];
    if (!file) return;
    const i = Number(fileInput.dataset.fabricFile);
    collectFabricsFromDOM();
    setPendingFile(state.fabrics[i], file);
    renderFabricsEditor();
  });

  $("#prints-editor")?.addEventListener("change", (e) => {
    const fileInput = e.target.closest("[data-print-file]");
    if (!fileInput) return;
    const file = fileInput.files?.[0];
    if (!file) return;
    const i = Number(fileInput.dataset.printFile);
    collectPrintsFromDOM();
    setPendingFile(state.prints[i], file);
    renderPrintsEditor();
  });

  $("#fabrics-editor")?.addEventListener("input", (e) => {
    const card = e.target.closest(".fabric-card");
    if (!card || card.classList.contains("print-card")) return;
    const i = Number(card.dataset.fabricIndex);
    const field = e.target.getAttribute("data-f");
    if (!field) return;
    if (field === "image") {
      revokePreview(state.fabrics[i]);
      delete state.fabrics[i]?._pendingFile;
      delete state.fabrics[i]?._previewUrl;
    }
    state.fabrics[i] = { ...state.fabrics[i], [field]: e.target.value };
  });

  $("#prints-editor")?.addEventListener("input", (e) => {
    const card = e.target.closest(".print-card");
    if (!card) return;
    const i = Number(card.dataset.printIndex);
    const field = e.target.getAttribute("data-p");
    if (!field) return;
    if (field === "image") {
      revokePreview(state.prints[i]);
      delete state.prints[i]?._pendingFile;
      delete state.prints[i]?._previewUrl;
    }
    state.prints[i] = { ...state.prints[i], [field]: e.target.value };
  });

  $("#categories-list").addEventListener("click", async (e) => {
    const editId = e.target.dataset.editCat;
    const delId = e.target.dataset.delCat;
    if (editId) {
      const cat = state.categories.find((c) => String(c.id) === String(editId));
      openCategoryDialog(cat);
    }
    if (delId && confirm("Delete this category?")) {
      await api(`/api/admin/categories/${delId}`, { method: "DELETE" });
      await loadCategories();
    }
  });

  $("#prod-thumb-file").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.prodThumbPending = file;
    if (state.prodThumbPreviewUrl) URL.revokeObjectURL(state.prodThumbPreviewUrl);
    state.prodThumbPreviewUrl = URL.createObjectURL(file);
    $("#prod-thumbnail").value = state.prodThumbPreviewUrl;
    const preview = $("#prod-thumb-preview");
    preview.src = state.prodThumbPreviewUrl;
    preview.classList.remove("hidden");
  });

  $("#prod-gallery-file").addEventListener("change", (e) => {
    const files = [...(e.target.files || [])];
    for (const file of files) {
      const item = { image: "" };
      setPendingFile(item, file);
      state.gallery.push(item);
    }
    renderGallery();
    e.target.value = "";
  });

  $("#prod-gallery").addEventListener("click", (e) => {
    if (e.target.dataset.removeGallery != null) {
      const idx = Number(e.target.dataset.removeGallery);
      revokePreview(state.gallery[idx]);
      state.gallery.splice(idx, 1);
      renderGallery();
    }
  });

  $("#add-variant-btn").addEventListener("click", () => {
    collectVariantsFromDOM();
    state.variants.push({ title: "", sku: "", currency: "usd", price_cents: 0, sale_price_cents: null, inventory_quantity: 0, manage_inventory: true, images: [] });
    renderVariantsEditor();
  });

  $("#variants-editor").addEventListener("click", (e) => {
    if (e.target.dataset.removeVariant != null) {
      collectVariantsFromDOM();
      state.variants.splice(Number(e.target.dataset.removeVariant), 1);
      renderVariantsEditor();
    }
    if (e.target.dataset.removeVimg != null) {
      collectVariantsFromDOM();
      const [vi, ii] = e.target.dataset.removeVimg.split(":").map(Number);
      revokePreview(state.variants[vi].images[ii]);
      state.variants[vi].images.splice(ii, 1);
      renderVariantsEditor();
    }
  });

  $("#variants-editor").addEventListener("change", (e) => {
    if (e.target.dataset.vimgFile != null) {
      collectVariantsFromDOM();
      const i = Number(e.target.dataset.vimgFile);
      const files = [...(e.target.files || [])];
      state.variants[i].images = state.variants[i].images || [];
      for (const file of files) {
        const item = { image: "" };
        setPendingFile(item, file);
        state.variants[i].images.push(item);
      }
      renderVariantsEditor();
    }
  });

  $("#product-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    collectVariantsFromDOM();
    const submitBtn = $("#product-form button[type=submit]");
    const status = $("#product-dialog-status");
    if (submitBtn) submitBtn.disabled = true;
    if (status) status.textContent = "Uploading images…";
    try {
      let thumbnailUrl = $("#prod-thumbnail").value || null;
      if (state.prodThumbPending) {
        thumbnailUrl = await uploadFile(state.prodThumbPending);
        if (state.prodThumbPreviewUrl) URL.revokeObjectURL(state.prodThumbPreviewUrl);
        state.prodThumbPending = null;
        state.prodThumbPreviewUrl = null;
      }
      await resolvePendingFilesIn(state.gallery);
      for (const v of state.variants) {
        await resolvePendingFilesIn(v.images || []);
      }

      const id = $("#prod-id").value;
      const galleryUrls = state.gallery.map((g) => g.image).filter(Boolean);
      const body = {
        title: $("#prod-title").value.trim(),
        slug: $("#prod-slug").value.trim(),
        subtitle: $("#prod-subtitle").value || null,
        description: $("#prod-description").value || null,
        thumbnail: thumbnailUrl || galleryUrls[0] || null,
        category_id: $("#prod-category").value ? Number($("#prod-category").value) : null,
        ribbon_text: $("#prod-ribbon").value || null,
        status: $("#prod-status").value,
        purchasable: true,
        images: galleryUrls,
        variants: state.variants.filter((v) => v.title.trim()).map((v) => {
          const vImages = (v.images || []).map((im) => im.image).filter(Boolean);
          return { ...v, images: vImages, image_url: vImages[0] || null };
        }),
      };
      if (status) status.textContent = "Saving…";
      if (id) await api(`/api/admin/products/${id}`, { method: "PUT", body });
      else await api("/api/admin/products", { method: "POST", body });
      if (status) status.textContent = "";
      $("#product-dialog").close();
      await loadProducts();
    } catch (err) {
      if (status) status.textContent = err.message || "Save failed";
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  $("#products-list").addEventListener("click", async (e) => {
    const editId = e.target.dataset.editProd;
    const delId = e.target.dataset.delProd;
    if (editId) {
      const data = await api(`/api/admin/products/${editId}`);
      openProductDialog(data.product || data);
    }
    if (delId && confirm("Delete this product?")) {
      await api(`/api/admin/products/${delId}`, { method: "DELETE" });
      await loadProducts();
    }
  });
}

async function boot() {
  bindEvents();
  if (!state.token) {
    showLogin();
    return;
  }
  try {
    await api("/api/admin/me");
    showDashboard();
    await Promise.all([loadCategories(), loadProducts(), loadBranding()]);
  } catch {
    state.token = "";
    localStorage.removeItem(TOKEN_KEY);
    showLogin();
  }
}

boot();
