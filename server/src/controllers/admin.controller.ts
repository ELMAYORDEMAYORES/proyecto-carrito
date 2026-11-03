import type { Types } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getStringQuery, getStringParam } from "../utils/request.js";
import { TenantModel } from "../models/Tenant.js";
import { UserModel } from "../models/User.js";
import { ProductModel } from "../models/Product.js";
import { OrderModel } from "../models/Order.js";
import {
  sendTenantApprovedEmail,
  sendTenantRejectedEmail,
} from "../services/email.service.js";
import type { RejectTenantInput } from "../schemas/admin.schema.js";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const stats = asyncHandler(async (_req, res) => {
  const [total, pending, active, rejected] = await Promise.all([
    TenantModel.countDocuments(),
    TenantModel.countDocuments({ status: "PENDING" }),
    TenantModel.countDocuments({ status: "ACTIVE" }),
    TenantModel.countDocuments({ status: "REJECTED" }),
  ]);

  res.json({ total, pending, active, rejected });
});

export const listTenants = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = getStringQuery(req.query.status);
  const search = getStringQuery(req.query.search);

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };

  const [tenants, total] = await Promise.all([
    TenantModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    TenantModel.countDocuments(filter),
  ]);

  const tenantIds = tenants.map((t) => t._id);

  const [productCounts, orderCounts] = await Promise.all([
    ProductModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { tenantId: { $in: tenantIds } } },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]),
    OrderModel.aggregate<{ _id: Types.ObjectId; count: number }>([
      { $match: { tenantId: { $in: tenantIds } } },
      { $group: { _id: "$tenantId", count: { $sum: 1 } } },
    ]),
  ]);

  const productMap = new Map(
    productCounts.map((p) => [p._id.toString(), p.count])
  );
  const orderMap = new Map(orderCounts.map((o) => [o._id.toString(), o.count]));

  const items = tenants.map((t) => ({
    id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    email: t.email,
    phone: t.phone,
    status: t.status,
    rejectionReason: t.rejectionReason,
    productCount: productMap.get(t._id.toString()) ?? 0,
    orderCount: orderMap.get(t._id.toString()) ?? 0,
    createdAt: t.createdAt,
  }));

  res.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const approve = asyncHandler(async (req, res) => {
  const tenant = await TenantModel.findById(getStringParam(req.params.id));
  if (!tenant) {
    throw ApiError.notFound("Negocio no encontrado");
  }

  if (tenant.status === "ACTIVE") {
    throw ApiError.badRequest("Este negocio ya está aprobado");
  }

  tenant.status = "ACTIVE";
  tenant.rejectionReason = null;
  await tenant.save();

  const owner = await UserModel.findById(tenant.ownerId);
  if (owner) {
    await sendTenantApprovedEmail(owner.email, tenant.name);
  }

  res.json({ id: tenant._id.toString(), status: tenant.status });
});

export const reject = asyncHandler(async (req, res) => {
  const { reason } = req.body as RejectTenantInput;
  const tenant = await TenantModel.findById(getStringParam(req.params.id));
  if (!tenant) {
    throw ApiError.notFound("Negocio no encontrado");
  }

  tenant.status = "REJECTED";
  tenant.rejectionReason = reason;
  await tenant.save();

  const owner = await UserModel.findById(tenant.ownerId);
  if (owner) {
    await sendTenantRejectedEmail(owner.email, tenant.name, reason);
  }

  res.json({
    id: tenant._id.toString(),
    status: tenant.status,
    rejectionReason: tenant.rejectionReason,
  });
});
