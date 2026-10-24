export const STORE_INFO = {
  name: process.env.NEXT_PUBLIC_STORE_NAME || "Mer Kilmurray Design",
  owner: "Mercedes",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+54 358 460-3609",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5493584603609",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/merkilmurray.design",
  instagramHandle: process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || "@merkilmurray.design",
  location: "Río Cuarto, Córdoba, Argentina",
  story: `Mi nombre es Mercedes. Soy diseñadora de indumentaria y licenciada en Diseño, y este proyecto nació de una necesidad propia: organizar mejor mi espacio de trabajo, mis herramientas de costura y mi día a día. Hoy, busco transformar esa necesidad en productos funcionales que también ayuden a otras personas a organizarse y hacer su rutina un poquito más fácil.`,
};

export const DELIVERY_OPTIONS = [
  {
    id: "retiro" as const,
    title: "Retiro por domicilio",
    description: "Coordinamos día y horario para retirar sin costo.",
    price: 0,
    requiresAddress: false,
  },
  {
    id: "cadeteria" as const,
    title: "Cadetería local",
    description: "Entrega a domicilio dentro de la ciudad.",
    price: null, // A coordinar según zona
    requiresAddress: true,
  },
  {
    id: "andreani" as const,
    title: "Envío Andreani",
    description: "Envío a sucursal o domicilio a todo el país.",
    price: null, // A cotizar según código postal
    requiresAddress: true,
  },
];

export const PAYMENT_OPTIONS = [
  {
    id: "transferencia" as const,
    title: "Transferencia bancaria",
    description: "Te pasamos el Alias y CBU al confirmar por WhatsApp.",
  },
  {
    id: "efectivo" as const,
    title: "Efectivo",
    description: "Al momento de retirar en persona.",
  },
];

export const COLOR_PALETTE = [
  { name: "Gris", hex: "#71717A" },
  { name: "Bordó", hex: "#800020" },
  { name: "Verde", hex: "#2D5A27" },
];
