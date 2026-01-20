import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../shared/middleware/asyncHandler";

export class ProductController {
  constructor(private readonly productService: ProductService) { }

  getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, category, categoryId, isActive, inStock, minPrice, maxPrice, sort, order } =
      req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categoryIdNum = categoryId ? parseInt(categoryId as string, 10) : undefined;
    const isActiveBool = isActive === "true" ? true : isActive === "false" ? false : undefined;
    const inStockBool = inStock === "true" ? true : inStock === "false" ? false : undefined;

    const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

    const params = {
      page: isNaN(pageNum) ? 1 : pageNum,
      limit: isNaN(limitNum) ? 10 : limitNum,
      search: search as string | undefined,
      category: category as string | undefined,
      categoryId: categoryIdNum,
      isActive: isActiveBool,
      inStock: inStockBool,
      minPrice: (minPriceNum !== undefined && isNaN(minPriceNum)) ? undefined : minPriceNum,
      maxPrice: (maxPriceNum !== undefined && isNaN(maxPriceNum)) ? undefined : maxPriceNum,
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
