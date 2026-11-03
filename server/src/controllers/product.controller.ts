import mongoose from "mongoose";
import type { HydratedDocument, Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { requireTenantId } from "../utils/request.js";
import { toDollars } from "../utils/money.js";
import { deleteImageByUrl } from "../utils/file.js";
import { MAX_PRODUCTS_PER_TENANT, MAX_IMAGES_PER_PRODUCT } from "../config/limits.js";
import { ProductModel } from "../models/Product.js";
import type { Product } from "../models/Product.js";
import { CategoryModel } from "../models/Category.js";
import { generateProductSlug } from "../services/slug.service.js";
import { persistImages } from "../services/image.service.js";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../schemas/product.schema.js";

type ProductDoc = HydratedDocument<Product>;

function toProductDTO(p: ProductDoc) {
  return {
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: toDollars(p.price),
    categoryId: p.categoryId?.toString() ?? null,
    categoryName: p.categoryName,
    status: p.status,
    trackInventory: p.trackInventory,
    stock: p.stock,
    images: p.images,
    createdAt: p.createdAt,
  };
}

async function resolveCategory(
  tenantId: string,
  categoryId?: string | null
): Promise<{ categoryId: Types.ObjectId | null; categoryName: string }> {
  if (!categoryId) {
    return { categoryId: null, categoryName: "" };
  }
  if (!mongoose.isValidObjectId(categoryId)) {
    throw ApiError.badRequest("Categoría inválida");
  }
  const category = await CategoryModel.findOne({ _id: categoryId, tenantId });
  if (!category) {
    throw ApiError.badRequest("Categoría no encontrada");
  }
  return { categoryId: category._id, categoryName: category.name };
}

export const list = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const { status, category } = req.query;

  const filter: Record<string, unknown> = { tenantId };
  if (status) filter.status = status;
  if (category) filter.categoryId = category;

  const [items, total] = await Promise.all([
    ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  res.json({
    items: items.map(toProductDTO),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const get = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const product = await ProductModel.findOne({ _id: req.params.id, tenantId });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }
  res.json(toProductDTO(product));
});

export const create = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const input = req.body as CreateProductInput;

  const count = await ProductModel.countDocuments({ tenantId });
  if (count >= MAX_PRODUCTS_PER_TENANT) {
    throw ApiError.badRequest(
      `Has alcanzado el límite de ${MAX_PRODUCTS_PER_TENANT} productos`
    );
  }

  const { categoryId, categoryName } = await resolveCategory(
    tenantId,
    input.categoryId
  );
  const slug = await generateProductSlug(tenantId, input.name);

  const product = await ProductModel.create({
    tenantId,
    name: input.name,
    slug,
    description: input.description,
    price: input.price,
    categoryId,
    categoryName,
    trackInventory: input.trackInventory,
    stock: input.stock,
    status: input.status,
    images: [],
  });

  res.status(201).json(toProductDTO(product));
});

export const update = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const input = req.body as UpdateProductInput;

  const product = await ProductModel.findOne({
    _id: req.params.id,
    tenantId,
  });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }

  if (input.name !== undefined) {
    product.name = input.name;
    product.slug = await generateProductSlug(tenantId, input.name);
  }
  if (input.description !== undefined) product.description = input.description;
  if (input.price !== undefined) product.price = input.price;
  if (input.trackInventory !== undefined) product.trackInventory = input.trackInventory;
  if (input.stock !== undefined) product.stock = input.stock;
  if (input.status !== undefined) product.status = input.status;
  if (input.categoryId !== undefined) {
    const { categoryId, categoryName } = await resolveCategory(
      tenantId,
      input.categoryId
    );
    product.categoryId = categoryId;
    product.categoryName = categoryName;
  }

  await product.save();
  res.json(toProductDTO(product));
});

export const addImages = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const files = (req.files as Express.Multer.File[]) ?? [];

  if (files.length === 0) {
    throw ApiError.badRequest("Debes enviar al menos una imagen");
  }

  const product = await ProductModel.findOne({
    _id: req.params.id,
    tenantId,
  });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }

  if (product.images.length + files.length > MAX_IMAGES_PER_PRODUCT) {
    throw ApiError.badRequest(
      `Un producto puede tener como máximo ${MAX_IMAGES_PER_PRODUCT} imágenes`
    );
  }

  const urls = await persistImages(files);
  product.images = [...product.images, ...urls];
  await product.save();

  res.json(toProductDTO(product));
});

export const removeImage = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const { id, filename } = req.params;

  const product = await ProductModel.findOne({ _id: id, tenantId });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }

  const url = product.images.find((img) => img.endsWith(`/${filename}`));
  if (!url) {
    throw ApiError.notFound("Imagen no encontrada");
  }

  product.images = product.images.filter((img) => img !== url);
  await product.save();
  await deleteImageByUrl(url);

  res.json(toProductDTO(product));
});

export const remove = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);

  const product = await ProductModel.findOne({
    _id: req.params.id,
    tenantId,
  });
  if (!product) {
    throw ApiError.notFound("Producto no encontrado");
  }

  await Promise.all(product.images.map(deleteImageByUrl));
  await product.deleteOne();

  res.json({ message: "Producto eliminado" });
});
