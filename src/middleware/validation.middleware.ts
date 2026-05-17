import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(
      { ...req.body, ...req.params, ...req.query },
      { abortEarly: false, allowUnknown: true }
    );
    if (error) {
      const errors = error.details.map((d) => d.message);
      res.status(400).json({ success: false, message: errors.join(", ") });
      return;
    }
    next();
  };
