import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Uploaded file exceeds the allowed size limit (max 5MB).'
        : err.message;
    res.status(400).json({ success: false, message });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  const anyErr = err as {
    name?: string;
    code?: number;
    statusCode?: number;
    message?: string;
    keyValue?: Record<string, unknown>;
    errors?: Record<string, { message: string }>;
  };

  if (anyErr?.code === 11000) {
    const duplicateField = anyErr.keyValue ? Object.keys(anyErr.keyValue).join(', ') : 'record';
    res.status(409).json({
      success: false,
      message: `Duplicate entry detected for ${duplicateField}.`,
    });
    return;
  }

  if (anyErr?.name === 'ValidationError' && anyErr.errors) {
    const firstMsg = Object.values(anyErr.errors)[0]?.message || 'Validation error';
    res.status(400).json({ success: false, message: firstMsg });
    return;
  }

  if (anyErr?.name === 'CastError') {
    res.status(400).json({ success: false, message: 'Invalid resource identifier format.' });
    return;
  }

  const statusCode = anyErr?.statusCode || 500;
  const message = anyErr?.message || 'Internal server error';
  if (statusCode >= 500) {
    console.error('[Error]', err);
  }
  res.status(statusCode).json({ success: false, message });
}
