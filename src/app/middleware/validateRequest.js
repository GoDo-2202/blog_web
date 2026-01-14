import { validationResult } from "express-validator";
import AppError from "../../utils/AppError.js";

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new AppError(
        "Validation failed",
        400,
        "VALIDATION_ERROR",
        errors.array().map((e) => ({
          param: e.param || "unknown",
          msg: e.msg,
          code: `INVALID_${(e.param || "unknown").toUpperCase()}`,
        }))
      )
    );
  }

  next();
};
