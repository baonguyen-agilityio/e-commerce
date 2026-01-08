import { Request, Response } from "express";
import { ProductService } from "./product.service";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getAllProducts = async (req: Request, res: Response) => {
    try {
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
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error });
    }
  };
}
