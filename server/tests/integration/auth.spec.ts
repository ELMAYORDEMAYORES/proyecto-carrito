import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import type { Express } from "express";
import { UserModel } from "../../src/models/User.js";

let mongo: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();

  process.env.MONGO_URI = mongo.getUri();
  process.env.JWT_ACCESS_SECRET = "test-access-secret-0123456789abcdef";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-0123456789abcdef";
  process.env.CLIENT_URL = "http://localhost:5173";

  const mod = await import("../../src/app.js");
  app = mod.default as Express;

  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe("auth (integración)", () => {
  it("registra, verifica, loguea y obtiene /me", async () => {
    const email = `user-${Date.now()}@test.com`;
    const slug = `test-${Date.now()}`;

    const reg = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email,
      password: "Password1",
      storeName: "Mi Tienda",
      storeSlug: slug,
    });
    expect(reg.status).toBe(201);

    // Marcamos el email como verificado (en el test no capturamos el token del email)
    await UserModel.updateOne({ email }, { $set: { emailVerified: true } });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password1" });
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe(email);
    expect(login.body.user.role).toBe("OWNER");
    expect(login.body.accessToken).toBeTruthy();

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${login.body.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);
    expect(me.body.tenantSlug).toBe(slug);
  });

  it("rechaza email duplicado (409)", async () => {
    const email = `dup-${Date.now()}@test.com`;

    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email,
      password: "Password1",
      storeName: "Mi Tienda",
      storeSlug: `dup-${Date.now()}`,
    });

    const dup = await request(app).post("/api/auth/register").send({
      name: "Otro",
      email,
      password: "Password1",
      storeName: "Otra Tienda",
      storeSlug: `dup2-${Date.now()}`,
    });
    expect(dup.status).toBe(409);
  });

  it("rechaza credenciales inválidas (401)", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "noexiste@test.com", password: "password" });
    expect(login.status).toBe(401);
  });

  it("bloquea login de email sin verificar (403)", async () => {
    const email = `unverified-${Date.now()}@test.com`;

    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email,
      password: "Password1",
      storeName: "Mi Tienda",
      storeSlug: `unv-${Date.now()}`,
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "Password1" });
    expect(login.status).toBe(403);
  });
});
