import { describe, it, expect } from "vitest";
import { slugify } from "../../src/services/slug.service.js";

describe("slugify", () => {
  it("convierte a minúsculas y reemplaza espacios por guiones", () => {
    expect(slugify("Auriculares Bluetooth Pro")).toBe(
      "auriculares-bluetooth-pro"
    );
  });

  it("elimina acentos", () => {
    expect(slugify("Árbol de Navidad")).toBe("arbol-de-navidad");
  });

  it("elimina caracteres especiales", () => {
    expect(slugify("Hola!!! Mundo???")).toBe("hola-mundo");
  });

  it("colapsa guiones repetidos y recorta extremos", () => {
    expect(slugify("  Mi---Tienda  ")).toBe("mi-tienda");
  });

  it("devuelve string vacío para entrada vacía", () => {
    expect(slugify("")).toBe("");
  });
});
