import mongoose from "mongoose";
import type { HydratedDocument, Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getStringParam, getStringQuery } from "../utils/request.js";
import { toDollars } from "../utils/money.js";
import { TenantModel } from "../models/Tenant.js";
import type { Tenant } from "../models/Tenant.js";
import { ProductModel } from "../models/Product.js";
import type { Product } from "../models/Product.js";
import { CategoryModel } from "../models/Category.js";
import { OrderModel } from "../models/Order.js";
import type { Order } from "../models/Order.js";
import type { CreateOrderInput } from "../schemas/catalog.schema.js";

type TenantDoc = HydratedDocument<Tenant>;
type ProductDoc = HydratedDocument<Product>;
type OrderDoc = HydratedDocument<Order>;

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toPublicProductDTO(p: ProductDoc) {
  return {
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: toDollars(p.price),
    categoryName: p.categoryName,
    trackInventory: p.trackInventory,
    stock: p.stock,
    images: p.images,
  };
}

function toOrderDTO(o: OrderDoc) {
  return {
    id: o._id.toString(),
    status: o.status,
    total: toDollars(o.total),
    items: o.items.map((i) => ({
      productName: i.productName,
      productPrice: toDollars(i.productPrice),
      quantity: i.quantity,
      imageUrl: i.snapshot?.imageUrl ?? null,
    })),
    createdAt: o.createdAt,
  };
}

async function findActiveTenant(slug: string): Promise<TenantDoc> {
  const tenant = await TenantModel.findOne({ slug, status: "ACTIVE" });
  if (!tenant) {
    throw ApiError.notFound("Tienda no encontrada");
  }
  return tenant;
}

export const getStore = asyncHandler(async (req, res) => {
  const tenant = await findActiveTenant(getStringParam(req.params.slug));
  const { config } = tenant;

  res.json({
    name: tenant.name,
    slug: tenant.slug,
    logoUrl: tenant.logoUrl,
    bannerUrl: tenant.bannerUrl,
    description: config.showDescription ? tenant.description : undefined,
    slogan: config.showSlogan ? tenant.slogan : undefined,
    email: config.showEmail ? tenant.email : undefined,
    phone: config.showPhone ? tenant.phone : undefined,
    address: config.showAddress ? tenant.address : undefined,
  });
});

export const listCategories = asyncHandler(async (req, res) => {
  const tenant = await findActiveTenant(getStringParam(req.params.slug));
  const categories = await CategoryModel.find({ tenantId: tenant._id }).sort({
    name: 1,
  });
  res.json({
    items: categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    })),
  });
});

export const listProducts = asyncHandler(async (req, res) => {
  const tenant = await findActiveTenant(getStringParam(req.params.slug));

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 24));
  const category = getStringQuery(req.query.category);
  const search = getStringQuery(req.query.search);

  const filter: Record<string, unknown> = {
    tenantId: tenant._id,
    status: "ACTIVE",
  };

  if (category) {
    const cat = await CategoryModel.findOne({
      tenantId: tenant._id,
      slug: category,
    });
    if (!cat) {
      res.json({ items: [], total: 0, page, limit, totalPages: 0 });
      return;
    }
    filter.categoryId = cat._id;
  }

  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: "i" };
  }

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  res.json({
    items: items.map(toPublicProductDTO),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const tenant = await findActiveTenant(getStringParam(req.params.slug));

  const product = await ProductModel.findOne({
    _id: getStringParam(req.params.id),
    tenantId: tenant._id,
    status: "ACTIVE",
  });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }

  res.json(toPublicProductDTO(product));
});

export const createOrder = asyncHandler(async (req, res) => {
  const tenant = await findActiveTenant(getStringParam(req.params.slug));
  const input = req.body as CreateOrderInput;

  for (const item of input.items) {
    if (!mongoose.isValidObjectId(item.productId)) {
      throw ApiError.badRequest("Producto inválido");
    }
  }

  const productIds = input.items.map((i) => i.productId);
  const products = await ProductModel.find({
    _id: { $in: productIds },
    tenantId: tenant._id,
  });

  const productMap = new Map(
    products.map((p) => [p._id.toString(), p])
  );

  const orderItems: {
    productId: Types.ObjectId;
    productName: string;
    productPrice: number;
    quantity: number;
    trackInventory: boolean;
    snapshot: { name: string; price: number; imageUrl: string | null };
  }[] = [];

  let total = 0;

  for (const item of input.items) {
    const product = productMap.get(item.productId);
    if (!product || product.status !== "ACTIVE") {
      throw ApiError.badRequest("Uno o más productos no están disponibles");
    }
    if (product.trackInventory && product.stock < item.quantity) {
      throw ApiError.badRequest(
        `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`
      );
    }

    total += product.price * item.quantity;

    orderItems.push({
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      quantity: item.quantity,
      trackInventory: product.trackInventory,
      snapshot: {
        name: product.name,
        price: product.price,
        imageUrl: product.images[0] ?? null,
      },
    });
  }

  for (const item of orderItems) {
    if (!item.trackInventory) {
      continue;
    }
    const result = await ProductModel.updateOne(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (result.matchedCount === 0) {
      throw ApiError.conflict(
        `El stock de "${item.productName}" cambió. Revisa tu pedido e inténtalo de nuevo.`
      );
    }
  }

  const order = await OrderModel.create({
    tenantId: tenant._id,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    notes: input.notes ?? null,
    total,
    status: "PENDING",
    items: orderItems.map(
      ({ productId, productName, productPrice, quantity, snapshot }) => ({
        productId,
        productName,
        productPrice,
        quantity,
        snapshot,
      })
    ),
  });

  res.status(201).json(toOrderDTO(order));
});
