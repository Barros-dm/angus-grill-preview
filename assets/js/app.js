const state = {
  selectedCategory: "Todos",
  search: "",
  sort: "featured",
  stockOnly: false,
  cart: new Map(),
  modalProduct: null,
  modalOptionId: null,
  modalKgAmount: 0,
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

const LANGUAGE_META = {
  pt: { html: "pt-BR", label: "Português" },
  en: { html: "en-GB", label: "English" },
  es: { html: "es", label: "Español" },
  ro: { html: "ro", label: "Română" }
};

const I18N = {
  pt: {
    skipLink: "Pular para produtos",
    announcement: "Entrega rápida em Canterbury • Retirada na loja disponível • Carnes e mercearia brasileira selecionadas",
    searchSr: "Buscar produto",
    searchPlaceholder: "O que você está procurando?",
    searchButton: "Buscar",
    howToBuy: "Como comprar",
    call: "Ligar",
    cart: "Carrinho",
    allCategories: "Todas as categorias",
    allProductsNav: "Todos os Produtos",
    heroMeatEyebrow: "Açougue premium em Canterbury",
    heroMeatTitle: "Carnes premium em Canterbury, <span>agora online.</span>",
    heroMeatText: "Cortes selecionados como picanha, maminha, costela e linguiça toscana. Entrega rápida ou retirada na loja.",
    shopMeat: "Comprar carnes",
    viewSausages: "Ver linguiças",
    deliveryCollectionAvailable: "Entrega e retirada disponíveis",
    heroGroceryEyebrow: "Mercearia brasileira",
    heroGroceryTitle: "Produtos do Brasil para completar <span>sua compra.</span>",
    heroGroceryText: "Temperos, congelados, bebidas, doces e itens de mercearia selecionados para o dia a dia da comunidade brasileira.",
    viewGrocery: "Ver mercearia",
    viewDrinks: "Ver bebidas",
    groceryFrozen: "Mercearia + congelados",
    selectedProducts: "Produtos selecionados",
    heroPromoEyebrow: "Promoção da semana",
    heroPromoTitle: "Ofertas para churrasco e compras <span>do dia a dia.</span>",
    heroPromoText: "Confira produtos em promoção, aproveite a entrega grátis acima de £40 e finalize o pedido direto pelo WhatsApp.",
    viewOffers: "Ver ofertas",
    freeDelivery: "Entrega grátis",
    insideDeliveryRadius: "Dentro do raio atendido",
    googleRating: "5.0 no Google",
    fastDelivery: "Entrega rápida",
    brazilianGrocery: "Mercearia brasileira",
    storeCollection: "Retirada na loja",
    categoriesEyebrow: "Categorias",
    shopByCategory: "Compre por categoria",
    categoryIntro: "Encontre cortes selecionados, linguiças, temperos, congelados, bebidas e produtos brasileiros para completar sua compra.",
    catalogEyebrow: "Catálogo",
    weeklyPopular: "Mais pedidos da semana",
    productCountSuffix: "com seleção especial para churrasco, família e compras do dia a dia.",
    sortBy: "Organizar por",
    sortFeatured: "Destaques",
    sortPriceAsc: "Menor preço",
    sortPriceDesc: "Maior preço",
    sortName: "Nome",
    filters: "Filtros",
    stockOnly: "Somente disponíveis",
    featureEyebrow: "Mercearia brasileira",
    featureTitle: "Produtos selecionados para completar sua compra",
    featureText: "Escolha carnes, temperos, congelados, bebidas e itens de mercearia, adicione ao carrinho e confirme retirada ou entrega pelo WhatsApp.",
    reviewsEyebrow: "Confiança local",
    reviewsTitle: "Avaliado com 5 estrelas pelos nossos clientes em Canterbury",
    reviewsIntro: "Carnes de qualidade, mercearia brasileira, atendimento próximo, entrega rápida e produtos cuidadosamente embalados.",
    reviewOne: "Excelente qualidade e atendimento. Carnes frescas e muito bem embaladas.",
    reviewOneBy: "Cliente Angus Grill",
    reviewTwo: "Ótima variedade de cortes e entrega rápida.",
    reviewTwoBy: "Compra para churrasco",
    reviewThree: "A melhor carne da região. Recomendo para churrasco e compras da semana.",
    reviewThreeBy: "Cliente local em Canterbury",
    simpleOrder: "Pedido simples",
    howItWorks: "Como funciona",
    stepOneTitle: "Escolha seus produtos",
    stepOneText: "Navegue pelas categorias e adicione carnes, mercearia e produtos brasileiros ao carrinho.",
    stepTwoTitle: "Informe entrega ou retirada",
    stepTwoText: "Escolha a melhor opção e adicione observações para entrega ou preparo.",
    stepThreeTitle: "Finalize pelo WhatsApp",
    stepThreeText: "Envie o pedido pronto e confirme diretamente com a equipe Angus Grill.",
    phaseTwo: "Fase 2",
    appsSoon: "Em breve no Google Play e App Store",
    appsText: "Estamos preparando uma experiência ainda mais prática para você comprar pelo celular.",
    aboutUs: "Sobre nós",
    contactUs: "Fale conosco",
    location: "Localização",
    reviews: "Avaliações",
    shop: "Comprar",
    service: "Atendimento",
    deliveryAndCollection: "Entrega e retirada",
    openingHours: "Horários",
    contact: "Contato",
    adminPanel: "Painel admin",
    addToCart: "Adicionar ao carrinho",
    yourOrder: "Seu pedido",
    closeCart: "Fechar carrinho",
    productsSubtotal: "Subtotal produtos",
    delivery: "Entrega",
    collection: "Retirada",
    estimatedTotal: "Total estimado",
    checkout: "Finalizar pedido",
    name: "Nome",
    phoneOrEmail: "Telefone ou e-mail",
    address: "Endereço",
    addressLine2: "Apartamento, bloco etc. (opcional)",
    city: "Cidade",
    preferredDate: "Data preferida",
    preferredTime: "Horário preferido",
    morning: "Manhã",
    afternoon: "Tarde",
    lateDay: "Final do dia",
    arrangeWhatsapp: "Combinar pelo WhatsApp",
    deliveryNotes: "Observações para entrega",
    deliveryNotesPlaceholder: "Ex: deixar na recepção, tocar campainha, separar produtos congelados...",
    finishWhatsapp: "Finalizar pedido no WhatsApp",
    confirmation: "Pedido preparado para envio no WhatsApp. Confira a mensagem antes de enviar.",
    continueShopping: "Continuar comprando",
    viewOrder: "Ver pedido",
    categoryItems: "produtos",
    categoryItem: "produto",
    productFound: "produto encontrado",
    productsFound: "produtos encontrados",
    noProductsTitle: "Nenhum produto encontrado",
    noProductsText: "Tente outra categoria ou busca.",
    available: "Disponível",
    unavailable: "Indisponível",
    chooseWeight: "escolha o peso",
    finalAfterWeighing: "final após pesagem",
    viewDetails: "Ver detalhes",
    chooseSize: "Escolher tamanho",
    emptyCart: "Seu carrinho está vazio. Adicione produtos para montar seu pedido.",
    selectedOption: "Opção selecionada pelo cliente.",
    weightFinalWhatsapp: "Peso e preço final confirmados no WhatsApp.",
    remove: "Remover",
    chooseAvailableWeight: "Escolha o peso disponível",
    availablePlural: "disponíveis",
    soldOut: "Esgotado",
    talkWhatsappPrepare: "Fale pelo WhatsApp para combinar cortes, preparo e embalagem.",
    fromPrice: "A partir de",
    priceToConfirm: "Preço a confirmar",
    finalPriceAfterWeighing: "Preço final confirmado após pesagem.",
    selectionFallback: "Seleção Angus Grill.",
    title: "Angus Grill Premium Meat | Açougue e Mercearia"
  },
  en: {
    skipLink: "Skip to products",
    announcement: "Fast delivery in Canterbury • Store collection available • Selected premium meats and Brazilian groceries",
    searchSr: "Search product",
    searchPlaceholder: "What are you looking for?",
    searchButton: "Search",
    howToBuy: "How to buy",
    call: "Call",
    cart: "Basket",
    allCategories: "All categories",
    allProductsNav: "All Products",
    heroMeatEyebrow: "Premium butcher in Canterbury",
    heroMeatTitle: "Premium meats in Canterbury, <span>now online.</span>",
    heroMeatText: "Selected cuts including picanha, maminha, beef ribs and Toscana sausage. Fast delivery or store collection.",
    shopMeat: "Shop meats",
    viewSausages: "View sausages",
    deliveryCollectionAvailable: "Delivery and collection available",
    heroGroceryEyebrow: "Brazilian grocery",
    heroGroceryTitle: "Brazilian products to complete <span>your shop.</span>",
    heroGroceryText: "Seasonings, frozen foods, drinks, sweets and grocery items selected for the Brazilian community.",
    viewGrocery: "View grocery",
    viewDrinks: "View drinks",
    groceryFrozen: "Grocery + frozen",
    selectedProducts: "Selected products",
    heroPromoEyebrow: "Weekly promotion",
    heroPromoTitle: "Offers for barbecue and <span>everyday shopping.</span>",
    heroPromoText: "Browse promotional products, get free delivery over £40 and finish the order directly on WhatsApp.",
    viewOffers: "View offers",
    freeDelivery: "Free delivery",
    insideDeliveryRadius: "Inside the delivery radius",
    googleRating: "5.0 on Google",
    fastDelivery: "Fast delivery",
    brazilianGrocery: "Brazilian grocery",
    storeCollection: "Store collection",
    categoriesEyebrow: "Categories",
    shopByCategory: "Shop by category",
    categoryIntro: "Find selected cuts, sausages, seasonings, frozen foods, drinks and Brazilian products to complete your shop.",
    catalogEyebrow: "Catalogue",
    weeklyPopular: "Most ordered this week",
    productCountSuffix: "with a special selection for barbecue, family and everyday shopping.",
    sortBy: "Sort by",
    sortFeatured: "Featured",
    sortPriceAsc: "Lowest price",
    sortPriceDesc: "Highest price",
    sortName: "Name",
    filters: "Filters",
    stockOnly: "Available only",
    featureEyebrow: "Brazilian grocery",
    featureTitle: "Selected products to complete your shop",
    featureText: "Choose meats, seasonings, frozen foods, drinks and grocery items, add them to the basket and confirm delivery or collection on WhatsApp.",
    reviewsEyebrow: "Local trust",
    reviewsTitle: "Rated 5 stars by our customers in Canterbury",
    reviewsIntro: "Quality meats, Brazilian grocery, friendly service, fast delivery and carefully packed products.",
    reviewOne: "Excellent quality and service. Fresh meats and very well packed.",
    reviewOneBy: "Angus Grill customer",
    reviewTwo: "Great variety of cuts and fast delivery.",
    reviewTwoBy: "Barbecue order",
    reviewThree: "The best meat in the area. Recommended for barbecue and weekly shopping.",
    reviewThreeBy: "Local Canterbury customer",
    simpleOrder: "Simple order",
    howItWorks: "How it works",
    stepOneTitle: "Choose your products",
    stepOneText: "Browse the categories and add meats, grocery and Brazilian products to the basket.",
    stepTwoTitle: "Choose delivery or collection",
    stepTwoText: "Choose the best option and add delivery or preparation notes.",
    stepThreeTitle: "Finish on WhatsApp",
    stepThreeText: "Send the prepared order and confirm directly with the Angus Grill team.",
    phaseTwo: "Phase 2",
    appsSoon: "Coming soon to Google Play and App Store",
    appsText: "We are preparing an even easier mobile shopping experience.",
    aboutUs: "About us",
    contactUs: "Contact us",
    location: "Location",
    reviews: "Reviews",
    shop: "Shop",
    service: "Service",
    deliveryAndCollection: "Delivery and collection",
    openingHours: "Opening hours",
    contact: "Contact",
    adminPanel: "Admin panel",
    addToCart: "Add to basket",
    yourOrder: "Your order",
    closeCart: "Close basket",
    productsSubtotal: "Products subtotal",
    delivery: "Delivery",
    collection: "Collection",
    estimatedTotal: "Estimated total",
    checkout: "Checkout",
    name: "Name",
    phoneOrEmail: "Phone or email",
    address: "Address",
    addressLine2: "Apartment, block etc. (optional)",
    city: "City",
    preferredDate: "Preferred date",
    preferredTime: "Preferred time",
    morning: "Morning",
    afternoon: "Afternoon",
    lateDay: "End of day",
    arrangeWhatsapp: "Arrange on WhatsApp",
    deliveryNotes: "Delivery notes",
    deliveryNotesPlaceholder: "E.g. leave at reception, ring bell, separate frozen products...",
    finishWhatsapp: "Finish order on WhatsApp",
    confirmation: "Order prepared for WhatsApp. Please check the message before sending.",
    continueShopping: "Continue shopping",
    viewOrder: "View order",
    categoryItems: "products",
    categoryItem: "product",
    productFound: "product found",
    productsFound: "products found",
    noProductsTitle: "No products found",
    noProductsText: "Try another category or search.",
    available: "Available",
    unavailable: "Unavailable",
    chooseWeight: "choose weight",
    finalAfterWeighing: "final after weighing",
    viewDetails: "View details",
    chooseSize: "Choose size",
    emptyCart: "Your basket is empty. Add products to build your order.",
    selectedOption: "Option selected by the customer.",
    weightFinalWhatsapp: "Final weight and price confirmed on WhatsApp.",
    remove: "Remove",
    chooseAvailableWeight: "Choose the available weight",
    availablePlural: "available",
    soldOut: "Sold out",
    talkWhatsappPrepare: "Talk on WhatsApp to arrange cuts, preparation and packaging.",
    fromPrice: "From",
    priceToConfirm: "Price to confirm",
    finalPriceAfterWeighing: "Final price confirmed after weighing.",
    selectionFallback: "Angus Grill selection.",
    title: "Angus Grill Premium Meat | Butcher and Grocery"
  },
  es: {
    skipLink: "Ir a productos",
    announcement: "Entrega rápida en Canterbury • Recogida en tienda disponible • Carnes y productos brasileños seleccionados",
    searchSr: "Buscar producto",
    searchPlaceholder: "¿Qué estás buscando?",
    searchButton: "Buscar",
    howToBuy: "Cómo comprar",
    call: "Llamar",
    cart: "Carrito",
    allCategories: "Todas las categorías",
    allProductsNav: "Todos los productos",
    heroMeatEyebrow: "Carnicería premium en Canterbury",
    heroMeatTitle: "Carnes premium en Canterbury, <span>ahora online.</span>",
    heroMeatText: "Cortes seleccionados como picanha, maminha, costilla y linguiça toscana. Entrega rápida o recogida en tienda.",
    shopMeat: "Comprar carnes",
    viewSausages: "Ver linguiças",
    deliveryCollectionAvailable: "Entrega y recogida disponibles",
    heroGroceryEyebrow: "Mercería brasileña",
    heroGroceryTitle: "Productos de Brasil para completar <span>tu compra.</span>",
    heroGroceryText: "Condimentos, congelados, bebidas, dulces y productos seleccionados para la comunidad brasileña.",
    viewGrocery: "Ver mercería",
    viewDrinks: "Ver bebidas",
    groceryFrozen: "Mercería + congelados",
    selectedProducts: "Productos seleccionados",
    heroPromoEyebrow: "Promoción de la semana",
    heroPromoTitle: "Ofertas para barbacoa y compras <span>del día a día.</span>",
    heroPromoText: "Consulta productos en promoción, aprovecha entrega gratis desde £40 y finaliza el pedido por WhatsApp.",
    viewOffers: "Ver ofertas",
    freeDelivery: "Entrega gratis",
    insideDeliveryRadius: "Dentro del radio de entrega",
    googleRating: "5.0 en Google",
    fastDelivery: "Entrega rápida",
    brazilianGrocery: "Mercería brasileña",
    storeCollection: "Recogida en tienda",
    categoriesEyebrow: "Categorías",
    shopByCategory: "Comprar por categoría",
    categoryIntro: "Encuentra cortes seleccionados, linguiças, condimentos, congelados, bebidas y productos brasileños.",
    catalogEyebrow: "Catálogo",
    weeklyPopular: "Más pedidos de la semana",
    productCountSuffix: "con selección especial para barbacoa, familia y compras del día a día.",
    sortBy: "Ordenar por",
    sortFeatured: "Destacados",
    sortPriceAsc: "Menor precio",
    sortPriceDesc: "Mayor precio",
    sortName: "Nombre",
    filters: "Filtros",
    stockOnly: "Solo disponibles",
    featureEyebrow: "Mercería brasileña",
    featureTitle: "Productos seleccionados para completar tu compra",
    featureText: "Elige carnes, condimentos, congelados, bebidas y mercería, añade al carrito y confirma entrega o recogida por WhatsApp.",
    reviewsEyebrow: "Confianza local",
    reviewsTitle: "Valorado con 5 estrellas por nuestros clientes en Canterbury",
    reviewsIntro: "Carnes de calidad, mercería brasileña, atención cercana, entrega rápida y productos cuidadosamente embalados.",
    reviewOne: "Excelente calidad y atención. Carnes frescas y muy bien embaladas.",
    reviewOneBy: "Cliente Angus Grill",
    reviewTwo: "Gran variedad de cortes y entrega rápida.",
    reviewTwoBy: "Compra para barbacoa",
    reviewThree: "La mejor carne de la zona. Recomiendo para barbacoa y compras semanales.",
    reviewThreeBy: "Cliente local en Canterbury",
    simpleOrder: "Pedido simple",
    howItWorks: "Cómo funciona",
    stepOneTitle: "Elige tus productos",
    stepOneText: "Navega por las categorías y añade carnes, mercería y productos brasileños al carrito.",
    stepTwoTitle: "Indica entrega o recogida",
    stepTwoText: "Elige la mejor opción y añade notas de entrega o preparación.",
    stepThreeTitle: "Finaliza por WhatsApp",
    stepThreeText: "Envía el pedido preparado y confirma directamente con el equipo Angus Grill.",
    phaseTwo: "Fase 2",
    appsSoon: "Próximamente en Google Play y App Store",
    appsText: "Estamos preparando una experiencia móvil aún más práctica.",
    aboutUs: "Sobre nosotros",
    contactUs: "Contacto",
    location: "Ubicación",
    reviews: "Reseñas",
    shop: "Comprar",
    service: "Atención",
    deliveryAndCollection: "Entrega y recogida",
    openingHours: "Horarios",
    contact: "Contacto",
    adminPanel: "Panel admin",
    addToCart: "Añadir al carrito",
    yourOrder: "Tu pedido",
    closeCart: "Cerrar carrito",
    productsSubtotal: "Subtotal productos",
    delivery: "Entrega",
    collection: "Recogida",
    estimatedTotal: "Total estimado",
    checkout: "Finalizar pedido",
    name: "Nombre",
    phoneOrEmail: "Teléfono o email",
    address: "Dirección",
    addressLine2: "Apartamento, bloque etc. (opcional)",
    city: "Ciudad",
    preferredDate: "Fecha preferida",
    preferredTime: "Horario preferido",
    morning: "Mañana",
    afternoon: "Tarde",
    lateDay: "Final del día",
    arrangeWhatsapp: "Confirmar por WhatsApp",
    deliveryNotes: "Notas de entrega",
    deliveryNotesPlaceholder: "Ej: dejar en recepción, tocar el timbre, separar congelados...",
    finishWhatsapp: "Finalizar pedido por WhatsApp",
    confirmation: "Pedido preparado para WhatsApp. Revisa el mensaje antes de enviar.",
    continueShopping: "Continuar comprando",
    viewOrder: "Ver pedido",
    categoryItems: "productos",
    categoryItem: "producto",
    productFound: "producto encontrado",
    productsFound: "productos encontrados",
    noProductsTitle: "No se encontraron productos",
    noProductsText: "Prueba otra categoría o búsqueda.",
    available: "Disponible",
    unavailable: "No disponible",
    chooseWeight: "elige el peso",
    finalAfterWeighing: "final tras pesaje",
    viewDetails: "Ver detalles",
    chooseSize: "Elegir tamaño",
    emptyCart: "Tu carrito está vacío. Añade productos para crear tu pedido.",
    selectedOption: "Opción seleccionada por el cliente.",
    weightFinalWhatsapp: "Peso y precio final confirmados por WhatsApp.",
    remove: "Eliminar",
    chooseAvailableWeight: "Elige el peso disponible",
    availablePlural: "disponibles",
    soldOut: "Agotado",
    talkWhatsappPrepare: "Habla por WhatsApp para acordar cortes, preparación y embalaje.",
    fromPrice: "Desde",
    priceToConfirm: "Precio a confirmar",
    finalPriceAfterWeighing: "Precio final confirmado tras pesaje.",
    selectionFallback: "Selección Angus Grill.",
    title: "Angus Grill Premium Meat | Carnicería y Mercería"
  },
  ro: {
    skipLink: "Sari la produse",
    announcement: "Livrare rapidă în Canterbury • Ridicare din magazin disponibilă • Carne premium și produse braziliene selectate",
    searchSr: "Caută produs",
    searchPlaceholder: "Ce cauți?",
    searchButton: "Caută",
    howToBuy: "Cum cumperi",
    call: "Sună",
    cart: "Coș",
    allCategories: "Toate categoriile",
    allProductsNav: "Toate produsele",
    heroMeatEyebrow: "Măcelărie premium în Canterbury",
    heroMeatTitle: "Carne premium în Canterbury, <span>acum online.</span>",
    heroMeatText: "Bucăți selectate precum picanha, maminha, costiță și cârnați Toscana. Livrare rapidă sau ridicare din magazin.",
    shopMeat: "Cumpără carne",
    viewSausages: "Vezi cârnați",
    deliveryCollectionAvailable: "Livrare și ridicare disponibile",
    heroGroceryEyebrow: "Băcănie braziliană",
    heroGroceryTitle: "Produse din Brazilia pentru <span>cumpărăturile tale.</span>",
    heroGroceryText: "Condimente, congelate, băuturi, dulciuri și produse alimentare selectate pentru comunitatea braziliană.",
    viewGrocery: "Vezi băcănia",
    viewDrinks: "Vezi băuturi",
    groceryFrozen: "Băcănie + congelate",
    selectedProducts: "Produse selectate",
    heroPromoEyebrow: "Promoția săptămânii",
    heroPromoTitle: "Oferte pentru grătar și <span>cumpărături zilnice.</span>",
    heroPromoText: "Vezi produsele la promoție, livrare gratuită peste £40 și finalizează comanda pe WhatsApp.",
    viewOffers: "Vezi ofertele",
    freeDelivery: "Livrare gratuită",
    insideDeliveryRadius: "În raza de livrare",
    googleRating: "5.0 pe Google",
    fastDelivery: "Livrare rapidă",
    brazilianGrocery: "Băcănie braziliană",
    storeCollection: "Ridicare din magazin",
    categoriesEyebrow: "Categorii",
    shopByCategory: "Cumpără pe categorii",
    categoryIntro: "Găsește carne selectată, cârnați, condimente, congelate, băuturi și produse braziliene.",
    catalogEyebrow: "Catalog",
    weeklyPopular: "Cele mai comandate ale săptămânii",
    productCountSuffix: "cu selecție specială pentru grătar, familie și cumpărături zilnice.",
    sortBy: "Sortează după",
    sortFeatured: "Recomandate",
    sortPriceAsc: "Preț crescător",
    sortPriceDesc: "Preț descrescător",
    sortName: "Nume",
    filters: "Filtre",
    stockOnly: "Doar disponibile",
    featureEyebrow: "Băcănie braziliană",
    featureTitle: "Produse selectate pentru cumpărăturile tale",
    featureText: "Alege carne, condimente, congelate, băuturi și produse alimentare, adaugă în coș și confirmă livrarea sau ridicarea pe WhatsApp.",
    reviewsEyebrow: "Încredere locală",
    reviewsTitle: "Evaluat cu 5 stele de clienții noștri din Canterbury",
    reviewsIntro: "Carne de calitate, produse braziliene, servicii apropiate, livrare rapidă și produse ambalate cu grijă.",
    reviewOne: "Calitate și servicii excelente. Carne proaspătă și foarte bine ambalată.",
    reviewOneBy: "Client Angus Grill",
    reviewTwo: "Varietate bună de bucăți și livrare rapidă.",
    reviewTwoBy: "Comandă pentru grătar",
    reviewThree: "Cea mai bună carne din zonă. Recomand pentru grătar și cumpărături săptămânale.",
    reviewThreeBy: "Client local din Canterbury",
    simpleOrder: "Comandă simplă",
    howItWorks: "Cum funcționează",
    stepOneTitle: "Alege produsele",
    stepOneText: "Navighează categoriile și adaugă carne, produse alimentare și produse braziliene în coș.",
    stepTwoTitle: "Alege livrare sau ridicare",
    stepTwoText: "Alege opțiunea potrivită și adaugă observații pentru livrare sau pregătire.",
    stepThreeTitle: "Finalizează pe WhatsApp",
    stepThreeText: "Trimite comanda pregătită și confirmă direct cu echipa Angus Grill.",
    phaseTwo: "Faza 2",
    appsSoon: "În curând pe Google Play și App Store",
    appsText: "Pregătim o experiență mobilă și mai practică.",
    aboutUs: "Despre noi",
    contactUs: "Contactează-ne",
    location: "Locație",
    reviews: "Recenzii",
    shop: "Cumpără",
    service: "Servicii",
    deliveryAndCollection: "Livrare și ridicare",
    openingHours: "Program",
    contact: "Contact",
    adminPanel: "Panou admin",
    addToCart: "Adaugă în coș",
    yourOrder: "Comanda ta",
    closeCart: "Închide coșul",
    productsSubtotal: "Subtotal produse",
    delivery: "Livrare",
    collection: "Ridicare",
    estimatedTotal: "Total estimat",
    checkout: "Finalizează comanda",
    name: "Nume",
    phoneOrEmail: "Telefon sau email",
    address: "Adresă",
    addressLine2: "Apartament, bloc etc. (opțional)",
    city: "Oraș",
    preferredDate: "Data preferată",
    preferredTime: "Ora preferată",
    morning: "Dimineața",
    afternoon: "După-amiază",
    lateDay: "Spre seară",
    arrangeWhatsapp: "Stabilește pe WhatsApp",
    deliveryNotes: "Observații pentru livrare",
    deliveryNotesPlaceholder: "Ex: lăsați la recepție, sunați la sonerie, separați produsele congelate...",
    finishWhatsapp: "Finalizează pe WhatsApp",
    confirmation: "Comanda este pregătită pentru WhatsApp. Verifică mesajul înainte de trimitere.",
    continueShopping: "Continuă cumpărăturile",
    viewOrder: "Vezi comanda",
    categoryItems: "produse",
    categoryItem: "produs",
    productFound: "produs găsit",
    productsFound: "produse găsite",
    noProductsTitle: "Nu s-au găsit produse",
    noProductsText: "Încearcă altă categorie sau căutare.",
    available: "Disponibil",
    unavailable: "Indisponibil",
    chooseWeight: "alege greutatea",
    finalAfterWeighing: "final după cântărire",
    viewDetails: "Vezi detalii",
    chooseSize: "Alege mărimea",
    emptyCart: "Coșul este gol. Adaugă produse pentru comandă.",
    selectedOption: "Opțiune selectată de client.",
    weightFinalWhatsapp: "Greutatea și prețul final se confirmă pe WhatsApp.",
    remove: "Elimină",
    chooseAvailableWeight: "Alege greutatea disponibilă",
    availablePlural: "disponibile",
    soldOut: "Epuizat",
    talkWhatsappPrepare: "Vorbește pe WhatsApp pentru tăiere, pregătire și ambalare.",
    fromPrice: "De la",
    priceToConfirm: "Preț de confirmat",
    finalPriceAfterWeighing: "Prețul final se confirmă după cântărire.",
    selectionFallback: "Selecție Angus Grill.",
    title: "Angus Grill Premium Meat | Măcelărie și Băcănie"
  }
};

const CATEGORY_LABELS = {
  pt: {
    Todos: "Todos",
    Ofertas: "Ofertas",
    "Mais Vendidos": "Mais Vendidos",
    Bovino: "Bovino",
    Linguiças: "Linguiças",
    Mercearia: "Mercearia",
    Congelados: "Congelados",
    Temperos: "Temperos",
    Bebidas: "Bebidas",
    Doces: "Doces",
    Utilidades: "Utilidades",
    Beleza: "Beleza",
    Livros: "Livros"
  },
  en: {
    Todos: "All",
    Ofertas: "Offers",
    "Mais Vendidos": "Best Sellers",
    Bovino: "Beef",
    Linguiças: "Sausages",
    Mercearia: "Grocery",
    Congelados: "Frozen",
    Temperos: "Seasonings",
    Bebidas: "Drinks",
    Doces: "Sweets",
    Utilidades: "Utilities",
    Beleza: "Beauty",
    Livros: "Books"
  },
  es: {
    Todos: "Todos",
    Ofertas: "Ofertas",
    "Mais Vendidos": "Más vendidos",
    Bovino: "Vacuno",
    Linguiças: "Linguiças",
    Mercearia: "Mercería",
    Congelados: "Congelados",
    Temperos: "Condimentos",
    Bebidas: "Bebidas",
    Doces: "Dulces",
    Utilidades: "Utilidades",
    Beleza: "Belleza",
    Livros: "Libros"
  },
  ro: {
    Todos: "Toate",
    Ofertas: "Oferte",
    "Mais Vendidos": "Cele mai vândute",
    Bovino: "Vită",
    Linguiças: "Cârnați",
    Mercearia: "Băcănie",
    Congelados: "Congelate",
    Temperos: "Condimente",
    Bebidas: "Băuturi",
    Doces: "Dulciuri",
    Utilidades: "Utile",
    Beleza: "Îngrijire",
    Livros: "Cărți"
  }
};

function currentLanguage() {
  return I18N[state.language] ? state.language : "pt";
}

function t(key) {
  const language = currentLanguage();
  return I18N[language]?.[key] || I18N.pt[key] || key;
}

function categoryLabel(category) {
  const language = currentLanguage();
  return CATEGORY_LABELS[language]?.[category] || CATEGORY_LABELS.pt[category] || category;
}

function productName(product) {
  return product.translations?.[currentLanguage()]?.name || product.name;
}

function productDescription(product) {
  return product.translations?.[currentLanguage()]?.description || product.description;
}

function productUnit(product) {
  return product.translations?.[currentLanguage()]?.unit || product.unit;
}

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

const KG_AMOUNT_CATEGORIES = new Set(["Bovino", "Frango", "Suíno"]);

function parseKgValue(rawValue, rawUnit = "") {
  const value = Number(String(rawValue).replace(",", "."));
  if (!Number.isFinite(value)) return null;
  const unit = String(rawUnit).toLowerCase();
  if (unit === "g" || value > 50) return value / 1000;
  return value;
}

function optionAverageKg(label = "") {
  const matches = [...String(label).matchAll(/(\d+(?:[.,]\d+)?)\s*(kg|g)?/gi)];
  const values = matches.map((match) => parseKgValue(match[1], match[2])).filter((value) => value && value > 0);
  if (!values.length) return null;
  if (values.length === 1) return values[0];
  return (values[0] + values[1]) / 2;
}

function derivedPricePerKg(product) {
  if (product.pricePerKg) return product.pricePerKg;
  if (product.pricingType === "perKg" && !productOptions(product).length) return product.price;
  const derived = productOptions(product)
    .map((option) => {
      const kg = option.weightKg || optionAverageKg(option.label);
      return kg ? optionPrice(product, option) / kg : null;
    })
    .filter((value) => Number.isFinite(value) && value > 0);
  return derived.length ? Number(derived[0].toFixed(2)) : product.price;
}

function isKgAmountProduct(product) {
  if (!product || !KG_AMOUNT_CATEGORIES.has(product.category)) return false;
  return product.pricingType === "perKg" || productOptions(product).some((option) => optionAverageKg(option.label));
}

function hasOptions(product) {
  return productOptions(product).length > 0 && !isKgAmountProduct(product);
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
  if (isKgAmountProduct(product)) return `${money(derivedPricePerKg(product))}/kg`;
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
  if (isKgAmountProduct(product)) return "Informe quantos kg deseja. O total é estimado pela quantidade selecionada.";
  if (product.pricingNote) return product.pricingNote;
  if (isVariableWeight(product)) return "Preço final confirmado após pesagem.";
  return "";
}

function lineLabel(product, quantity, option = null) {
  if (isKgAmountProduct(product)) return `${formatKgAmount(quantity)} solicitados`;
  if (option) return `${quantity}x`;
  const unit = option ? "opção" : product.orderUnit || "unidade";
  const invariantUnits = new Set(["kg", "g"]);
  const plural = quantity > 1 && !unit.endsWith("s") && !invariantUnits.has(unit) ? `${unit}s` : unit;
  return `${quantity} ${plural}`;
}

function sanitizeKgAmount(value, options = {}) {
  const { allowZero = false } = options;
  const amount = Number(String(value).replace(",", "."));
  if (!Number.isFinite(amount)) return allowZero ? 0 : 0.25;
  const rounded = Math.round(amount * 100) / 100;
  return Math.max(allowZero ? 0 : 0.25, rounded);
}

function formatKgAmount(value) {
  const amount = sanitizeKgAmount(value, { allowZero: true });
  return `${amount.toFixed(2).replace(/\.00$/, "").replace(/0$/, "")}kg`;
}

function stepKgAmount(value, direction) {
  const current = sanitizeKgAmount(value, { allowZero: true });
  return Math.max(0, Math.round((current + direction * 0.25) * 100) / 100);
}

function displayUnit(product) {
  return isKgAmountProduct(product) ? "preço por kg" : product.unit;
}

function cartLineTotal(item) {
  if (item.option) return optionPrice(item.product, item.option) * item.quantity;
  if (isKgAmountProduct(item.product)) return derivedPricePerKg(item.product) * item.quantity;
  if (!isVariableWeight(item.product)) return item.product.price * item.quantity;
  return 0;
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
  return cartItems().reduce((total, item) => total + cartLineTotal(item), 0);
}

function cartHasVariableWeight() {
  return cartItems().some((item) => isVariableWeight(item.product) && !item.option && !isKgAmountProduct(item.product));
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
  return cartItems().reduce((total, item) => total + (isKgAmountProduct(item.product) ? 1 : item.quantity), 0);
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
  if (isKgAmountProduct(product) && optionId !== "kgAmount") {
    openModal(productId);
    return;
  }
  if (hasOptions(product) && !option) {
    openModal(productId);
    return;
  }
  if (option && option.stock <= 0) return;
  const key = cartKey(productId, option?.id);
  const existing = state.cart.get(key);
  const kgQuantity = isKgAmountProduct(product) ? sanitizeKgAmount(quantity, { allowZero: true }) : null;
  if (isKgAmountProduct(product) && kgQuantity <= 0) return;
  const nextQuantity = isKgAmountProduct(product)
    ? kgQuantity
    : (existing?.quantity || 0) + quantity;
  state.cart.set(key, { key, product, option, quantity: option ? Math.min(nextQuantity, option.stock) : nextQuantity });
  renderCart();
}

function setCartQuantity(key, quantity) {
  if (quantity <= 0) {
    state.cart.delete(key);
  } else {
    const existing = state.cart.get(key);
    if (existing) {
      const nextQuantity = isKgAmountProduct(existing.product)
        ? sanitizeKgAmount(quantity)
        : existing.option ? Math.min(quantity, existing.option.stock) : quantity;
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
        <div class="unit-stock"><span>${displayUnit(product)}</span><span class="${product.inStock ? "stock-ok" : "stock-out"}">${product.inStock ? "Disponivel" : "Indisponível"}</span></div>
        <p>${product.description}</p>
        <div class="price-row">
          <div><strong>${priceLabel(product)}</strong>${oldPriceLabel(product) ? ` <del>${oldPriceLabel(product)}</del>` : ""}</div>
          ${isKgAmountProduct(product) ? `<small>preço por kg</small>` : hasOptions(product) ? `<small>escolha a opção</small>` : isVariableWeight(product) ? `<small>final após pesagem</small>` : ""}
        </div>
        ${pricingNote(product) ? `<p class="pricing-note">${pricingNote(product)}</p>` : ""}
        <div class="card-actions">
          <button class="secondary-button" type="button" data-detail="${product.id}">Ver detalhes</button>
          <button class="primary-button" type="button" data-add="${product.id}" ${product.inStock ? "" : "disabled"}>${product.inStock ? (isKgAmountProduct(product) ? "Escolher kg" : hasOptions(product) ? "Escolher tamanho" : "Adicionar ao carrinho") : "Indisponível"}</button>
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
        <p>${lineLabel(product, quantity, option)} - ${option ? option.label : displayUnit(product)} - ${isKgAmountProduct(product) ? `${money(cartLineTotal({ product, option, quantity }))} (${priceLabel(product)})` : option ? money(optionPrice(product, option)) : priceLabel(product)}</p>
        ${isKgAmountProduct(product) ? `<p class="cart-note">Quantidade em kg escolhida pelo cliente.</p>` : option ? `<p class="cart-note">Opção selecionada pelo cliente.</p>` : isVariableWeight(product) ? `<p class="cart-note">Peso e preço final confirmados no WhatsApp.</p>` : ""}
        <button class="remove-link" type="button" data-remove="${key}">Remover</button>
      </div>
      <div class="qty" aria-label="Quantidade de ${product.name}">
        <button type="button" data-dec="${key}" aria-label="Diminuir quantidade de ${product.name}">-</button>
        <span>${isKgAmountProduct(product) ? formatKgAmount(quantity) : quantity}</span>
        <button type="button" data-inc="${key}" aria-label="Aumentar quantidade de ${product.name}">+</button>
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
  state.modalKgAmount = 0;
  elements.modalImage.src = product.image;
  elements.modalImage.alt = product.name;
  elements.modalCategory.textContent = product.category;
  elements.modalTitle.textContent = product.name;
  elements.modalDescription.textContent = product.description;
  elements.modalUnit.textContent = displayUnit(product);
  elements.modalNote.textContent = product.preparationNote || pricingNote(product) || "Fale pelo WhatsApp para combinar cortes, preparo e embalagem.";
  renderModalOptions();
  elements.modalPrice.textContent = isKgAmountProduct(product) ? money(derivedPricePerKg(product) * state.modalKgAmount) : selectedModalOption() ? money(optionPrice(product, selectedModalOption())) : priceLabel(product);
  elements.modalStock.textContent = product.inStock ? "Disponivel" : "Indisponível";
  elements.modalStock.className = product.inStock ? "stock-ok" : "stock-out";
  elements.modalAdd.disabled = isKgAmountProduct(product) ? !product.inStock || state.modalKgAmount <= 0 : !product.inStock;
  elements.productModal.hidden = false;
}

function closeModal() {
  elements.productModal.hidden = true;
  state.modalProduct = null;
  state.modalOptionId = null;
  state.modalKgAmount = 0;
}

function renderModalOptions() {
  const product = state.modalProduct;
  if (product && isKgAmountProduct(product)) {
    const pricePerKg = derivedPricePerKg(product);
    const estimatedTotal = pricePerKg * state.modalKgAmount;
    elements.modalOptions.hidden = false;
    elements.modalOptions.innerHTML = `
      <p>Escolha a quantidade desejada</p>
      <div class="kg-amount-selector">
        <button type="button" data-kg-dec aria-label="Diminuir quantidade">-</button>
        <label>
          <span>Quantidade em kg</span>
          <input id="modalKgAmount" type="number" min="0" step="0.25" value="${state.modalKgAmount}" inputmode="decimal">
        </label>
        <button type="button" data-kg-inc aria-label="Aumentar quantidade">+</button>
      </div>
      <div class="kg-estimate">
        <span>Preço por kg</span><strong>${money(pricePerKg)}/kg</strong>
        <span>Total estimado</span><strong data-kg-total>${money(estimatedTotal)}</strong>
      </div>
      <small class="kg-note">O valor final pode variar apenas se a equipe precisar ajustar o peso separado.</small>
    `;
    updateModalKgEstimate();
    return;
  }
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

function updateModalKgAmount(value) {
  if (!state.modalProduct || !isKgAmountProduct(state.modalProduct)) return;
  state.modalKgAmount = sanitizeKgAmount(value, { allowZero: true });
  renderModalOptions();
}

function updateModalKgDraft(value) {
  if (!state.modalProduct || !isKgAmountProduct(state.modalProduct)) return;
  state.modalKgAmount = sanitizeKgAmount(value, { allowZero: true });
  updateModalKgEstimate();
}

function updateModalKgEstimate() {
  if (!state.modalProduct || !isKgAmountProduct(state.modalProduct)) return;
  const estimatedTotal = derivedPricePerKg(state.modalProduct) * state.modalKgAmount;
  elements.modalPrice.textContent = money(estimatedTotal);
  const total = elements.modalOptions.querySelector("[data-kg-total]");
  if (total) total.textContent = money(estimatedTotal);
  elements.modalAdd.disabled = !state.modalProduct.inStock || state.modalKgAmount <= 0;
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
    if (isKgAmountProduct(product)) {
      return `- ${product.name} - ${formatKgAmount(quantity)} - ${money(cartLineTotal({ product, option, quantity }))} (${priceLabel(product)}) - quantidade em kg escolhida pelo cliente`;
    }
    const price = option ? money(optionPrice(product, option)) : priceLabel(product);
    const selected = option ? ` - ${option.label}` : ` - ${displayUnit(product)}`;
    const note = option ? " - opção selecionada pelo cliente" : isVariableWeight(product) ? " - final peso/preço confirmado após pesagem" : "";
    return `- ${lineLabel(product, quantity, option)} ${product.name}${selected} - ${price}${note}`;
  }).join("\n");
  return `Ola Angus Grill, gostaria de fazer um pedido:

Nome: ${form.name || "A informar"}
Contato: ${form.contact || "A informar"}
Tipo: ${type}
${form.fulfilmentType === "delivery" ? `Endereço: ${form.address || "A informar"}\n${form.addressLine2 ? `Complemento: ${form.addressLine2}\n` : ""}Cidade: ${form.city || "A informar"}\nPostcode: ${form.postcode || "A informar"}\n` : ""}Data preferida: ${form.preferredDate || "A combinar"}
Horário: ${form.preferredTime || "Combinar pelo WhatsApp"}

Produtos:
${products}

Subtotal produtos: ${cartSubtotalLabel()}
${form.fulfilmentType === "delivery" ? `Zona de entrega: ${DELIVERY_ZONES[form.deliveryZone]?.label || "A confirmar"}\nTaxa de entrega: ${deliveryFeeLabel()}\n` : "Retirada na loja: sem taxa de entrega\n"}Total/estimativa: ${orderTotalLabel()}
${cartHasVariableWeight() ? "Obs: itens por kg podem variar conforme o peso real separado pela equipe." : ""}
${form.fulfilmentType === "delivery" && form.deliveryZone === "outside" ? "Obs entrega: endereço possívelmente fora do raio maximo de 15 milhas, confirmar disponibilidade.\n" : ""}

Observações para entrega:
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
    if ("kgInc" in target.dataset && state.modalProduct) updateModalKgAmount(stepKgAmount(state.modalKgAmount, 1));
    if ("kgDec" in target.dataset && state.modalProduct) updateModalKgAmount(stepKgAmount(state.modalKgAmount, -1));
    if (target.dataset.inc) {
      const existing = state.cart.get(target.dataset.inc);
      const step = existing && isKgAmountProduct(existing.product) ? 0.25 : 1;
      setCartQuantity(target.dataset.inc, (existing?.quantity || 0) + step);
    }
    if (target.dataset.dec) {
      const existing = state.cart.get(target.dataset.dec);
      const step = existing && isKgAmountProduct(existing.product) ? 0.25 : 1;
      setCartQuantity(target.dataset.dec, (existing?.quantity || 0) - step);
    }
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
    if (state.modalProduct && isKgAmountProduct(state.modalProduct)) {
      addToCart(state.modalProduct.id, state.modalKgAmount, "kgAmount");
    } else if (state.modalProduct) {
      addToCart(state.modalProduct.id, 1, state.modalOptionId);
    }
    closeModal();
    openCart();
  });
  elements.modalOptions.addEventListener("input", (event) => {
    if (event.target.id === "modalKgAmount") updateModalKgDraft(event.target.value);
  });
  elements.modalOptions.addEventListener("change", (event) => {
    if (event.target.id === "modalKgAmount") updateModalKgAmount(event.target.value);
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
  const preferredDate = elements.checkoutForm.querySelector('input[name="preferredDate"]');
  if (preferredDate) preferredDate.min = new Date().toISOString().slice(0, 10);
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
