const CATEGORIES = [
  "Todos",
  "Ofertas",
  "Mais Vendidos",
  "Bovino",
  "Linguiças",
  "Mercearia",
  "Congelados",
  "Temperos",
  "Bebidas",
  "Doces",
  "Utilidades",
  "Beleza",
  "Livros"
];

const ANGUS_GRILL_PRODUCTS = [
  {
    id: "picanha-premium",
    name: "Picanha Premium",
    category: "Bovino",
    description: "Corte selecionado, ideal para churrasco e ocasiões especiais.",
    price: 19.99,
    oldPrice: 22.99,
    pricingType: "perKg",
    orderUnit: "peça",
    estimatedWeight: "1.2kg - 1.8kg",
    unit: "1 peça aprox. 1.2kg - 1.8kg",
    pricingNote: "Escolha uma faixa de peso disponível antes de adicionar.",
    weightOptions: [
      { id: "picanha-1200-1400", label: "1.200kg a 1.400kg", weightKg: 1.3, price: 25.99, stock: 4 },
      { id: "picanha-1400-1600", label: "1.400kg a 1.600kg", weightKg: 1.5, price: 29.99, stock: 5 },
      { id: "picanha-1600-1800", label: "1.600kg a 1.800kg", weightKg: 1.7, price: 33.98, stock: 3 }
    ],
    image: "assets/images/product-picanha.png",
    badge: "Oferta",
    featured: true,
    bestSeller: true,
    inStock: true,
    preparationNote: "Pode ser preparada inteira ou fatiada para churrasco."
  },
  {
    id: "contra-file",
    name: "Contra-file",
    category: "Bovino",
    description: "Corte macio e saboroso para bifes, grelha ou churrasco.",
    price: 15.99,
    pricingType: "perKg",
    orderUnit: "peça",
    estimatedWeight: "1kg - 1.5kg",
    unit: "1 peça aprox. 1kg - 1.5kg",
    pricingNote: "Escolha uma faixa de peso disponível antes de adicionar.",
    weightOptions: [
      { id: "contra-1000-1200", label: "1.000kg a 1.200kg", weightKg: 1.1, price: 17.59, stock: 3 },
      { id: "contra-1200-1400", label: "1.200kg a 1.400kg", weightKg: 1.3, price: 20.79, stock: 4 },
      { id: "contra-1400-1600", label: "1.400kg a 1.600kg", weightKg: 1.5, price: 23.99, stock: 2 }
    ],
    image: "assets/images/product-contra-file.png",
    badge: "Mais vendido",
    bestSeller: true,
    inStock: true,
    preparationNote: "Peça para cortar em bifes finos ou grossos."
  },
  {
    id: "fraldinha",
    name: "Fraldinha",
    category: "Bovino",
    description: "Corte suculento, perfeito para grelha, forno ou churrasco.",
    price: 14.99,
    pricingType: "perKg",
    orderUnit: "peça",
    estimatedWeight: "800g - 1.3kg",
    unit: "1 peça aprox. 800g - 1.3kg",
    pricingNote: "Escolha uma faixa de peso disponível antes de adicionar.",
    weightOptions: [
      { id: "fraldinha-0800-1000", label: "800g a 1.000kg", weightKg: 0.9, price: 13.49, stock: 4 },
      { id: "fraldinha-1000-1200", label: "1.000kg a 1.200kg", weightKg: 1.1, price: 16.49, stock: 3 },
      { id: "fraldinha-1200-1400", label: "1.200kg a 1.400kg", weightKg: 1.3, price: 19.49, stock: 2 }
    ],
    image: "assets/images/product-fraldinha.png",
    bestSeller: true,
    inStock: true
  },
  {
    id: "costela-bovina",
    name: "Costela Bovina",
    category: "Bovino",
    description: "Ideal para assados longos, churrasco e preparo tradicional.",
    price: 11.99,
    pricingType: "perKg",
    orderUnit: "peça",
    estimatedWeight: "1kg - 2kg",
    unit: "1 peça aprox. 1kg - 2kg",
    pricingNote: "Escolha uma faixa de peso disponível antes de adicionar.",
    weightOptions: [
      { id: "costela-1000-1300", label: "1.000kg a 1.300kg", weightKg: 1.15, price: 13.79, stock: 3 },
      { id: "costela-1300-1600", label: "1.300kg a 1.600kg", weightKg: 1.45, price: 17.39, stock: 3 },
      { id: "costela-1600-2000", label: "1.600kg a 2.000kg", weightKg: 1.8, price: 21.58, stock: 2 }
    ],
    image: "assets/images/product-costela.png",
    badge: "Corte especial",
    inStock: true
  },
  {
    id: "linguica-toscana",
    name: "Linguiça Toscana Premium",
    category: "Linguiças",
    description: "Linguiça suína temperada, ideal para churrasco.",
    price: 8.99,
    pricingType: "perKg",
    orderUnit: "pacote",
    estimatedWeight: "800g - 1kg",
    unit: "pacote aprox. 800g - 1kg",
    pricingNote: "Escolha o tamanho do pacote disponível.",
    weightOptions: [
      { id: "linguica-toscana-800g", label: "Pacote 800g", weightKg: 0.8, price: 7.19, stock: 8 },
      { id: "linguica-toscana-1kg", label: "Pacote 1kg", weightKg: 1, price: 8.99, stock: 10 }
    ],
    image: "assets/images/product-linguica-toscana.png",
    badge: "Mais vendido",
    featured: true,
    bestSeller: true,
    inStock: true
  },
  {
    id: "linguica-frango",
    name: "Linguiça de Frango",
    category: "Linguiças",
    description: "Opção leve e saborosa para grelha ou refeições do dia a dia.",
    price: 7.99,
    pricingType: "perKg",
    orderUnit: "pacote",
    estimatedWeight: "800g - 1kg",
    unit: "pacote aprox. 800g - 1kg",
    pricingNote: "Escolha o tamanho do pacote disponível.",
    weightOptions: [
      { id: "linguica-frango-800g", label: "Pacote 800g", weightKg: 0.8, price: 6.39, stock: 5 },
      { id: "linguica-frango-1kg", label: "Pacote 1kg", weightKg: 1, price: 7.99, stock: 6 }
    ],
    image: "assets/images/product-assortment.png",
    inStock: true
  },
  {
    id: "coxa-sobrecoxa",
    name: "Coxa e Sobrecoxa de Frango",
    category: "Frango",
    description: "Frango fresco, ótimo para assar, grelhar ou preparar em família.",
    price: 5.99,
    pricingType: "perKg",
    orderUnit: "kg",
    estimatedWeight: "pedido por kg",
    unit: "preço por kg",
    pricingNote: "Escolha a quantidade desejada.",
    weightOptions: [
      { id: "coxa-500g", label: "500g", weightKg: 0.5, price: 3.0, stock: 10 },
      { id: "coxa-1kg", label: "1kg", weightKg: 1, price: 5.99, stock: 10 },
      { id: "coxa-2kg", label: "2kg", weightKg: 2, price: 11.98, stock: 6 }
    ],
    image: "assets/images/product-assortment.png",
    badge: "Fresco",
    inStock: true
  },
  {
    id: "coxinha-asa",
    name: "Coxinha da Asa",
    category: "Frango",
    description: "Perfeita para churrasco, air fryer ou petiscos.",
    price: 6.49,
    pricingType: "perKg",
    orderUnit: "kg",
    estimatedWeight: "pedido por kg",
    unit: "preço por kg",
    pricingNote: "Escolha a quantidade desejada.",
    weightOptions: [
      { id: "asa-500g", label: "500g", weightKg: 0.5, price: 3.25, stock: 10 },
      { id: "asa-1kg", label: "1kg", weightKg: 1, price: 6.49, stock: 10 },
      { id: "asa-2kg", label: "2kg", weightKg: 2, price: 12.98, stock: 6 }
    ],
    image: "assets/images/product-assortment.png",
    bestSeller: true,
    inStock: true
  },
  {
    id: "bisteca-suina",
    name: "Bisteca Suína",
    category: "Suíno",
    description: "Corte tradicional, saboroso e prático para o dia a dia.",
    price: 7.49,
    pricingType: "perKg",
    orderUnit: "kg",
    estimatedWeight: "pedido por kg",
    unit: "preço por kg",
    pricingNote: "Escolha a quantidade desejada.",
    weightOptions: [
      { id: "bisteca-500g", label: "500g", weightKg: 0.5, price: 3.75, stock: 10 },
      { id: "bisteca-1kg", label: "1kg", weightKg: 1, price: 7.49, stock: 10 },
      { id: "bisteca-2kg", label: "2kg", weightKg: 2, price: 14.98, stock: 5 }
    ],
    image: "assets/images/product-assortment.png",
    inStock: true
  },
  {
    id: "carne-moida",
    name: "Carne Moída",
    category: "Bovino",
    description: "Moída fresca, ideal para receitas, hambúrgueres e refeições rápidas.",
    price: 9.99,
    pricingType: "perKg",
    orderUnit: "kg",
    estimatedWeight: "pedido por kg",
    unit: "preço por kg",
    pricingNote: "Escolha a quantidade desejada.",
    weightOptions: [
      { id: "moida-500g", label: "500g", weightKg: 0.5, price: 5.0, stock: 12 },
      { id: "moida-1kg", label: "1kg", weightKg: 1, price: 9.99, stock: 12 },
      { id: "moida-2kg", label: "2kg", weightKg: 2, price: 19.98, stock: 6 }
    ],
    image: "assets/images/product-assortment.png",
    badge: "Fresco",
    inStock: true,
    preparationNote: "Moer na hora quando disponível."
  },
  {
    id: "hamburguer-artesanal",
    name: "Hambúrguer Artesanal",
    category: "Congelados",
    description: "Hambúrguer preparado com carne selecionada.",
    price: 6.99,
    unit: "pacote com 4 unidades",
    image: "assets/images/product-assortment.png",
    badge: "Prático",
    inStock: true
  },
  {
    id: "kit-churrasco-familia",
    name: "Kit Churrasco Família",
    category: "Kits Churrasco",
    description: "Seleção prática com carnes e linguiças para reunir a família.",
    price: 39.99,
    oldPrice: 44.99,
    unit: "serve 4-6 pessoas",
    image: "assets/images/product-kit-churrasco.png",
    badge: "Oferta",
    featured: true,
    bestSeller: true,
    inStock: true
  },
  {
    id: "kit-churrasco-premium",
    name: "Kit Churrasco Premium",
    category: "Kits Churrasco",
    description: "Cortes especiais para uma experiência de churrasco premium.",
    price: 59.99,
    unit: "serve 6-8 pessoas",
    image: "assets/images/product-kit-churrasco.png",
    badge: "Premium",
    featured: true,
    inStock: true
  },
  {
    id: "tempero-churrasco",
    name: "Tempero para Churrasco",
    category: "Temperos",
    description: "Mistura para realçar carnes, frango e suínos.",
    price: 3.99,
    unit: "pote 150g",
    image: "assets/images/product-assortment.png",
    inStock: false
  }
];

const SUPPLIER_PRODUCTS = window.BRASIL_INBOX_PRODUCTS || [];
const PRODUCTS = [...SUPPLIER_PRODUCTS];
