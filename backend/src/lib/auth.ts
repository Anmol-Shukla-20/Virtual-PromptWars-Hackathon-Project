/**
 * JWT auth helper for Next.js API Routes.
 * Verifies the Bearer token from the Authorization header
 * and returns the decoded user payload.
 */

import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

export interface JwtPayload {
  user: { id: string };
}

/**
 * Extracts and verifies the JWT from the Authorization header.
 * Returns the decoded payload or throws an error if invalid.
 */

export function verifyAuth(req: NextRequest): JwtPayload {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token, authorization denied');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return decoded;
  } catch {
    throw new Error('Token is not valid');
  }
}
