import { NextFunction, Request, Response } from 'express';

type AuthorizeOptions = {
  permissions?: string[] | string;
  role?: string;
};

export const authorize = ({ permissions, role }: AuthorizeOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.pm) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const checkRole = () => {
      if (!role) return true;
      return req.pm?.hasRole(role) || false;
    };

    const checkPermissions = () => {
      if (!permissions) return true;
      const perms = Array.isArray(permissions) ? permissions : [permissions];
      return req.pm?.hasPermissions(perms) || false;
    };

    const hasAccess = checkRole() && checkPermissions();

    if (!hasAccess) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    next();
  };
};

