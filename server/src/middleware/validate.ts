import { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const flat = result.error.flatten();
      res.status(400).json({
        message: "Datos inválidos",
        errors: flat.fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
