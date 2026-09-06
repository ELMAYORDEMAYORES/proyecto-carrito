export type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";
export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type TenantStatus = "PENDING" | "ACTIVE" | "REJECTED" | "INACTIVE";
export type UserRole = "SUPER_ADMIN" | "OWNER" | "ADMIN" | "STAFF";

export interface MockProduct {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  status: ProductStatus;
  categoryId: string;
  categoryName: string;
  trackInventory: boolean;
  stock: number;
  images: string[];
  createdAt: string;
}

export interface MockOrderItem {
  id: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  productSnapshot: {
    name: string;
    price: number;
    imageUrl: string;
  };
}

export interface MockOrder {
  id: string;
  tenantId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  total: number;
  notes: string | null;
  items: MockOrderItem[];
  createdAt: string;
}

export interface MockCategory {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
}

export interface MockTenant {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string;
  email: string;
  phone: string;
  address: string;
  status: TenantStatus;
  rejectionReason: string | null;
  config: {
    showPhone: boolean;
    showAddress: boolean;
    showEmail: boolean;
    showDescription: boolean;
  };
}

export const mockCategories: MockCategory[] = [
  { id: "cat-1", tenantId: "mock-tenant-001", name: "Electrónica", slug: "electronica" },
  { id: "cat-2", tenantId: "mock-tenant-001", name: "Hogar", slug: "hogar" },
  { id: "cat-3", tenantId: "mock-tenant-001", name: "Ropa", slug: "ropa" },
  { id: "cat-4", tenantId: "mock-tenant-001", name: "Deportes", slug: "deportes" },
  { id: "cat-5", tenantId: "mock-tenant-001", name: "Libros", slug: "libros" },
];

const IMG_AURICULARES =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop";
const IMG_LAMPARA =
  "https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop";
const IMG_CAMISETA =
  "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=300&fit=crop";
const IMG_ZAPATILLAS =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop";
const IMG_LIBRO =
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=300&fit=crop";
const IMG_TECLADO =
  "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400&h=300&fit=crop";
const IMG_SARTENES =
  "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&h=300&fit=crop";
const IMG_MOCHILA =
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop";

export const mockProducts: MockProduct[] = [
  {
    id: "prod-1",
    tenantId: "mock-tenant-001",
    name: "Auriculares Bluetooth Pro",
    slug: "auriculares-bluetooth-pro",
    description: "Auriculares inalámbricos con cancelación de ruido activa, 30 horas de batería.",
    price: 89.99,
    status: "ACTIVE",
    categoryId: "cat-1",
    categoryName: "Electrónica",
    trackInventory: true,
    stock: 15,
    images: [IMG_AURICULARES],
    createdAt: "2026-07-15T10:00:00Z",
  },
  {
    id: "prod-2",
    tenantId: "mock-tenant-001",
    name: "Lámpara LED Inteligente",
    slug: "lampara-led-inteligente",
    description: "Lámpara con control por app, 16 millones de colores, compatible con Alexa y Google Home.",
    price: 24.99,
    status: "ACTIVE",
    categoryId: "cat-2",
    categoryName: "Hogar",
    trackInventory: true,
    stock: 30,
    images: [IMG_LAMPARA],
    createdAt: "2026-07-14T10:00:00Z",
  },
  {
    id: "prod-3",
    tenantId: "mock-tenant-001",
    name: "Camiseta Algodón Premium",
    slug: "camiseta-algodon-premium",
    description: "Camiseta 100% algodón peinado, disponible en talles S al XXL.",
    price: 15.99,
    status: "ACTIVE",
    categoryId: "cat-3",
    categoryName: "Ropa",
    trackInventory: true,
    stock: 50,
    images: [IMG_CAMISETA],
    createdAt: "2026-07-13T10:00:00Z",
  },
  {
    id: "prod-4",
    tenantId: "mock-tenant-001",
    name: "Zapatillas Running Ultra",
    slug: "zapatillas-running-ultra",
    description: "Zapatillas con amortiguación avanzada para corredores de larga distancia.",
    price: 79.99,
    status: "ACTIVE",
    categoryId: "cat-4",
    categoryName: "Deportes",
    trackInventory: true,
    stock: 20,
    images: [IMG_ZAPATILLAS],
    createdAt: "2026-07-12T10:00:00Z",
  },
  {
    id: "prod-5",
    tenantId: "mock-tenant-001",
    name: "El Arte del Código Limpio",
    slug: "el-arte-del-codigo-limpio",
    description: "Guía práctica para escribir código mantenible y escalable.",
    price: 34.99,
    status: "ACTIVE",
    categoryId: "cat-5",
    categoryName: "Libros",
    trackInventory: false,
    stock: 0,
    images: [IMG_LIBRO],
    createdAt: "2026-07-11T10:00:00Z",
  },
  {
    id: "prod-6",
    tenantId: "mock-tenant-001",
    name: "Teclado Mecánico RGB",
    slug: "teclado-mecanico-rgb",
    description: "Teclado mecánico con switches Cherry MX Red, retroiluminación RGB por tecla.",
    price: 64.99,
    status: "INACTIVE",
    categoryId: "cat-1",
    categoryName: "Electrónica",
    trackInventory: true,
    stock: 8,
    images: [IMG_TECLADO],
    createdAt: "2026-07-10T10:00:00Z",
  },
  {
    id: "prod-7",
    tenantId: "mock-tenant-001",
    name: "Set de Sartenes Antiadherentes",
    slug: "set-sartenes-antiadherentes",
    description: "Set de 3 sartenes con recubrimiento cerámico libre de PFOA.",
    price: 45.99,
    status: "ACTIVE",
    categoryId: "cat-2",
    categoryName: "Hogar",
    trackInventory: true,
    stock: 0,
    images: [IMG_SARTENES],
    createdAt: "2026-07-09T10:00:00Z",
  },
  {
    id: "prod-8",
    tenantId: "mock-tenant-001",
    name: "Mochila Impermeable 40L",
    slug: "mochila-impermeable-40l",
    description: "Mochila resistente al agua, compartimento acolchado para laptop.",
    price: 39.99,
    status: "ARCHIVED",
    categoryId: "cat-4",
    categoryName: "Deportes",
    trackInventory: false,
    stock: 0,
    images: [IMG_MOCHILA],
    createdAt: "2026-06-01T10:00:00Z",
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: "ord-001",
    tenantId: "mock-tenant-001",
    customerName: "Carlos López",
    customerEmail: "carlos@email.com",
    customerPhone: "+54 11 5555-0001",
    status: "PENDING",
    total: 89.99,
    notes: null,
    createdAt: "2026-07-26T14:30:00Z",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Auriculares Bluetooth Pro",
        productPrice: 89.99,
        quantity: 1,
        productSnapshot: {
          name: "Auriculares Bluetooth Pro",
          price: 89.99,
          imageUrl: IMG_AURICULARES,
        },
      },
    ],
  },
  {
    id: "ord-002",
    tenantId: "mock-tenant-001",
    customerName: "Ana Martínez",
    customerEmail: "ana@email.com",
    customerPhone: "+54 11 5555-0002",
    status: "CONFIRMED",
    total: 31.98,
    notes: "Envolver para regalo por favor",
    createdAt: "2026-07-26T10:00:00Z",
    items: [
      {
        id: "item-2",
        productId: "prod-3",
        productName: "Camiseta Algodón Premium",
        productPrice: 15.99,
        quantity: 2,
        productSnapshot: {
          name: "Camiseta Algodón Premium",
          price: 15.99,
          imageUrl: IMG_CAMISETA,
        },
      },
    ],
  },
  {
    id: "ord-003",
    tenantId: "mock-tenant-001",
    customerName: "Pedro Sánchez",
    customerEmail: "pedro@email.com",
    customerPhone: "+54 11 5555-0003",
    status: "DELIVERED",
    total: 114.98,
    notes: null,
    createdAt: "2026-07-25T09:00:00Z",
    items: [
      {
        id: "item-3",
        productId: "prod-1",
        productName: "Auriculares Bluetooth Pro",
        productPrice: 89.99,
        quantity: 1,
        productSnapshot: {
          name: "Auriculares Bluetooth Pro",
          price: 89.99,
          imageUrl: IMG_AURICULARES,
        },
      },
      {
        id: "item-4",
        productId: "prod-2",
        productName: "Lámpara LED Inteligente",
        productPrice: 24.99,
        quantity: 1,
        productSnapshot: {
          name: "Lámpara LED Inteligente",
          price: 24.99,
          imageUrl: IMG_LAMPARA,
        },
      },
    ],
  },
  {
    id: "ord-004",
    tenantId: "mock-tenant-001",
    customerName: "Laura Fernández",
    customerEmail: "laura@email.com",
    customerPhone: "+54 11 5555-0004",
    status: "CANCELLED",
    total: 15.99,
    notes: "Cliente canceló por demora",
    createdAt: "2026-07-24T16:00:00Z",
    items: [
      {
        id: "item-5",
        productId: "prod-3",
        productName: "Camiseta Algodón Premium",
        productPrice: 15.99,
        quantity: 1,
        productSnapshot: {
          name: "Camiseta Algodón Premium",
          price: 15.99,
          imageUrl: IMG_CAMISETA,
        },
      },
    ],
  },
  {
    id: "ord-005",
    tenantId: "mock-tenant-001",
    customerName: "Martín Díaz",
    customerEmail: "martin@email.com",
    customerPhone: "+54 11 5555-0005",
    status: "PENDING",
    total: 169.98,
    notes: "Entrega en oficina, horario 9-18hs",
    createdAt: "2026-07-26T15:45:00Z",
    items: [
      {
        id: "item-6",
        productId: "prod-4",
        productName: "Zapatillas Running Ultra",
        productPrice: 79.99,
        quantity: 1,
        productSnapshot: {
          name: "Zapatillas Running Ultra",
          price: 79.99,
          imageUrl: IMG_ZAPATILLAS,
        },
      },
      {
        id: "item-7",
        productId: "prod-1",
        productName: "Auriculares Bluetooth Pro",
        productPrice: 89.99,
        quantity: 1,
        productSnapshot: {
          name: "Auriculares Bluetooth Pro",
          price: 89.99,
          imageUrl: IMG_AURICULARES,
        },
      },
    ],
  },
];

export const mockTenant: MockTenant = {
  id: "mock-tenant-001",
  name: "Mi Tienda",
  slug: "mi-tienda",
  logoUrl: null,
  bannerUrl: null,
  description: "Tu tienda de confianza con los mejores productos seleccionados.",
  email: "contacto@mitienda.com",
  phone: "+54 11 4444-0000",
  address: "Av. Corrientes 1234, CABA",
  status: "ACTIVE",
  rejectionReason: null,
  config: {
    showPhone: true,
    showAddress: true,
    showEmail: true,
    showDescription: true,
  },
};

export const mockPendingTenants: MockTenant[] = [
  {
    id: "ten-pend-1",
    name: "Panadería El Trigo",
    slug: "panaderia-el-trigo",
    logoUrl: null,
    bannerUrl: null,
    description: "Panadería artesanal con 20 años de trayectoria.",
    email: "info@eltrigo.com",
    phone: "+54 11 3333-0001",
    address: "Av. Rivadavia 5000, CABA",
    status: "PENDING",
    rejectionReason: null,
    config: {
      showPhone: true,
      showAddress: true,
      showEmail: true,
      showDescription: true,
    },
  },
  {
    id: "ten-pend-2",
    name: "Librería Universitaria",
    slug: "libreria-universitaria",
    logoUrl: null,
    bannerUrl: null,
    description: "Todos los libros para tu carrera universitaria.",
    email: "ventas@libreriauniv.com",
    phone: "+54 11 3333-0002",
    address: "Calle 50 e/ 6 y 7, La Plata",
    status: "PENDING",
    rejectionReason: null,
    config: {
      showPhone: false,
      showAddress: true,
      showEmail: true,
      showDescription: true,
    },
  },
  {
    id: "ten-pend-3",
    name: "Tech Solutions",
    slug: "tech-solutions",
    logoUrl: null,
    bannerUrl: null,
    description: "Soluciones tecnológicas para empresas.",
    email: "contacto@techsolutions.com",
    phone: "+54 11 3333-0003",
    address: "Av. del Libertador 8000, CABA",
    status: "PENDING",
    rejectionReason: null,
    config: {
      showPhone: true,
      showAddress: false,
      showEmail: true,
      showDescription: true,
    },
  },
];

export const mockActiveTenants: MockTenant[] = [
  {
    id: "ten-act-1",
    name: "Deportes Extremos",
    slug: "deportes-extremos",
    logoUrl: null,
    bannerUrl: null,
    description: "Equipamiento para deportes de aventura.",
    email: "info@deportesextremos.com",
    phone: "+54 11 4444-1111",
    address: "Av. Santa Fe 3000, CABA",
    status: "ACTIVE",
    rejectionReason: null,
    config: {
      showPhone: true,
      showAddress: true,
      showEmail: true,
      showDescription: true,
    },
  },
  {
    id: "ten-act-2",
    name: "Vivero Natural",
    slug: "vivero-natural",
    logoUrl: null,
    bannerUrl: null,
    description: "Plantas, macetas y accesorios de jardinería.",
    email: "hola@viveronatural.com",
    phone: "+54 11 4444-2222",
    address: "Av. Belgrano 1500, CABA",
    status: "ACTIVE",
    rejectionReason: null,
    config: {
      showPhone: true,
      showAddress: false,
      showEmail: true,
      showDescription: true,
    },
  },
];

export const mockRejectedTenants: MockTenant[] = [
  {
    id: "ten-rej-1",
    name: "Farmacia Express",
    slug: "farmacia-express",
    logoUrl: null,
    bannerUrl: null,
    description: "Medicamentos y productos de farmacia a domicilio.",
    email: "ventas@farmaciaexpress.com",
    phone: "+54 11 5555-3333",
    address: "Av. Cabildo 2500, CABA",
    status: "REJECTED",
    rejectionReason: "El rubro farmacéutico requiere documentación adicional. Solicita la habilitación de ANMAT y reenvía la solicitud.",
    config: {
      showPhone: false,
      showAddress: false,
      showEmail: true,
      showDescription: true,
    },
  },
];

export const mockAllTenants: MockTenant[] = [
  ...mockPendingTenants,
  ...mockActiveTenants,
  ...mockRejectedTenants,
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
}
