import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = (decoded as any).user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
