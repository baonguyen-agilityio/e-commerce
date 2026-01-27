import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
  constructor(private readonly productService: ProductService) { }

  getAllProducts = async (req: Request, res: Response) => {
    const { page, limit, search, category, categoryPublicId, isActive, inStock, minPrice, maxPrice, sort, order } =
      req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const isActiveBool = isActive === "true" ? true : isActive === "false" ? false : undefined;
    const inStockBool = inStock === "true" ? true : inStock === "false" ? false : undefined;

    const minPriceNum = minPrice ? parseFloat(minPrice as string) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice as string) : undefined;

    const params = {
      page: isNaN(pageNum) ? 1 : pageNum,
      limit: isNaN(limitNum) ? 10 : limitNum,
      search: search as string | undefined,
      category: category as string | undefined,
      categoryPublicId: categoryPublicId as string | undefined,
      isActive: isActiveBool,
      inStock: inStockBool,
      minPrice: (minPriceNum !== undefined && isNaN(minPriceNum)) ? undefined : minPriceNum,
      maxPrice: (maxPriceNum !== undefined && isNaN(maxPriceNum)) ? undefined : maxPriceNum,
      sort: sort as "name" | "price" | "createdAt" | undefined,
      order: order as "ASC" | "DESC" | undefined,
    };

    const result = await this.productService.getAllProducts(params);
    res.json(result);
  };

  getProductByPublicId = async (req: Request, res: Response) => {
    const { publicId } = req.params;
    const product = await this.productService.getProductByPublicId(publicId);
    res.json(product);
  };

  createProduct = async (req: Request, res: Response) => {
    const productData = req.body;
    const newProduct = await this.productService.createProduct(productData);
    res.status(201).json(newProduct);
  };

  updateProduct = async (req: Request, res: Response) => {
    const { publicId } = req.params;
    const productData = req.body;
    const updatedProduct = await this.productService.updateProduct(
      publicId,
      productData,
    );
    res.json(updatedProduct);
  };

  deleteProduct = async (req: Request, res: Response) => {
    const { publicId } = req.params;
    const deleted = await this.productService.deleteProduct(publicId);
    res.json(deleted);
  };
}
