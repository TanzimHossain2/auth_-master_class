import { NextFunction, Request, Response } from 'express';
import { jwtValidationResponse, validateToken } from '@kinde/jwt-validator';
import { jwtDecode } from 'jwt-decode';
import { User } from '../types';
import { PermissionManager } from "@learn/pm";


export const authnticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
     res.status(401).json({ message: 'Unauthorized' });
      return;
  }


  const validationResult : jwtValidationResponse = await validateToken({token,
    domain: process.env.KINDE_DOMAIN
  });


  if (!validationResult.valid) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const decodedToken = jwtDecode<User>(token);
  
  if (!decodedToken) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }


  const pm = new PermissionManager({
    permissions: decodedToken.permissions,
    roles: decodedToken.roles.map((role) => role.name),
  });

  req.user = decodedToken;
  req.pm = pm;
  




  next();
  



};
