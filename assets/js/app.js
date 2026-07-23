const state = {
  selectedCategory: "Todos",
  search: "",
  sort: "featured",
  stockOnly: false,
  cart: new Map(),
  modalProduct: null,
  modalOptionId: null,
  heroIndex: 0,
  reviewIndex: 0,
  deliveryQuote: {
    status: "idle",
    address: "",
    zone: null,
    miles: null,
    message: ""
  }
};

const money = (value) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
const byId = (id) => document.getElementById(id);

const DELIVERY_ZONES = {
  local: { label: "Canterbury e até 7.5 milhas", fee: 2.5 },
  extended: { label: "Herne Bay, Whitstable e 7.5 a 15 milhas", fee: 5 },
  outside: { label: "Fora de 15 milhas", fee: null }
};

const FREE_DELIVERY_THRESHOLD = 40;
const STORE_ADDRESS = "36 Brymore Road, Canterbury CT1 1JE, UK";
const METERS_PER_MILE = 1609.344;
let googleMapsLoadPromise = null;
let storeLocationPromise = null;
let deliveryQuoteTimer = null;
let addressAutocomplete = null;

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
  if (product.pricingType === "variable") return "Preço a confirmar";
  return money(product.price);
}

function oldPriceLabel(product) {
  if (!product.oldPrice) return "";
  if (hasOptions(product)) return "";
  return product.pricingType === "perKg" ? `${money(product.oldPrice)}/kg` : money(product.oldPrice);
}

function pricingNote(product) {
  if (product.pricingNote) return product.pricingNote;
  if (isVariableWeight(product)) return "Preço final confirmado após pesagem.";
  return "";
}

function lineLabel(product, quantity, option = null) {
  if (option) return `${quantity}x`;
  const unit = option ? "opção" : product.orderUnit || "unidade";
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
  deliveryFee: byId("deliveryFee"),
  orderTotal: byId("orderTotal"),
  deliveryNote: byId("deliveryNote"),
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
  addressInput: byId("addressInput"),
  addressLine2Label: byId("addressLine2Label"),
  addressLine2Input: byId("addressLine2Input"),
  addressGrid: byId("addressGrid"),
  cityInput: byId("cityInput"),
  postcodeInput: byId("postcodeInput"),
  deliveryZone: byId("deliveryZone"),
  deliveryQuoteCard: byId("deliveryQuoteCard"),
  deliveryQuoteTitle: byId("deliveryQuoteTitle"),
  deliveryQuoteText: byId("deliveryQuoteText"),
  productCount: byId("productCount"),
  heroSlides: [...document.querySelectorAll("[data-hero-slide]")],
  heroDots: byId("heroDots"),
  reviewSlides: [...document.querySelectorAll("[data-review-slide]")],
  reviewDots: byId("reviewDots"),
  reviewPrev: byId("reviewPrev"),
  reviewNext: byId("reviewNext")
};

function renderHeroCarousel() {
  if (!elements.heroSlides.length || !elements.heroDots) return;

  elements.heroSlides.forEach((slide, index) => {
    const isActive = index === state.heroIndex;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", isActive ? "false" : "true");
  });

  elements.heroDots.innerHTML = elements.heroSlides.map((_, index) => (
    `<button class="hero-dot ${index === state.heroIndex ? "is-active" : ""}" type="button" data-hero-index="${index}" aria-label="Mostrar destaque ${index + 1}" ${index === state.heroIndex ? 'aria-current="true"' : ""}></button>`
  )).join("");
}

function showHero(index) {
  if (!elements.heroSlides.length) return;
  state.heroIndex = (index + elements.heroSlides.length) % elements.heroSlides.length;
  renderHeroCarousel();
}

function startHeroCarousel() {
  if (elements.heroSlides.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  window.setInterval(() => showHero(state.heroIndex + 1), 6200);
}

const CATEGORY_COPY = {
  Ofertas: "Selecionados com preços especiais por tempo limitado.",
  "Mais Vendidos": "Favoritos dos clientes para churrasco e semana.",
  Bovino: "Cortes selecionados para o dia a dia e churrasco.",
  Frango: "Opções frescas para grelha, forno e refeições.",
  Suíno: "Cortes práticos, saborosos e bem preparados.",
  Linguiças: "Linguiças saborosas, frescas e prontas para grelhar.",
  "Kits Churrasco": "Combinações práticas para família e amigos.",
  Mercearia: "Produtos brasileiros selecionados para completar sua compra.",
  Congelados: "Produtos prontos para facilitar a rotina.",
  Temperos: "Complementos para realçar o preparo das carnes.",
  Bebidas: "Refrigerantes, sucos e bebidas brasileiras para acompanhar.",
  Doces: "Biscoitos, chocolates, sobremesas e sabores do Brasil.",
  Utilidades: "Itens práticos para cozinha, churrasco e rotina.",
  Beleza: "Produtos de cuidado pessoal e marcas brasileiras.",
  Livros: "Livros e itens especiais do catálogo brasileiro."
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

function cartSubtotalLabel() {
  const fixedSubtotal = cartSubtotal();
  if (cartHasVariableWeight()) {
    return fixedSubtotal ? `${money(fixedSubtotal)} + itens a pesar` : "A confirmar";
  }
  return money(fixedSubtotal);
}

function selectedFulfilmentType() {
  return new FormData(elements.checkoutForm).get("fulfilmentType") || "delivery";
}

function selectedDeliveryZone() {
  return elements.deliveryZone?.value || "local";
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectDeliveryZone(address) {
  const value = normalizeText(address || "");
  const postcodeMatch = value.match(/\bct\s*(\d{1,2})\b/);
  const postcodeArea = postcodeMatch ? `ct${postcodeMatch[1]}` : "";
  const outwardPostcodeMatch = value.match(/\b([a-z]{1,2}\d[a-z\d]?)\b/);
  const outwardPostcode = outwardPostcodeMatch ? outwardPostcodeMatch[1] : "";

  if (!value.trim()) return { zone: selectedDeliveryZone(), confidence: "empty" };
  if (value.includes("herne bay") || value.includes("whitstable") || postcodeArea === "ct5" || postcodeArea === "ct6") {
    return { zone: "extended", confidence: "matched" };
  }
  if (value.includes("canterbury") || postcodeArea === "ct1" || postcodeArea === "ct2") {
    return { zone: "local", confidence: "matched" };
  }
  if (postcodeArea === "ct3" || postcodeArea === "ct4") {
    return { zone: "extended", confidence: "postcode" };
  }
  if (postcodeMatch) return { zone: "outside", confidence: "outside" };
  if (outwardPostcode && !outwardPostcode.startsWith("ct")) return { zone: "outside", confidence: "outside" };
  return { zone: selectedDeliveryZone(), confidence: "unknown" };
}

function geocodingQuery(value) {
  const cleanValue = value.trim();
  if (!cleanValue) return "";
  if (normalizeText(cleanValue).includes("uk") || normalizeText(cleanValue).includes("united kingdom")) return cleanValue;
  return `${cleanValue}, United Kingdom`;
}

function addressForDeliveryQuote() {
  const parts = [
    elements.addressInput?.value,
    elements.cityInput?.value,
    elements.postcodeInput?.value
  ].map((part) => part?.trim()).filter(Boolean);
  return parts.join(", ");
}

function activeDeliveryQuote() {
  const address = addressForDeliveryQuote();
  if (state.deliveryQuote.address === address && state.deliveryQuote.zone) return state.deliveryQuote;
  return null;
}

function hasMapsKey() {
  return Boolean(window.ANGUS_GRILL_MAPS_API_KEY);
}

function deliveryQuoteEndpoint() {
  return window.ANGUS_GRILL_DELIVERY_QUOTE_ENDPOINT || "";
}

async function fetchDeliveryQuote(address) {
  const endpoint = deliveryQuoteEndpoint();
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postcode: elements.postcodeInput?.value || address, address, subtotal: cartSubtotal() })
  });
  if (!response.ok) throw new Error("Delivery quote endpoint failed.");
  return response.json();
}

function loadGoogleMaps() {
  if (window.google?.maps?.Geocoder && window.google?.maps?.geometry?.spherical) {
    return Promise.resolve(window.google.maps);
  }
  if (!hasMapsKey()) {
    return Promise.reject(new Error("Google Maps API key not configured."));
  }
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    const script = document.creatéElement("script");
    const params = new URLSearchParams({
      key: window.ANGUS_GRILL_MAPS_API_KEY,
      libraries: "geometry,places",
      loading: "async"
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.Geocoder && window.google?.maps?.geometry?.spherical) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Google Maps did not load correctly."));
      }
    };
    script.onerror = () => reject(new Error("Could not load Google Maps."));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

async function geocodeAddress(address) {
  const maps = await loadGoogleMaps();
  const geocoder = new maps.Geocoder();
  const response = await geocoder.geocode({
    address,
    componentRestrictions: { country: "GB" }
  });
  const result = response.results?.[0];
  if (!result?.geometry?.location) {
    throw new Error("Address not found.");
  }
  return result.geometry.location;
}

function storeLocation() {
  if (!storeLocationPromise) {
    storeLocationPromise = geocodeAddress(STORE_ADDRESS);
  }
  return storeLocationPromise;
}

function zoneFromMiles(miles) {
  if (miles <= 7.5) return "local";
  if (miles <= 15) return "extended";
  return "outside";
}

function componentValue(place, type) {
  const component = place.address_components?.find((item) => item.types.includes(type));
  return component?.long_name || "";
}

function fillAddressFields(place) {
  if (!place.address_components?.length) return;
  const streetNumber = componentValue(place, "street_number");
  const route = componentValue(place, "route");
  const city =
    componentValue(place, "postal_town") ||
    componentValue(place, "locality") ||
    componentValue(place, "administrative_área_level_2");
  const postcode = [
    componentValue(place, "postal_code"),
    componentValue(place, "postal_code_suffix")
  ].filter(Boolean).join(" ");

  if (streetNumber || route) elements.addressInput.value = [streetNumber, route].filter(Boolean).join(" ");
  if (city && elements.cityInput) elements.cityInput.value = city;
  if (postcode && elements.postcodeInput) elements.postcodeInput.value = postcode;
}

function setDeliveryQuoteFromMiles(address, miles) {
  const zone = zoneFromMiles(miles);
  state.deliveryQuote = {
    status: "ready",
    address,
    zone,
    miles,
    message: zone === "outside"
      ? `Distância estimada: ${miles.toFixed(1)} milhas. Fora do raio de entrega.`
      : `Distância estimada: ${miles.toFixed(1)} milhas. ${DELIVERY_ZONES[zone].label}.`
  };
}

async function calculatéDeliveryQuoteFromLocation(address, destination) {
  const cleanAddress = address.trim();
  if (!cleanAddress || !destination) return;
  state.deliveryQuote = {
    status: "loading",
    address: cleanAddress,
    zone: null,
    miles: null,
    message: "Calculando distancia pelo Google Maps..."
  };
  renderCart();

  try {
    const origin = await storeLocation();
    const meters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
    setDeliveryQuoteFromMiles(cleanAddress, meters / METERS_PER_MILE);
  } catch (error) {
    const fallback = detectDeliveryZone(cleanAddress);
    state.deliveryQuote = {
      status: "error",
      address: cleanAddress,
      zone: fallback.zone,
      miles: null,
      message: "não foi possível calcular com Google Maps. Usando estimativa pelo postcode."
    };
  }

  renderCart();
}

async function calculatéDeliveryQuote(address) {
  const cleanAddress = address.trim();
  if (!cleanAddress) {
    state.deliveryQuote = { status: "idle", address: "", zone: null, miles: null, message: "" };
    renderCart();
    return;
  }

  state.deliveryQuote = {
    status: "loading",
    address: cleanAddress,
    zone: null,
    miles: null,
    message: "Calculando distancia pelo Google Maps..."
  };
  renderCart();

  try {
    const endpointQuote = await fetchDeliveryQuote(cleanAddress);
    if (endpointQuote) {
      if (addressForDeliveryQuote() !== cleanAddress) return;
      state.deliveryQuote = {
        status: "ready",
        address: cleanAddress,
        zone: endpointQuote.zone || zoneFromMiles(Number(endpointQuote.miles || 999)),
        miles: Number(endpointQuote.miles),
        message: endpointQuote.message || ""
      };
      renderCart();
      return;
    }

    const [origin, destination] = await Promise.all([storeLocation(), geocodeAddress(geocodingQuery(cleanAddress))]);
    if (addressForDeliveryQuote() !== cleanAddress) return;
    const meters = window.google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
    setDeliveryQuoteFromMiles(cleanAddress, meters / METERS_PER_MILE);
  } catch (error) {
    if (addressForDeliveryQuote() !== cleanAddress) return;
    const fallback = detectDeliveryZone(cleanAddress);
    state.deliveryQuote = {
      status: "error",
      address: cleanAddress,
      zone: fallback.zone,
      miles: null,
      message: "não foi possível calcular com Google Maps. Usando estimativa pelo postcode."
    };
  }

  renderCart();
}

function scheduleDeliveryQuote() {
  if (!hasMapsKey() && !deliveryQuoteEndpoint()) return;
  window.clearTimeout(deliveryQuoteTimer);
  deliveryQuoteTimer = window.setTimeout(() => {
    calculatéDeliveryQuote(addressForDeliveryQuote());
  }, 650);
}

function initAddressAutocomplete() {
  if (!elements.addressInput || addressAutocomplete || !hasMapsKey()) return;
  loadGoogleMaps()
    .then((maps) => {
      if (!maps.places?.Autocomplete || addressAutocomplete) return;
      addressAutocomplete = new maps.places.Autocomplete(elements.addressInput, {
        componentRestrictions: { country: "gb" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
        types: ["address"]
      });
      addressAutocomplete.addListener("place_changed", () => {
        const place = addressAutocomplete.getPlace();
        const selectedAddress = place.formatted_address || place.name || elements.addressInput.value;
        fillAddressFields(place);
        const deliveryAddress = addressForDeliveryQuote() || selectedAddress;
        window.clearTimeout(deliveryQuoteTimer);
        if (place.geometry?.location) {
          calculatéDeliveryQuoteFromLocation(deliveryAddress, place.geometry.location);
        } else {
          calculatéDeliveryQuote(deliveryAddress);
        }
      });
    })
    .catch(() => {
      updatéDeliveryQuoteCard();
    });
}

function syncDeliveryZoneFromAddress() {
  if (!elements.addressInput || !elements.deliveryZone) return;
  const address = addressForDeliveryQuote();
  const quote = activeDeliveryQuote();
  const mapsResultApplies = state.deliveryQuote.address === address && ["loading", "ready", "error"].includes(state.deliveryQuote.status);
  const result = quote
    ? { zone: quote.zone, confidence: quote.status }
    : detectDeliveryZone(address);
  if (result.zone) elements.deliveryZone.value = result.zone;
}

function updatéDeliveryQuoteCard() {
  if (!elements.deliveryQuoteCard || !elements.deliveryQuoteTitle || !elements.deliveryQuoteText) return;
  const isDelivery = selectedFulfilmentType() === "delivery";
  const address = addressForDeliveryQuote();
  const quote = activeDeliveryQuote();
  const mapsResultApplies = state.deliveryQuote.address === address && ["loading", "ready", "error"].includes(state.deliveryQuote.status);
  const fallback = quote ? null : detectDeliveryZone(address);
  const zone = quote?.zone || fallback?.zone;
  const subtotal = cartSubtotal();
  const isFree = subtotal >= FREE_DELIVERY_THRESHOLD && !cartHasVariableWeight();

  elements.deliveryQuoteCard.style.display = isDelivery ? "grid" : "none";
  elements.deliveryQuoteCard.classList.toggle("is-loading", isDelivery && state.deliveryQuote.status === "loading" && state.deliveryQuote.address === address);
  elements.deliveryQuoteCard.classList.toggle("is-outside", isDelivery && zone === "outside");

  if (!isDelivery) {
    elements.deliveryQuoteTitle.textContent = "Retirada na loja";
    elements.deliveryQuoteText.textContent = "Sem taxa de entrega. O horário sera confirmado pelo WhatsApp.";
  } else if (!address) {
    elements.deliveryQuoteTitle.textContent = "Digite o endereço para calcular";
    elements.deliveryQuoteText.textContent = "Selecione o endereço sugerido. Gratis acima de £40.";
  } else if (state.deliveryQuote.status === "loading" && state.deliveryQuote.address === address) {
    elements.deliveryQuoteTitle.textContent = "Calculando entrega";
    elements.deliveryQuoteText.textContent = "Verificando a distancia a partir da loja Angus Grill.";
  } else if (zone === "outside") {
    elements.deliveryQuoteTitle.textContent = "Fora do raio de entrega";
    elements.deliveryQuoteText.textContent = "Este endereço parece ficar acima de 15 milhas. Finalize pelo WhatsApp para a equipe confirmar.";
  } else if (isFree) {
    elements.deliveryQuoteTitle.textContent = "Entrega grátis aplicada";
    elements.deliveryQuoteText.textContent = quote?.miles
      ? `Distância estimada: ${quote.miles.toFixed(1)} milhas. Pedido acima de £40.`
      : "Pedido acima de £40 dentro da área de entrega.";
  } else if (zone === "local") {
    elements.deliveryQuoteTitle.textContent = "Entrega £2.50";
    elements.deliveryQuoteText.textContent = quote?.miles
      ? `Distância estimada: ${quote.miles.toFixed(1)} milhas, dentro do raio de 7.5 milhas.`
      : "Postcode dentro da zona até 7.5 milhas.";
  } else if (zone === "extended") {
    elements.deliveryQuoteTitle.textContent = "Entrega £5.00";
    elements.deliveryQuoteText.textContent = quote?.miles
      ? `Distância estimada: ${quote.miles.toFixed(1)} milhas, dentro do raio maximo de 15 milhas.`
      : "Postcode dentro da zona de 7.5 a 15 milhas.";
  } else if (mapsResultApplies && state.deliveryQuote.status === "error") {
    elements.deliveryQuoteTitle.textContent = "Confirmar entrega pelo WhatsApp";
    elements.deliveryQuoteText.textContent = "não conseguimos calcular automaticamente. A equipe confirma a taxa antes de preparar o pedido.";
  } else if (fallback?.confidence === "unknown") {
    elements.deliveryQuoteTitle.textContent = "Selecione o endereço sugerido";
    elements.deliveryQuoteText.textContent = "Com o endereço completo conseguimos calcular a entrega.";
  } else if (fallback?.confidence === "empty") {
    elements.deliveryQuoteTitle.textContent = "Digite o endereço para calcular";
    elements.deliveryQuoteText.textContent = "Ate 7.5 milhas: £2.50. De 7.5 a 15 milhas: £5.00. Gratis acima de £40.";
  }
}

function deliveryFeeAmount() {
  if (!cartItems().length) return 0;
  if (selectedFulfilmentType() !== "delivery") return 0;
  if (selectedDeliveryZone() === "outside") return 0;
  const subtotal = cartSubtotal();
  if (subtotal >= FREE_DELIVERY_THRESHOLD && !cartHasVariableWeight()) return 0;
  return DELIVERY_ZONES[selectedDeliveryZone()]?.fee || 0;
}

function deliveryFeeLabel() {
  if (selectedFulfilmentType() !== "delivery") return "Retirada";
  if (selectedDeliveryZone() === "outside") return "Consultar";
  if (cartSubtotal() >= FREE_DELIVERY_THRESHOLD && !cartHasVariableWeight()) return "Gratis";
  return money(deliveryFeeAmount());
}

function orderTotalLabel() {
  if (selectedFulfilmentType() === "delivery" && selectedDeliveryZone() === "outside") return "A confirmar";
  if (cartHasVariableWeight()) return cartSubtotal() ? `${money(cartSubtotal() + deliveryFeeAmount())} + itens a pesar` : "A confirmar";
  return money(cartSubtotal() + deliveryFeeAmount());
}

function updatéDeliveryUi() {
  const isDelivery = selectedFulfilmentType() === "delivery";
  elements.addressLabel.style.display = isDelivery ? "grid" : "none";
  elements.addressLine2Label.style.display = isDelivery ? "grid" : "none";
  elements.addressGrid.style.display = isDelivery ? "grid" : "none";
  updatéDeliveryQuoteCard();
  if (!elements.deliveryNote) return;
  if (!isDelivery) {
    elements.deliveryNote.textContent = "Retirada na loja sem taxa de entrega. Horário sera confirmado pelo WhatsApp.";
  } else if (selectedDeliveryZone() === "outside") {
    elements.deliveryNote.textContent = "Endereço fora do raio maximo de 15 milhas. A entrega precisa ser confirmada pelo WhatsApp.";
  } else if (cartSubtotal() >= FREE_DELIVERY_THRESHOLD && !cartHasVariableWeight()) {
    elements.deliveryNote.textContent = "Entrega grátis aplicada para pedidos acima de £40. Distância máxima para entrega: 15 milhas.";
  } else {
    elements.deliveryNote.textContent = "Entrega: até 7.5 milhas £2.50, de 7.5 a 15 milhas £5.00. Gratis acima de £40.";
  }
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

function renderCatégories() {
  elements.headerCategory.innerHTML = CATEGORIES.map((category) => `<option value="${category}">${category === "Todos" ? "Todas as categorias" : category}</option>`).join("");
  elements.categoryNav.innerHTML = CATEGORIES.map((category) => `<button type="button" class="${category === "Todos" ? "active" : ""}" data-category="${category}">${category === "Todos" ? "Todos os Produtos" : category}</button>`).join("");
  elements.categoryCards.innerHTML = CATEGORIES.filter((category) => category !== "Todos").map((category) => {
    const count = PRODUCTS.filter((product) => product.category === category || (category === "Ofertas" && product.oldPrice) || (category === "Mais Vendidos" && product.bestSeller)).length;
    const representative = PRODUCTS.find((product) => product.category === category || (category === "Ofertas" && product.oldPrice) || (category === "Mais Vendidos" && product.bestSeller)) || PRODUCTS[0];
    return '<button class="category-card" type="button" data-category="' + category + '"><img src="' + representative.image + '" alt="' + category + '"><span>' + count + ' produtos</span><strong>' + category + '</strong><em>' + (CATEGORY_COPY[category] || "Seleção Angus Grill.") + '</em></button>';
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
        <div class="unit-stock"><span>${product.unit}</span><span class="${product.inStock ? "stock-ok" : "stock-out"}">${product.inStock ? "Disponivel" : "Indisponível"}</span></div>
        <p>${product.description}</p>
        <div class="price-row">
          <div><strong>${priceLabel(product)}</strong>${oldPriceLabel(product) ? ` <del>${oldPriceLabel(product)}</del>` : ""}</div>
          ${hasOptions(product) ? `<small>escolha o peso</small>` : isVariableWeight(product) ? `<small>final após pesagem</small>` : ""}
        </div>
        ${pricingNote(product) ? `<p class="pricing-note">${pricingNote(product)}</p>` : ""}
        <div class="card-actions">
          <button class="secondary-button" type="button" data-detail="${product.id}">Ver detalhes</button>
          <button class="primary-button" type="button" data-add="${product.id}" ${product.inStock ? "" : "disabled"}>${product.inStock ? (hasOptions(product) ? "Escolher tamanho" : "Adicionar ao carrinho") : "Indisponível"}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const items = cartItems();
  syncDeliveryZoneFromAddress();
  elements.cartCount.textContent = String(cartCount());
  elements.subtotal.textContent = cartSubtotalLabel();
  elements.deliveryFee.textContent = deliveryFeeLabel();
  elements.orderTotal.textContent = orderTotalLabel();
  elements.mobileCartTotal.textContent = orderTotalLabel();
  elements.mobileCart.hidden = items.length === 0;
  updatéDeliveryUi();

  if (!items.length) {
    elements.cartItems.innerHTML = `<p>Seu carrinho está vazio. Adicione produtos para montar seu pedido.</p>`;
    return;
  }

  elements.cartItems.innerHTML = items.map(({ key, product, option, quantity }) => `
    <article class="cart-item">
      <div>
        <h4>${product.name}</h4>
        <p>${lineLabel(product, quantity, option)} - ${option ? option.label : product.unit} - ${option ? money(optionPrice(product, option)) : priceLabel(product)}</p>
        ${option ? `<p class="cart-note">Opção selecionada pelo cliente.</p>` : isVariableWeight(product) ? `<p class="cart-note">Peso e preço final confirmados no WhatsApp.</p>` : ""}
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
  elements.modalStock.textContent = product.inStock ? "Disponivel" : "Indisponível";
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
    <p>Escolha o peso disponível</p>
    <div class="weight-option-grid">
      ${productOptions(product).map((option) => `
        <button class="weight-option ${state.modalOptionId === option.id ? "selected" : ""}" type="button" data-option="${option.id}" ${option.stock > 0 ? "" : "disabled"}>
          <span>${option.label}</span>
          <strong>${money(optionPrice(product, option))}</strong>
          <em>${option.stock > 0 ? `${option.stock} disponíveis` : "Esgotado"}</em>
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
    `<button class="review-dot ${index === state.reviewIndex ? "is-active" : ""}" type="button" data-review-index="${index}" aria-label="Mostrar avaliação ${index + 1}" ${index === state.reviewIndex ? 'aria-current="true"' : ""}></button>`
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

function creatéMessage(form) {
  const type = form.fulfilmentType === "delivery" ? "Entrega" : "Retirada";
  const products = cartItems().map(({ product, option, quantity }) => {
    const price = option ? money(optionPrice(product, option)) : priceLabel(product);
    const selected = option ? ` - ${option.label}` : ` - ${product.unit}`;
    const note = option ? " - opção selecionada pelo cliente" : isVariableWeight(product) ? " - final peso/preço confirmado após pesagem" : "";
    return `- ${lineLabel(product, quantity, option)} ${product.name}${selected} - ${price}${note}`;
  }).join("\n");
  return `Ola Angus Grill, gostaria de fazer um pedido:

Nome: ${form.name || "A informar"}
Contato: ${form.contact || "A informar"}
Tipo: ${type}
${form.fulfilmentType === "delivery" ? `Endereço: ${form.address || "A informar"}\n${form.addressLine2 ? `Complemento: ${form.addressLine2}\n` : ""}Cidade: ${form.city || "A informar"}\nPostcode: ${form.postcode || "A informar"}\n` : ""}Data preferida: ${form.preferredDaté || "A combinar"}
Horário: ${form.preferredTime || "Combinar pelo WhatsApp"}

Produtos:
${products}

Subtotal produtos: ${cartSubtotalLabel()}
${form.fulfilmentType === "delivery" ? `Zona de entrega: ${DELIVERY_ZONES[form.deliveryZone]?.label || "A confirmar"}\nTaxa de entrega: ${deliveryFeeLabel()}\n` : "Retirada na loja: sem taxa de entrega\n"}Total/estimativa: ${orderTotalLabel()}
${cartHasVariableWeight() ? "Obs: itens por kg podem variar conforme o peso real separado pela equipe." : ""}
${form.fulfilmentType === "delivery" && form.deliveryZone === "outside" ? "Obs entrega: endereço possívelmente fora do raio maximo de 15 milhas, confirmar disponibilidade.\n" : ""}

Observações para o açougueiro:
${form.butcherNotes || "Sem observações."}

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
    if (target.dataset.heroIndex) showHero(Number(target.dataset.heroIndex));
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
      updatéDeliveryUi();
    }
    if (event.target.name === "fulfilmentType" || event.target.name === "deliveryZone") renderCart();
  });
  [elements.addressInput, elements.cityInput, elements.postcodeInput].forEach((input) => input?.addEventListener("input", () => {
    scheduleDeliveryQuote();
    renderCart();
  }));
  initAddressAutocomplete();
  elements.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cartItems().length) {
      openCart();
      return;
    }
    const formData = new FormData(elements.checkoutForm);
    const form = Object.fromEntries(formData.entries());
    const url = `https://wa.me/447923832005?text=${encodeURIComponent(creatéMessage(form))}`;
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

renderCatégories();
renderProducts();
renderCart();
renderHeroCarousel();
startHeroCarousel();
renderReviewCarousel();
startReviewCarousel();
setupEvents();
