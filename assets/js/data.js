const CATEGORIES = [
  "Todos",
  "Ofertas",
  "Mais Vendidos",
  "Bovino",
  "Frango",
  "Suino",
  "Linguicas",
  "Kits Churrasco",
  "Congelados",
  "Temperos"
];

const PRODUCTS = [
  {
    id: "picanha-premium",
    name: "Picanha Premium",
    category: "Bovino",
    description: "Corte selecionado, ideal para churrasco e ocasioes especiais.",
    price: 19.99,
    oldPrice: 22.99,
    unit: "aprox. 1kg",
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
    unit: "aprox. 1kg",
    image: "assets/images/product-contra-file.png",
    badge: "Mais vendido",
    bestSeller: true,
    inStock: true,
    preparationNote: "Peca para cortar em bifes finos ou grossos."
  },
  {
    id: "fraldinha",
    name: "Fraldinha",
    category: "Bovino",
    description: "Corte suculento, perfeito para grelha, forno ou churrasco.",
    price: 14.99,
    unit: "aprox. 1kg",
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
    unit: "aprox. 1kg",
    image: "assets/images/product-costela.png",
    badge: "Corte especial",
    inStock: true
  },
  {
    id: "linguica-toscana",
    name: "Linguica Toscana Premium",
    category: "Linguicas",
    description: "Linguica suina temperada, ideal para churrasco.",
    price: 8.99,
    unit: "pacote aprox. 1kg",
    image: "assets/images/product-linguica-toscana.png",
    badge: "Mais vendido",
    featured: true,
    bestSeller: true,
    inStock: true
  },
  {
    id: "linguica-frango",
    name: "Linguica de Frango",
    category: "Linguicas",
    description: "Opcao leve e saborosa para grelha ou refeicoes do dia a dia.",
    price: 7.99,
    unit: "pacote aprox. 1kg",
    image: "assets/images/product-assortment.png",
    inStock: true
  },
  {
    id: "coxa-sobrecoxa",
    name: "Coxa e Sobrecoxa de Frango",
    category: "Frango",
    description: "Frango fresco, otimo para assar, grelhar ou preparar em familia.",
    price: 5.99,
    unit: "aprox. 1kg",
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
    unit: "aprox. 1kg",
    image: "assets/images/product-assortment.png",
    bestSeller: true,
    inStock: true
  },
  {
    id: "bisteca-suina",
    name: "Bisteca Suina",
    category: "Suino",
    description: "Corte tradicional, saboroso e pratico para o dia a dia.",
    price: 7.49,
    unit: "aprox. 1kg",
    image: "assets/images/product-assortment.png",
    inStock: true
  },
  {
    id: "carne-moida",
    name: "Carne Moida",
    category: "Bovino",
    description: "Moida fresca, ideal para receitas, hamburgueres e refeicoes rapidas.",
    price: 9.99,
    unit: "aprox. 1kg",
    image: "assets/images/product-assortment.png",
    badge: "Fresco",
    inStock: true,
    preparationNote: "Moer na hora quando disponivel."
  },
  {
    id: "hamburguer-artesanal",
    name: "Hamburguer Artesanal",
    category: "Congelados",
    description: "Hamburguer preparado com carne selecionada.",
    price: 6.99,
    unit: "pacote com 4 unidades",
    image: "assets/images/product-assortment.png",
    badge: "Pratico",
    inStock: true
  },
  {
    id: "kit-churrasco-familia",
    name: "Kit Churrasco Familia",
    category: "Kits Churrasco",
    description: "Selecao pratica com carnes e linguicas para reunir a familia.",
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
    description: "Cortes especiais para uma experiencia de churrasco premium.",
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
    description: "Mistura para realcar carnes, frango e suinos.",
    price: 3.99,
    unit: "pote 150g",
    image: "assets/images/product-assortment.png",
    inStock: false
  }
];
