import { Category, Product } from "@/types/database";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "cat-costura",
    name: "Costura",
    slug: "costura",
    description: "Accesorios y protectores para máquinas y kits de costura.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-trabajo",
    name: "Trabajo",
    slug: "trabajo",
    description: "Fundas y accesorios funcionales para notebook y estudio.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cat-cotidiano",
    name: "Cotidiano",
    slug: "cotidiano",
    description: "Organizadores y neceseres para la rutina y los viajes.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    category_id: "cat-costura",
    name: "Bolso para máquina de coser",
    slug: "bolso-para-maquina-de-coser",
    description:
      "Diseñado para guardar y trasladar tu máquina de coser de forma práctica y cómoda. Estructurado para protegerla y mantener todo más organizado.",
    base_price: 140000,
    is_active: true,
    is_featured: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    category: INITIAL_CATEGORIES[0],
    variants: [
      { id: "var-1-1", product_id: "prod-1", color_name: "Gris", color_hex: "#71717A", stock: 5, sku: "BOL-MC-GRI", created_at: "" },
      { id: "var-1-2", product_id: "prod-1", color_name: "Rosa", color_hex: "#E2A6BA", stock: 3, sku: "BOL-MC-ROS", created_at: "" },
      { id: "var-1-3", product_id: "prod-1", color_name: "Verde", color_hex: "#2D5A27", stock: 4, sku: "BOL-MC-VER", created_at: "" },
    ],
  },
  {
    id: "prod-2",
    category_id: "cat-costura",
    name: "Costurero portátil",
    slug: "costurero-portatil",
    description:
      "Un pequeño kit de costura para llevar siempre con vos. Ideal para tener a mano lo esencial y resolver esos pequeños arreglos que aparecen en el día a día.",
    base_price: null, // Precio a definir
    is_active: true,
    is_featured: false,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    category: INITIAL_CATEGORIES[0],
    variants: [
      { id: "var-2-2", product_id: "prod-2", color_name: "Rosa", color_hex: "#E2A6BA", stock: 8, sku: "COS-POR-ROS", created_at: "" },
      { id: "var-2-3", product_id: "prod-2", color_name: "Verde", color_hex: "#2D5A27", stock: 8, sku: "COS-POR-VER", created_at: "" },
    ],
  },
  {
    id: "prod-3",
    category_id: "cat-trabajo",
    name: "Porta notebook",
    slug: "porta-notebook",
    description:
      "Diseñado para transportar y proteger tu notebook de forma práctica. Un complemento funcional para acompañarte en tus jornadas de trabajo, estudio o donde sea que necesites llevarla.",
    base_price: 34500,
    is_active: true,
    is_featured: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    category: INITIAL_CATEGORIES[1],
    variants: [
      { id: "var-3-1", product_id: "prod-3", color_name: "Gris", color_hex: "#71717A", stock: 6, sku: "POR-NOT-GRI", created_at: "" },
      { id: "var-3-2", product_id: "prod-3", color_name: "Rosa", color_hex: "#E2A6BA", stock: 4, sku: "POR-NOT-ROS", created_at: "" },
      { id: "var-3-3", product_id: "prod-3", color_name: "Verde", color_hex: "#2D5A27", stock: 5, sku: "POR-NOT-VER", created_at: "" },
    ],
  },
  {
    id: "prod-4",
    category_id: "cat-cotidiano",
    name: "Neceser organizador",
    slug: "neceser-organizador",
    description:
      "Un básico para guardar y organizar esos objetos que necesitás tener a mano. Práctico y versátil, te acompaña en tu rutina y se adapta a distintos usos. También podés complementarlo con tu bolso para la máquina de coser.",
    base_price: 27000,
    is_active: true,
    is_featured: true,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    category: INITIAL_CATEGORIES[2],
    variants: [
      { id: "var-4-1", product_id: "prod-4", color_name: "Gris", color_hex: "#71717A", stock: 8, sku: "NEC-ORG-GRI", created_at: "" },
      { id: "var-4-2", product_id: "prod-4", color_name: "Rosa", color_hex: "#E2A6BA", stock: 6, sku: "NEC-ORG-ROS", created_at: "" },
      { id: "var-4-3", product_id: "prod-4", color_name: "Verde", color_hex: "#2D5A27", stock: 7, sku: "NEC-ORG-VER", created_at: "" },
    ],
  },
];
