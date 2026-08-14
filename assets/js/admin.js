const adminState = {
  products: [],
  orders: [],
  session: null,
  editingId: null,
  ready: false,
  productFilters: {
    name: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    stock: "",
    highlight: "",
    image: ""
  },
  orderFilters: {
    reference: "",
    customer: "",
    fulfilment: "",
    items: "",
    minTotal: "",
    maxTotal: "",
    dateFrom: "",
    dateTo: "",
    status: "",
    payment: "",
    notes: ""
  }
};

const adminElements = {
  status: document.getElementById("adminStatus"),
  login: document.getElementById("adminLogin"),
  loginForm: document.getElementById("loginForm"),
  logoutButton: document.getElementById("logoutButton"),
  workspace: document.getElementById("adminWorkspace"),
  summaryGrid: document.getElementById("summaryGrid"),
  productRows: document.getElementById("productRows"),
  productFilters: document.getElementById("productFilters"),
  clearProductFilters: document.getElementById("clearProductFilters"),
  addProduct: document.getElementById("addProduct"),
  importLocalProducts: document.getElementById("importLocalProducts"),
  productForm: document.getElementById("productForm"),
  cancelProduct: document.getElementById("cancelProduct"),
  ordersSection: document.getElementById("ordersSection"),
  orderRows: document.getElementById("orderRows"),
  orderFilters: document.getElementById("orderFilters"),
  clearOrderFilters: document.getElementById("clearOrderFilters"),
  refreshOrders: document.getElementById("refreshOrders")
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
  if (!adminState.ready) {
    adminElements.summaryGrid.innerHTML = "";
    return;
  }
  const active = adminState.products.filter((product) => product.inStock).length;
  const categories = new Set(adminState.products.map((product) => product.category)).size;
  const offers = adminState.products.filter((product) => Number(product.oldPrice) > Number(product.price)).length;
  const images = adminState.products.filter((product) => product.image).length;
  const pendingOrders = adminState.orders.filter((order) => order.status === "pending_whatsapp_confirmation").length;
  const summary = [
    ["Produtos ativos", active],
    ["Categorias", categories],
    ["Ofertas/destaques", offers],
    ["Com imagem", images],
    ["Pedidos aguardando", pendingOrders]
  ];

  adminElements.summaryGrid.innerHTML = summary.map(([label, value]) => `
    <article class="summary-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderRows() {
  if (!adminState.ready) {
    adminElements.productRows.innerHTML = "";
    return;
  }
  const products = filteredProducts();
  if (!products.length) {
    const message = adminState.products.length
      ? "Nenhum produto corresponde aos filtros selecionados."
      : "Nenhum produto encontrado. Importe o catálogo atual ou adicione o primeiro produto.";
    adminElements.productRows.innerHTML = `<tr><td colspan="7" class="admin-empty-row">${message}</td></tr>`;
    return;
  }
  adminElements.productRows.innerHTML = products.map((product) => `
    <tr>
      <td data-label="Produto"><strong>${escapeHtml(product.name)}</strong><br><small>${escapeHtml(product.unit || product.id)}</small></td>
      <td data-label="Categoria">${escapeHtml(product.category)}</td>
      <td data-label="Preço">${adminPriceLabel(product)}</td>
      <td data-label="Estoque"><span class="${product.inStock ? "stock-ok" : "stock-out"}">${product.inStock ? "Disponível" : "Indisponível"}</span>${product.stock ? `<br><small>${product.stock} em estoque</small>` : ""}</td>
      <td data-label="Destaque">${Number(product.oldPrice) > Number(product.price) ? "Oferta" : (product.featured ? "Destaque" : "-")}</td>
      <td data-label="Imagem">${product.image ? `<img class="admin-product-thumb" src="${escapeHtml(product.image)}" alt="">` : "<small>Sem imagem</small>"}</td>
      <td data-label="Ações">
        <div class="admin-row-actions">
          <button class="small-button" type="button" data-edit="${escapeHtml(product.id)}">Editar</button>
          <button class="small-button muted" type="button" data-hide="${escapeHtml(product.id)}">${product.isActive === false ? "Reativar" : "Ocultar"}</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filteredProducts() {
  const filters = adminState.productFilters;
  const name = filters.name.trim().toLocaleLowerCase("pt-BR");
  const minPrice = filters.minPrice === "" ? null : Number(filters.minPrice);
  const maxPrice = filters.maxPrice === "" ? null : Number(filters.maxPrice);
  return adminState.products.filter((product) => {
    const isOffer = Number(product.oldPrice) > Number(product.price);
    const hasHighlight = isOffer || product.featured || product.bestSeller;
    if (name && !`${product.name} ${product.unit || ""}`.toLocaleLowerCase("pt-BR").includes(name)) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (minPrice !== null && Number(product.price) < minPrice) return false;
    if (maxPrice !== null && Number(product.price) > maxPrice) return false;
    if (filters.stock === "available" && !product.inStock) return false;
    if (filters.stock === "unavailable" && product.inStock) return false;
    if (filters.stock === "positive" && Number(product.stock || 0) <= 0) return false;
    if (filters.stock === "zero" && Number(product.stock || 0) !== 0) return false;
    if (filters.highlight === "offer" && !isOffer) return false;
    if (filters.highlight === "featured" && !product.featured) return false;
    if (filters.highlight === "bestSeller" && !product.bestSeller) return false;
    if (filters.highlight === "none" && hasHighlight) return false;
    if (filters.image === "with" && !product.image) return false;
    if (filters.image === "without" && product.image) return false;
    return true;
  });
}

function orderStatusLabel(status) {
  return {
    pending_whatsapp_confirmation: "Aguardando WhatsApp",
    confirmed: "Confirmado",
    preparing: "Em preparo",
    ready: "Pronto",
    completed: "Concluído",
    cancelled: "Cancelado"
  }[status] || status;
}

function orderDateLabel(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function orderItemLabel(order) {
  const items = order.order_items?.length ? order.order_items : order.items_snapshot || [];
  if (!items.length) return "Sem itens";
  return items.map((item) => `${item.quantity}x ${item.product_name || item.productName || "Produto"}`).join("<br>");
}

function orderPaymentLabel(status) {
  return {
    pending: "Pendente",
    paid: "Pago",
    cash_on_delivery: "Pagar na entrega",
    not_required: "Não aplicável",
    refunded: "Reembolsado"
  }[status] || "Pendente";
}

function renderOrderRows() {
  if (!adminElements.orderRows) return;
  if (!adminState.ready) {
    adminElements.orderRows.innerHTML = "";
    return;
  }
  const orders = filteredOrders();
  if (!orders.length) {
    adminElements.orderRows.innerHTML = '<tr><td colspan="9" class="admin-empty-row">Não há pedidos neste filtro.</td></tr>';
    return;
  }
  adminElements.orderRows.innerHTML = orders.map((order) => `
    <tr>
      <td data-label="Referência"><strong>${escapeHtml(order.order_reference)}</strong><br><small>${escapeHtml(order.source || "whatsapp_checkout")}</small></td>
      <td data-label="Cliente"><strong>${escapeHtml(order.customer_name || "-")}</strong><br><small>${escapeHtml(order.contact || "-")}</small></td>
      <td data-label="Entrega">${escapeHtml(order.fulfilment_type === "collection" ? "Retirada" : "Entrega")}<br><small>${escapeHtml([order.address, order.address_line2, order.city, order.postcode].filter(Boolean).join(", ") || "-")}</small></td>
      <td class="admin-order-items" data-label="Itens">${orderItemLabel(order).split("<br>").map(escapeHtml).join("<br>")}</td>
      <td data-label="Total"><strong>${order.total_estimate === null ? "A confirmar" : adminMoney(order.total_estimate)}</strong><br><small>Subtotal ${adminMoney(order.subtotal)}</small></td>
      <td data-label="Recebido">${orderDateLabel(order.created_at)}</td>
      <td data-label="Status">
        <label class="visually-hidden" for="status-${escapeHtml(order.id)}">Status do pedido ${escapeHtml(order.order_reference)}</label>
        <select id="status-${escapeHtml(order.id)}" data-order-status="${escapeHtml(order.id)}">
          ${["pending_whatsapp_confirmation", "confirmed", "preparing", "ready", "completed", "cancelled"].map((status) => `<option value="${status}" ${order.status === status ? "selected" : ""}>${orderStatusLabel(status)}</option>`).join("")}
        </select>
      </td>
      <td data-label="Pagamento">
        <label class="visually-hidden" for="payment-${escapeHtml(order.id)}">Pagamento do pedido ${escapeHtml(order.order_reference)}</label>
        <select id="payment-${escapeHtml(order.id)}" data-order-payment="${escapeHtml(order.id)}">
          ${["pending", "paid", "cash_on_delivery", "not_required", "refunded"].map((status) => `<option value="${status}" ${(order.payment_status || "pending") === status ? "selected" : ""}>${orderPaymentLabel(status)}</option>`).join("")}
        </select>
      </td>
      <td class="admin-order-actions" data-label="Notas e ações">
        <label class="visually-hidden" for="notes-${escapeHtml(order.id)}">Notas internas do pedido ${escapeHtml(order.order_reference)}</label>
        <textarea id="notes-${escapeHtml(order.id)}" data-order-notes="${escapeHtml(order.id)}" rows="3" placeholder="Notas internas, confirmação, pagamento...">${escapeHtml(order.admin_notes || "")}</textarea>
        <div>
          ${order.status === "pending_whatsapp_confirmation" ? `<button class="small-button" type="button" data-confirm-order="${escapeHtml(order.id)}">Confirmar pedido</button>` : ""}
          <button class="small-button muted" type="button" data-save-order="${escapeHtml(order.id)}">Salvar</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function filteredOrders() {
  const filters = adminState.orderFilters;
  const reference = filters.reference.trim().toLocaleLowerCase("pt-BR");
  const customer = filters.customer.trim().toLocaleLowerCase("pt-BR");
  const items = filters.items.trim().toLocaleLowerCase("pt-BR");
  const notes = filters.notes.trim().toLocaleLowerCase("pt-BR");
  const minTotal = filters.minTotal === "" ? null : Number(filters.minTotal);
  const maxTotal = filters.maxTotal === "" ? null : Number(filters.maxTotal);

  return adminState.orders.filter((order) => {
    const orderItems = order.order_items?.length ? order.order_items : order.items_snapshot || [];
    const itemText = orderItems.map((item) => item.product_name || item.productName || "").join(" ").toLocaleLowerCase("pt-BR");
    const contactText = `${order.customer_name || ""} ${order.contact || ""}`.toLocaleLowerCase("pt-BR");
    const orderDate = order.created_at ? new Date(order.created_at).toISOString().slice(0, 10) : "";
    const total = Number(order.total_estimate ?? order.subtotal ?? 0);
    if (reference && !String(order.order_reference || "").toLocaleLowerCase("pt-BR").includes(reference)) return false;
    if (customer && !contactText.includes(customer)) return false;
    if (filters.fulfilment && order.fulfilment_type !== filters.fulfilment) return false;
    if (items && !itemText.includes(items)) return false;
    if (minTotal !== null && total < minTotal) return false;
    if (maxTotal !== null && total > maxTotal) return false;
    if (filters.dateFrom && orderDate < filters.dateFrom) return false;
    if (filters.dateTo && orderDate > filters.dateTo) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (filters.payment && (order.payment_status || "pending") !== filters.payment) return false;
    if (notes && !String(order.admin_notes || "").toLocaleLowerCase("pt-BR").includes(notes)) return false;
    return true;
  });
}

function renderAdmin() {
  renderSummary();
  renderRows();
  renderOrderRows();
}

async function loadAdminOrders() {
  if (!adminState.session) {
    adminState.orders = [];
    if (adminElements.ordersSection) adminElements.ordersSection.hidden = true;
    return;
  }
  const { data, error } = await angusSupabase()
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  adminState.orders = data || [];
  if (adminElements.ordersSection) adminElements.ordersSection.hidden = false;
}

async function refreshOrders() {
  if (!adminState.ready) return;
  try {
    setAdminStatus("Atualizando pedidos...", "info");
    await loadAdminOrders();
    renderAdmin();
    setAdminStatus("Pedidos atualizados.", "success");
  } catch (error) {
    setAdminStatus(error.message || "Não foi possível carregar os pedidos.", "error");
  }
}

async function updateOrder(orderId, changes, successMessage = "Pedido atualizado.") {
  try {
    const { error } = await angusSupabase().from("orders").update(changes).eq("id", orderId);
    if (error) throw error;
    const order = adminState.orders.find((item) => item.id === orderId);
    if (order) Object.assign(order, changes);
    renderAdmin();
    setAdminStatus(successMessage, "success");
  } catch (error) {
    setAdminStatus(error.message || "Não foi possível atualizar o pedido.", "error");
    await refreshOrders();
  }
}

async function saveOrderChanges(orderId, { confirmOrder = false } = {}) {
  const statusInput = adminElements.orderRows.querySelector(`[data-order-status="${CSS.escape(orderId)}"]`);
  const paymentInput = adminElements.orderRows.querySelector(`[data-order-payment="${CSS.escape(orderId)}"]`);
  const notesInput = adminElements.orderRows.querySelector(`[data-order-notes="${CSS.escape(orderId)}"]`);
  const currentOrder = adminState.orders.find((order) => order.id === orderId);
  if (!statusInput || !paymentInput || !notesInput || !currentOrder) return;
  const status = confirmOrder ? "confirmed" : statusInput.value;
  const changes = {
    status,
    payment_status: paymentInput.value,
    admin_notes: notesInput.value.trim() || null
  };
  if (status === "confirmed" && !currentOrder.confirmed_at) changes.confirmed_at = new Date().toISOString();
  if (status === "completed" && !currentOrder.completed_at) changes.completed_at = new Date().toISOString();
  await updateOrder(orderId, changes, confirmOrder ? "Pedido confirmado e salvo." : "Pedido atualizado.");
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
  adminElements.productForm.elements.onOffer.checked = false;
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
  form.onOffer.checked = Number(product.oldPrice) > Number(product.price);
  form.featured.checked = Boolean(product.featured);
  form.bestSeller.checked = Boolean(product.bestSeller);
  form.isActive.checked = product.isActive !== false;
}

function productFromForm(imageUrl) {
  const form = adminElements.productForm.elements;
  const name = form.name.value.trim();
  if (!name) throw new Error("Informe o nome do produto.");
  const existing = adminState.products.find((product) => product.id === form.id.value) || {};
  const price = Number(form.price.value || 0);
  const isOnOffer = form.onOffer.checked;
  const oldPrice = toNumberOrNull(form.oldPrice.value);
  if (isOnOffer && (!oldPrice || oldPrice <= price)) {
    throw new Error("Para marcar um produto como oferta, informe um preço anterior maior que o preço final.");
  }
  return {
    ...existing,
    id: form.id.value || slugify(name),
    name,
    category: form.category.value,
    description: form.description.value.trim(),
    price,
    oldPrice: isOnOffer ? oldPrice : null,
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
  if (!file.type.startsWith("image/")) throw new Error("Envie um arquivo de imagem válido.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 5 MB.");
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
  const lockWorkspace = () => {
    adminState.products = [];
    adminState.orders = [];
    adminState.session = null;
    adminState.ready = false;
    adminState.editingId = null;
    adminElements.workspace.hidden = true;
    adminElements.logoutButton.hidden = true;
    adminElements.login.hidden = false;
    adminElements.ordersSection.hidden = true;
    setFormMode(false);
    renderAdmin();
  };

  if (!isSupabaseConfigured()) {
    lockWorkspace();
    setAdminStatus("Supabase não está configurado. O painel administrativo permanece bloqueado.", "error");
    return;
  }

  const client = angusSupabase();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) {
    lockWorkspace();
    setAdminStatus(sessionError.message || "Não foi possível verificar a sessão administrativa.", "error");
    return;
  }
  const session = sessionData.session?.user?.is_anonymous ? null : sessionData.session;

  if (!session) {
    lockWorkspace();
    setAdminStatus("Entre com uma conta administrativa para acessar o painel.", "info");
    return;
  }

  try {
    const { data: adminUser, error: adminError } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (adminError) throw adminError;
    if (!adminUser) {
      lockWorkspace();
      setAdminStatus("Esta conta não tem permissão de administrador. Use as credenciais do administrador cadastradas.", "error");
      return;
    }

    adminState.session = session;
    adminState.products = await loadSupabaseProducts({ includeInactive: true });
    adminState.ready = true;
    adminElements.workspace.hidden = false;
    adminElements.login.hidden = true;
    adminElements.logoutButton.hidden = false;
    await loadAdminOrders();
    renderAdmin();
    setAdminStatus("Painel administrativo conectado ao Supabase.", "success");
  } catch (error) {
    lockWorkspace();
    setAdminStatus(error.message || "Este usuário não tem acesso ao painel administrativo.", "error");
  }
}

function populateCategorySelect() {
  const select = adminElements.productForm.elements.category;
  select.innerHTML = editableCategories.map((category) => `<option value="${category}">${category}</option>`).join("");

  const filter = adminElements.productFilters.querySelector('[name="category"]');
  filter.innerHTML = `<option value="">Todas</option>${editableCategories.map((category) => `<option value="${category}">${category}</option>`).join("")}`;
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
    if (!adminState.ready) return;
    resetForm();
    setFormMode(true);
  });

  adminElements.importLocalProducts.addEventListener("click", importLocalProducts);
  adminElements.refreshOrders.addEventListener("click", refreshOrders);

  adminElements.cancelProduct.addEventListener("click", () => {
    resetForm();
    setFormMode(false);
  });

  adminElements.productForm.addEventListener("submit", saveProduct);

  adminElements.productFilters.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    adminState.productFilters[input.name] = input.value;
    renderRows();
  });

  adminElements.productFilters.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLSelectElement)) return;
    adminState.productFilters[input.name] = input.value;
    renderRows();
  });

  adminElements.clearProductFilters.addEventListener("click", () => {
    adminState.productFilters = {
      name: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      stock: "",
      highlight: "",
      image: ""
    };
    adminElements.productFilters.querySelectorAll("input, select").forEach((input) => {
      input.value = "";
    });
    renderRows();
  });

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

  adminElements.orderFilters.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    adminState.orderFilters[input.name] = input.value;
    renderOrderRows();
  });

  adminElements.orderFilters.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLSelectElement)) return;
    adminState.orderFilters[input.name] = input.value;
    renderOrderRows();
  });

  adminElements.clearOrderFilters.addEventListener("click", () => {
    adminState.orderFilters = {
      reference: "",
      customer: "",
      fulfilment: "",
      items: "",
      minTotal: "",
      maxTotal: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      payment: "",
      notes: ""
    };
    adminElements.orderFilters.querySelectorAll("input, select").forEach((input) => {
      input.value = "";
    });
    renderOrderRows();
  });

  adminElements.orderRows.addEventListener("click", async (event) => {
    const confirmButton = event.target.closest("[data-confirm-order]");
    const saveButton = event.target.closest("[data-save-order]");
    if (confirmButton) await saveOrderChanges(confirmButton.dataset.confirmOrder, { confirmOrder: true });
    if (saveButton) await saveOrderChanges(saveButton.dataset.saveOrder);
  });
}

populateCategorySelect();
setupAdminEvents();
loadAdminProducts();
