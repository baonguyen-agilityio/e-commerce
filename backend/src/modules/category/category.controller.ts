import { Request, Response } from "express";
import { CategoryQueryParams, ICategoryService } from "./category.interface";

export class CategoryController {
  constructor(private readonly categoryService: ICategoryService) { }

  getAllCategories = async (req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.getAllCategories(req.query as unknown as CategoryQueryParams);
    res.json(categories);
  };

  getCategoryById = async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId;
    const category = await this.categoryService.getCategoryById(categoryId);
    res.json(category);
  };

  createCategory = async (req: Request, res: Response): Promise<void> => {
    const categoryData = req.body;
    const newCategory =
      await this.categoryService.createCategory(categoryData);
    res.status(201).json(newCategory);
  };

  updateCategory = async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId;
    const categoryData = req.body;
    const updatedCategory = await this.categoryService.updateCategory(
      categoryId,
      categoryData,
    );
    res.json(updatedCategory);
  };

  deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const categoryId = req.params.categoryId;
    const deleted = await this.categoryService.deleteCategory(categoryId);
    res.status(200).json(deleted);
  };
}
