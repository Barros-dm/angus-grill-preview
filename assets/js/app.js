const state = {
  selectedCategory: "Todos",
  search: "",
  sort: "featured",
  stockOnly: false,
  cart: new Map(),
  modalProduct: null,
  modalOptionId: null,
  reviewIndex: 0
};

const money = (value) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
const byId = (id) => document.getElementById(id);

function isVariableWeight(product) {
  return product.pricingType === "perKg" || product.pricingType === "variable";
}

function productOptions(product) {
  return product.weightOptions || [];
}

function hasOptions(product) {
  return productOptions(product).length > 0;
}

function optionPrice(product, option) {
  if (!option) return product.price;
  return option.price ?? product.price * option.weightKg;
}

function lowestOptionPrice(product) {
  const prices = productOptions(product).map((option) => optionPrice(product, option));
  return prices.length ? Math.min(...prices) : product.price;
}

function selectedModalOption() {
  if (!state.modalProduct) return null;
  return productOptions(state.modalProduct).find((option) => option.id === state.modalOptionId) || null;
}

function priceLabel(product) {
  if (hasOptions(product)) return `A partir de ${money(lowestOptionPrice(product))}`;
  if (product.pricingType === "perKg") return `${money(product.price)}/kg`;
  if (product.pricingType === "variable") return "Preco a confirmar";
  return money(product.price);
}

function oldPriceLabel(product) {
  if (!product.oldPrice) return "";
  if (hasOptions(product)) return "";
  return product.pricingType === "perKg" ? `${money(product.oldPrice)}/kg` : money(product.oldPrice);
}

function pricingNote(product) {
  if (product.pricingNote) return product.pricingNote;
  if (isVariableWeight(product)) return "Preco final confirmado apos pesagem.";
  return "";
}

function lineLabel(product, quantity, option = null) {
  if (option) return `${quantity}x`;
  const unit = option ? "opcao" : product.orderUnit || "unidade";
  const invariantUnits = new Set(["kg", "g"]);
  const plural = quantity > 1 && !unit.endsWith("s") && !invariantUnits.has(unit) ? `${unit}s` : unit;
  return `${quantity} ${plural}`;
}

function cartKey(productId, optionId = "") {
  return optionId ? `${productId}::${optionId}` : productId;
}

const elements = {
  headerCategory: byId("headerCategory"),
  searchInput: byId("searchInput"),
  searchButton: byId("searchButton"),
  categoryNav: byId("categoryNav"),
  categoryCards: byId("categoryCards"),
  productGrid: byId("productGrid"),
  sortSelect: byId("sortSelect"),
  stockOnly: byId("stockOnly"),
  cartCount: byId("cartCount"),
  openCart: byId("openCart"),
  closeCart: byId("closeCart"),
  continueShopping: byId("continueShopping"),
  cartDrawer: byId("cartDrawer"),
  cartItems: byId("cartItems"),
  subtotal: byId("subtotal"),
  checkoutForm: byId("checkoutForm"),
  confirmation: byId("confirmation"),
  mobileCart: byId("mobileCart"),
  mobileCartTotal: byId("mobileCartTotal"),
  productModal: byId("productModal"),
  closeModal: byId("closeModal"),
  modalImage: byId("modalImage"),
  modalCategory: byId("modalCategory"),
  modalTitle: byId("modalTitle"),
  modalDescription: byId("modalDescription"),
  modalUnit: byId("modalUnit"),
  modalNote: byId("modalNote"),
  modalOptions: byId("modalOptions"),
  modalPrice: byId("modalPrice"),
  modalStock: byId("modalStock"),
  modalAdd: byId("modalAdd"),
  addressLabel: byId("addressLabel"),
  productCount: byId("productCount"),
  reviewSlides: [...document.querySelectorAll("[data-review-slide]")],
  reviewDots: byId("reviewDots"),
  reviewPrev: byId("reviewPrev"),
  reviewNext: byId("reviewNext")
};

const CATEGORY_COPY = {
  Ofertas: "Selecionados com precos especiais por tempo limitado.",
  "Mais Vendidos": "Favoritos dos clientes para churrasco e semana.",
  Bovino: "Cortes selecionados para o dia a dia e churrasco.",
  Frango: "Opcoes frescas para grelha, forno e refeicoes.",
  Suino: "Cortes praticos, saborosos e bem preparados.",
  Linguicas: "Linguicas saborosas, frescas e prontas para grelhar.",
  "Kits Churrasco": "Combinacoes praticas para familia e amigos.",
  Congelados: "Produtos prontos para facilitar a rotina.",
  Temperos: "Complementos para realcar o preparo das carnes."
};

function cartItems() {
  return [...state.cart.values()];
}

function cartSubtotal() {
  return cartItems().reduce((total, item) => {
    if (item.option) return total + optionPrice(item.product, item.option) * item.quantity;
    if (!isVariableWeight(item.product)) return total + item.product.price * item.quantity;
    return total;
  }, 0);
}

function cartHasVariableWeight() {
  return cartItems().some((item) => isVariableWeight(item.product) && !item.option);
}

function cartTotalLabel() {
  const fixedSubtotal = cartSubtotal();
  if (cartHasVariableWeight()) {
    return fixedSubtotal ? `${money(fixedSubtotal)} + itens a pesar` : "A confirmar";
  }
  return money(fixedSubtotal);
}

function cartCount() {
  return cartItems().reduce((total, item) => total + item.quantity, 0);
}

function productSectionOffset() {
  const stickyParts = [document.querySelector(".site-header"), document.querySelector(".category-nav")];
  return stickyParts.reduce((total, element) => total + (element ? element.getBoundingClientRect().height : 0), 14);
}

function scrollToProducts() {
  const section = byId("produtos");
  if (!section) return;
  const top = section.getBoundingClientRect().top + window.scrollY - productSectionOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

function setCategory(category, options = {}) {
  state.selectedCategory = category;
  elements.headerCategory.value = category;
  document.querySelectorAll("[data-category], [data-filter]").forEach((button) => {
    const value = button.dataset.category || button.dataset.filter;
    button.classList.toggle("active", value === category);
  });
  renderProducts();
  if (options.scrollToProducts) window.requestAnimationFrame(scrollToProducts);
}

function productMatches(product) {
  const query = state.search.trim().toLowerCase();
  const categoryOk =
    state.selectedCategory === "Todos" ||
    product.category === state.selectedCategory ||
    (state.selectedCategory === "Ofertas" && product.oldPrice) ||
    (state.selectedCategory === "Mais Vendidos" && product.bestSeller);
  const searchOk = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
  const stockOk = !state.stockOnly || product.inStock;
  return categoryOk && searchOk && stockOk;
}

function sortedProducts() {
  return PRODUCTS.filter(productMatches).sort((a, b) => {
    if (state.sort === "price-asc") return a.price - b.price;
    if (state.sort === "price-desc") return b.price - a.price;
    if (state.sort === "name") return a.name.localeCompare(b.name);
    return Number(Boolean(b.featured || b.bestSeller || b.oldPrice)) - Number(Boolean(a.featured || a.bestSeller || a.oldPrice));
  });
}

function addToCart(productId, quantity = 1, optionId = null) {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product || !product.inStock) return;
  const option = optionId ? productOptions(product).find((item) => item.id === optionId) : null;
  if (hasOptions(product) && !option) {
    openModal(productId);
    return;
  }
  if (option && option.stock <= 0) return;
  const key = cartKey(productId, option?.id);
  const existing = state.cart.get(key);
  const nextQuantity = (existing?.quantity || 0) + quantity;
  state.cart.set(key, { key, product, option, quantity: option ? Math.min(nextQuantity, option.stock) : nextQuantity });
  renderCart();
}

function setCartQuantity(key, quantity) {
  if (quantity <= 0) {
    state.cart.delete(key);
  } else {
    const existing = state.cart.get(key);
    if (existing) {
      const nextQuantity = existing.option ? Math.min(quantity, existing.option.stock) : quantity;
      state.cart.set(key, { ...existing, quantity: nextQuantity });
    }
  }
  renderCart();
}

function renderCategories() {
  elements.headerCategory.innerHTML = CATEGORIES.map((category) => `<option value="${category}">${category === "Todos" ? "Todas as categorias" : category}</option>`).join("");
  elements.categoryNav.innerHTML = CATEGORIES.map((category) => `<button type="button" class="${category === "Todos" ? "active" : ""}" data-category="${category}">${category === "Todos" ? "Todos os Produtos" : category}</button>`).join("");
  elements.categoryCards.innerHTML = CATEGORIES.filter((category) => category !== "Todos").map((category) => {
    const count = PRODUCTS.filter((product) => product.category === category || (category === "Ofertas" && product.oldPrice) || (category === "Mais Vendidos" && product.bestSeller)).length;
    const representative = PRODUCTS.find((product) => product.category === category || (category === "Ofertas" && product.oldPrice) || (category === "Mais Vendidos" && product.bestSeller)) || PRODUCTS[0];
    return '<button class="category-card" type="button" data-category="' + category + '"><img src="' + representative.image + '" alt="' + category + '"><span>' + count + ' produtos</span><strong>' + category + '</strong><em>' + (CATEGORY_COPY[category] || "Selecao Angus Grill.") + '</em></button>';
  }).join("");
}

function renderProducts() {
  const products = sortedProducts();
  if (elements.productCount) {
    elements.productCount.textContent = `${products.length} ${products.length === 1 ? "produto encontrado" : "produtos encontrados"}`;
  }
  if (!products.length) {
    elements.productGrid.innerHTML = `<div class="product-card"><div class="product-body"><h3>Nenhum produto encontrado</h3><p>Tente outra categoria ou busca.</p></div></div>`;
    return;
  }

  elements.productGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <figure>
        <img src="${product.image}" alt="${product.name}">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
      </figure>
      <div class="product-body">
        ${product.badge ? `<span class="product-kicker">${product.badge}</span>` : `<span class="product-kicker">${product.category}</span>`}
        <h3>${product.name}</h3>
        <div class="unit-stock"><span>${product.unit}</span><span class="${product.inStock ? "stock-ok" : "stock-out"}">${product.inStock ? "Disponivel" : "Indisponivel"}</span></div>
        <p>${product.description}</p>
        <div class="price-row">
          <div><strong>${priceLabel(product)}</strong>${oldPriceLabel(product) ? ` <del>${oldPriceLabel(product)}</del>` : ""}</div>
          ${hasOptions(product) ? `<small>escolha o peso</small>` : isVariableWeight(product) ? `<small>final apos pesagem</small>` : ""}
        </div>
        ${pricingNote(product) ? `<p class="pricing-note">${pricingNote(product)}</p>` : ""}
        <div class="card-actions">
          <button class="secondary-button" type="button" data-detail="${product.id}">Ver detalhes</button>
          <button class="primary-button" type="button" data-add="${product.id}" ${product.inStock ? "" : "disabled"}>${product.inStock ? (hasOptions(product) ? "Escolher tamanho" : "Adicionar ao carrinho") : "Indisponivel"}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const items = cartItems();
  elements.cartCount.textContent = String(cartCount());
  elements.subtotal.textContent = cartTotalLabel();
  elements.mobileCartTotal.textContent = cartTotalLabel();
  elements.mobileCart.hidden = items.length === 0;

  if (!items.length) {
    elements.cartItems.innerHTML = `<p>Seu carrinho esta vazio. Adicione produtos para montar seu pedido.</p>`;
    return;
  }

  elements.cartItems.innerHTML = items.map(({ key, product, option, quantity }) => `
    <article class="cart-item">
      <div>
        <h4>${product.name}</h4>
        <p>${lineLabel(product, quantity, option)} - ${option ? option.label : product.unit} - ${option ? money(optionPrice(product, option)) : priceLabel(product)}</p>
        ${option ? `<p class="cart-note">Opcao selecionada pelo cliente.</p>` : isVariableWeight(product) ? `<p class="cart-note">Peso e preco final confirmados no WhatsApp.</p>` : ""}
        <button class="remove-link" type="button" data-remove="${key}">Remover</button>
      </div>
      <div class="qty" aria-label="Quantidade de ${product.name}">
        <button type="button" data-dec="${key}">-</button>
        <span>${quantity}</span>
        <button type="button" data-inc="${key}">+</button>
      </div>
    </article>
  `).join("");
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

function openModal(productId) {
  const product = PRODUCTS.find((item) => item.id === productId);
  if (!product) return;
  state.modalProduct = product;
  state.modalOptionId = productOptions(product).find((option) => option.stock > 0)?.id || productOptions(product)[0]?.id || null;
  elements.modalImage.src = product.image;
  elements.modalImage.alt = product.name;
  elements.modalCategory.textContent = product.category;
  elements.modalTitle.textContent = product.name;
  elements.modalDescription.textContent = product.description;
  elements.modalUnit.textContent = product.unit;
  elements.modalNote.textContent = product.preparationNote || pricingNote(product) || "Fale pelo WhatsApp para combinar cortes, preparo e embalagem.";
  renderModalOptions();
  elements.modalPrice.textContent = selectedModalOption() ? money(optionPrice(product, selectedModalOption())) : priceLabel(product);
  elements.modalStock.textContent = product.inStock ? "Disponivel" : "Indisponivel";
  elements.modalStock.className = product.inStock ? "stock-ok" : "stock-out";
  elements.modalAdd.disabled = !product.inStock;
  elements.productModal.hidden = false;
}

function closeModal() {
  elements.productModal.hidden = true;
  state.modalProduct = null;
  state.modalOptionId = null;
}

function renderModalOptions() {
  const product = state.modalProduct;
  if (!product || !hasOptions(product)) {
    elements.modalOptions.hidden = true;
    elements.modalOptions.innerHTML = "";
    return;
  }
  elements.modalOptions.hidden = false;
  elements.modalOptions.innerHTML = `
    <p>Escolha o peso disponivel</p>
    <div class="weight-option-grid">
      ${productOptions(product).map((option) => `
        <button class="weight-option ${state.modalOptionId === option.id ? "selected" : ""}" type="button" data-option="${option.id}" ${option.stock > 0 ? "" : "disabled"}>
          <span>${option.label}</span>
          <strong>${money(optionPrice(product, option))}</strong>
          <em>${option.stock > 0 ? `${option.stock} disponiveis` : "Esgotado"}</em>
        </button>
      `).join("")}
    </div>
  `;
}

function renderReviewCarousel() {
  if (!elements.reviewSlides.length || !elements.reviewDots) return;

  elements.reviewSlides.forEach((slide, index) => {
    const isActive = index === state.reviewIndex;
    slide.hidden = !isActive;
    slide.classList.toggle("is-active", isActive);
  });

  elements.reviewDots.innerHTML = elements.reviewSlides.map((_, index) => (
    `<button class="review-dot ${index === state.reviewIndex ? "is-active" : ""}" type="button" data-review-index="${index}" aria-label="Mostrar avaliacao ${index + 1}" ${index === state.reviewIndex ? 'aria-current="true"' : ""}></button>`
  )).join("");
}

function showReview(index) {
  if (!elements.reviewSlides.length) return;
  state.reviewIndex = (index + elements.reviewSlides.length) % elements.reviewSlides.length;
  renderReviewCarousel();
}

function startReviewCarousel() {
  if (elements.reviewSlides.length < 2) return;
  window.setInterval(() => showReview(state.reviewIndex + 1), 6500);
}

function createMessage(form) {
  const type = form.fulfilmentType === "delivery" ? "Entrega" : "Retirada";
  const products = cartItems().map(({ product, option, quantity }) => {
    const price = option ? money(optionPrice(product, option)) : priceLabel(product);
    const selected = option ? ` - ${option.label}` : ` - ${product.unit}`;
    const note = option ? " - opcao selecionada pelo cliente" : isVariableWeight(product) ? " - final peso/preco confirmado apos pesagem" : "";
    return `- ${lineLabel(product, quantity, option)} ${product.name}${selected} - ${price}${note}`;
  }).join("\n");
  return `Ola Angus Grill, gostaria de fazer um pedido:

Nome: ${form.name || "A informar"}
Contato: ${form.contact || "A informar"}
Tipo: ${type}
${form.fulfilmentType === "delivery" ? `Endereco: ${form.address || "A informar"}\n` : ""}Data preferida: ${form.preferredDate || "A combinar"}
Horario: ${form.preferredTime || "Combinar pelo WhatsApp"}

Produtos:
${products}

Total/estimativa: ${cartTotalLabel()}
${cartHasVariableWeight() ? "Obs: itens por kg podem variar conforme o peso real separado pela equipe." : ""}

Observacoes para o acougueiro:
${form.butcherNotes || "Sem observacoes."}

Obrigado.`;
}

function setupEvents() {
  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("button, a");
    if (!target) return;

    if (target.dataset.category) {
      event.preventDefault();
      setCategory(target.dataset.category, { scrollToProducts: true });
    }
    if (target.dataset.filter) setCategory(target.dataset.filter);
    if (target.dataset.categoryLink) {
      event.preventDefault();
      setCategory(target.dataset.categoryLink, { scrollToProducts: true });
    }
    if (target.dataset.add) addToCart(target.dataset.add);
    if (target.dataset.detail) openModal(target.dataset.detail);
    if (target.dataset.option && state.modalProduct) {
      state.modalOptionId = target.dataset.option;
      renderModalOptions();
      elements.modalPrice.textContent = money(optionPrice(state.modalProduct, selectedModalOption()));
    }
    if (target.dataset.inc) setCartQuantity(target.dataset.inc, (state.cart.get(target.dataset.inc)?.quantity || 0) + 1);
    if (target.dataset.dec) setCartQuantity(target.dataset.dec, (state.cart.get(target.dataset.dec)?.quantity || 0) - 1);
    if (target.dataset.remove) setCartQuantity(target.dataset.remove, 0);
    if (target.dataset.reviewIndex) showReview(Number(target.dataset.reviewIndex));
  });

  elements.headerCategory.addEventListener("change", (event) => setCategory(event.target.value, { scrollToProducts: true }));
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderProducts();
  });
  elements.searchButton.addEventListener("click", renderProducts);
  elements.sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderProducts();
  });
  elements.stockOnly.addEventListener("change", (event) => {
    state.stockOnly = event.target.checked;
    renderProducts();
  });
  elements.openCart.addEventListener("click", openCart);
  elements.mobileCart.addEventListener("click", openCart);
  elements.closeCart.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeCart();
  });
  elements.continueShopping.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeCart();
  });
  elements.cartDrawer.addEventListener("click", (event) => {
    if (event.target === elements.cartDrawer) closeCart();
  });
  elements.closeModal.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeModal();
  });
  elements.productModal.addEventListener("click", (event) => {
    if (event.target === elements.productModal) closeModal();
  });
  elements.modalAdd.addEventListener("click", () => {
    if (state.modalProduct) addToCart(state.modalProduct.id, 1, state.modalOptionId);
    closeModal();
    openCart();
  });
  if (elements.reviewPrev) {
    elements.reviewPrev.addEventListener("click", () => showReview(state.reviewIndex - 1));
  }
  if (elements.reviewNext) {
    elements.reviewNext.addEventListener("click", () => showReview(state.reviewIndex + 1));
  }
  elements.checkoutForm.addEventListener("change", (event) => {
    if (event.target.name === "fulfilmentType") {
      elements.addressLabel.style.display = event.target.value === "delivery" ? "grid" : "none";
    }
  });
  elements.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cartItems().length) {
      openCart();
      return;
    }
    const formData = new FormData(elements.checkoutForm);
    const form = Object.fromEntries(formData.entries());
    const url = `https://wa.me/447923832005?text=${encodeURIComponent(createMessage(form))}`;
    elements.confirmation.hidden = false;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
      closeCart();
    }
  });
}

renderCategories();
renderProducts();
renderCart();
renderReviewCarousel();
startReviewCarousel();
setupEvents();
