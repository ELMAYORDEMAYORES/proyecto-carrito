import type { HydratedDocument } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { requireTenantId, getStringQuery, getStringParam } from "../utils/request.js";
import { toDollars } from "../utils/money.js";
import { OrderModel } from "../models/Order.js";
import type { Order } from "../models/Order.js";
import type { UpdateOrderStatusInput } from "../schemas/order.schema.js";

type OrderDoc = HydratedDocument<Order>;

function toOrderDTO(o: OrderDoc) {
  return {
    id: o._id.toString(),
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    status: o.status,
    total: toDollars(o.total),
    notes: o.notes,
    items: o.items.map((i) => ({
      productId: i.productId.toString(),
      productName: i.productName,
      productPrice: toDollars(i.productPrice),
      quantity: i.quantity,
      imageUrl: i.snapshot?.imageUrl ?? null,
    })),
    createdAt: o.createdAt,
  };
}

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const list = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const status = getStringQuery(req.query.status);

  const filter: Record<string, unknown> = { tenantId };
  if (status) filter.status = status;

  const [items, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    OrderModel.countDocuments(filter),
  ]);

  res.json({
    items: items.map(toOrderDTO),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
});

export const get = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const order = await OrderModel.findOne({
    _id: getStringParam(req.params.id),
    tenantId,
  });
  if (!order) {
    throw ApiError.notFound("Pedido no encontrado");
  }
  res.json(toOrderDTO(order));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);
  const { status } = req.body as UpdateOrderStatusInput;

  const order = await OrderModel.findOne({
    _id: getStringParam(req.params.id),
    tenantId,
  });
  if (!order) {
    throw ApiError.notFound("Pedido no encontrado");
  }

  order.status = status;
  await order.save();

  res.json(toOrderDTO(order));
});

export const exportCsv = asyncHandler(async (req, res) => {
  const tenantId = requireTenantId(req.tenantId);

  const orders = await OrderModel.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(1000);

  const header = [
    "ID",
    "Cliente",
    "Email",
    "Teléfono",
    "Total",
    "Estado",
    "Notas",
    "Items",
    "Fecha",
  ];

  const rows = orders.map((o) => [
    o._id.toString(),
    o.customerName,
    o.customerEmail,
    o.customerPhone,
    toDollars(o.total),
    o.status,
    o.notes ?? "",
    o.items.map((i) => `${i.quantity}x ${i.productName}`).join("; "),
    o.createdAt.toISOString(),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="pedidos-${Date.now()}.csv"`
  );
  res.send(`\uFEFF${csv}`);
});
