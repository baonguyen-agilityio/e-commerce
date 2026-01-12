import { Request, Response } from "express";
import { ICategoryService } from "./category.interface";
import { asyncHandler } from "../../shared/middleware/asyncHandler";

export class CategoryController {
  constructor(private readonly categoryService: ICategoryService) {}

  getAllCategories = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const categories = await this.categoryService.getAllCategories();
      res.json(categories);
    },
  );

  getCategoryById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id, 10);
      const category = await this.categoryService.getCategoryById(id);
      res.json(category);
    },
  );

  createCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const categoryData = req.body;
      const newCategory =
        await this.categoryService.createCategory(categoryData);
      res.status(201).json(newCategory);
    },
  );

  updateCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id, 10);
      const categoryData = req.body;
      const updatedCategory = await this.categoryService.updateCategory(
        id,
        categoryData,
      );
      res.json(updatedCategory);
    },
  );

  deleteCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id, 10);
      await this.categoryService.deleteCategory(id);
      res.status(204).send();
    },
  );
}
