import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { ProductQueryParams } from "./product.interface";

export class ProductController {
  constructor(private readonly productService: ProductService) { }

  getAllProducts = async (req: Request, res: Response) => {
    const result = await this.productService.getAllProducts(req.query as unknown as ProductQueryParams);
    res.json(result);
  };

  getProductByProductId = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const product = await this.productService.getProductByProductId(productId);
    res.json(product);
  };

  createProduct = async (req: Request, res: Response) => {
    const productData = req.body;
    const newProduct = await this.productService.createProduct(productData);
    res.status(201).json(newProduct);
  };

  updateProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const productData = req.body;
    const updatedProduct = await this.productService.updateProduct(
      productId,
      productData,
    );
    res.json(updatedProduct);
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const deleted = await this.productService.deleteProduct(productId);
    res.json(deleted);
  };
}
