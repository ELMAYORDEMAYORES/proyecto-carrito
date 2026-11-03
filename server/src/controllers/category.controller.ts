import type { HydratedDocument } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { requireTenantId } from "../utils/request.js";
import { MAX_CATEGORIES_PER_TENANT } from "../config/limits.js";
import { CategoryModel } from "../models/Category.js";
import type { Category } from "../models/Category.js";
import { ProductModel } from "../models/Product.js";
import { generateCategorySlug } from "../services/slug.service.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema.js";

type CategoryDoc = HydratedDocument<Category>;

function toCategoryDTO(c: CategoryDoc) {
  return {
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
  };
}

export const list = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const categories = await CategoryModel.find({ tenantId }).sort({ name: 1 });
  res.json({ items: categories.map(toCategoryDTO) });
});

export const create = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const { name } = req.body as CreateCategoryInput;

  const count = await CategoryModel.countDocuments({ tenantId });
  if (count >= MAX_CATEGORIES_PER_TENANT) {
    throw ApiError.badRequest(
      `Has alcanzado el límite de ${MAX_CATEGORIES_PER_TENANT} categorías`
    );
  }

  const slug = await generateCategorySlug(tenantId, name);
  const category = await CategoryModel.create({ tenantId, name, slug });
  res.status(201).json(toCategoryDTO(category));
});

export const update = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const { id } = req.params;
  const { name } = req.body as UpdateCategoryInput;

  const category = await CategoryModel.findOne({ _id: id, tenantId });
  if (!category) {
    throw ApiError.notFound("Categoría no encontrada");
  }

  category.name = name;
  await category.save();

  res.json(toCategoryDTO(category));
});

export const remove = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const { id } = req.params;

  const category = await CategoryModel.findOne({ _id: id, tenantId });
  if (!category) {
    throw ApiError.notFound("Categoría no encontrada");
  }

  await category.deleteOne();

  await ProductModel.updateMany(
    { tenantId, categoryId: category._id },
    { $set: { categoryId: null, categoryName: "" } }
  );

  res.json({ message: "Categoría eliminada" });
});
