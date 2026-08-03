const adminState = {
  products: [...PRODUCTS],
  session: null,
  editingId: null,
  ready: false
};

const adminElements = {
  status: document.getElementById("adminStatus"),
  login: document.getElementById("adminLogin"),
  loginForm: document.getElementById("loginForm"),
  logoutButton: document.getElementById("logoutButton"),
  summaryGrid: document.getElementById("summaryGrid"),
  productRows: document.getElementById("productRows"),
  addProduct: document.getElementById("addProduct"),
  importLocalProducts: document.getElementById("importLocalProducts"),
  productForm: document.getElementById("productForm"),
  cancelProduct: document.getElementById("cancelProduct")
};

const editableCategories = CATEGORIES.filter((category) => !["Todos", "Ofertas", "Mais Vendidos"].includes(category));

function adminMoney(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value || 0));
}

function setAdminStatus(message, tone = "info") {
  adminElements.status.textContent = message;
  adminElements.status.dataset.tone = tone;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slugify(value) {
  return String(value || "produto")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || `produto-${Date.now()}`;
}

function parseJsonField(value, fallback) {
  if (!value.trim()) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error("O campo JSON das opções de peso/tamanho está inválido.");
  }
}

function adminPriceLabel(product) {
  if (product.pricingType === "perKg") return `${adminMoney(product.price)}/kg`;
  if (product.pricingType === "variable") return "A confirmar";
  return adminMoney(product.price);
}

function renderSummary() {
  const active = adminState.products.filter((product) => product.inStock).length;
  const categories = new Set(adminState.products.map((product) => product.category)).size;
  const offers = adminState.products.filter((product) => product.oldPrice || product.featured).length;
  const images = adminState.products.filter((product) => product.image).length;
  const summary = [
    ["Produtos ativos", active],
    ["Categorias", categories],
    ["Ofertas/destaques", offers],
    ["Com imagem", images]
  ];

  adminElements.summaryGrid.innerHTML = summary.map(([label, value]) => `
    <article class="summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderRows() {
  adminElements.productRows.innerHTML = adminState.products.map((product) => `
    <tr>
      <td><strong>${escapeHtml(product.name)}</strong><br><small>${escapeHtml(product.unit || product.id)}</small></td>
      <td>${escapeHtml(product.category)}</td>
      <td>${adminPriceLabel(product)}</td>
      <td><span class="${product.inStock ? "stock-ok" : "stock-out"}">${product.inStock ? "Disponível" : "Indisponível"}</span>${product.stock ? `<br><small>${product.stock} em estoque</small>` : ""}</td>
      <td>${product.featured ? "Sim" : "Não"}</td>
      <td>${product.image ? `<img class="admin-product-thumb" src="${escapeHtml(product.image)}" alt="">` : "<small>Sem imagem</small>"}</td>
      <td>
        <button class="small-button" type="button" data-edit="${escapeHtml(product.id)}">Editar</button>
        <button class="small-button muted" type="button" data-hide="${escapeHtml(product.id)}">${product.isActive === false ? "Reativar" : "Ocultar"}</button>
      </td>
    </tr>
  `).join("");
}

function renderAdmin() {
  renderSummary();
  renderRows();
}

function setFormMode(isOpen) {
  adminElements.productForm.hidden = !isOpen;
  if (isOpen) adminElements.productForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  adminState.editingId = null;
  adminElements.productForm.reset();
  adminElements.productForm.elements.id.value = "";
  adminElements.productForm.elements.inStock.checked = true;
  adminElements.productForm.elements.isActive.checked = true;
  adminElements.productForm.elements.weightOptions.value = "";
}

function fillForm(product) {
  adminState.editingId = product.id;
  const form = adminElements.productForm.elements;
  form.id.value = product.id;
  form.name.value = product.name || "";
  form.category.value = product.category || "Mercearia";
  form.price.value = product.price ?? 0;
  form.oldPrice.value = product.oldPrice ?? "";
  form.unit.value = product.unit || "";
  form.pricingType.value = product.pricingType || "";
  form.badge.value = product.badge || "";
  form.stock.value = product.stock || 0;
  form.description.value = product.description || "";
  form.image.value = product.image || "";
  form.weightOptions.value = product.weightOptions?.length ? JSON.stringify(product.weightOptions, null, 2) : "";
  form.inStock.checked = Boolean(product.inStock);
  form.featured.checked = Boolean(product.featured);
  form.bestSeller.checked = Boolean(product.bestSeller);
  form.isActive.checked = product.isActive !== false;
}

function productFromForm(imageUrl) {
  const form = adminElements.productForm.elements;
  const name = form.name.value.trim();
  if (!name) throw new Error("Informe o nome do produto.");
  return {
    id: form.id.value || slugify(name),
    name,
    category: form.category.value,
    description: form.description.value.trim(),
    price: Number(form.price.value || 0),
    oldPrice: toNumberOrNull(form.oldPrice.value),
    unit: form.unit.value.trim(),
    pricingType: form.pricingType.value,
    badge: form.badge.value.trim(),
    stock: Number(form.stock.value || 0),
    image: imageUrl || form.image.value.trim(),
    weightOptions: parseJsonField(form.weightOptions.value, []),
    inStock: form.inStock.checked,
    featured: form.featured.checked,
    bestSeller: form.bestSeller.checked,
    isActive: form.isActive.checked
  };
}

async function uploadProductImage(productId) {
  const fileInput = adminElements.productForm.elements.imageFile;
  const file = fileInput.files?.[0];
  if (!file) return "";
  const client = angusSupabase();
  if (!client) throw new Error("Supabase não está configurado para upload de imagens.");
  const bucket = supabaseConfig().productBucket || "product-images";
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${productId}/${Date.now()}.${extension}`;
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true
  });
  if (error) throw error;
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function saveProduct(event) {
  event.preventDefault();
  if (!adminState.ready) {
    setAdminStatus("Configure o Supabase antes de salvar alterações reais.", "warning");
    return;
  }
  try {
    setAdminStatus("Salvando produto...", "info");
    const draft = productFromForm("");
    const imageUrl = await uploadProductImage(draft.id);
    const product = productFromForm(imageUrl);
    const client = angusSupabase();
    const { error } = await client.from("products").upsert(productToSupabaseRow(product));
    if (error) throw error;
    await loadAdminProducts();
    resetForm();
    setFormMode(false);
    setAdminStatus("Produto salvo no Supabase.", "success");
  } catch (error) {
    setAdminStatus(error.message || "Erro ao salvar produto.", "error");
  }
}

async function toggleProductVisibility(productId) {
  if (!adminState.ready) {
    setAdminStatus("Configure o Supabase antes de ocultar ou reativar produtos.", "warning");
    return;
  }
  const product = adminState.products.find((item) => item.id === productId);
  if (!product) return;
  const nextActive = product.isActive === false;
  const { error } = await angusSupabase().from("products").update({ is_active: nextActive }).eq("id", productId);
  if (error) {
    setAdminStatus(error.message, "error");
    return;
  }
  await loadAdminProducts();
  setAdminStatus(nextActive ? "Produto reativado." : "Produto ocultado da loja.", "success");
}

async function importLocalProducts() {
  if (!adminState.ready) {
    setAdminStatus("Entre no painel conectado ao Supabase antes de importar o catálogo.", "warning");
    return;
  }
  if (!confirm("Importar o catálogo atual para o Supabase? Produtos com o mesmo ID serão atualizados.")) return;
  try {
    setAdminStatus("Importando catálogo atual...", "info");
    const rows = PRODUCTS.map(productToSupabaseRow);
    const { error } = await angusSupabase().from("products").upsert(rows);
    if (error) throw error;
    await loadAdminProducts();
    setAdminStatus("Catálogo importado para o Supabase.", "success");
  } catch (error) {
    setAdminStatus(error.message || "Erro ao importar catálogo.", "error");
  }
}

async function loadAdminProducts() {
  if (!isSupabaseConfigured()) {
    adminState.products = [...PRODUCTS];
    adminState.ready = false;
    renderAdmin();
    setAdminStatus("Supabase ainda não configurado. O painel está em modo preview e não salva alterações.", "warning");
    adminElements.login.hidden = true;
    return;
  }

  const client = angusSupabase();
  const { data: sessionData } = await client.auth.getSession();
  adminState.session = sessionData.session;
  adminElements.logoutButton.hidden = !adminState.session;
  adminElements.login.hidden = Boolean(adminState.session);

  if (!adminState.session) {
    adminState.products = [...PRODUCTS];
    adminState.ready = false;
    renderAdmin();
    setAdminStatus("Entre para gerir produtos e imagens no Supabase.", "info");
    return;
  }

  adminState.products = await loadSupabaseProducts({ includeInactive: true });
  adminState.ready = true;
  renderAdmin();
  setAdminStatus("Painel conectado ao Supabase.", "success");
}

function populateCategorySelect() {
  const select = adminElements.productForm.elements.category;
  select.innerHTML = editableCategories.map((category) => `<option value="${category}">${category}</option>`).join("");
}

function setupAdminEvents() {
  adminElements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(adminElements.loginForm);
    const client = angusSupabase();
    if (!client) return;
    setAdminStatus("Entrando...", "info");
    const { error } = await client.auth.signInWithPassword({
      email: formData.get("email"),
      password: formData.get("password")
    });
    if (error) {
      setAdminStatus(error.message, "error");
      return;
    }
    adminElements.loginForm.reset();
    await loadAdminProducts();
  });

  adminElements.logoutButton.addEventListener("click", async () => {
    await angusSupabase()?.auth.signOut();
    resetForm();
    setFormMode(false);
    await loadAdminProducts();
  });

  adminElements.addProduct.addEventListener("click", () => {
    resetForm();
    setFormMode(true);
  });

  adminElements.importLocalProducts.addEventListener("click", importLocalProducts);

  adminElements.cancelProduct.addEventListener("click", () => {
    resetForm();
    setFormMode(false);
  });

  adminElements.productForm.addEventListener("submit", saveProduct);

  adminElements.productRows.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit]");
    const hideButton = event.target.closest("[data-hide]");
    if (editButton) {
      const product = adminState.products.find((item) => item.id === editButton.dataset.edit);
      if (product) {
        fillForm(product);
        setFormMode(true);
      }
    }
    if (hideButton) {
      await toggleProductVisibility(hideButton.dataset.hide);
    }
  });
}

populateCategorySelect();
setupAdminEvents();
loadAdminProducts();
