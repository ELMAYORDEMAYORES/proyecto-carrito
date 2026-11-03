import type { HydratedDocument } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { deleteImageByUrl } from "../utils/file.js";
import { TenantModel } from "../models/Tenant.js";
import type { Tenant } from "../models/Tenant.js";
import { resolveTenantSlug } from "../services/slug.service.js";
import { persistImages } from "../services/image.service.js";
import type { UpdateTenantInput } from "../schemas/tenant.schema.js";

type TenantDoc = HydratedDocument<Tenant>;

function toTenantDTO(t: TenantDoc) {
  return {
    id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    description: t.description,
    slogan: t.slogan,
    email: t.email,
    phone: t.phone,
    address: t.address,
    logoUrl: t.logoUrl,
    bannerUrl: t.bannerUrl,
    status: t.status,
    rejectionReason: t.rejectionReason,
    config: {
      showPhone: t.config.showPhone,
      showAddress: t.config.showAddress,
      showEmail: t.config.showEmail,
      showDescription: t.config.showDescription,
      showSlogan: t.config.showSlogan,
    },
  };
}

export const getMe = asyncHandler(async (req, res) => {
  const tenant = await TenantModel.findOne({ ownerId: req.userId });
  if (!tenant) {
    throw ApiError.notFound("Negocio no encontrado");
  }
  res.json(toTenantDTO(tenant));
});

export const updateMe = asyncHandler(async (req, res) => {
  const input = req.body as UpdateTenantInput;
  const tenant = await TenantModel.findOne({ ownerId: req.userId });
  if (!tenant) {
    throw ApiError.notFound("Negocio no encontrado");
  }

  if (input.slug && input.slug !== tenant.slug) {
    tenant.slug = await resolveTenantSlug(input.slug);
  }
  if (input.name !== undefined) tenant.name = input.name;
  if (input.description !== undefined) tenant.description = input.description;
  if (input.slogan !== undefined) tenant.slogan = input.slogan;
  if (input.email !== undefined) tenant.email = input.email;
  if (input.phone !== undefined) tenant.phone = input.phone;
  if (input.address !== undefined) tenant.address = input.address;
  if (input.config !== undefined) {
    tenant.config = { ...tenant.config, ...input.config };
  }

  await tenant.save();
  res.json(toTenantDTO(tenant));
});

export const uploadLogo = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    throw ApiError.badRequest("Debes enviar una imagen");
  }
  const tenant = await TenantModel.findOne({ ownerId: req.userId });
  if (!tenant) {
    throw ApiError.notFound("Negocio no encontrado");
  }

  const [url] = await persistImages([file]);
  const previous = tenant.logoUrl;
  tenant.logoUrl = url;
  await tenant.save();

  if (previous) {
    await deleteImageByUrl(previous);
  }

  res.json({ logoUrl: url });
});

export const uploadBanner = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    throw ApiError.badRequest("Debes enviar una imagen");
  }
  const tenant = await TenantModel.findOne({ ownerId: req.userId });
  if (!tenant) {
    throw ApiError.notFound("Negocio no encontrado");
  }

  const [url] = await persistImages([file]);
  const previous = tenant.bannerUrl;
  tenant.bannerUrl = url;
  await tenant.save();

  if (previous) {
    await deleteImageByUrl(previous);
  }

  res.json({ bannerUrl: url });
});
