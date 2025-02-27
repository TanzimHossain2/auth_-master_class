import PermissionManager from '@learn/pm';
import { ProductAddPolicy } from '@learn/policy';

type Product = {
  name: string;
  price: number;
};

type ServiceOptions = {
  userId: string;
  pm: PermissionManager;
};

export class ProductService {
  private products: Product[] = [];
  private userId: string;
  private pm: PermissionManager;
  private static instance: ProductService;

  constructor(options: ServiceOptions) {
    this.userId = options.userId;
    this.pm = options.pm;
  }

  public static getInstance(options: ServiceOptions) {
    if (!this.instance) {
      this.instance = new ProductService(options);
    }
    return this.instance;
  }

  public async addProduct(product: Product) {
    if (!this.pm.hasPermission('product:create')) {
      throw new Error(
        'Unauthorized: You do not have permission to add products.'
      );
    }

    const productPolicy = ProductAddPolicy.getInstance();

    const { allowed, reason } = await productPolicy.can({
      userId: this.userId,
    });

    if (!allowed) {
      console.log('reason', reason);
      throw new Error(reason);
    }

    this.products.push(product);

    return this.products;
  }

  public getProducts() {
    return this.products;
  }
}

