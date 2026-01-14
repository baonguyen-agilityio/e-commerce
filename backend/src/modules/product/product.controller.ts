import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../shared/middleware/asyncHandler";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, category, minPrice, maxPrice, sort, order } =
      req.query;

    const params = {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      search: search as string | undefined,
      category: category as string | undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      sort: sort as "name" | "price" | "createdAt" | undefined,
      order: order as "ASC" | "DESC" | undefined,
    };

    const result = await this.productService.getAllProducts(params);
    res.json(result);
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const product = await this.productService.getProductById(id);
    res.json(product);
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const productData = req.body;
    const newProduct = await this.productService.createProduct(productData);
    res.status(201).json(newProduct);
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const productData = req.body;
    const updatedProduct = await this.productService.updateProduct(
      id,
      productData,
    );
    res.json(updatedProduct);
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const deleted = await this.productService.deleteProduct(id);
    res.json(deleted);
  });
}
