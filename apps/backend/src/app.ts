import dotenv from 'dotenv';
dotenv.config();

import PermissionManager from '@learn/pm';
import cors from 'cors';
import express from 'express';
import { authnticate } from './middleware/authenticate';
import { authorize } from './middleware/authorize';
import { ProductService } from './services/ProductService';
import { User } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      pm?: PermissionManager;
    }
  }
}

const app = express();

app.use(cors());
app.use(express.json());

app.get(
  '/api',
  authnticate,
  authorize({ role: 'user', permissions: ['product:create', 'product:read'] }),
  async (req, res) => {
    if (!req.user || !req.pm) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const productService = ProductService.getInstance({
      userId: req.user.sub,
      pm: req.pm,
    });

    try {
      const product = { name: 'Product 1', price: 100 };

      const result = await productService.addProduct(product);
      res
        .status(200)
        .json({
          message: 'Product added successfully',
          data: result,
          productService,
          req: req.user,
        });
    } catch (err) {
      res.status(403).json({ message: err.message });
    }
  }
);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message ?? 'Something went wrong' });
});

export default app;

