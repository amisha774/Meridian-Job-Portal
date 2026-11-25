import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: 'path' in err ? err.path : 'field',
      message: err.msg,
    }));
    res.status(400).json({
      success: false,
      message: formatted[0]?.message || 'Validation failed',
      errors: formatted,
    });
    return;
  }
  next();
}
