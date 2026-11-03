import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../src/utils/password.js";

describe("password", () => {
  it("hashea y compara correctamente", async () => {
    const hash = await hashPassword("MiPassword1");
    expect(hash).not.toBe("MiPassword1");
    expect(hash).toMatch(/^\$2[aby]\$/);

    expect(await comparePassword("MiPassword1", hash)).toBe(true);
    expect(await comparePassword("otraPassword1", hash)).toBe(false);
  });

  it("genera hashes distintos para la misma contraseña (salt aleatorio)", async () => {
    const h1 = await hashPassword("MiPassword1");
    const h2 = await hashPassword("MiPassword1");
    expect(h1).not.toBe(h2);
  });
});
